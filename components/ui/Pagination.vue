<script setup lang="ts">
import { computed, useRoute, useRouter } from '#imports'

const props = defineProps<{ current: number; total: number }>()
const route = useRoute()
const router = useRouter()

const pages = computed(() => {
  const range: (number | string)[] = []
  const { current, total } = props

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
  } else {
    range.push(1)
    if (current > 4) range.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) range.push(i)
    if (current < total - 3) range.push('...')
    range.push(total)
  }
  return range
})

const goToPage = (page: number) => {
  router.push({ path: route.path, query: { ...route.query, page: page.toString() } })
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <ul class="flex gap-2 text-xl md:text-2xl justify-center items-center mt-10 mb-0 md:my-20">
    <li>
      <button class="text-black/50 hover:text-black me-2" :disabled="current === 1" @click="goToPage(current - 1)">
        <img src="/icons/arrow-right-pag.svg" alt="Previous" class="rotate-180 w-10/12 md:w-full" />
      </button>
    </li>
    <li v-for="item in pages" :key="item">
      <button
        v-if="item !== '...'"
        :class="['px-2 py-1 mb-1', item === current ? 'text-black' : 'text-black/50 hover:text-black']"
        @click="goToPage(item as number)"
      >
        {{ item }}
      </button>
      <span v-else class="text-black/50 px-2">...</span>
    </li>
    <li>
      <button class="text-black/50 hover:text-black ms-2" :disabled="current === total" @click="goToPage(current + 1)">
        <img src="/icons/arrow-right-pag.svg" alt="Next" class=" w-10/12 md:w-full" />
      </button>
    </li>
  </ul>
</template>
