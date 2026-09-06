# Fix пустых SEO-маршрутов

Проверить после `pnpm dev`:

- `http://localhost:3000/catalog/mozg-i-nervnaya-sistema` -> каталог с активным SEO-фильтром.
- `http://localhost:3000/catalog/kishechnik-i-immunitet` -> каталог с активным SEO-фильтром.
- `http://localhost:3000/articles/page2` -> вторая страница списка статей.
- `http://localhost:3000/catalog/metabiotik-daigo` -> обычная карточка товара.

Причина пустой страницы: custom route указывал на промежуточный компонент без route meta `layout: main`.
В текущей архитектуре `app.vue` рендерит только `NuxtLayout`, а `NuxtPage` находится внутри `layouts/main.vue`,
поэтому layout должен быть известен до mount page-компонента. `setPageLayout()` внутри промежуточного компонента вызывался слишком поздно.

Исправление: custom SEO routes теперь напрямую используют `pages/catalog/index.vue` и `pages/articles/index.vue`
и получают `meta: { layout: 'main' }` уже на этапе формирования route table.

Дополнительно cart-init перенесён на `app:mounted`, чтобы API корзины не менял client VDOM до hydration.
Это устраняет основные mismatch предупреждения CartBadge/ProductCard из приложенного лога.
