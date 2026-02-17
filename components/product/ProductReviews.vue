<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'

type ReviewMedia = {
  id: string
  type: 'image' | 'video'
  thumb: string
  src?: string
}

type ReviewProduct = {
  slug?: string
  title: string
  image: string
}

type ReviewItem = {
  id: string
  author: string
  rating: number
  date?: string
  title?: string
  text: string
  source?: string
  verified?: boolean
  media?: ReviewMedia[]
  tags?: string[]
  product?: ReviewProduct
  i18n?: {
    ru: { title?: string; text: string }
    en?: { title?: string; text: string }
  }
}

const props = defineProps<{
  reviews?: {
    ratingAvg?: number
    count?: number
    items: ReviewItem[]
    source?: string
  }
  title?: string
  showActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'write'): void
  (e: 'question'): void
  (e: 'openMedia', media: ReviewMedia): void
}>()

const safeTitle = computed(() => props.title ?? 'Customer Reviews')
const showActions = computed(() => props.showActions ?? true)

const items = computed<ReviewItem[]>(() => props.reviews?.items ?? [])

const activeTag = ref<string>('Все')

const tags = computed(() => {
  const set = new Set<string>()
  for (const it of items.value) {
    for (const t of it.tags ?? []) set.add(t)
  }
  return ['Все', ...Array.from(set)]
})

watch(
  () => tags.value.join('|'),
  () => {
    if (!tags.value.includes(activeTag.value)) activeTag.value = 'Все'
  }
)

const filteredItems = computed(() => {
  if (activeTag.value === 'Все') return items.value
  return items.value.filter(it => (it.tags ?? []).includes(activeTag.value))
})

const count = computed(() => filteredItems.value.length)

const clampRating = (r: number) => Math.max(0, Math.min(5, Number.isFinite(r) ? r : 0))

const ratingAvg = computed(() => {
  if (!filteredItems.value.length) return 0
  const sum = filteredItems.value.reduce((acc, it) => acc + clampRating(it.rating), 0)
  return sum / filteredItems.value.length
})

const dist = computed(() => {
  const d: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const it of filteredItems.value) {
    const r = Math.round(clampRating(it.rating))
    if (r >= 1 && r <= 5) d[r]++
  }
  return d
})

const percent = (stars: number) => {
  const total = count.value || 1
  return Math.round(((dist.value[stars] || 0) / total) * 100)
}

const allMedia = computed(() => {
  const out: ReviewMedia[] = []
  for (const it of filteredItems.value) {
    if (it.media?.length) out.push(...it.media)
  }
  return out
})

const galleryLimit = 8
const gallery = computed(() => allMedia.value.slice(0, galleryLimit))
const rest = computed(() => Math.max(0, allMedia.value.length - galleryLimit))

const formatCount = (n: number) => new Intl.NumberFormat('ru-RU').format(Number.isFinite(n) ? n : 0)
const starsLabel = computed(() => `${ratingAvg.value.toFixed(1)} / 5`)

const openMedia = (m: ReviewMedia) => emit('openMedia', m)

type ReviewLang = 'ru' | 'en'
const lang = ref<ReviewLang>('en')

const isReviewModalOpen = ref(false)
const activeReview = ref<ReviewItem | null>(null)

const hasEn = (r: ReviewItem) => !!r.i18n?.en?.text

const getTitle = (r: ReviewItem) =>
  (lang.value === 'en' && hasEn(r) ? r.i18n?.en?.title : r.i18n?.ru?.title) ?? r.title

const getText = (r: ReviewItem) =>
  (lang.value === 'en' && hasEn(r) ? r.i18n?.en?.text : r.i18n?.ru?.text) ?? r.text

const openReview = (r: ReviewItem) => {
  activeReview.value = r
  if (lang.value === 'en' && !hasEn(r)) lang.value = 'ru'
  isReviewModalOpen.value = true
}

const closeReview = () => {
  isReviewModalOpen.value = false
  activeReview.value = null
}

const overflowMap = ref<Record<string, boolean>>({})

const setTextEl = (id: string, el: Element | null) => {
  if (!id) return
  if (!el) {
    delete overflowMap.value[id]
    overflowMap.value = { ...overflowMap.value }
    return
  }
  ;(el as HTMLElement).dataset.reviewId = id
}

const recalcOverflow = async () => {
  await nextTick()
  const root = document
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-review-id]'))
  const next: Record<string, boolean> = {}

  for (const el of els) {
    const id = el.dataset.reviewId || ''
    if (!id) continue

    // если контента больше чем видно — значит кламп реально обрезал
    const isOverflow = el.scrollHeight - el.clientHeight > 1
    next[id] = isOverflow
  }

  overflowMap.value = next
}

const shouldShowReadMore = (r: ReviewItem) => !!overflowMap.value[r.id]

watch(
  () => filteredItems.value.map(i => i.id).join('|') + '|' + activeTag.value,
  () => recalcOverflow()
)

watch(lang, () => recalcOverflow())

