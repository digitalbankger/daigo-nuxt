# Articles prerender

Статьи являются build-time контентом.

## Источник

- `content/articles-json/*.json` — полные статьи.
- `content/articles-json/articles.cards.ts` — лёгкий список, автоматически пересобирается из JSON.

## Сборка

`pnpm build` сначала запускает `scripts/generate-articles-cards.mjs`, затем Nuxt/Nitro автоматически добавляет `/articles` и все JSON slug в prerender.

В production output каждая статья получает заранее сформированный HTML и Nuxt payload. При первом открытии статьи запрос к Go API не требуется.

## SEO description

Для каждой статьи meta description формируется в порядке:

1. `description`
2. `preview`
3. текст из `contentTop`
4. `contentBottom`
5. `title`

HTML удаляется, пробелы нормализуются, текст ограничивается SEO-длиной. Поэтому отсутствие `description` в старом JSON не оставляет страницу без `<meta name="description">`.

## Новая статья

Добавить JSON в `content/articles-json/` и выполнить обычный `pnpm build`. Роут вручную в `nuxt.config.ts` добавлять не нужно.
