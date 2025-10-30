<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useRoute, useRouter, useHead, watchEffect, computed } from '#imports'
import { useCatalogStore } from '~/stores/catalogStore'
import FilterPanel from '~/components/catalog/FilterPanel.vue'
import ProductCard from '~/components/catalog/ProductCard.vue'
import CatalogBanner from '~/components/catalog/CatalogBanner.vue'
import Pagination from '~/components/ui/Pagination.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import PromoHero from '~/components/catalog/PromoHero.vue'
import PromoLeadModal from '~/components/catalog/PromoLeadModal.vue'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const { reach } = useAnalytics()

await catalogStore.fetchFilters()
await catalogStore.fetchCatalogBanner()

const page = computed(() => Number(route.query.page || 1))

const PIVOT = 15 

const visibleProducts = computed(() => {
  const products = catalogStore.products.filter(p => (p.price ?? 0) > 0)

  return products.slice().sort((a, b) => {
    const aSort = Number.isFinite(+a.sort) ? +a.sort : 0
    const bSort = Number.isFinite(+b.sort) ? +b.sort : 0

    const aKey = aSort === 0 ? PIVOT + 0.5 : aSort
    const bKey = bSort === 0 ? PIVOT + 0.5 : bSort

    if (aKey !== bKey) return aKey - bKey

    // стабильный порядок внутри одинаковых ключей
    // сначала по name (если есть), иначе по id
    const aTie = String(a.title ?? a.product_id ?? '')
    const bTie = String(b.title ?? b.product_id ?? '')
    return aTie.localeCompare(bTie, 'ru')
  })
})

watchEffect(async () => {
  catalogStore.setPage(page.value)

  const normalizedQuery = Object.fromEntries(
    Object.entries(route.query)
      .filter(([key]) => key !== 'empty')
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value[0] ?? '' : value ?? ''
      ])
  ) as Record<string, string>

  await catalogStore.fetchProducts(normalizedQuery)

  if (visibleProducts.value.length === 0 && !('empty' in route.query)) {
    router.replace({ query: { ...route.query, empty: '1' } })
  }
})

useHead(() => {
  const query = route.query
  const filters = Object.entries(query)
    .filter(([k]) => !['page', 'empty'].includes(k))
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')

  const isEmpty = 'empty' in query
  const title = isEmpty
    ? 'Товары не найдены — Daigo'
    : `Каталог: ${filters} — Daigo`

  const description = isEmpty
    ? 'По вашему запросу товары не найдены.'
    : `Подборка товаров по фильтрам: ${filters}`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { name: 'robots', content: isEmpty ? 'noindex, follow' : 'index, follow' }
    ],
    link: [
      {
        rel: 'canonical',
        href: 'https://daigo.ru' + route.fullPath.split('&empty=1').join('')
      }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Daigo',
            url: 'https://daigo.ru/catalog'
          }
        })
      }
    ]
  }
})

const firstRowMobile = computed(() => visibleProducts.value.slice(0, 2))
const firstRowDesktop = computed(() => visibleProducts.value.slice(0, 3))

const otherProductsMobile = computed(() => visibleProducts.value.slice(2))
const otherProductsDesktop = computed(() => visibleProducts.value.slice(3))

const isFilterModalOpen = ref(false)

function openFilters() {
  isFilterModalOpen.value = true
}

function closeFilters() {
  isFilterModalOpen.value = false
}

function openChat() {
  if (typeof window !== 'undefined') {
    const cq = (window as any).carrotquest
    if (cq && typeof cq.open === 'function') cq.open()
    else if (cq && typeof cq.toggle === 'function') cq.toggle()
    else console.warn('Carrot quest не найден или не инициализировался')
    reach('promo_action')
  }
}

function onContact() {
  reach('promo_action')
  openChat()
}

const isLeadOpen = ref(false)

function openGiftModal() {
  isLeadOpen.value = true
}

