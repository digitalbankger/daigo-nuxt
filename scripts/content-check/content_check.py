#!/usr/bin/env python3
"""
Проверка контент-политики сайта

Схема:
  1. scan_source()             — grep по исходникам фронта 
  2. check_forbidden_phrases()  — regex по исходникам и/или отрендеренному тексту 
  3. check_required_elements()  — наличие обязательных текстов/ссылок в DOM 
  4. check_english_ui()         — латиница в кнопках/меню 
  5. check_caps_lock() / check_promo_deadline() — мягкие эвристики 
  6. call_claude_vision()       — ИИ (vision), только для медсимволики/образа врача/
     госсимволики/качества фото и только на страницах с visual_check: true

Запускается CI-джобом после деплоя на staging (см. .gitlab-ci.yml)
Конфигурация (список страниц, чек-листы, пороги) — в config.yaml
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import yaml
from anthropic import Anthropic, APIConnectionError, APIStatusError, APITimeoutError
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

CONFIDENCE_RANK = {"low": 0, "medium": 1, "high": 2}
LATIN_ONLY_RE = re.compile(r"^[A-Za-z][A-Za-z\-\s]{1,40}$")
CAPS_WORD_RE = re.compile(r"\b[А-ЯЁ]{4,}\b")

VISUAL_TOOL_SCHEMA = {
    "name": "report_violations",
    "description": "Список найденных нарушений контент-политики на скриншоте страницы.",
    "input_schema": {
        "type": "object",
        "properties": {
            "violations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "string",
                            "description": "Код пункта чек-листа, например '8.1'. Использовать только коды из переданного чек-листа.",
                        },
                        "title": {"type": "string", "description": "Краткое название нарушения"},
                        "location": {
                            "type": "string",
                            "description": "Где на скриншоте находится нарушение",
                        },
                        "description": {
                            "type": "string",
                            "description": "Что конкретно увидено и почему это нарушение",
                        },
                        "confidence": {"type": "string", "enum": ["low", "medium", "high"]},
                    },
                    "required": ["code", "title", "location", "description", "confidence"],
                },
            }
        },
        "required": ["violations"],
    },
}

# Промпт сузили: ИИ проверяет ТОЛЬКО визуальные категории, которые в принципе
# нельзя поймать текстом/regex (символика, образ врача, качество/подлинность фото).
# Всё, что можно было проверить текстом, уже проверено rule-engine до вызова ИИ.
VISUAL_PROMPT_TEMPLATE = """Ты — визуальный контент-модератор сайта БАД-компании (Россия).
Тебе передан full-page скриншот страницы типа "{page_type}" (URL: {url}).

Текстовые нарушения (обещания лечения, отсутствие обязательных плашек, английские
кнопки и т.п.) уже проверены отдельным алгоритмом — НЕ анализируй текст, анализируй
ТОЛЬКО визуальные признаки из чек-листа ниже: символику, образы людей, качество и
подлинность фотографий.

Чек-лист (только визуальные категории):
{checklist}

