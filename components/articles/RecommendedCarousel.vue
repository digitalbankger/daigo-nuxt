<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

type Item = {
  id: number | string
  slug: string
  title: string
  image: string
  preview?: string
  date?: string               // ISO или «ДД.ММ.ГГГГ»
  time?: number | string      // минуты
  views?: number
  comments?: number
}

const props = defineProps<{
  items: Item[]
  title?: string
}>()

const rail = ref<HTMLDivElement | null>(null)

// gap должен совпадать с классом gap-x-4 (16px)
const GAP = 16

/** прокрутка на ширину одной карточки (+ gap) */
function slide(dir: 1 | -1) {
  const el = rail.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('[data-card]')
  const step = (card?.offsetWidth || el.clientWidth * 0.86) + GAP
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

/** клавиатура: ← → */
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') slide(-1)
  if (e.key === 'ArrowRight') slide(1)
}

onMounted(() => rail.value?.addEventListener('keydown', onKey))
onBeforeUnmount(() => rail.value?.removeEventListener('keydown', onKey))

function fmtDate(d?: string) {
  if (!d) return ''
  // если пришла ISO — красиво форматируем, если нет — отдаем как есть
  const t = Date.parse(d)
  return isNaN(t) ? d : new Date(t).toLocaleDateString('ru-RU')
}
</script>

<template>
  <!-- мобильная секция; на десктопе скрыта -->
  <section
    v-if="items?.length"
    class="md:hidden mt-10"
    role="region"
    aria-labelledby="rec-title"
  >
    <div class="flex items-center justify-between mb-4">
      <h3 id="rec-title" class="text-slider leading-tight font-medium">
        {{ title || 'Рекомендации для вас' }}
      </h3>
    </div>

    <div
      ref="rail"
      tabindex="0"
      class="flex gap-x-4 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1"
      aria-roledescription="карусель"
    >
      <NuxtLink
        v-for="it in items"
        :key="it.id"
        :to="`/articles/${it.slug}`"
        data-card
        class="snap-start shrink-0 w-full bg-white overflow-hidden focus:outline-none focus:shadow-fp group"
      >
        <!-- картинка, как на общей карточке -->
        <div class="w-full h-[285px] overflow-hidden rounded-[15px] mb-4">
          <img
            :src="it.image"
            :alt="it.title"
            width="416"
            height="350"
            format="webp"
            quality="80"
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 86vw, 416px"
            class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <!-- заголовок -->
        <h4 class="text-2xl font-medium text-black leading-tight mb-2">
          {{ it.title }}
        </h4>

        <!-- превью -->
        <p class="text-sm text-left text-black mb-2 line-clamp-3">
          {{ it.preview }}
        </p>

        <!-- мета -->
        <div class="text-sm text-black/50 flex flex-wrap gap-2 mt-auto">
          <span class="flex flex-row gap-2 items-center">
            <img src="/icons/calendar.svg" class="w-4 opacity-50" />
            {{ fmtDate(it.date) }}
          </span>
          <span v-if="it.time != null" class="flex flex-row gap-2 items-center">
            <img src="/icons/clock.svg" class="w-3 opacity-50" />
            {{ it.time }} мин
          </span>
          <span v-if="it.views != null" class="flex flex-row gap-2 items-center">
            <img src="/icons/eye.svg" class="w-4 opacity-50" />
            {{ it.views }}
          </span>
          <span v-if="it.comments != null" class="flex flex-row gap-2 items-center">
            <img src="/icons/comments.svg" class="w-4 opacity-50" />
            {{ it.comments }}
          </span>
        </div>
      </NuxtLink>
    </div>
    <!-- кастомные стрелки -->
      <div class="flex items-center justify-center gap-6 w-full mt-4">
        <button
          class="swiper-button-prev-partner w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Назад"
          type="button"
          @click="slide(-1)"
        >
          <img src="/icons/arrow-left.svg" alt="" class="w-full" />
        </button>
        <button
          class="swiper-button-next-partner w-8 h-8 rounded-full flex items-center justify-center"
          aria-label="Вперёд"
          type="button"
          @click="slide(1)"
        >
          <img src="/icons/arrow-right.svg" alt="" class="w-full" />
        </button>
      </div>
  </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
