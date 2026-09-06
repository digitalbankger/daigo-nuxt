# Исправление optimized-изображений каталога v2

FirstVDS использует два эквивалентных вида URL:

- `https://products.s3.firstvds.ru/daigo-5/product-3.png`
- `https://s3.firstvds.ru/products/daigo-5/product-3.png`

После нормализации оба превращаются в `/media-s3/products/daigo-5/product-3.png`, но build-time генератор сохраняет optimized-файлы по исходному host/path.

Каталожная карточка теперь последовательно пробует:

1. `remote/products.s3.firstvds.ru/...`
2. `remote/s3.firstvds.ru/products/...`
3. `local/products/...`
4. исходный `/media-s3/...`
5. placeholder

Это позволяет использовать уже сгенерированные файлы независимо от формы URL, которую вернул API.
