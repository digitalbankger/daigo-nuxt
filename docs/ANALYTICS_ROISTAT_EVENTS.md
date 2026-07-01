# Аналитика: Microsoft Clarity + передача целей в Roistat

## Где менять идентификаторы

Все публичные идентификаторы вынесены в `nuxt.config.ts` → `runtimeConfig.public`.

Поддерживаются переменные окружения:

```env
NUXT_PUBLIC_YM_ID=31773751
NUXT_PUBLIC_CLARITY_ID=xbgiz9fpnd
NUXT_PUBLIC_ROISTAT_PROJECT_ID=8d6f3bc978e0a498604ac6d0377f7a8b
NUXT_PUBLIC_ROISTAT_HOST=cloud.roistat.com
```

Дополнительно для событий Roistat:

```env
# Необязательный префикс для всех событий, например daigo_
NUXT_PUBLIC_ROISTAT_EVENT_PREFIX=

# Необязательная карта переименований, если ID события в Roistat отличается от ID цели Метрики/YTM
NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP={"addtocart":"add_to_cart_roistat","purchase":"purchase_roistat"}

# Можно отключить отдельные мосты, если маркетолог попросит
NUXT_PUBLIC_ROISTAT_BRIDGE_YM_GOALS=true
NUXT_PUBLIC_ROISTAT_BRIDGE_DATALAYER_EVENTS=true
```

## Что отправляется в Roistat

Клиентский плагин `plugins/roistat-events.client.ts` передает в Roistat:

1. Все прямые цели Яндекс.Метрики вида:

```ts
ym(counterId, 'reachGoal', 'goal_id', params)
```

2. Все бизнес-события, которые проект кладет в `dataLayer` для Yandex Tag Manager:

```ts
dataLayer.push({ event: 'view_cart', ... })
```

Системные события контейнеров `gtm.js`, `gtm.dom`, `gtm.load`, `gtm.historyChange` не отправляются, чтобы не засорять Roistat.

## Что нужно сделать в кабинете Roistat

В Roistat для каждого события нужно создать событие с условием `Передается через JavaScript`.

ID события в Roistat должен совпадать с ID, который отправляет сайт:

- если `NUXT_PUBLIC_ROISTAT_EVENT_PREFIX` пустой и нет карты переименований — ID события равен ID цели/события на сайте: `addtocart`, `purchase`, `view_cart`, `begin_checkout` и т.д.;
- если задан префикс — ID будет `prefix + eventName`;
- если задан `NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP`, для указанного события используется значение из карты.

## Проверка в браузере

В консоли можно выполнить:

```js
ym(31773751, 'reachGoal', 'test_goal', { debug: true })
```

Или:

```js
dataLayer.push({ event: 'test_data_layer_event', event_data: { debug: true } })
```

После этого в Roistat событие должно появиться в истории срабатываний, если такое событие создано в настройках Roistat.

## Найденные текущие ID целей/событий в проекте

Прямые цели Яндекс.Метрики через `useAnalytics.reach`:

```text
addtocart
purchase
form_submit
informer-click
may_quiz_start
may_quiz_question_answer
may_quiz_regular_phrase_copy
may_quiz_add_to_cart_click
may_quiz_add_to_cart
may_quiz_auth_success
may_quiz_complete
thank_page
```

События `dataLayer` / Yandex Tag Manager через `useYtm`:

```text
view_page
view_item_list
view_item
view_cart
product_click
add_to_cart
remove_from_cart
begin_checkout
checkout_progress
purchase
apply_promo
remove_promo
promo_view
promo_click
```
