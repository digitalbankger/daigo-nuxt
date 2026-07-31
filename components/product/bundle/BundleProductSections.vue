<script setup lang="ts">
import type { BundleContentSection, BundleRelatedProduct } from '~/types/product'
import { useCartStore } from '~/stores/cartStore'

defineProps<{
  sections: BundleContentSection[]
}>()

const formatMoney = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)

const cartStore = useCartStore()
const addingProductId = ref<string | null>(null)

const addRelatedProductToCart = async (product: BundleRelatedProduct) => {
  const productId = String(product.product_id)
  if (addingProductId.value || !product.variant_id) return
  addingProductId.value = productId
  try {
    await cartStore.addToCart({
      id: productId,
      variantId: product.variant_id,
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.image,
      tag: 'bundle',
    })
  } finally {
    addingProductId.value = null
  }
}
</script>

<template>
  <div id="bundle-description" class="space-y-8 py-4 sm:space-y-12 sm:py-10">
    <template v-for="(section, sectionIndex) in sections" :key="`${section.type}-${sectionIndex}`">
      <section v-if="section.type === 'feature-grid'" class="space-y-5">
        <h2 v-if="section.title" class="text-3xl font-medium sm:text-product xl:text-slider mb-4">
          {{ section.title }}
        </h2>

        <div class="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <article
            v-if="section.cards[0]"
            class="relative min-h-[260px] overflow-hidden rounded-2xl bg-[#F7F7F7] p-5 sm:min-h-[320px] sm:p-7"
          >
            <div class="relative z-10 max-w-[74%]">
              <h3 class="text-xl font-medium sm:text-4xl">{{ section.cards[0].title }}</h3>
              <hr class="my-4 border-black/10">
              <div class="space-y-3 text-sm leading-relaxed sm:text-base" v-html="section.cards[0].text" />
            </div>
            <img
              v-if="section.cards[0].image"
              :src="section.cards[0].image"
              :alt="section.cards[0].title"
              class="absolute bottom-20 right-0 h-[78%] w-[42%] object-contain object-bottom"
              loading="lazy"
              decoding="async"
            >
          </article>

          <div class="grid gap-4 sm:grid-cols-2 lg:gap-6">
            <article
              v-for="card in section.cards.slice(1, 5)"
              :key="card.title"
              class="relative min-h-[190px] overflow-hidden rounded-2xl bg-[#F7F7F7] p-5"
            >
              <div class="relative z-10 max-w-full">
                <h3 class="text-base font-medium leading-tight sm:text-lg">{{ card.title }}</h3>
                <hr class="my-3 border-black/10">
                <div class="text-sm leading-relaxed max-w-[78%]" v-html="card.text" />
              </div>
              <img
                v-if="card.image"
                :src="card.image"
                :alt="card.title"
                class="absolute bottom-2 right-2 h-[150px] w-[160px] object-contain object-right-bottom"
                loading="lazy"
                decoding="async"
              >
            </article>
          </div>
        </div>

                <div
          v-if="section.cards.length > 5"
          class="grid gap-4 lg:grid-cols-2 lg:gap-6"
        >
          <article
            v-for="card in section.cards.slice(5, 7)"
            :key="card.title"
            class="relative min-h-[250px] overflow-hidden rounded-2xl bg-[#F7F7F7] p-5 sm:p-7"
          >
            <div
              class="relative z-10"
              :class="card.image ? 'max-w-[72%]' : 'max-w-full'"
            >
              <h3 class="text-xl font-medium leading-tight sm:text-2xl">
                {{ card.title }}
              </h3>

              <hr class="my-4 border-black/10">

              <div
                class="space-y-3 text-sm leading-relaxed sm:text-base"
                v-html="card.text"
              />
            </div>

            <img
              v-if="card.image"
              :src="card.image"
              :alt="card.title"
              class="absolute bottom-0 right-0 h-[70%] w-[38%] object-contain object-right-bottom"
              loading="lazy"
              decoding="async"
            >
          </article>
        </div>
      </section>

      <section
        v-else-if="section.type === 'split'"
        class="grid items-stretch gap-5 lg:grid-cols-2 lg:gap-8"
      >
        <div
          class="min-h-[280px] overflow-hidden rounded-2xl bg-[#F7F7F7]"
          :class="section.imagePosition === 'right' ? 'lg:order-2' : ''"
        >
          <img
            :src="section.image"
            :alt="section.imageAlt || section.title"
            class="h-full min-h-[280px] w-full object-cover"
            loading="lazy"
            decoding="async"
          >
        </div>

        <div class="flex flex-col justify-center">
          <h2 class="text-2xl font-medium leading-tight sm:text-4xl">{{ section.title }}</h2>
          <div class="mt-4 space-y-3 text-sm leading-relaxed sm:text-base" v-html="section.content" />

          <div
            v-if="section.noteTitle || section.noteContent"
            class="mt-5 rounded-2xl bg-[#F7F7F7] p-5"
          >
            <h3 v-if="section.noteTitle" class="text-2xl font-medium">{{ section.noteTitle }}</h3>
            <hr class="mb-2 mt-3 w-7/12"/>
            <div v-if="section.noteContent" class="mt-2 text-base leading-relaxed" v-html="section.noteContent" />
            <a
              v-if="section.linkHref && section.linkLabel"
              :to="section.linkHref"
              class="mt-4 inline-flex text-sm text-primary underline-offset-4 hover:underline cursor-pointer"
            >
              {{ section.linkLabel }}
            </a>
          </div>
        </div>
      </section>

      <section v-else-if="section.type === 'wide-image'" class="overflow-hidden rounded-[18px] sm:rounded-[44px] bg-[#EEF4FF]">
        <img
          :src="section.image"
          :alt="section.imageAlt || ''"
          class="h-auto w-full object-cover"
          loading="lazy"
          decoding="async"
        >
      </section>

      <section
        v-else-if="section.type === 'checklist'"
        class="grid items-center gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-8"
      >
        <div
          class="overflow-hidden rounded-2xl bg-[#F7F7F7]"
          :class="section.imagePosition === 'right' ? 'lg:order-2' : ''"
        >
          <img
            :src="section.image"
            :alt="section.imageAlt || section.title"
            class="aspect-[4/3] w-full object-cover"
            loading="lazy"
            decoding="async"
          >
        </div>

        <div>
          <h2 class="text-2xl font-medium leading-tight sm:text-3xl">{{ section.title }}</h2>
          <div v-if="section.content" class="mt-4 text-sm leading-relaxed sm:text-base" v-html="section.content" />
          <ul class="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
            <li v-for="item in section.items" :key="item" class="flex gap-3">
              <span class="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section v-else-if="section.type === 'related-products'" class="space-y-5">
        <h2 v-if="section.title" class="text-2xl font-medium sm:text-3xl">
          {{ section.title }}
        </h2>

        <div class="grid gap-5 lg:grid-cols-3 lg:gap-10">
          <article
            v-for="relatedProduct in section.products"
            :key="relatedProduct.product_id"
            class="grid min-h-[230px] grid-cols-[minmax(0,1.08fr)_minmax(140px,0.92fr)] overflow-hidden rounded-2xl bg-white shadow-productcard"
          >
            <NuxtLink :to="`/catalog/${relatedProduct.slug}`" class="block min-h-0 overflow-hidden">
              <img
                :src="relatedProduct.image"
                :alt="relatedProduct.title"
                class="h-full min-h-[230px] w-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </NuxtLink>
            <div class="flex min-w-0 flex-col p-4">
              <NuxtLink :to="`/catalog/${relatedProduct.slug}`" class="text-base font-normal leading-[1.15] hover:text-primary">
                {{ relatedProduct.title }}
              </NuxtLink>
              <div class="mt-auto pt-4">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span v-if="relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price" class="text-sm text-black/40 line-through">
                    {{ formatMoney(relatedProduct.originalPrice) }} ₽
                  </span>
                  <span class="text-lg font-medium text-cgreen">{{ formatMoney(relatedProduct.price) }} ₽</span>
                </div>
                <button
                  type="button"
                  class="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-primary px-3 text-sm text-white transition hover:bg-hoverbtn hover:text-black disabled:cursor-wait disabled:opacity-70"
                  :disabled="addingProductId === String(relatedProduct.product_id)"
                  @click="addRelatedProductToCart(relatedProduct)"
                >
                  <img src="/icons/add-to-cart.svg" alt="" class="mr-2 size-5 shrink-0">
                  {{ addingProductId === String(relatedProduct.product_id) ? 'Добавляем…' : 'В корзину' }}
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </template>
  </div>
</template>
