# Проверка 404 после деплоя

Прямой HTTP-запрос должен вернуть именно статус 404, а не 200 с пустым layout.

```bash
curl -I https://daigo.ru/this-page-does-not-exist
curl -I https://daigo.ru/catalog/this-product-does-not-exist
curl -I https://daigo.ru/articles/this-article-does-not-exist
curl -I https://daigo.ru/articles/page9999
curl -I https://daigo.ru/researches/this-category-does-not-exist
curl -I https://daigo.ru/researches/item/this-research-does-not-exist
```

Для каждого ожидается `HTTP/... 404`.

Контрольные URL должны остаться `200`:

```bash
curl -I https://daigo.ru/
curl -I https://daigo.ru/catalog
curl -I https://daigo.ru/articles
```

На клиентском переходе Nuxt теперь использует fatal route errors, поэтому вместо пустого layout также открывается error.vue.
