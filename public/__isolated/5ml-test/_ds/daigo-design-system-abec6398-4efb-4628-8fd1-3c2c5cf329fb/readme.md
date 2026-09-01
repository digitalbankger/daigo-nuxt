# Daigo — Design System

**Daigo** (ДАЙГО) is a **premium biotic supplement brand** (БАД / биодобавки) positioned for a high-end Russian audience — "признаны профессиональным сообществом врачей, сформирован спрос среди премиальной аудитории." The product line centres on a metabiotic (16 strains of lactic-acid bacteria / биорегуляторы) sold as Daigo, Daigo Lux, Tamotsu, plus toothpaste, shampoo and curated gift sets (Daigo Samurai, Daigo Emperor) priced from ~2 900 ₽ to 840 000 ₽. The brand tone is clinical-but-luxurious: editorial typography, vast whitespace, a playful **multicolour "daigo" wordmark** against an otherwise austere monochrome system, and confident full-bleed product tiles.

This design system recreates that visual language as reusable tokens, components, foundation cards, UI kits and slides.

## Source of truth
- **Figma:** "[Presentation] Daigo.fig" (mounted virtual filesystem). Key pages: `16-05-24---presentations` (123-frame marketing-kit deck), `25-04-24---dark-theme` (dark catalog + product cards), `16-04-24` (light editorial article page), plus footer/FAQ iterations. Component library lives under `/external-shared/` (Header/Footer/Buttons/Cards/Logos).
- Colours, type and components were extracted directly from the file (`fig_materialize` for the logos/icons, `METADATA.md` for the colour/type census). The single Figma Variable collection held only `#FFFFFF`; the full token system here was derived from the measured palette + screenshots.

> The reader is not assumed to have Figma access; paths are recorded above in case they do.

---

## CONTENT FUNDAMENTALS — how Daigo writes

- **Language:** Russian. Product names stay Latin (Daigo, Daigo Lux, Tamotsu).
- **Voice:** authoritative, clinical, restrained — closer to a medical journal than a wellness blog. Explains mechanisms ("метабиотик поддерживает собственную микрофлору"), cites specialists and studies. Uses **third person / impersonal** ("Удалось подтвердить, что…"), not chummy "ты/вы" marketing.
- **Casing:** Display page titles are **ALL-CAPS** (`КАТАЛОГ`, `СЕРТИФИКАТЫ`). Eyebrows/rubrics are uppercase with a `#` hashtag (`#ЗДОРОВЬЕ`, `#ОТ СПЕЦИАЛИСТОВ`). Body is sentence case.
- **Numbers:** prices are grouped with a thin space and the ₽ sign — `11 900 ₽`, `840 000 ₽`. Dates as `31.02.22`.
- **Disclaimers:** every product surface carries a quiet, low-contrast legal line — **«не является лекарством»** / «БАД. Не является лекарственным средством.» This is mandatory, never omitted.
- **Emoji:** none. Ever. The only "playful" element is the colour of the logo itself.
- **Vibe:** premium, calm, evidence-led. Short declarative sentences. Whitespace does the talking.

## VISUAL FOUNDATIONS

