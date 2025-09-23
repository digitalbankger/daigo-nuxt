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
              class="text-sm text-gray-500"
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

/** Только слаги реальных групп фильтров (для отбраковки page/empty и пр.) */
const allowedSlugs = computed(() => new Set(filters.value.map(g => g.slug)))

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
  router.push({ path: route.path, query: { page: '1' } })
  props.store.fetchCounts({})
}

/** Очищенная копия selected: только разрешённые ключи и непустые массивы */
function cleanedSelected(): Record<string, string[]> {
  const clean: Record<string, string[]> = {}
  const allow = allowedSlugs.value
  for (const [k, v] of Object.entries(selected)) {
    if (!allow.has(k)) continue
    if (Array.isArray(v) && v.length) clean[k] = [...v]
  }
  return clean
}

/** Заполняем selected из URL только по разрешённым слагам */
function hydrateFromRoute() {
  const allow = allowedSlugs.value
  for (const [key, raw] of Object.entries(route.query)) {
    if (!allow.has(key)) continue
    const values =
      typeof raw === 'string'
        ? raw.split(',').filter(Boolean)
        : Array.isArray(raw)
          ? raw.flatMap(v => typeof v === 'string' ? v.split(',') : []).filter(Boolean)
          : []
    if (values.length) selected[key] = values
  }
}

onMounted(() => {
  hydrateFromRoute()
  props.store.fetchCounts(cleanedSelected())
})

/** Если фильтры загрузились позже — повторно инициализируем из URL и пересчитаем */
watch(() => filters.value, () => {
  // не затираем уже выбранное — только добавим недостающие из URL
  hydrateFromRoute()
  props.store.fetchCounts(cleanedSelected())
}, { deep: true })

// Обновляем количество при выборе фильтров (с очищением ключей)
watch(selected, () => {
  props.store.fetchCounts(cleanedSelected())
}, { deep: true })

// Обновляем URL при изменении выбранных фильтров (только фильтровые ключи)
watch(selected, () => {
  const query: Record<string, string> = {}
  const allow = allowedSlugs.value
  for (const [k, arr] of Object.entries(selected)) {
    if (!allow.has(k)) continue
    if (arr?.length) query[k] = arr.join(',')
  }
  query.page = '1'
  router.push({ path: route.path, query })
}, { deep: true })
</script>