function onLeadDone() {
  isLeadOpen.value = false
  reach('promo_lead_sent')
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <PromoHero
        class="mt-0 sm:mt-8 mb-8 sm:mb-12"
        title="Ваш подарок ждет вас - запросить у менеджера!"
        subtitle="Дарим подарки до 4 ноября"
        primary="Получить подарок"
        secondary="Связаться с менеджером"
        :deadline="'2025-11-04T23:59:59+03:00'"
        sideNote="Предложение ограничено по времени, до завершения акции осталось:"
        @primary="openGiftModal"
        @secondary="onContact"
      />
      <PromoLeadModal
        v-model:open="isLeadOpen"
        title="Получите свой подарок"
        subtitle="Менеджер закрепит подарок за вами и свяжется с вами в течение часа"
        @done="onLeadDone"
      />
      <div class="flex flex-row items-centr justify-between absolute z-0 bottom-0 left-0 text-white">
        <h1 class="text-slider font-medium mb-4 md:mb-10">Каталог</h1>
      </div>
      <div class="flex lg:hidden items-center gap-4 mb-6 relative z-10">
        <div
          class="flex flex-row justify-center items-center rounded-md bg-hoverbtn w-10 h-10 cursor-pointer flex-shrink-0"
          @click="openFilters"
          aria-label="Открыть фильтры"
        >
          <img src="/icons/filter.svg" width="20" alt="Фильтр" />
        </div>

        <div class="flex overflow-x-auto gap-4 no-scrollbar">
          <button
            v-for="tag in [
              { label: 'Кишечник и иммунитет', value: 'kishechnik-i-immunitet' },
              { label: 'Нервная система и мозг', value: 'mozg-i-nervnaya-sistema' },
              { label: 'Кожа и волосы', value: 'kozha-i-volosy' }
            ]"
            :key="tag.value"
            class="flex-shrink-0 px-4 py-2 rounded-md"
            :class="route.query.napravlennost === tag.value ? 'bg-primary text-white' : 'bg-hoverbtn'"
            @click="router.push({ query: { ...route.query, napravlennost: tag.value, page: '1' } })"
            type="button"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <Transition name="fade">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-0 z-40 bg-black/20"
          @click="closeFilters"
        />
      </Transition>

      <Transition name="slide-left">
        <div
          v-if="isFilterModalOpen"
          class="fixed inset-y-0 left-0 z-50 w-11/12 rounded-r-2xl sm:w-[500px] bg-white p-3 md:p-6 overflow-y-auto"
        >
          <div class="w-full flex justify-between items-center mb-4">
            <button @click="closeFilters" class="absolute top-4 right-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <FilterPanel :store="catalogStore" />
        </div>
      </Transition>

      <div class="flex flex-row gap-7">
        <aside class="hidden lg:block w-full lg:w-1/4">
          <FilterPanel :store="catalogStore" :with-shadow="true" />
        </aside>
        
        <div 
          v-if="visibleProducts.length"
          class="w-full lg:w-3/4"
        >
          <div class="grid grid-cols-2 gap-4 gap-y-6 lg:hidden">
            <ProductCard
              v-for="product in firstRowMobile"
              :key="product.id"
              :product="product"
            />
          </div>

          <div class="hidden lg:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <ProductCard
              v-for="product in firstRowDesktop"
              :key="product.id"
              :product="product"
            />
          </div>

          <p class="xs-max:text-base text-lg font-medium mx-auto text-center mt-20 border-y py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

          <CatalogBanner
            v-if="catalogStore.catalogBanner"
            :banner="catalogStore.catalogBanner"
            class="my-5 md:my-10"
          />

          <div class="grid grid-cols-2 gap-4 md:gap-6 gap-y-6 md:gap-y-20 md:hidden">
            <ProductCard
              v-for="product in otherProductsMobile"
              :key="product.id"
              :product="product"
            />
          </div>

          <div class="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 gap-y-6 md:gap-y-20">
            <ProductCard
              v-for="product in otherProductsDesktop"
              :key="product.id"
              :product="product"
            />
          </div>

          <Pagination :current="page" :total="catalogStore.totalPages" />

          <div class="mt-0 text-sm text-gray-700 leading-relaxed h-2 relative overflow-hidden">
            <h2 class="md:w-[88%] font-medium leading-tight mb-6 text-[clamp(2rem,6vw,2.8rem)] text-white">
              Широкий выбор биологически активных добавок на Daigo.ru
            </h2>
            <p class="mb-20 text-base md:text-lg text-white">
              Онлайн магазин БАДов «Дайго» - это надёжное место для покупки качественных биологически активных добавок. 
              <br>Забота о здоровье становится все более актуальной темой. Люди стремятся к жизни полной энергии и бодрости, и правильное питание играет здесь ключевую роль. 
              <br>Магазин «Дайго» предлагает широкий ассортимент БАДов, которые помогут поддержать организм в тонусе, улучшить общее состояние и повысить иммунитет. <br><br>Один из ключевых принципов магазина «Дайго» - это качество и безопасность продукции. Представленные на сайте товары прошли строгий контроль качества, что позволяет быть уверенными в их эффективности и безопасности для здоровья. Приятным бонусом для наших клиентов является удобная система заказа и доставки. Вы можете оформить покупку в любое время, не выходя из дома, и получить заказ в кратчайшие сроки. Забота о собственном здоровье — это важный шаг на пути к полноценной и счастливой жизни. Поддерживайте организм с помощью качественных биологически активных добавок из магазина «Дайго» и наслаждайтесь активным образом жизни!
            </p>
          </div>
        </div>

        <div v-else class="text-center text-black/70 m-auto">
          <p>Товары не найдены!<br/>Измените фильтры.</p>
        </div>
      </div>
    </section>
  </BaseContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(-100%);
}
.slide-left-enter-to {
  transform: translateX(0);
}
.slide-left-leave-from {
  transform: translateX(0);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
