<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[100] overflow-y-auto overscroll-contain p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Полный текст отзыва"
        @keydown.esc="onClose"
      >
        <div class="fixed inset-0 bg-black/40" aria-hidden="true" @click="onClose" />

        <div class="relative z-10 flex min-h-full items-center justify-center">
          <article
            class="flex w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            @click.stop
          >
            <header class="relative shrink-0 border-b border-black/10 px-5 py-4 pr-14 sm:px-6 sm:py-5 sm:pr-16">
              <h3 class="text-xl font-medium">{{ review?.author }}</h3>
              <p v-if="review?.date" class="mt-1 text-sm text-gray-500">
                {{ new Date(review!.date as any).toLocaleDateString('ru-RU') }}
              </p>
              <button
                type="button"
                class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl leading-none transition hover:bg-gray-200"
                aria-label="Закрыть отзыв"
                @click="onClose"
              >
                ×
              </button>
            </header>

            <div
              class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
              style="-webkit-overflow-scrolling: touch;"
              @wheel.stop
              @touchmove.stop
            >
              <div class="prose max-w-none whitespace-pre-line">
                {{ review?.feedback_preview }}
              </div>

              <section v-if="relatedProducts.length" class="mt-6 pb-1">
                <h4 class="mb-3 font-medium">Сопутствующие товары</h4>
                <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <NuxtLink
                    v-for="p in relatedProducts"
                    :key="p.product_id || p.id"
                    :to="p.slug ? `/catalog/${p.slug}` : `/product/${p.id}`"
                    class="block rounded-xl border p-3 hover:shadow"
                  >
                    <SmartImg
                      :src="p.image"
                      :alt="p.name"
                      class="mb-2 h-28 w-full object-contain"
                      loading="lazy"
                    />
                    <div class="line-clamp-2 text-sm">{{ p.name }}</div>
                  </NuxtLink>
                </div>
              </section>
            </div>
          </article>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Review } from '~/types/content'
import { useProductsByIds } from '~/composables/useProductsByIds'
import { useBodyScrollLock } from '~/composables/useBodyScrollLock'

const props = defineProps<{
  show: boolean
  review: Review | null
  onClose: () => void
}>()

const ids = computed<(string | number)[]>(() => props.review?.productIds ?? [])
const { items: relatedProducts } = useProductsByIds(ids)

useBodyScrollLock(computed(() => props.show))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
