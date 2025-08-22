<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { useRoute, useRouter, useHead, watchEffect, computed } from '#imports'
import { useCatalogStore } from '~/stores/catalogStore'
import FilterPanel from '~/components/catalog/FilterPanel.vue'
import ProductCard from '~/components/catalog/ProductCard.vue'
import CatalogBanner from '~/components/catalog/CatalogBanner.vue'
import Pagination from '~/components/ui/Pagination.vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()

await catalogStore.fetchFilters()
await catalogStore.fetchCatalogBanner()

const page = computed(() => Number(route.query.page || 1))

watchEffect(async () => {
  catalogStore.setPage(page.value)

  const normalizedQuery = Object.fromEntries(
    Object.entries(route.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? '' : value ?? ''
    ])
  ) as Record<string, string>

  await catalogStore.fetchProducts(normalizedQuery)

  if (catalogStore.products.length === 0 && !('empty' in route.query)) {
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
    : `Подборка: ${filters} — Daigo`

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

const firstRow = computed(() => catalogStore.products.slice(0, 3))
const otherProducts = computed(() => catalogStore.products.slice(3))

const isFilterModalOpen = ref(false)

function openFilters() {
  isFilterModalOpen.value = true
}

function closeFilters() {
  isFilterModalOpen.value = false
}

</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-centr justify-between">
        <h1 class="text-slider font-medium mb-10">Каталог</h1>
        <div class="md:hidden flex flex-row items-center gap-4 cursor-pointer" @click="openFilters">
          <p class="text-2xl">Фильтры</p>
          <img src="/icons/sort.svg" class="" width="20"/>
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
          class="fixed inset-y-0 left-0 z-50 w-full sm:w-[500px] bg-white p-6 overflow-y-auto"
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

      <div 
        class="flex flex-row gap-7"
      >
        <aside class="w-full lg:w-1/4">
          <FilterPanel :store="catalogStore" />
        </aside>
        
        <div 
          v-if="catalogStore.products.length"
          class="w-full lg:w-3/4"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-20  items-start">
            <ProductCard
              v-for="product in firstRow"
              :key="product.id"
              :product="product"
            />
          </div>

          <CatalogBanner
            v-if="catalogStore.catalogBanner"
            :banner="catalogStore.catalogBanner"
            class="my-10"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-20">
            <ProductCard
              v-for="product in otherProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <Pagination :current="page" :total="catalogStore.totalPages" />

          <div class="mt-10 text-sm text-gray-700 leading-relaxed">
            <h2 class="md:w-[88%] font-medium leading-tight mb-6 text-[clamp(2rem,6vw,2.8rem)]">
              Широкий выбор биологически активных добавок на Daigo.ru
            </h2>
            <p class="mb-20 text-base md:text-lg">
              Онлайн магазин БАДов «Дайго» - это надёжное место для покупки качественных биологически активных добавок. 
              <br>Забота о здоровье становится все более актуальной темой. Люди стремятся к жизни полной энергии и бодрости, и правильное питание играет здесь ключевую роль. 
              <br>Магазин «Дайго» предлагает широкий ассортимент БАДов, которые помогут поддержать организм в тонусе, улучшить общее состояние и повысить иммунитет. <br><br>Один из ключевых принципов магазина «Дайго» - это качество и безопасность продукции. Представленные на сайте товары прошли строгий контроль качества, что позволяет быть уверенными в их эффективности и безопасности для здоровья. Приятным бонусом для наших клиентов является удобная система заказа и доставки. Вы можете оформить покупку в любое время, не выходя из дома, и получить заказ в кратчайшие сроки. Забота о собственном здоровье — это важный шаг на пути к полноценной и счастливой жизни. Поддерживайте организм с помощью качественных биологически активных добавок из магазина «Дайго» и наслаждайтесь активным образом жизни!
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
