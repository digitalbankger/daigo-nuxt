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
      <div class="w-full text-left text-xl flex justify-between items-center">
        {{ group.label }}
      </div>

      <div class="mt-5 space-y-4">
        <label
          v-for="option in group.options"
          :key="option.value"
          class="flex items-center gap-2 text-base"
        >
          <BaseCheckbox
            :modelValue="Boolean(selected[group.slug]?.includes(option.value))"
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
import { computed, reactive, watch, onMounted } from 'vue'
import type { FilterGroup } from '~/types/filter'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import {
  buildCatalogFilterLocation,
  getCatalogTrackingQuery,
  mergeCatalogFilters,
  parseCatalogQueryFilters,
  parseCatalogSeoPathSegments,
  stableCatalogFiltersKey,
  type CatalogFilterValues,
} from '~/utils/catalogFilterRoute'

const props = defineProps<{
  store: {
    filters: FilterGroup[]
    counts: Record<string, number>
    fetchCounts: (baseQuery?: Record<string, string[]>) => void | Promise<void>
  }
  withShadow?: boolean
}>()

const filters = computed(() => props.store.filters)
const counts = computed(() => props.store.counts)

const router = useRouter()
const route = useRoute()
const selected = reactive<Record<string, string[]>>({})
const allowedSlugs = computed(() => new Set(filters.value.map((group) => group.slug)))

let countsTimer: ReturnType<typeof setTimeout> | null = null
let didHydrate = false
let syncingRoute = false


function toggleOption(groupSlug: string, value: string) {
  if (!Array.isArray(selected[groupSlug])) selected[groupSlug] = []
  const index = selected[groupSlug].indexOf(value)
  if (index === -1) selected[groupSlug].push(value)
  else selected[groupSlug].splice(index, 1)
}

function cleanedSelected(): CatalogFilterValues {
  const clean: CatalogFilterValues = {}

  for (const [key, values] of Object.entries(selected)) {
    if (!allowedSlugs.value.has(key)) continue
    if (Array.isArray(values) && values.length) clean[key] = [...values]
  }

  return clean
}

function currentRouteFilters(): CatalogFilterValues {
  return mergeCatalogFilters(
    parseCatalogSeoPathSegments(route.params.filters),
    parseCatalogQueryFilters(route.query as Record<string, unknown>, allowedSlugs.value),
  )
}

function hydrateFromRoute() {
  syncingRoute = true
  const current = currentRouteFilters()

  for (const group of filters.value) {
    selected[group.slug] = [...(current[group.slug] || [])]
  }

  queueMicrotask(() => {
    syncingRoute = false
    didHydrate = true
  })
}

function queueCountsRecalc(delay = 120) {
  if (countsTimer) clearTimeout(countsTimer)
  countsTimer = setTimeout(() => {
    props.store.fetchCounts(cleanedSelected())
  }, delay)
}

function routeToSelectedFilters() {
  const location = buildCatalogFilterLocation(cleanedSelected())
  const tracking = getCatalogTrackingQuery(route.query as Record<string, unknown>)

  return router.push({
    path: location.path,
    query: { ...location.query, ...tracking },
    hash: route.hash,
  })
}

function clearFilters() {
  for (const group of filters.value) selected[group.slug] = []
  const tracking = getCatalogTrackingQuery(route.query as Record<string, unknown>)
  router.push({ path: '/catalog', query: tracking, hash: route.hash })
  queueCountsRecalc(0)
}

onMounted(() => {
  hydrateFromRoute()

  // Количества в фильтрах не нужны для первого экрана. Старый вариант через
  // 400 мс начинал полную выборку товаров и конкурировал с LCP. Считаем их
  // только в idle-период (или максимум через ~2.5 с).
  const requestIdle = (window as any).requestIdleCallback as undefined | ((cb: () => void, options?: { timeout?: number }) => number)
  if (requestIdle) {
    requestIdle(() => queueCountsRecalc(0), { timeout: 2500 })
  } else {
    window.setTimeout(() => queueCountsRecalc(0), 1800)
  }
})

watch(
  () => filters.value.map((group) => group.slug).join('|'),
  () => {
    hydrateFromRoute()
    queueCountsRecalc(200)
  },
)

watch(
  () => [route.path, route.query, route.params.filters],
  () => {
    hydrateFromRoute()
  },
  { deep: true },
)

watch(
  selected,
  async () => {
    if (!didHydrate || syncingRoute) return

    queueCountsRecalc(120)

    const currentKey = stableCatalogFiltersKey(currentRouteFilters())
    const selectedKey = stableCatalogFiltersKey(cleanedSelected())
    if (currentKey === selectedKey) return

    await routeToSelectedFilters()
  },
  { deep: true },
)
</script>
