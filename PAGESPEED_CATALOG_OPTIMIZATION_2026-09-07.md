# Catalog PageSpeed optimization — 2026-09-07

Основание: mobile Lighthouse/PageSpeed report: FCP 4.8s, LCP 12.2s, TBT 160ms, CLS 0.001. Initial document ~409 KiB и отдавался без text compression.

## Изменения в проекте

### 1. Уменьшен SSR/hydration payload каталога

Ранее `catalogStore.fetchProducts()` вызывал `ensureAllLoaded()` и загружал `limit=9999`, после чего все товары попадали в Pinia SSR state. Дополнительно массив товаров дублировался в `useAsyncData` payload.

Теперь:

- `server/api/shop/products?for=catalog-page` по-прежнему делает точную локальную фильтрацию по полной выборке на сервере;
- в браузер/SSR возвращается только текущая порция по 12 товаров;
- `useAsyncData` сохраняет только boolean completion marker;
- сами 12 карточек гидратируются один раз через Pinia;
- `Показать ещё` запрашивает следующую порцию и append-ит её.

Это должно существенно уменьшить HTML `/catalog` и hydration JSON.

### 2. Убраны дубли товаров из analytics listing

`WeeklyProducts` не рендерится, но `analyticsProducts` раньше объединял weekly + rendered, из-за чего YTM/Roistat получали повторяющиеся товары и очень длинные event URLs. Теперь в listing отправляются только реально отображённые карточки.

### 3. Filter counts отложены из critical path

Полная выборка для подсчёта `(N)` в фильтрах больше не стартует через 400ms. Запуск перенесён в `requestIdleCallback` с timeout, fallback — отложенный timer.

### 4. Responsive catalog images

Для карточек оставлены две полезные ширины:

- 320px — mobile/обычный desktop card;
- 640px — Retina/high-DPR.

Форматы: AVIF + WebP. После этого изменения один раз нужен `pnpm build:optimized`, чтобы создать `w-320.*` и обновить manifest.

### 5. Cookie banner больше не является поздним hydration LCP

Раньше banner был `isVisible=false` на SSR и появлялся только в `onMounted`. Lighthouse определял его текст как LCP. Теперь consent cookie читается через `useCookie`, и новый посетитель получает banner уже в SSR HTML.

### 6. Third-party scripts

Отложены до `window.load + 2.5s`:

- Microsoft Clarity;
- CarrotQuest;
- Mango Office;
- Bitrix call tracker.

Yandex Metrica и Roistat пока не задерживались агрессивно, чтобы не менять критичную бизнес-аналитику без отдельного решения.

### 7. Прочее

- Sofia Sans Google stylesheet удалён: в проекте `font-sofia` не используется;
- Nuxt DevTools выключены в production;
- `html lang="ru"`;
- убран `maximum-scale=1`, который ломал accessibility audit.

## Что остаётся сделать в Nginx

PageSpeed прямо показывает `Без сжатия` и оценочную экономию ~274 KiB. Следующий обязательный шаг — включить gzip (и Brotli, если модуль доступен) для HTML/CSS/JS/JSON/SVG и прямую immutable-раздачу `/_nuxt/` + `/images/optimized/`.

Также стоит задать долгий cache для `/logo.svg` и `/icons/`.
