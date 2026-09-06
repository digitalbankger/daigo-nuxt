<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import Breadcrumbs from '~/components/ui/Breadcrumbs.vue'

const route = useRoute()

const LABELS: Record<string, string> = {
  about: 'О нас',
  akcii: 'Акции',
  aminobiotics: 'Аминобиотики',
  articles: 'Статьи',
  bonusopad: 'Бонусопад',
  cart: 'Корзина',
  catalog: 'Каталог',
  certificates: 'Сертификаты',
  contacts: 'Контакты',
  dostavka: 'Доставка',
  faq: 'Частые вопросы',
  form: 'Форма',
  konkurs: 'Конкурс',
  'konkurs-policy': 'Правила конкурса',
  'loyalty-old': 'Программа лояльности',
  'microbiome-day': 'День микробиома',
  oplata: 'Оплата',
  order: 'Оформление заказа',
  orders: 'Мои заказы',
  otzyvy: 'Отзывы',
  plasmalogens: 'Плазмалогены',
  privacy: 'Политика конфиденциальности',
  profile: 'Профиль',
  'quality-and-safety': 'Качество и безопасность',
  researches: 'Исследования',
  'soglasie-na-obrabotku-personalnykh-dannykh': 'Согласие на обработку персональных данных',
  'soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok': 'Согласие на получение рассылок',
  'terms-sale': 'Условия продажи',
  thanks: 'Спасибо за заказ',
  'user-agreement': 'Пользовательское соглашение',
  'usloviya-dostavki': 'Условия доставки',
  'usloviya-vozvrata-i-obmena': 'Условия возврата и обмена',
  'womens-day': 'Женский день',
  type: 'Категория',
  item: 'Материал',
}

function humanize(segment: string) {
  const decoded = decodeURIComponent(segment)
  const pageMatch = decoded.match(/^page(\d+)$/i)
  if (pageMatch) return `Страница ${pageMatch[1]}`

  const known = LABELS[decoded]
  if (known) return known

  const normalized = decoded.replace(/[-_]+/g, ' ').trim()
  if (!normalized) return decoded
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const shouldRender = computed(() => {
  if (route.path === '/') return false
  return !(route.meta as Record<string, unknown>).hideGlobalBreadcrumbs
})

const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  // Служебные динамические идентификаторы не выводим пользователю как UUID/ID.
  if (segments[0] === 'thanks' && segments.length > 1) {
    return [{ title: LABELS.thanks, to: route.path }]
  }

  let path = ''
  return segments.map((segment) => {
    path += `/${segment}`
    return {
      title: humanize(segment),
      to: path,
    }
  })
})
</script>

<template>
  <BaseContainer v-if="shouldRender">
    <div class="pt-3 md:pt-4">
      <Breadcrumbs :crumbs="crumbs" />
    </div>
  </BaseContainer>
</template>
