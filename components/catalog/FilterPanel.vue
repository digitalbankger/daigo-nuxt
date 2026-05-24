<template>
  <div
    :class="[
      'bg-white max-w-[500px] mx-auto rounded-xl p-6 pb-20 lg:p-6',
      { 'shadow-fp': withShadow }
    ]"
  >
    <h3 class="font-medium leading-tight mb-6 text-[clamp(1.6rem,6vw,2.2rem)]">Фильтры</h3>

    <div
      v-for="group in filters"
      :key="group.slug"
      class="border-b border-gray-200 py-3"
    >
      <button
        class="w-full text-left text-xl flex justify-between items-center"
        @click="toggle(group.slug)"
      >
        {{ group.label }}
        <span
          :class="isOpen(group.slug) ? '-rotate-90' : 'rotate-90'"
          class="transition-transform"
        >
          <img src="/icons/arrow-right-pag.svg" class="opacity-60" width="8" />
        </span>
      </button>

      <div v-if="isOpen(group.slug)" class="mt-5 space-y-4">
        <label
          v-for="option in group.options"
          :key="option.value"
          class="flex items-center gap-2 text-base"
        >
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
import { useRoute, useRouter } from 'vue-router'
import { computed, reactive, ref, watch, onMounted } from 'vue'
import type { FilterGroup } from '~/types/filter'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'

const props = defineProps<{
  store: {
    filters: FilterGroup[]
    counts: Record<string, number>
    fetchCounts: (baseQuery?: Record<string, string[]>) => void
  }
  withShadow?: boolean
}>()

const filters = computed(() => props.store.filters)
const counts  = computed(() => props.store.counts)

const router = useRouter()
const route  = useRoute()
const selected = reactive<Record<string, string[]>>({})
const opened   = ref<string[]>([])

const allowedSlugs = computed(() => new Set(filters.value.map(g => g.slug)))

let countsTimer: ReturnType<typeof setTimeout> | null = null
let didScheduleInitialCounts = false

function queueCountsRecalc(delay = 120) {
  if (countsTimer) clearTimeout(countsTimer)
  countsTimer = setTimeout(() => {
    props.store.fetchCounts(cleanedSelected())
  }, delay)
}

function scheduleInitialCounts() {
  if (didScheduleInitialCounts) return
  didScheduleInitialCounts = true

  if (typeof window !== 'undefined') {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
    }

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleWindow.requestIdleCallback(() => queueCountsRecalc(0), { timeout: 1500 })
      return
    }
  }

  queueCountsRecalc(1200)
}

function toggle(slug: string) {
  opened.value.includes(slug)
    ? (opened.value = opened.value.filter(s => s !== slug))
    : opened.value.push(slug)
}
function isOpen(slug: string) { return opened.value.includes(slug) }

function toggleOption(groupSlug: string, value: string) {
  if (!Array.isArray(selected[groupSlug])) selected[groupSlug] = []
  const index = selected[groupSlug].indexOf(value)
  if (index === -1) selected[groupSlug].push(value)
  else selected[groupSlug].splice(index, 1)
}

function clearFilters() {
  for (const key in selected) selected[key] = []
  router.push({ path: route.path, query: {} })
  queueCountsRecalc(0)
}

function cleanedSelected(): Record<string, string[]> {
  const clean: Record<string, string[]> = {}
  const allow = allowedSlugs.value
  for (const [k, v] of Object.entries(selected)) {
    if (!allow.has(k)) continue
    if (Array.isArray(v) && v.length) clean[k] = [...v]
  }
  return clean
}

function hydrateFromRoute() {
  const allow = allowedSlugs.value
  for (const key of Object.keys(selected)) {
    if (allow.has(key)) selected[key] = []
  }

  for (const [key, raw] of Object.entries(route.query)) {
    if (!allow.has(key)) continue
    const values =
      typeof raw === 'string'
        ? raw.split(',').filter(Boolean)
        : Array.isArray(raw)
          ? raw.flatMap(v => typeof v === 'string' ? v.split(',') : []).filter(Boolean)
          : []
    selected[key] = values
  }
}

onMounted(() => {
  hydrateFromRoute()
  scheduleInitialCounts()
})

watch(() => filters.value.length, () => {
  hydrateFromRoute()
  scheduleInitialCounts()
})

watch(selected, () => {
  if (!didScheduleInitialCounts) return
  queueCountsRecalc(120)
}, { deep: true })

watch(selected, () => {
  const query: Record<string, string> = {}
  const allow = allowedSlugs.value
  for (const [k, arr] of Object.entries(selected)) {
    if (!allow.has(k)) continue
    if (arr?.length) query[k] = arr.join(',')
  }
  const currentQuery = Object.fromEntries(
    Object.entries(route.query)
      .filter(([key]) => allow.has(key))
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] ?? '' : String(value ?? '')])
  )

  if (JSON.stringify(currentQuery) !== JSON.stringify(query)) {
    router.push({ path: route.path, query })
  }
}, { deep: true })

watch(() => route.query, () => {
  hydrateFromRoute()
}, { deep: true })
</script>
