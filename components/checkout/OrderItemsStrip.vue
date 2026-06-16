<script setup lang="ts">
import type { CartItem } from '~/stores/cartOrderStore'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

// props
const props = defineProps<{ items: CartItem[] }>()

// берём базовый домен для картинок из рантайм-конфига
const {
  // public: { testApiBase, daigoApiBase }
  public: { daigoApiBase }
} = useRuntimeConfig()

// что использовать как базу — сначала testApiBase, иначе daigoApiBase
// const IMG_BASE = (testApiBase || daigoApiBase || '').replace(/\/$/, '')
const IMG_BASE = (daigoApiBase || '').replace(/\/$/, '')

/**
 * Делаем абсолютный URL:
 * - если уже абсолютный (http/https, data:, blob:) — возвращаем как есть
 * - иначе аккуратно склеиваем с IMG_BASE
 */
function abs(src?: string) {
  const normalized = normalizeMediaUrl(src)
  if (!normalized) return ''
  if (/^(https?:)?\/\//.test(normalized) || /^data:|^blob:/.test(normalized)) return normalized
  if (normalized.startsWith('/media-s3/') || normalized.startsWith('/images/') || normalized.startsWith('/icons/')) return normalized
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`
  return `${IMG_BASE}${path}`
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-6 overflow-x-auto pb-2 sm:w-full">
    <div v-for="it in items" :key="it.id" class="flex flex-col items-start min-w-[80px] gap-2">
      <div class="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden">
        <!-- Вариант 1: обычный <img> -->
        <!-- <img v-if="it.img" :src="abs(it.img)" class="w-full h-full object-cover" /> -->

        <!-- Вариант 2: Nuxt Image (рекомендую) -->
        <img
          v-if="it.img"
          :src="abs(it.img)"
          :alt="it.title"
          width="112"
          height="112"
          format="webp"
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div class="mt-2 text-sm text-black/70 line-clamp-2 text-left">{{ it.title }}</div>
      <div class="text-xl">
        <span v-if="it.price === 0" class="text-green-600">Бесплатно</span>
        <span v-else>{{ it.price.toLocaleString('ru-RU') }} ₽</span>
      </div>
    </div>
  </div>
</template>
