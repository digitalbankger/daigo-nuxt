# Исправление optimized изображений каталога

Проблема: API каталога нормализует FirstVDS URL в `/media-s3/...` до передачи в `CatalogCardImage`.
Build-time скрипт при этом сохраняет оптимизированные файлы по пути `images/optimized/remote/s3.firstvds.ru/...`.
Ранее `utils/optimizedImage.ts` специально считал `/media-s3/...` не оптимизируемым, поэтому карточка вообще не пыталась использовать уже созданный WebP и сразу брала исходный `/media-s3/...`.

Исправлено сопоставление:

`/media-s3/products/daigo-5/product-3.png`
→ `/images/optimized/remote/s3.firstvds.ru/products/daigo-5/product-3/w-640.webp`

Fallback на исходный `/media-s3/...` и placeholder сохранён.
