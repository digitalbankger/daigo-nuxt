<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import type { Product } from '~/types/product'
import { useCartStore } from '~/stores/cartStore'

const props = defineProps<{ product: Product; observeTarget?: string }>()
const cartStore = useCartStore()

const isVisible = ref(false)
const adding = ref(false)

const hasDiscount = computed(() => props.product.oldPrice && props.product.oldPrice > props.product.price)
const productIdStr = computed(() => String(props.product.product_id))

/** список товаров с предзаказом */
const PREORDER_IDS = new Set<string>(['f5d348fc-bc07-4936-9f1e-0521dd6fc712'])
const isPreorder = computed(() => PREORDER_IDS.has(productIdStr.value))

const truncatedTitle = computed(() => {
  const t = props.product.title ?? ''
  const w = t.trim().split(/\s+/u)
  return w.length <= 4 ? t.trim() : w.slice(0, 4).join(' ') + '…'
})

const coverImageUrl = computed<string | null>(() => {
  const imgs = props.product.images || []
  if (!imgs.length) return null
  const sorted = [...imgs].sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.display_order || 0) - (b.display_order || 0)
  })
  return sorted[0]?.image_url || null
})

// Суммарное количество по String(id) — совместимо со стором и API
const quantityInCart = computed(() =>
  cartStore.items
    .filter(i => String(i.id) === productIdStr.value)
    .reduce((sum, i) => sum + i.quantity, 0)
)

async function ensureCartLoadedOnce() {
  if (cartStore.items.length === 0) {
    try { await cartStore.loadCart() } catch {}
  }
}

async function addToCartHandler() {
  if (adding.value) return
  if (!productIdStr.value) return
  adding.value = true
  try {
    await ensureCartLoadedOnce()
    await cartStore.addToCart({
      id: productIdStr.value as unknown as any, // строковый UUID
      title: props.product.title,
      subtitle: props.product.subtitle,
      price: props.product.price,
      oldPrice: props.product.oldPrice,
      quantity: 1,
      image: coverImageUrl.value ?? ''
    })
  } catch (e) {
    console.warn('addToCart failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

async function incrementHandler() {
  if (adding.value) return
  adding.value = true
  try {
    await cartStore.updateItem(productIdStr.value as unknown as any, (quantityInCart.value || 0) + 1)
  } catch (e) {
    console.warn('updateItem(+1) failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

async function decrementHandler() {
  if (adding.value) return
  adding.value = true
  try {
    await cartStore.updateItem(
      productIdStr.value as unknown as any,
      Math.max(0, (quantityInCart.value || 0) - 1)
    )
  } catch (e) {
    console.warn('updateItem(-1) failed, syncing cart...', e)
    await cartStore.loadCart()
  } finally {
    adding.value = false
  }
}

let io: IntersectionObserver | null = null
let handleScroll: (() => void) | null = null

onMounted(async () => {
  await ensureCartLoadedOnce()

  const selector = props.observeTarget || '#product-cta'
  const el = document.querySelector(selector)
  if (!el) return

  const updateVisibility = () => {
    const rect = el.getBoundingClientRect()
    const outOfView = rect.bottom < 0 || rect.top > window.innerHeight
    isVisible.value = outOfView && window.scrollY > 120
  }

  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      ([entry]) => { isVisible.value = !entry.isIntersecting && window.scrollY > 120 },
      { root: null, threshold: 0.01 }
    )
    io.observe(el)
  }

  handleScroll = updateVisibility
  window.addEventListener('scroll', handleScroll, { passive: true })
  updateVisibility()
})

onBeforeUnmount(() => {
  if (io) io.disconnect()
  if (handleScroll) window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <transition name="fade">
    <aside
      v-if="isVisible"
      class="fixed z-[60] left-1/2 -translate-x-1/2 bottom-16 sm:bottom-4 w-[92vw] sm:max-w-[680px]
             bg-white rounded-2xl shadow-xl border border-black/5
             p-3 sm:p-4 md:p-5 flex items-start sm:items-center gap-3 md:gap-5"
      aria-live="polite"
    >
      <div class="shrink-0">
        <img
          v-if="coverImageUrl"
          :src="coverImageUrl"
          :alt="product.title"
          width="64" height="64" format="webp" loading="lazy"
          class="w-14 h-14 md:w-16 md:h-16 rounded-xl object-contain bg-gray-50"
        />
        <div v-else class="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-100" />
      </div>
      <div class="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 w-full min-w-0">
      <div class="flex-1 min-w-0">
        <h3 class="block w-full max-w-full line-clamp-2 break-words text-sm sm:text-lg font-normal">{{ truncatedTitle }}</h3>
        <div class="mt-1 md:mt-2 flex items-baseline gap-2">
          <span v-if="hasDiscount" class="text-black/40 line-through text-xs md:text-sm">
            {{ product.oldPrice?.toLocaleString() }} ₽
          </span>
          <span class="text-cgreen text-lg md:text-xl font-medium">
            {{ product.price.toLocaleString() }} ₽
          </span>
        </div>
      </div>

      <!-- Если нет в корзине — кнопка -->
      <div v-if="isPreorder" class="shrink-0 flex flex-col gap-2">
        <a
          href="tel:88005552043"
          class="text-xs text-primary border-primary w-fit"
          aria-label="Позвонить для предзаказа"
        >
          8 (800) 555-20-43
        </a>
        <div
          class="inline-flex items-center justify-center px-4 md:px-5 h-10 md:h-12
                 rounded-lg sm:rounded-xl bg-hoverbtn text-black text-sm md:text-base
                 select-none cursor-default"
          aria-label="Предзаказ"
        >
          Предзаказ
        </div>
      </div>

      <button
        v-else-if="quantityInCart === 0"
        type="button"
        :disabled="adding"
        @click="addToCartHandler"
        class="shrink-0 inline-flex items-center gap-2 px-4 md:px-5 h-10 md:h-12
               rounded-lg sm:rounded-lg bg-primary text-white text-sm md:text-base
               hover:opacity-90 transition focus:outline-none focus:ring-none disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 32 32" class="fill-current"><path d="M0 5c0-.265.105-.52.293-.707C0.48 4.105.735 4 1 4h3c.223 0 .44.074.615.212.176.137.3.33.354.546L5.78 8H29c.152 0 .302.035.438.101.137.067.256.163.35.283.093.119.158.259.19.407.031.149.029.302-.007.45L26.97 21.242A1 1 0 0 1 26 22H8a1 1 0 0 1-.97-.758L3.22 6H1a1 1 0 0 1-1-1Zm6.28 5 2.5 10h16.44l2.5-10H6.28ZM10 26a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm14 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>
        В корзину
      </button>

      <!-- Если есть — компактный + / − -->
      <div class="flex flex-col gap-2"
        v-else
      >
        <div
          class="shrink-0 flex items-center gap-2 bg-primary text-white px-2 py-1 rounded-lg sm:rounded-xl h-10 md:h-12"
        >
          <button type="button" :disabled="adding" @click="decrementHandler" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 disabled:opacity-60" aria-label="Уменьшить количество">−</button>
          <span class="min-w-[2rem] text-center">{{ quantityInCart }} шт</span>
          <button type="button" :disabled="adding" @click="incrementHandler" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 disabled:opacity-60" aria-label="Увеличить количество">＋</button>
        </div>
      </div>
      </div>
    </aside>
  </transition>
</template>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .18s ease,transform .18s ease;}
.fade-enter-from,.fade-leave-to{opacity:0;transform:translate(-50%,8px);}
</style>
