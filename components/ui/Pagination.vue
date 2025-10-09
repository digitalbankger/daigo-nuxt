<script setup lang="ts">
import { computed, useRoute, useRouter } from '#imports'

const props = defineProps<{ current: number; total: number }>()
const route = useRoute()
const router = useRouter()

type PageItem =
  | { kind: 'dots'; side: 'left' | 'right' }
  | { kind: 'page'; value: number }

const pages = computed<PageItem[]>(() => {
  const items: PageItem[] = []
  const { current, total } = props
  const WINDOW = 10 // хотим видеть 10 номеров

  if (total <= WINDOW) {
    for (let i = 1; i <= total; i++) items.push({ kind: 'page', value: i })
    return items
  }

  // Считаем окно из 10 страниц, с центровкой вокруг current
  let start = current - Math.floor(WINDOW / 2) + 1 // так current ближе к центру
  let end = start + WINDOW - 1

  if (start < 1) { start = 1; end = WINDOW }
  if (end > total) { end = total; start = total - WINDOW + 1 }

  if (start > 1) items.push({ kind: 'dots', side: 'left' })
  for (let i = start; i <= end; i++) items.push({ kind: 'page', value: i })
  if (end < total) items.push({ kind: 'dots', side: 'right' })

  return items
})

const goToPage = (page: number) => {
  const p = Math.min(Math.max(1, page), props.total)
  if (p === props.current) return
  router.push({ path: route.path, query: { ...route.query, page: String(p) } })
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <ul class="flex gap-2 text-xl md:text-2xl justify-center items-center mt-10 mb-0 md:my-20">
    <li>
      <button
        class="text-black/50 hover:text-black me-2"
        :disabled="current === 1"
        @click="goToPage(current - 1)"
        aria-label="Предыдущая страница"
      >
        <img src="/icons/arrow-right-pag.svg" alt="" class="rotate-180 w-10/12 md:w-full" />
      </button>
    </li>

    <li v-for="(item, idx) in pages" :key="item.kind === 'page' ? `p-${item.value}` : `d-${item.side}-${idx}`">
      <button
        v-if="item.kind === 'page'"
        :class="['px-2 py-1 mb-1', item.value === current ? 'text-black' : 'text-black/50 hover:text-black']"
        @click="goToPage(item.value)"
        :aria-current="item.value === current ? 'page' : undefined"
      >
        {{ item.value }}
      </button>
      <span v-else class="text-black/50 px-2 select-none">…</span>
    </li>

    <li>
      <button
        class="text-black/50 hover:text-black ms-2"
        :disabled="current === total"
        @click="goToPage(current + 1)"
        aria-label="Следующая страница"
      >
        <img src="/icons/arrow-right-pag.svg" alt="" class="w-10/12 md:w-full" />
      </button>
    </li>
  </ul>
</template>
