<script setup lang="ts">
import { computed, ref } from 'vue'

type ReviewMedia = {
  id: string
  type: 'image' | 'video'
  thumb: string    
  src?: string  
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
}

const props = defineProps<{
  reviews?: {
    ratingAvg?: number
    count?: number
    items: ReviewItem[]
    source?: string
  }
  title?: string
  // если хочешь прятать кнопки, например на лендинге
  showActions?: boolean
}>()

const emit = defineEmits<{
  (e: 'write'): void
  (e: 'question'): void
  (e: 'openMedia', media: ReviewMedia): void
}>()

const safeTitle = computed(() => props.title ?? 'Customer Reviews')
const showActions = computed(() => props.showActions ?? true)

const items = computed(() => props.reviews?.items ?? [])
const count = computed(() => filteredCount.value)

const activeTag = ref<string>('Все')

const tags = computed(() => {
  const set = new Set<string>()
  for (const it of items.value) {
    for (const t of (it.tags ?? [])) set.add(t)
  }
  return ['Все', ...Array.from(set)]
})

const filteredItems = computed(() => {
  if (activeTag.value === 'Все') return items.value
  return items.value.filter(it => (it.tags ?? []).includes(activeTag.value))
})

const filteredCount = computed(() => filteredItems.value.length)


const clampRating = (r: number) => Math.max(0, Math.min(5, r))

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

const formatCount = (n: number) => new Intl.NumberFormat('ru-RU').format(n)

const starsLabel = computed(() => `${ratingAvg.value.toFixed(1)} / 5`)

// лёгкий “скелет” под модалку — если захочешь открыть превью
const activeMedia = ref<ReviewMedia | null>(null)
const openMedia = (m: ReviewMedia) => {
  activeMedia.value = m
  emit('openMedia', m)
}
</script>

<template>
  <section v-if="items.length" class="mt-12">
    <div class="mx-auto">
      <h2 class="text-center text-2xl sm:text-3xl font-semibold text-[#111]">
        {{ safeTitle }}
      </h2>

      <div class="mt-5 flex flex-wrap justify-center gap-2">
        <button
          v-for="t in tags"
          :key="t"
          type="button"
          class="h-9 px-4 rounded-full text-sm border transition"
          :class="activeTag === t
            ? 'bg-[#111] text-white border-[#111]'
            : 'bg-white text-[#111] border-[#E5E7EB] hover:border-[#111]'"
          @click="activeTag = t"
        >
          {{ t }}
        </button>
      </div>

      <div class="mt-6 rounded-2xl border border-[#E5E7EB] bg-white px-5 py-6 sm:px-7">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-[220px_1fr] sm:gap-10">
          <div class="text-center sm:text-left">
            <div class="text-[44px] leading-none font-semibold text-[#111]">
              {{ ratingAvg.toFixed(1) }}
            </div>

            <div class="mt-2 flex items-center justify-center sm:justify-start gap-1" aria-label="rating stars">
              <svg
                v-for="i in 5"
                :key="i"
                class="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
                :class="i <= Math.round(ratingAvg) ? 'text-[#16A34A]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>

            <div class="mt-2 text-sm text-[#6B7280]">
              {{ formatCount(count) }} reviews
              <span v-if="reviews?.source" class="mx-1">•</span>
              <span v-if="reviews?.source">{{ reviews.source }}</span>
            </div>

            <div class="sr-only">{{ starsLabel }}</div>
          </div>

          <div>
            <div class="space-y-2">
              <div v-for="s in [5, 4, 3, 2, 1]" :key="s" class="flex items-center gap-3">
                <div class="w-12 text-sm text-[#111]">{{ s }} Star</div>

                <div class="relative h-2 flex-1 rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div
                    class="absolute left-0 top-0 h-full rounded-full bg-[#16A34A] transition-all"
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

            <!-- actions -->
            <div v-if="showActions" class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                class="h-11 rounded-xl border border-[#111] bg-white px-4 text-sm font-semibold text-[#111] hover:bg-[#111] hover:text-white transition"
                @click="emit('write')"
              >
                Write a review
              </button>

              <button
                type="button"
                class="h-11 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111] hover:border-[#111] transition"
                @click="emit('question')"
              >
                Ask a question
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="r in filteredItems"
          :key="r.id"
          class="rounded-2xl border border-[#E5E7EB] bg-white p-5"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-base font-semibold text-[#111]">{{ r.author }}</div>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                <span v-if="r.verified" class="rounded-full bg-[#EAF7EE] px-2 py-1 text-[#118A3B]">
                  Verified
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
                :class="i <= clampRating(r.rating) ? 'text-[#16A34A]' : 'text-[#E5E7EB]'"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z"
                />
              </svg>
            </div>
          </div>

          <div v-if="r.title" class="mt-3 text-sm font-semibold text-[#111]">{{ r.title }}</div>
          <p class="mt-3 text-sm leading-6 text-[#111]">{{ r.text }}</p>
        </article>
      </div>

      <teleport to="body">
        <div
          v-if="activeMedia"
          class="fixed inset-0 z-[60] bg-black/60 p-4 sm:p-8"
          @click.self="activeMedia = null"
        >
          <div class="mx-auto max-w-[900px] overflow-hidden rounded-2xl bg-white">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <div class="text-sm font-semibold text-[#111]">Media</div>
              <button class="text-sm text-[#6B7280] hover:text-[#111]" @click="activeMedia = null">
                Close
              </button>
            </div>

            <div class="bg-black">
              <img
                v-if="activeMedia.type === 'image'"
                :src="activeMedia.src || activeMedia.thumb"
                alt=""
                class="w-full max-h-[80vh] object-contain"
              />
              <video
                v-else
                class="w-full max-h-[80vh]"
                controls
                :src="activeMedia.src"
              />
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </section>
</template>
