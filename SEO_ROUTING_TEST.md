# SEO routing — тест перед переключением 307 → 301

Новые SEO-редиректы собраны отдельным блоком в `server/middleware/redirects.global.ts`.
Код переключается одной константой:

```ts
const SEO_TEST_REDIRECT_CODE = 307
```

После проверки заменить `307` на `301`.

## Каталог

SEO path получают только:

- `napravlennost`;
- `pomogaet-pri`.

Примеры:

```text
/catalog?napravlennost=kishechnik-i-immunitet
→ 307 /catalog/kishechnik-i-immunitet

/catalog?napravlennost=kishechnik-i-immunitet&pomogaet-pri=helicobacter-pylori
→ 307 /catalog/kishechnik-i-immunitet?pomogaet-pri=helicobacter-pylori

/catalog?napravlennost=kishechnik-i-immunitet&produkty=daigo-5ml
→ 307 /catalog/kishechnik-i-immunitet?produkty=daigo-5ml
```

`klass-produkta` отключён в каталоге. Старый параметр удаляется временным 307.
Остальные фильтры (`produkty`, `sostav`, `podarochnye`) остаются query-параметрами и не входят в canonical.

## Статьи

```text
/articles?page=2
→ 307 /articles/page2

/articles?page=3&napravlennost=kishechnik-i-immunitet
→ 307 /articles/page3?napravlennost=kishechnik-i-immunitet
```

Фильтры статей остаются отдельными query-фильтрами и работают через `/api/articles/filters`.

## Быстрая проверка curl

```bash
curl -I 'https://daigo.ru/catalog?napravlennost=kishechnik-i-immunitet'
curl -I 'https://daigo.ru/articles?page=2'
curl -I 'https://daigo.ru/catalog/kishechnik-i-immunitet/'
```

На тестовом этапе ожидается `307` и правильный `Location`.

## Canonical

Ожидаемые canonical:

```text
/catalog/kishechnik-i-immunitet?produkty=daigo-5ml
→ https://daigo.ru/catalog/kishechnik-i-immunitet

/articles/page2
→ https://daigo.ru/articles/page2
```

## Оптимизированные изображения карточек

Обычная сборка не зависит от внешнего API:

```bash
pnpm build
```

Если перед деплоем нужно предварительно скачать и подготовить WebP/AVIF каталога:

```bash
pnpm build:optimized
```

Карточка сначала использует `/images/optimized/.../w-640.webp`, затем при 404 автоматически откатывается на исходное изображение, а затем на placeholder.

## robots.txt

`public/robots.txt` собран на базе переданного файла, но конфликт с новой архитектурой устранён:

- чистые `/catalog/...` и `/articles/...` не блокируются вообще;
- `Disallow: /*?*` продолжает закрывать остальные параметрические дубли;
- старые `/catalog?...` SEO-фильтры и `/articles?page=N` временно `Allow`, чтобы робот смог увидеть 307 и перенести URL;
- после переключения миграционных редиректов на 301 и переобхода эти временные `Allow` можно удалить.


## ВАЖНО: максимальная глубина ЧПУ каталога

Индексируемый URL каталога имеет максимум один сегмент после `/catalog`:

```text
/catalog/kishechnik-i-immunitet
/catalog/helicobacter-pylori
```

Комбинации НЕ создают третий уровень URL:

```text
/catalog?napravlennost=kishechnik-i-immunitet&pomogaet-pri=helicobacter-pylori
  --307--> /catalog/kishechnik-i-immunitet?pomogaet-pri=helicobacter-pylori
```

Старый ошибочный многоуровневый URL также нормализуется:

```text
/catalog/kishechnik-i-immunitet/helicobacter-pylori
  --307--> /catalog/kishechnik-i-immunitet?pomogaet-pri=helicobacter-pylori
```

Страница с query получает `noindex, follow`, а canonical:

```text
https://daigo.ru/catalog/kishechnik-i-immunitet
```

Приоритет SEO-сегмента при комбинации: `napravlennost`, затем `pomogaet-pri`.

## Финальная миграция старого каталога mail.daigo.ru

Старый каталог использовал вложенные карточки вида:

```text
/catalog/metabiotik/metabiotik-daigo-10ml/
```

Текущие карточки плоские:

```text
/catalog/metabiotik-daigo-10ml
```

На этапе тестирования эти переходы находятся в том же временном SEO-блоке и возвращают `307`.
Проверенные пары берутся из уже существовавшей legacy-карты проекта, поэтому произвольный второй сегмент не превращается в товар.

Примеры:

```text
/catalog/metabiotik/metabiotik-daigo-10ml/  --307--> /catalog/metabiotik-daigo-10ml
/catalog/metabiotik/metabiotik-daigo/       --307--> /catalog/metabiotik-daigo
/catalog/aminobiotiki/daigo-brain/          --307--> /catalog/daigo-brain
/catalog/aminobiotiki/daigo-jointic/        --307--> /catalog/daigo-jointic
/catalog/gigiena/zubnaya-pasta-daigo-dent/  --307--> /catalog/zubnaya-pasta-daigo-dent
/catalog/nabory/beauty-box/                  --307--> /catalog/beauty-box
```

Быстрый тест:

```bash
curl -I 'https://daigo.ru/catalog/metabiotik/metabiotik-daigo-10ml/'
curl -I 'https://daigo.ru/catalog/aminobiotiki/daigo-brain/'
```

Ожидается `307 Temporary Redirect` и `Location` без раздела и без завершающего слэша.
После проверки меняется одна константа `SEO_TEST_REDIRECT_CODE = 307` на `301`.

## Статьи: trailing slash

Все URL раздела статей со слэшем в конце нормализуются на URL без слэша:

```text
/articles/                                         --307--> /articles
/articles/page2/                                   --307--> /articles/page2
/articles/primer-stati/                            --307--> /articles/primer-stati
/articles/primer-stati/?utm_source=test            --307--> /articles/primer-stati?utm_source=test
```

Это правило выполняется до маршрутизации страницы и сохраняет query-параметры.

## JSON-LD: что должно быть после сборки

Общий layout/app:

- `Organization` с единым `@id=https://daigo.ru/#organization`;
- `WebSite` с единым `@id=https://daigo.ru/#website`.

Карточка товара:

- `Product`;
- `Offer`/offers только при валидной цене;
- `AggregateRating` и `Review` только при наличии реальных SSR-отзывов;
- `BreadcrumbList`;
- `FAQPage`, когда FAQ реально присутствует.

Каталог:

- `CollectionPage`;
- `BreadcrumbList`;
- `ItemList` с текущими товарами.

Статья:

- `Article`;
- `BreadcrumbList` даже при отсутствии breadcrumbs в JSON статьи;
- `FAQPage`, когда FAQ реально есть.

Список статей:

- `CollectionPage`;
- `BreadcrumbList`;
- `ItemList` текущей страницы пагинации.

Проверять после деплоя следует по исходному HTML (`curl` или View Source), а не только по DOM после гидрации.


## Heading/title duplication cleanup

- `/catalog/<slug>/` -> `307 /catalog/<slug>` during test period.
- `/catalog/` -> `307 /catalog`.
- Product pages render the subtitle `<h2>` only when it is non-empty.
- Homepage has one stable `<h1>`; carousel slide titles are `<h2>` to prevent multiple H1s from Swiper slides.
- After validation, switch `SEO_TEST_REDIRECT_CODE` from `307` to `301`.

Checks:

```bash
curl -I https://daigo.ru/catalog/tamotsu/
curl -I https://daigo.ru/catalog/tamotsu
```

Expected: first request -> 307 to `/catalog/tamotsu`, second -> 200.
