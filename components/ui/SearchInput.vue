<!-- <template>
  <div class="relative w-[416px]">
    <input
      v-model="searchQuery"
      :placeholder="placeholder"
      type="text"
      class="w-full h-order rounded-md bg-hoverbtn ps-14 pe-6 py-2 transition border-none focus:ring-1 focus:ring-primary focus:outline-none"
      @input="emit('update:modelValue', searchQuery)"
      @focus="showDropdown = true"
      @blur="hideDropdown"
    />

    <div v-if="!hideIcon" class="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#a09ea3"/>
      </svg>
    </div>

    <button v-if="searchQuery" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" @click="clearSearch">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#49454F"/>
      </svg>
    </button>

    <div v-if="dropdownEnabled && showDropdown" class="absolute z-50 top-full left-0 w-full mt-1 rounded-md border bg-white shadow-lg pb-2">
      <div class="p-3 space-y-4 text-sm text-gray-700">
        <div v-if="productsFiltered.length">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Товары</h3>
          <SearchResultItem
            v-for="product in productsFiltered"
            :key="product.id"
            :title="product.name"
            :subtitle="formatPrice(product.price) + ' ₽'"
            :image="getFullImageUrl(product.images?.[0]?.image_url)"
            :to="`/product/${product.url_cpu}`"
          />
          <button class="text-blue-500 text-sm transition duration-300 mt-2" @click="goToCatalog">
            Смотреть все товары →
          </button>
        </div>

        <div v-if="promosFiltered.length">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Акции</h3>
          <SearchResultItem
            v-for="promo in promosFiltered"
            :key="promo.id"
            :title="promo.name"
            :subtitle="promo.description"
            :image="getFullImageUrl(promo.banner_url)"
            :to="`/deals?search=${searchQuery}`"
          />
          <button class="text-blue-500 text-sm transition duration-300 mt-2" @click="goToPromotions">
            Смотреть все акции →
          </button>
        </div>

        <p v-if="!productsFiltered.length && !promosFiltered.length" class="text-center text-gray-500">
          Ничего не найдено
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/composables/store/productStore'
import { usePromoStore } from '@/composables/store/promotionStore'
import SearchResultItem from '@/components/ui/SearchResultItem.vue'

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Поиск...' },
  dropdownEnabled: { type: Boolean, default: true },
  hideIcon: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'search'])

const searchQuery = ref(props.modelValue || '')
const showDropdown = ref(false)

const router = useRouter()
const route = useRoute()

const productStore = useProductStore()
const promoStore = usePromoStore()

onMounted(() => {
  if (!productStore.products.length) productStore.fetchProducts()
})

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU').format(price)

const getFullImageUrl = (url?: string) =>
  url?.startsWith('http') ? url : `https://api.daigo.ru${url}`

const goToCatalog = () => {
  router.push({ path: '/catalog', query: { search: searchQuery.value } })
  showDropdown.value = false
}

const goToPromotions = () => {
  router.push({ path: '/deals', query: { search: searchQuery.value } })
  showDropdown.value = false
}

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  if (route.path === '/catalog') router.replace({ query: {} })
  showDropdown.value = false
}

const productsFiltered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return productStore.products
    .filter(p =>
      p.product_id !== 'ca16b1e3-f6bd-4845-9079-7c66ba9d1a26' &&
      (p.name?.toLowerCase().includes(q) || p.name_ru?.toLowerCase().includes(q))
    )
    .slice(0, 3)
})

const promosFiltered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return promoStore.promotions
    .filter(p =>
      [p.name, p.description, p.coupon].some(s => s?.toLowerCase().includes(q))
    )
    .slice(0, 3)
})
</script> -->









<template>
  <div class="relative w-[416px]">
    <input
      v-model="searchQuery"
      :placeholder="placeholder"
      type="text"
      class="w-full h-order rounded-md bg-hoverbtn ps-14 pe-6 py-2 transition border-none focus:ring-1 focus:ring-primary focus:outline-none"
      @focus="showDropdown = true"
      @blur="hideDropdown"
    />

    <div class="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]">
      <img src="/icons/search.svg"/>
    </div>

    <button
      v-if="searchQuery"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      @click="clearSearch"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#49454F" />
      </svg>
    </button>

    <div
      v-if="dropdownEnabled && showDropdown"
      class="absolute z-50 top-full left-0 w-full mt-1 rounded-md border bg-white shadow-lg pb-2"
    >
      <div class="p-3 space-y-4 text-sm text-gray-700">
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2">Результаты</h3>

          <div class="flex items-center gap-3 py-2 hover:bg-gray-100 cursor-pointer">
            <div class="w-12 h-12 bg-gray-200 rounded-sm" />
            <div>
              <p class="text-sm mb-1">Тестовый товар</p>
              <p class="text-xs text-gray-400">1 990 ₽</p>
            </div>
          </div>

          <div class="flex items-center gap-3 py-2 hover:bg-gray-100 cursor-pointer">
            <div class="w-12 h-12 bg-gray-200 rounded-sm" />
            <div>
              <p class="text-sm mb-1">Ещё товар</p>
              <p class="text-xs text-gray-400">990 ₽</p>
            </div>
          </div>

          <button class="text-blue-500 text-sm transition duration-300 mt-2 text-left">
            Смотреть все →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Поиск...' },
  dropdownEnabled: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref(props.modelValue || '')
const showDropdown = ref(false)

const clearSearch = () => {
  searchQuery.value = ''
  emit('update:modelValue', '')
  showDropdown.value = false
}

const hideDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}
</script>
