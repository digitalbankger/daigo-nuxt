<template>
  <div class="bg-white max-w-[500px] mx-auto rounded-xl p-6 pb-20 lg:p-6">
    <h3 class="font-medium leading-tight mb-6 text-[clamp(1.6rem,6vw,2.2rem)]">Фильтры статей</h3>

    <div v-for="group in filters" :key="group.slug" class="border-b border-gray-200 py-3">
      <button
        class="w-full text-left text-xl flex justify-between items-center"
        type="button"
        @click="toggle(group.slug)"
      >
        {{ group.label }}
        <span :class="isOpen(group.slug) ? '-rotate-90' : 'rotate-90'" class="transition-transform">
          <img src="/icons/arrow-right-pag.svg" class="opacity-60" width="8" alt="" />
        </span>
      </button>

      <div v-if="isOpen(group.slug)" class="mt-5 space-y-4">
        <label v-for="option in group.options" :key="option.value" class="flex items-center gap-2 text-base">
          <BaseCheckbox
            :modelValue="selected[group.slug]?.includes(option.value)"
            @update:modelValue="toggleOption(group.slug, option.value)"
          >
            {{ option.label }}
            <span
              v-if="counts[`${group.slug}__${option.value}`] !== undefined"
              class="inline-block min-w-[3ch] text-right text-sm text-gray-500"
            >
              ({{ counts[`${group.slug}__${option.value}`] }})
            </span>
          </BaseCheckbox>
        </label>
      </div>
    </div>

    <Button variant="outline" class="mt-3 w-full" @click="clearFilters">
      Очистить фильтры
    </Button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import type { FilterGroup } from '~/types/filter'

const props = defineProps<{
  store: {
    filters: FilterGroup[]
    counts: Record<string, number>
    fetchCounts: (baseQuery?: Record<string, string[]>, search?: string) => void | Promise<void>
  }
}>()

const route = useRoute()
const router = useRouter()
const filters = computed(() => props.store.filters)
const counts = computed(() => props.store.counts)
const selected = reactive<Record<string, string[]>>({})
const opened = ref<string[]>([])
const allowed = computed(() => new Set(filters.value.map(group => group.slug)))
let syncing = false
let ready = false
let countTimer: ReturnType<typeof setTimeout> | null = null

function toggle(slug: string) {
  opened.value.includes(slug)
    ? (opened.value = opened.value.filter(item => item !== slug))
    : opened.value.push(slug)
}

function isOpen(slug: string) {
  return opened.value.includes(slug)
}

function toggleOption(slug: string, value: string) {
  if (!Array.isArray(selected[slug])) selected[slug] = []
  const index = selected[slug].indexOf(value)
  if (index === -1) selected[slug].push(value)
  else selected[slug].splice(index, 1)
}

function hydrate() {
  syncing = true
  for (const group of filters.value) {
    const raw = route.query[group.slug]
    const values = typeof raw === 'string'
      ? raw.split(',').map(v => v.trim()).filter(Boolean)
      : Array.isArray(raw)
        ? raw.flatMap(v => String(v || '').split(',')).map(v => v.trim()).filter(Boolean)
        : []
    selected[group.slug] = values
  }
  queueMicrotask(() => {
    syncing = false
    ready = true
  })
}

function cleanedSelected() {
  const result: Record<string, string[]> = {}
  for (const [key, values] of Object.entries(selected)) {
    if (allowed.value.has(key) && values.length) result[key] = [...values]
  }
  return result
}

function selectedQuery() {
  const query: Record<string, string> = {}
  const q = String(route.query.q ?? '').trim()
  if (q) query.q = q
  for (const [key, values] of Object.entries(cleanedSelected())) query[key] = values.join(',')
  return query
}

function queueCounts() {
  if (countTimer) clearTimeout(countTimer)
  countTimer = setTimeout(() => {
    props.store.fetchCounts(cleanedSelected(), String(route.query.q ?? '').trim())
  }, 120)
}

function clearFilters() {
  for (const group of filters.value) selected[group.slug] = []
  const q = String(route.query.q ?? '').trim()
  router.push({ path: '/articles', query: q ? { q } : {} })
  queueCounts()
}

onMounted(() => {
  hydrate()
  queueCounts()
})

watch(() => [route.query, filters.value.length], () => {
  hydrate()
  queueCounts()
}, { deep: true })

watch(selected, () => {
  if (!ready || syncing) return
  queueCounts()
  router.push({ path: '/articles', query: selectedQuery() })
}, { deep: true })
</script>