- **Colour:** a near-monochrome base — **Ink `#1B1B1B`**, paper `#FCFCFC`, mist `#F0F0F0`, warm **sand `#E0DDD8`** — punctuated by the **brand spectrum** carried in the wordmark (magenta `#E40088`, blue `#009ACD`, amber `#FFB423`, green `#22B14C`, violet `#7477C5`). **Coral `#FF7171`** is the signature accent (hero gradients, sale tags). Gold `#AE9D7E` signals "premium." Gift certificates explode into vivid blue/yellow/green. Dark theme inverts onto Ink with `#282828` raised surfaces.
- **Type:** one family — **Mont** (Fontfabric geometric sans), almost always **SemiBold**, with Bold for the giant wordmarks and Regular for body. Tight tracking on display (`-0.02em`), wide tracking on uppercase eyebrows (`+0.14em`). *Substituted with Montserrat here — see Caveats.*
- **Layout:** 1920 design width, ~80px gutters, big section rhythm (96–160px vertical). Generous, asymmetric, editorial. Product catalog is an edge-to-edge 2-column grid of full-bleed tiles with **no gaps** — colour blocks butt against each other.
- **Backgrounds:** mostly flat paper or Ink. Hero uses a soft **coral vertical gradient**. Product tiles are solid colour or full-bleed product photography (warm, naturalistic, soft daylight). No textures, no noise, no patterns.
- **Corners:** crisp by default (0px) on big layout blocks and product tiles; **pills (999px)** for every control; **soft (12–20px)** for content cards and gift cards.
- **Cards:** content cards sit on white with a *subtle* shadow (`0 8px 30px rgba(0,0,0,.06)`) — never heavy. Product tiles have no shadow, they rely on colour. Borders are hairline `#D9D9D9`.
- **Shadows:** restrained and soft; used for pop-overs/menus, rarely on cards.
- **Buttons:** pill, ink-fill or hairline-stroke; `КУПИТЬ` is the recurring CTA. Hover dims fill (~0.86) / inverts stroke to ink; press scales to 0.97.
- **Motion:** clean and quiet — fades and eases (`cubic-bezier(.22,.61,.36,1)`), 140–420ms. **No bounce, no spring.** The colourful logo can animate its colours; UI itself stays calm.
- **Transparency/blur:** the sticky header uses a translucent blurred backdrop. Otherwise opacity is used only to mute secondary text and disclaimers.
- **Imagery vibe:** warm, premium, clinical-clean — soft daylight, neutral backgrounds, product-forward.

## ICONOGRAPHY

- Daigo uses a **small bespoke line/solid SVG icon set** — account, cart, message bubble, audio/sound, close (✕ in a soft circle), plus directional arrows and a download "↓". Stroke weight is ~1.5–2px, geometric, rounded joints. These were extracted from the Figma and re-issued as the **`Icon`** component (`components/icons/Icon.jsx`), single-colour with `currentColor`.
- **No icon font, no emoji, no unicode-as-icon.** Glyphs are SVG only.
- The **logo** is a vector asset (colourful `daigo` wordmark `LogoFlat`, round `d.` monogram `DaigoMark`) — kept as real Figma vectors, never redrawn.
- When a glyph is missing, extend `Icon.jsx` with the matching geometric stroke rather than importing a third-party set.

---

## Index / manifest

**Root**
- `styles.css` — global entry (import list only).
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `fonts.css`, `base.css`.
- `readme.md` — this guide. `SKILL.md` — agent-skill manifest.

**Components** (`window.DaigoDesignSystem_abec63.*`)
- `components/brand/` — `DaigoLogo`, `DaigoMark`, `LogoFlat`
- `components/icons/` — `Icon` (+ `iconNames`)
- `components/core/` — `Button`, `IconButton`, `Input`, `Badge`, `Tabs`, `QuantityStepper`, `Accordion`
- `components/cards/` — `ProductCard`, `GiftCard`, `NewsCard`, `InfoCard`, `InnerCard` (product-page detail panel)
- `components/layout/` — `SiteHeader`, `SiteFooter`

**Foundations** — specimen cards under `guidelines/` (Colors, Type, Spacing) shown in the Design System tab.

**UI kits**
- `ui_kits/store/` — light marketing site + catalog + product page + cart (interactive).

**Slides**
- `slides/` — Daigo marketing-kit slide templates (title, statement, catalog, quote).

## Using the bundle
```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script>
  const { Button, ProductCard, SiteHeader } = window.DaigoDesignSystem_abec63;
</script>
```
Wrap any subtree in `data-theme="dark"` to flip to the dark palette (token system supports it; the shipped pages use the light palette throughout).
