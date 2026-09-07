# Articles: API list + local detail prerender

## Текущая схема

Список статей и пагинация получают актуальные данные через Go API:

`Go /v1/shop/articles` → `server/api/articles` → `pages/articles/index.vue`.

Frontend не обращается к Go напрямую: Nitro остаётся адаптером, нормализует ответ, ставит короткий cache и при кратковременной ошибке Go использует локальный build-content fallback.

Полные detail-страницы пока остаются локальными:

- `content/articles-json/*.json` — полный контент статьи;
- `/articles/<slug>` → локальный JSON через Nitro;
- detail-страницы продолжают prerenderиться при `pnpm build`.

Это сделано намеренно: в текущем проекте подтверждён контракт Go API для списка `/v1/shop/articles`, но нет подтверждённого отдельного detail-контракта, способного без потерь заменить авторские `layout/sections/contentTop/contentBottom` из локальных JSON.

## Список

`server/api/articles/index.get.ts` сначала обращается к Go API. Заголовок ответа показывает источник:

- `X-Articles-Source: go-api`;
- `X-Articles-Source: go-api-cache`;
- `X-Articles-Source: build-content-fallback` — только если Go временно недоступен.

Кэш списка — короткий, чтобы новые публикации появлялись без нового frontend-деплоя.

## Detail/prerender

`pnpm build` по-прежнему запускает `scripts/generate-articles-cards.mjs` и prerender локальных article detail routes. Локальные cards также остаются как аварийный fallback и источник существующих filter-counts.

## Пагинация

- `/articles` — первая страница;
- `/articles/page2`, `/articles/page3`, ... — следующие страницы;
- SPA-переходы обновляют список без F5;
- старые `/articles?page=2` переводятся временным 307 на `/articles/page2`.

Количество build-time prerender pagination routes пока рассчитывается по локальным JSON. Runtime-страница при этом получает актуальный список из Go API. После подключения подтверждённого Go detail endpoint имеет смысл перевести на API также sitemap и discovery prerender routes.