Для каждого найденного нарушения укажи: код пункта чек-листа (строго один из списка
выше), краткое название, расположение на скриншоте, описание и уровень уверенности
(low/medium/high). Если нарушений нет — верни пустой список violations.
Вызови инструмент report_violations со строго структурированным результатом."""


@dataclass
class Finding:
    code: str
    title: str
    location: str
    description: str
    confidence: str
    source: str  # "rule" | "ai"
    file: str | None = None
    line: int | None = None

    def to_dict(self) -> dict:
        d = {
            "code": self.code,
            "title": self.title,
            "location": self.location,
            "description": self.description,
            "confidence": self.confidence,
            "source": self.source,
        }
        if self.file is not None:
            d["file"] = self.file
            d["line"] = self.line
        return d


def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def format_checklist(items: list[dict]) -> str:
    return "\n".join(f"- [{i['code']}] ({i['section']}) {i['description']}" for i in items)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_cache(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return {}


def save_cache(path: Path, cache: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


# ---------------------------------------------------------------------------
# 1. Статический grep по исходникам фронта (без браузера, без ИИ)
# ---------------------------------------------------------------------------


def scan_source(root: Path, forbidden_phrases: list[dict], source_cfg: dict) -> tuple[list[Finding], int]:
    compiled = [
        (rule, [re.compile(p) for p in rule["patterns"]])
        for rule in forbidden_phrases
        if "source" in rule.get("scopes", [])
    ]
    exclude_dirs = set(source_cfg.get("exclude_dirs", []))
    findings: list[Finding] = []
    seen_files: set[Path] = set()
    files_scanned = 0

    for pattern in source_cfg.get("include_globs", []):
        for path in root.glob(pattern):
            if not path.is_file() or path in seen_files:
                continue
            if any(part in exclude_dirs for part in path.parts):
                continue
            seen_files.add(path)
            files_scanned += 1
            try:
                lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
            except OSError:
                continue
            rel = str(path.relative_to(root))
            for lineno, line in enumerate(lines, start=1):
                for rule, patterns in compiled:
                    if any(p.search(line) for p in patterns):
                        findings.append(
                            Finding(
                                code=rule["code"],
                                title=rule["description"][:80],
                                location=f"{rel}:{lineno}",
                                description=line.strip()[:200],
                                confidence="medium",
                                source="rule",
                                file=rel,
                                line=lineno,
                            )
                        )
                        break  # одна находка на строку/правило, не дублируем

    return findings, files_scanned


# ---------------------------------------------------------------------------
# 2-5. DOM/текстовые проверки отрендеренной страницы (без ИИ)
# ---------------------------------------------------------------------------


def capture_and_extract(context, url: str, playwright_cfg: dict, english_ui_cfg: dict) -> tuple[bytes, dict]:
    last_error: Exception | None = None
    for attempt in range(1, playwright_cfg["max_retries"] + 1):
        page = context.new_page()
        try:
            page.goto(
                url,
                timeout=playwright_cfg["navigation_timeout_ms"],
                wait_until=playwright_cfg["wait_until"],
            )
            screenshot = page.screenshot(full_page=True, type="png")

            english_ui_texts: dict[str, list[str]] = {}
            for group in english_ui_cfg.get("groups", []):
                texts = (
                    page.eval_on_selector_all(
                        group["selector"],
                        "els => els.map(e => (e.innerText || e.value || '').trim()).filter(Boolean)",
                    )
                    or []
                )
                english_ui_texts[group["code"]] = texts

            data = {
                "body_text": page.inner_text("body"),
                "footer_text": page.eval_on_selector_all(
                    "footer", "els => els.map(e => e.innerText).join('\\n')"
                )
                or "",
                "paragraph_texts": page.eval_on_selector_all("p", "els => els.map(e => e.innerText)") or [],
                "links": page.eval_on_selector_all(
                    "a", "els => els.map(e => ({text: e.innerText, href: e.getAttribute('href')}))"
                )
                or [],
                "english_ui_texts": english_ui_texts,
            }
            return screenshot, data
        except PlaywrightError as e:
            last_error = e
            print(f"  [capture] attempt {attempt}/{playwright_cfg['max_retries']} failed for {url}: {e}", file=sys.stderr)
            time.sleep(2 * attempt)
        finally:
            page.close()
    raise RuntimeError(f"Failed to load {url}") from last_error


def check_forbidden_phrases(text: str, rules: list[dict], scope_name: str) -> list[Finding]:
    findings = []
    for rule in rules:
        if scope_name not in rule.get("scopes", []):
            continue
        for pattern in rule["patterns"]:
            m = re.search(pattern, text)
            if m:
                snippet = text[max(0, m.start() - 40) : m.end() + 40].replace("\n", " ").strip()
                findings.append(
                    Finding(
                        code=rule["code"],
                        title=rule["description"][:80],
                        location=f"текст страницы ({scope_name})",
                        description=f"Найдено: «{snippet}»",
                        confidence="high",
                        source="rule",
                    )
                )
                break  # не дублируем одно и то же правило по нескольким паттернам
    return findings


def check_required_elements(
    rules: list[dict], page_type: str, footer_text: str, body_text: str, links: list[dict]
) -> list[Finding]:
    findings = []
    for rule in rules:
        applies_to = rule.get("applies_to", ["all"])
        if "all" not in applies_to and page_type not in applies_to:
            continue

        haystack = footer_text if rule["scope"] == "footer" else body_text
        satisfied = any(re.search(p, haystack) for p in rule.get("patterns", []))

        if not satisfied and rule.get("href_patterns"):
            satisfied = any(
                href_pat in (link.get("href") or "")
                for link in links
                for href_pat in rule["href_patterns"]
            )

        if not satisfied:
            findings.append(
                Finding(
                    code=rule["code"],
                    title=rule["description"][:80],
                    location=f"область: {rule['scope']}",
                    description=rule["description"],
                    confidence="high",
                    source="rule",
                )
            )
    return findings


def check_english_ui(english_ui_texts: dict[str, list[str]], groups: list[dict], whitelist: set[str]) -> list[Finding]:
    group_by_code = {g["code"]: g for g in groups}
    findings = []
    for code, texts in english_ui_texts.items():
        seen: set[str] = set()
        for raw in texts:
            t = raw.strip()
            key = t.lower()
            if not t or key in seen or key in whitelist:
                continue
            seen.add(key)
            if LATIN_ONLY_RE.match(t):
                findings.append(
                    Finding(
                        code=code,
                        title=f"Английский текст в интерфейсе: «{t}»",
                        location=f"селектор: {group_by_code[code]['selector']}",
                        description=f"Найден непереведённый текст «{t}» в интерактивном элементе",
                        confidence="high",
                        source="rule",
                    )
                )
    return findings


def check_caps_lock(paragraph_texts: list[str], cfg: dict) -> list[Finding]:
    max_words = cfg.get("max_allowed_words", 3)
    findings = []
    for p in paragraph_texts:
        words = CAPS_WORD_RE.findall(p)
        if len(words) > max_words:
            findings.append(
                Finding(
                    code=cfg["code"],
                    title="Капслок в сплошном тексте",
                    location="абзац на странице",
                    description=f"Найдено {len(words)} слов заглавными буквами: {', '.join(words[:5])}",
                    confidence="low",
                    source="rule",
                )
            )
    return findings


def check_promo_deadline(body_text: str, cfg: dict) -> list[Finding]:
    triggered = any(re.search(p, body_text) for p in cfg["trigger_patterns"])
    if not triggered:
        return []
    has_deadline = any(re.search(p, body_text) for p in cfg["deadline_patterns"])
    if has_deadline:
        return []
    return [
        Finding(
            code=cfg["code"],
            title="Акция/скидка без явного указания срока",
            location="текст страницы",
            description="Найдено упоминание акции/скидки, срок действия рядом не найден — проверить вручную",
            confidence="low",
            source="rule",
        )
    ]


# ---------------------------------------------------------------------------
# 6. ИИ (vision) — только визуальные категории, только на visual_check-страницах
# ---------------------------------------------------------------------------


def call_claude_vision(
    client: Anthropic,
    image_bytes: bytes,
    url: str,
    page_type: str,
    visual_checklist: list[dict],
    anthropic_cfg: dict,
) -> list[Finding]:
    prompt = VISUAL_PROMPT_TEMPLATE.format(
        page_type=page_type, url=url, checklist=format_checklist(visual_checklist)
    )
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    last_error: Exception | None = None
    for attempt in range(1, anthropic_cfg["max_retries"] + 1):
        try:
            response = client.messages.create(
                model=anthropic_cfg["model"],
                max_tokens=anthropic_cfg["max_tokens"],
                timeout=anthropic_cfg["timeout_seconds"],
                tools=[VISUAL_TOOL_SCHEMA],
                tool_choice={"type": "tool", "name": "report_violations"},
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {"type": "base64", "media_type": "image/png", "data": image_b64},
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
            )
            for block in response.content:
                if block.type == "tool_use" and block.name == "report_violations":
                    return [
                        Finding(
                            code=v["code"],
                            title=v["title"],
                            location=v["location"],
                            description=v["description"],
                            confidence=v["confidence"],
                            source="ai",
                        )
                        for v in block.input.get("violations", [])
                    ]
            return []
        except (APIConnectionError, APITimeoutError, APIStatusError) as e:
            last_error = e
            print(f"  [claude] attempt {attempt}/{anthropic_cfg['max_retries']} failed for {url}: {e}", file=sys.stderr)
            time.sleep(2 * attempt)
    raise RuntimeError(f"Claude API call failed for {url}") from last_error


# ---------------------------------------------------------------------------
# Оркестрация
# ---------------------------------------------------------------------------


@dataclass
class PageResult:
    slug: str
    url: str
    page_type: str
    visual_check: bool
    from_cache: bool = False
    ai_skipped: bool = False
    rule_findings: list[Finding] = field(default_factory=list)
    ai_findings: list[Finding] = field(default_factory=list)
    error: str | None = None

    @property
    def all_findings(self) -> list[Finding]:
        return self.rule_findings + self.ai_findings


def collect_blocking_codes(config: dict) -> set[str]:
    codes: set[str] = set()
    for rule in config["forbidden_phrases"]:
        if rule.get("blocking"):
            codes.add(rule["code"])
    for rule in config["required_elements"]:
        if rule.get("blocking"):
            codes.add(rule["code"])
    for group in config["english_ui"]["groups"]:
        if group.get("blocking"):
            codes.add(group["code"])
    if config["caps_lock"].get("blocking"):
        codes.add(config["caps_lock"]["code"])
    if config["promo_deadline"].get("blocking"):
        codes.add(config["promo_deadline"]["code"])
    for item in config["visual_checklist"]:
        if item.get("blocking"):
            codes.add(item["code"])
    return codes


def is_blocking(finding: Finding, blocking_codes: set[str], threshold_rank: int) -> bool:
    return finding.code in blocking_codes and CONFIDENCE_RANK.get(finding.confidence, 0) >= threshold_rank


def build_markdown_report(
    source_findings: list[Finding],
    files_scanned: int,
    results: list[PageResult],
    blocking_codes: set[str],
    threshold_rank: int,
) -> str:
    lines = ["# Отчёт по контент-политике", "", f"Сгенерировано: {datetime.now(timezone.utc).isoformat()}", ""]

    all_findings = list(source_findings) + [f for r in results for f in r.all_findings]
    blocking_hits = [f for f in all_findings if is_blocking(f, blocking_codes, threshold_rank)]
    ai_calls = sum(1 for r in results if r.visual_check and not r.from_cache and not r.error and not r.ai_skipped)
    ai_skipped_pages = sum(1 for r in results if r.ai_skipped)

    lines += [
        f"Файлов просканировано (static grep): {files_scanned}",
        f"Страниц проверено: {len(results)}",
        f"Вызовов Claude API (без учёта кэша): {ai_calls}",
        f"Страниц с пропущенной ИИ-проверкой (нет ANTHROPIC_API_KEY): {ai_skipped_pages}",
        f"Всего находок: {len(all_findings)}",
        f"Блокирующих находок: {len(blocking_hits)}",
        "",
        "## Статический анализ кода (без ИИ)",
        "",
    ]
    if not source_findings:
        lines.append("Нарушений в исходниках не найдено.")
    for f in source_findings:
        marker = "🚫 BLOCKING" if is_blocking(f, blocking_codes, threshold_rank) else "⚠️ warning"
        lines.append(f"- **[{f.code}] {f.title}** ({marker}) — `{f.file}:{f.line}`: {f.description}")
    lines.append("")

    for r in results:
        lines.append(f"## {r.slug} ({r.url})")
        if r.error:
            lines.append(f"- ⚠️ Ошибка при обработке страницы: {r.error}")
            lines.append("")
            continue
        if not r.all_findings and not r.visual_check:
            lines.append("Нарушений не найдено.")
            lines.append("")
            continue

        if r.rule_findings:
            lines.append("**DOM/текст (без ИИ):**")
            for f in r.rule_findings:
                marker = "🚫 BLOCKING" if is_blocking(f, blocking_codes, threshold_rank) else "⚠️ warning"
                lines.append(f"- **[{f.code}] {f.title}** ({marker}) — {f.location}: {f.description}")
        elif not r.visual_check:
            lines.append("Нарушений не найдено.")

        if r.visual_check:
            if r.ai_skipped:
                lines.append("**ИИ vision:** пропущено (ANTHROPIC_API_KEY не задан)")
            else:
                cache_note = " _(из кэша, скриншот не менялся)_" if r.from_cache else ""
                lines.append(f"**ИИ vision{cache_note}:**")
                if not r.ai_findings:
                    lines.append("- нарушений не найдено")
                for f in r.ai_findings:
                    marker = "🚫 BLOCKING" if is_blocking(f, blocking_codes, threshold_rank) else "⚠️ warning"
                    lines.append(f"- **[{f.code}] {f.title}** ({marker}, confidence: {f.confidence}) — {f.location}: {f.description}")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Content policy checker (rule-based + minimal AI)")
    parser.add_argument("--base-url", required=True, help="Базовый URL (например http://localhost:3003)")
    parser.add_argument("--config", default=str(Path(__file__).parent / "config.yaml"))
    parser.add_argument("--repo-root", default=".", help="Корень репозитория для static grep")
    parser.add_argument("--output-dir", default="content-check-report")
    parser.add_argument("--cache-file", default=".cache/content-check/cache.json")
    args = parser.parse_args()

    config = load_config(Path(args.config))
    run_cfg = config["run"]
    playwright_cfg = config["playwright"]
    anthropic_cfg = config["anthropic"]
    forbidden_phrases = config["forbidden_phrases"]
    required_elements = config["required_elements"]
    english_ui_cfg = config["english_ui"]
    english_ui_whitelist = {w.lower() for w in english_ui_cfg.get("whitelist", [])}
    caps_lock_cfg = config["caps_lock"]
    promo_deadline_cfg = config["promo_deadline"]
    visual_checklist = config["visual_checklist"]
    pages_cfg = config["pages"][: run_cfg["max_pages_per_run"]]

    blocking_codes = collect_blocking_codes(config)
    threshold_rank = CONFIDENCE_RANK[run_cfg["confidence_threshold"]]

    output_dir = Path(args.output_dir)
    screenshots_dir = output_dir / "screenshots"
    screenshots_dir.mkdir(parents=True, exist_ok=True)

    # --- 1. Статический grep (не требует staging/браузера/ИИ) ---
    source_findings, files_scanned = scan_source(Path(args.repo_root), forbidden_phrases, config["source_scan"])
    print(f"[source-scan] файлов просканировано: {files_scanned}, находок: {len(source_findings)}")

    # ИИ-проверка необязательна: если ANTHROPIC_API_KEY не передан, весь vision-этап
    # просто пропускается (страницы отмечаются как ai_skipped), rule-based проверки
    # при этом отрабатывают в полном объёме и по-прежнему могут блокировать пайплайн.
    needs_ai = any(p.get("visual_check") for p in pages_cfg)
    client: Anthropic | None = None
    ai_enabled = False
    if needs_ai:
        import os

        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if api_key:
            client = Anthropic(api_key=api_key, max_retries=0)  # ретраи делаем сами, с логами
            ai_enabled = True
        else:
            print(
                "[content-check] ANTHROPIC_API_KEY не задан — ИИ-проверка (visual_checklist) "
                "пропущена, будут выполнены только rule-based проверки",
                file=sys.stderr,
            )

    cache_path = Path(args.cache_file)
    cache = load_cache(cache_path)

    results: list[PageResult] = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport=playwright_cfg["viewport"])

        for page_cfg in pages_cfg:
            slug = page_cfg["slug"]
            page_type = page_cfg["type"]
            visual_check = bool(page_cfg.get("visual_check"))
            full_url = urljoin(args.base_url, page_cfg["url"])
            print(f"[page] {slug} -> {full_url} (visual_check={visual_check})")

            try:
                screenshot_bytes, page_data = capture_and_extract(context, full_url, playwright_cfg, english_ui_cfg)
            except Exception as e:
                results.append(PageResult(slug=slug, url=full_url, page_type=page_type, visual_check=visual_check, error=str(e)))
                continue

            (screenshots_dir / f"{slug}.png").write_bytes(screenshot_bytes)

            # --- rule-based проверки (всегда, без ИИ) ---
            rule_findings: list[Finding] = []
            rule_findings += check_forbidden_phrases(page_data["body_text"], forbidden_phrases, "body")
            rule_findings += check_required_elements(
                required_elements, page_type, page_data["footer_text"], page_data["body_text"], page_data["links"]
            )
            rule_findings += check_english_ui(page_data["english_ui_texts"], english_ui_cfg["groups"], english_ui_whitelist)
            rule_findings += check_caps_lock(page_data["paragraph_texts"], caps_lock_cfg)
            rule_findings += check_promo_deadline(page_data["body_text"], promo_deadline_cfg)

            result = PageResult(slug=slug, url=full_url, page_type=page_type, visual_check=visual_check, rule_findings=rule_findings)

            # --- ИИ vision (только если visual_check, ключ передан и есть новый скриншот) ---
            if visual_check and not ai_enabled:
                result.ai_skipped = True
                print("  ANTHROPIC_API_KEY не задан, ИИ-проверка пропущена")
            elif visual_check:
                image_hash = sha256_bytes(screenshot_bytes)
                cached_entry = cache.get(slug)
                if cached_entry and cached_entry.get("hash") == image_hash:
                    ai_findings_raw = cached_entry.get("ai_violations", [])
                    result.ai_findings = [Finding(**{**v, "source": "ai"}) for v in ai_findings_raw]
                    result.from_cache = True
                    print("  cache hit, skipping Claude API call")
                else:
                    try:
                        ai_findings = call_claude_vision(
                            client, screenshot_bytes, full_url, page_type, visual_checklist, anthropic_cfg
                        )
                        result.ai_findings = ai_findings
                    except Exception as e:
                        result.error = f"Claude vision call failed: {e}"
                    cache[slug] = {
                        "hash": image_hash,
                        "ai_violations": [
                            {"code": f.code, "title": f.title, "location": f.location, "description": f.description, "confidence": f.confidence}
                            for f in result.ai_findings
                        ],
                        "checked_at": datetime.now(timezone.utc).isoformat(),
                    }

            results.append(result)

        browser.close()

    save_cache(cache_path, cache)

    report_json = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": args.base_url,
        "confidence_threshold": run_cfg["confidence_threshold"],
        "blocking_codes": sorted(blocking_codes),
        "source_scan": {
            "files_scanned": files_scanned,
            "findings": [f.to_dict() for f in source_findings],
        },
        "pages": [
            {
                "slug": r.slug,
                "url": r.url,
                "type": r.page_type,
                "visual_check": r.visual_check,
                "from_cache": r.from_cache,
                "ai_skipped": r.ai_skipped,
                "error": r.error,
                "rule_findings": [f.to_dict() for f in r.rule_findings],
                "ai_findings": [f.to_dict() for f in r.ai_findings],
            }
            for r in results
        ],
    }
    (output_dir / "report.json").write_text(json.dumps(report_json, ensure_ascii=False, indent=2), encoding="utf-8")
    (output_dir / "report.md").write_text(
        build_markdown_report(source_findings, files_scanned, results, blocking_codes, threshold_rank), encoding="utf-8"
    )

    all_findings = list(source_findings) + [f for r in results for f in r.all_findings]
    blocking_hits = [f for f in all_findings if is_blocking(f, blocking_codes, threshold_rank)]

    print("")
    print(f"Проверено страниц: {len(results)}")
    print(f"Блокирующих находок: {len(blocking_hits)}")
    for f in blocking_hits:
        where = f"{f.file}:{f.line}" if f.file else f.location
        print(f"  - [{f.code}] {f.title} ({where}, confidence: {f.confidence})")

    return 1 if blocking_hits else 0


if __name__ == "__main__":
    sys.exit(main())
