<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="onClose" />
        <article class="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-auto bg-white rounded-2xl p-6 shadow-xl">
          <header class="mb-4 pr-10">
            <h3 class="text-xl font-semibold">{{ review?.author }}</h3>
            <p v-if="review?.date" class="text-sm text-gray-500 mt-1">
              {{ new Date(review!.date as any).toLocaleDateString('ru-RU') }}
            </p>
            <button class="absolute top-3 right-3 rounded-xl px-3 py-1 bg-gray-100 hover:bg-gray-200" @click="onClose">
              Закрыть
            </button>
          </header>

          <div class="prose max-w-none whitespace-pre-line">
            {{ review?.feedback_preview }}
          </div>

          <section v-if="relatedProducts.length" class="mt-6">
            <h4 class="font-medium mb-3">Сопутствующие товары</h4>
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
              <NuxtLink
                v-for="p in relatedProducts" :key="p.product_id || p.id"
                :to="p.slug ? `/catalog/${p.slug}` : `/product/${p.id}`"
                class="block border rounded-xl p-3 hover:shadow"
              >
                <SmartImg :src="p.image" :alt="p.name" class="w-full h-28 object-contain mb-2" loading="lazy" />
                <div class="text-sm line-clamp-2">{{ p.name }}</div>
              </NuxtLink>
            </div>
          </section>
        </article>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Review } from '~/types/content'
import { useProductsByIds } from '~/composables/useProductsByIds'

const props = defineProps<{
  show: boolean
  review: Review | null
  onClose: () => void
}>()

const ids = computed<(string|number)[]>(() => props.review?.productIds ?? [])
const { items: relatedProducts } = useProductsByIds(ids)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