onMounted(() => {
  recalcOverflow()
  window.addEventListener('resize', recalcOverflow, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', recalcOverflow)
})
</script>

<template>
  <section v-if="items.length" class="mt-12">
    <div class="mx-auto">
      <h2 class="text-product leading-tight font-medium">
        {{ safeTitle }}
      </h2>

      <p class="text-lg mb-8 mt-4 whitespace-pre-line">Отзывы от клиентов Daigo со всего мира</p>

      <div class="mt-5 -mx-1 px-1 flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
        <button
          v-for="t in tags"
          :key="t"
          type="button"
          class="shrink-0 h-9 px-4 rounded-lg text-sm border transition"
          :class="activeTag === t
            ? 'bg-primary text-white'
            : 'bg-white text-[#111]'"
          @click="activeTag = t"
        >
          {{ t }}
        </button>
      </div>

      <div class="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-6 sm:px-7">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-[220px_1fr_180px] sm:gap-10">
          <div class="text-center sm:text-left">
            <div class="text-[44px] leading-none font-medium">
              {{ ratingAvg.toFixed(1) }}
            </div>

            <div class="mt-2 flex items-center justify-center sm:justify-start gap-1" aria-label="rating stars">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
                :class="i <= Math.round(ratingAvg) ? 'text-[#e3c97b]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>

            <div class="mt-2 text-sm text-[#6B7280]">
              {{ formatCount(count) }} Отзывов
              <span v-if="reviews?.source" class="mx-1">•</span>
              <span v-if="reviews?.source">{{ reviews.source }}</span>
            </div>

            <div class="sr-only">{{ starsLabel }}</div>
          </div>

          <div>
            <div class="space-y-2">
              <div v-for="s in [5, 4, 3, 2, 1]" :key="s" class="flex items-center gap-3">
                <div class="w-14 text-sm text-[#111]">{{ s }} Звезд</div>

                <div class="relative h-2 flex-1 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div
                    class="absolute left-0 top-0 h-full rounded-full bg-[#e3c97b] transition-all"
                    :style="{ width: percent(s) + '%' }"
                  />
                </div>

                <div class="w-10 text-right text-sm text-[#111]">
                  {{ dist[s] ?? 0 }}
                </div>
              </div>
            </div>

            <div v-if="gallery.length" class="mt-6">
              <div class="grid grid-cols-4 gap-3 sm:grid-cols-6">
                <button
                  v-for="(m, idx) in gallery"
                  :key="m.id + ':' + idx"
                  type="button"
                  class="group relative aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]"
                  @click="openMedia(m)"
                  aria-label="open media"
                >
                  <img :src="m.thumb" alt="" class="h-full w-full object-cover" loading="lazy" />

                  <div
                    v-if="m.type === 'video'"
                    class="absolute inset-0 grid place-items-center bg-black/15"
                  >
                    <div class="grid place-items-center h-9 w-9 rounded-full bg-white/90 shadow">
                      <svg viewBox="0 0 20 20" class="h-5 w-5 text-[#111]" fill="currentColor">
                        <path d="M8 5v10l8-5-8-5z" />
                      </svg>
                    </div>
                  </div>

                  <!-- +N overlay on last -->
                  <div
                    v-if="idx === gallery.length - 1 && rest > 0"
                    class="absolute inset-0 grid place-items-center bg-black/45 text-white font-semibold"
                  >
                    +{{ rest }}
                  </div>

                  <div class="absolute inset-0 ring-0 group-hover:ring-2 group-hover:ring-[#111] transition" />
                </button>
              </div>
            </div>

          </div>

          <!-- actions -->
          <div v-if="showActions" class="flex flex-col items-stretch gap-3">
            <button
              type="button"
              class="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition ms-auto"
              @click="emit('write')"
            >
              Написать отзыв
            </button>

            <!-- <button
              type="button"
              class="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111] hover:border-[#111] transition"
              @click="emit('question')"
            >
              Задать вопрос
            </button> -->
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="r in filteredItems"
          :key="r.id"
          class="rounded-2xl border border-[#E5E7EB] bg-white p-5 relative"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center text-sm font-semibold text-[#111]">
                  {{ (r.author?.[0] || '?').toUpperCase() }}
                </div>
                <div class="text-base font-semibold text-[#111]">{{ r.author }}</div>
              </div>

              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                <span
                  v-if="r.verified"
                  class="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] px-2 py-1 text-[#118A3B] mt-1 tracking-wide"
                >
                  <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path
                      fill-rule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.1 7.1a1 1 0 01-1.42 0l-3.1-3.1a1 1 0 011.42-1.42l2.39 2.39 6.39-6.39a1 1 0 011.42 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Подтвержденный покупатель
                </span>
                <span v-if="r.date">{{ r.date }}</span>
                <span v-if="r.source">• {{ r.source }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1" aria-label="review rating">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                :class="i <= clampRating(r.rating) ? 'text-[#e3c97b]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>
          </div>

          <div v-if="getTitle(r)" class="mt-3 text-sm font-medium">
            {{ getTitle(r) }}
          </div>

          <p
            class="mt-3 text-sm leading-6 text-[#111] review-clamp"
            :ref="(el) => setTextEl(r.id, el as Element | null)"
          >
            {{ getText(r) }}
          </p>

          <button
            v-if="shouldShowReadMore(r)"
            type="button"
            class="mt-3 text-sm font-medium text-primary hover:underline"
            @click="openReview(r)"
          >
            Читать полностью
          </button>

          <div v-if="r.product" class="mt-4 flex items-center gap-3 border-t border-[#F3F4F6] pt-4">
            <img :src="r.product.image" alt="" class="h-9 w-9 rounded-lg object-cover border border-[#E5E7EB]" />
            <div class="text-sm text-[#111] font-medium">
              {{ r.product.title }}
            </div>
          </div>

          <div v-if="hasEn(r)" class="mt-3 inline-flex rounded-lg border border-[#E5E7EB] overflow-hidden absolute right-3 bottom-3">
            <button class="px-3 py-1 text-xs" :class="lang==='ru' ? 'bg-primary text-white' : 'bg-white'" @click="lang='ru'">RU</button>
            <button class="px-3 py-1 text-xs" :class="lang==='en' ? 'bg-primary text-white' : 'bg-white'" @click="lang='en'">EN</button>
          </div>

        </article>
      </div>

      <UiModal
        :show="isReviewModalOpen"
        @close="closeReview"
        :panelClass="'sm:max-w-3xl p-0 overflow-hidden'"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
          <div class="text-lg font-medium">Отзыв</div>
          <button class="text-sm text-[#6B7280] hover:text-[#111]" @click="closeReview">Закрыть</button>
        </div>

        <div class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] grid place-items-center text-sm font-semibold text-[#111]">
                {{ (activeReview?.author?.[0] || '?').toUpperCase() }}
              </div>
              <div>
                <div class="text-base font-semibold text-[#111]">{{ activeReview?.author }}</div>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                  <span v-if="activeReview?.verified" class="inline-flex items-center gap-1 rounded-full bg-[#EAF7EE] px-2 py-1 text-[#118A3B]">
                    <svg viewBox="0 0 20 20" class="h-4 w-4" fill="currentColor"><path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.1 7.1a1 1 0 01-1.42 0l-3.1-3.1a1 1 0 011.42-1.42l2.39 2.39 6.39-6.39a1 1 0 011.42 0z" clip-rule="evenodd"/></svg>
                    Подтвержденный покупатель
                  </span>
                  <span v-if="activeReview?.date">{{ activeReview?.date }}</span>
                  <span v-if="activeReview?.source">• {{ activeReview?.source }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1" aria-label="review rating">
              <svg v-for="i in 5" :key="i" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"
                  :class="i <= clampRating(activeReview?.rating || 0) ? 'text-[#e3c97b]' : 'text-[#E5E7EB]'">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"/>
              </svg>
            </div>
          </div>

          <div v-if="activeReview && hasEn(activeReview)" class="mt-4 inline-flex rounded-lg border border-[#E5E7EB] overflow-hidden">
            <button class="px-3 py-2 text-sm" :class="lang==='ru' ? 'bg-primary text-white' : 'bg-white'" @click="lang='ru'">RU</button>
            <button class="px-3 py-2 text-sm" :class="lang==='en' ? 'bg-primary text-white' : 'bg-white'" @click="lang='en'">EN</button>
          </div>

          <div v-if="activeReview && getTitle(activeReview)" class="mt-4 text-sm font-medium text-[#111]">
            {{ getTitle(activeReview) }}
          </div>

          <p class="mt-3 text-sm leading-6 text-[#111] whitespace-pre-line">
            {{ activeReview ? getText(activeReview) : '' }}
          </p>

          <!-- media -->
          <div v-if="activeReview?.media?.length" class="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              v-for="m in activeReview.media"
              :key="m.id"
              type="button"
              class="relative aspect-video overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]"
              @click="openMedia(m)"
            >
              <img :src="m.thumb" alt="" class="h-full w-full object-cover" />
              <div v-if="m.type === 'video'" class="absolute inset-0 grid place-items-center bg-black/15">
                <div class="grid place-items-center h-9 w-9 rounded-full bg-white/90 shadow">
                  <svg viewBox="0 0 20 20" class="h-5 w-5 text-[#111]" fill="currentColor"><path d="M8 5v10l8-5-8-5z" /></svg>
                </div>
              </div>
            </button>
          </div>

          <!-- product -->
          <div v-if="activeReview?.product" class="mt-5 flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-3">
            <img :src="activeReview.product.image" alt="" class="h-10 w-10 rounded-lg object-cover border border-[#E5E7EB]" />
            <div class="text-sm font-medium text-[#111]">
              {{ activeReview.product.title }}
            </div>
          </div>
        </div>
      </UiModal>

    </div>
  </section>
</template>

<style scoped>
.review-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
