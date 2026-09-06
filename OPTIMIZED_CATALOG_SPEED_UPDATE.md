# Оптимизация изображений каталога

Изменения:

- optimized-файлы выбираются только по build-time manifest, без перебора предполагаемых S3-путей и лишних 404;
- исходный URL из API используется как ключ manifest, поэтому поддерживаются `products.s3.firstvds.ru`, `s3.firstvds.ru`, `api.daigo.ru`, `daigo.ru` и другие источники, которые реально попали в генератор;
- карточки используют `<picture>` с AVIF/WebP и `srcset` 480/640;
- первые 3 карточки каталога получают `loading=eager` + `fetchpriority=high`, остальные — `loading=lazy` + `fetchpriority=auto`;
- блок «Продукты недели» больше не поднимает приоритет всех изображений;
- `pnpm build`, `pnpm dev` и `pnpm generate` синхронизируют компактную build-time карту из `public/images/optimized/manifest.json`;
- `pnpm build:optimized` сначала создаёт изображения, затем карту manifest и только после этого собирает проект;
- генератор проверяет физическое наличие всех AVIF/WebP-вариантов и восстанавливает их, если manifest есть, а файлы были удалены.

## Команды

Первичная генерация или после изменения изображений:

```bash
pnpm build:optimized
```

Обычная последующая сборка, если `public/images/optimized` уже заполнен:

```bash
pnpm build
```

Проверка количества optimized-файлов:

```bash
find public/images/optimized -type f | wc -l
find .output/public/images/optimized -type f | wc -l
```

Следующий этап — настроить Nginx на прямую отдачу `/images/optimized/` и `/_nuxt/` с долгим immutable cache. `/media-s3/` пока оставить как fallback.
