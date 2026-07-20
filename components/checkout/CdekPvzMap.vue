<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRuntimeConfig } from '#imports'

type CdekCity = { code: number; city: string; region?: string; country_code?: string }
type CdekOffice = {
  code: string
  uuid?: string
  address_comment?: string
  nearest_station?: string
  work_time?: string
  location: { city_code: number; city: string; address: string; latitude: number; longitude: number }
}

const props = defineProps<{ city?: string | null; modelValue?: CdekOffice | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: CdekOffice | null): void; (e: 'select', value: CdekOffice): void }>()

const config = useRuntimeConfig()
const yandexKey = computed(() => String(config.public.yandexMapsApiKey || ''))

const cityQuery = ref(String(props.city || ''))
const cities = ref<CdekCity[]>([])
const selectedCityCode = ref<number | null>(null)
const offices = ref<CdekOffice[]>([])
const loadingCities = ref(false)
const loadingOffices = ref(false)
const error = ref('')
const selected = ref<CdekOffice | null>(props.modelValue || null)
const mapEl = ref<HTMLElement | null>(null)
const map = shallowRef<any>(null)
const objectManager = shallowRef<any>(null)
let cityTimer: ReturnType<typeof setTimeout> | undefined
let scriptPromise: Promise<any> | null = null

const canLoadMap = computed(() => !!yandexKey.value)
const cityLabel = (c: CdekCity) => [c.city, c.region, c.country_code].filter(Boolean).join(', ')
const officeAddress = (o: CdekOffice | null | undefined) => {
  if (!o) return ''

  const address = String(o.location?.address || '').trim()

  return address || `Код ПВЗ: ${o.code}`
}

const selectedOffice = computed(() => {
  if (!selected.value) return null

  const selectedCode = String(selected.value.code || '')

  return offices.value.find(o => String(o.code) === selectedCode) || selected.value
})

const selectedOfficeAddress = computed(() => {
  return officeAddress(selectedOffice.value)
})

watch(() => props.city, (value) => {
  const next = String(value || '').trim()
  if (next && next !== cityQuery.value) cityQuery.value = next
}, { immediate: true })

watch(() => props.modelValue, (value) => { selected.value = value || null })
watch(cityQuery, () => scheduleCitySearch(), { immediate: true })
watch(selectedCityCode, async (code) => {
  if (!code) return
  await loadOffices(code)
})

function scheduleCitySearch() {
  if (cityTimer) clearTimeout(cityTimer)
  const q = cityQuery.value.trim()
  if (q.length < 2) {
    cities.value = []
    return
  }
  cityTimer = setTimeout(() => loadCities(q), 300)
}

async function loadCities(q: string) {
  loadingCities.value = true
  error.value = ''
  try {
    const data = await $fetch<CdekCity[]>('/api/shop/order/cdek/cities', { query: { city: q } })
    cities.value = Array.isArray(data) ? data : []
    if (cities.value.length === 1) selectedCityCode.value = Number(cities.value[0].code)
  } catch (e: any) {
    error.value = e?.message || 'Не удалось загрузить города СДЭК'
    cities.value = []
  } finally {
    loadingCities.value = false
  }
}

async function loadOffices(code: number) {
  loadingOffices.value = true
  error.value = ''
  offices.value = []
  selected.value = null
  emit('update:modelValue', null)
  try {
    const data = await $fetch<CdekOffice[]>('/api/shop/order/cdek/offices', { query: { city_code: code } })
    offices.value = (Array.isArray(data) ? data : [])
      .filter(o => Number.isFinite(Number(o?.location?.latitude)) && Number.isFinite(Number(o?.location?.longitude)))
      .map(o => ({
        ...o,
        location: {
          ...o.location,
          latitude: Number(o.location.latitude),
          longitude: Number(o.location.longitude),
        },
      }))
    await renderMap()
  } catch (e: any) {
    error.value = e?.message || 'Не удалось загрузить ПВЗ СДЭК'
  } finally {
    loadingOffices.value = false
  }
}

function loadYandexMaps() {
  if (!process.client) return Promise.reject(new Error('client only'))
  const w = window as any
  if (w.ymaps) return Promise.resolve(w.ymaps)
  if (!yandexKey.value) return Promise.reject(new Error('YANDEX_MAPS_API_KEY_EMPTY'))
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(yandexKey.value)}&lang=ru_RU`
    script.async = true
    script.onload = () => w.ymaps.ready(() => resolve(w.ymaps))
    script.onerror = () => reject(new Error('YANDEX_MAPS_LOAD_FAILED'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

async function renderMap() {
  if (!process.client || !canLoadMap.value || !offices.value.length) return
  await nextTick()
  if (!mapEl.value) return
  const ymaps = await loadYandexMaps()
  const first = offices.value[0]
  if (!map.value) {
    map.value = new ymaps.Map(mapEl.value, { center: [first.location.latitude, first.location.longitude], zoom: 10, controls: ['zoomControl', 'fullscreenControl'] })
  }
  if (objectManager.value) map.value.geoObjects.remove(objectManager.value)
  objectManager.value = new ymaps.ObjectManager({ clusterize: true, gridSize: 48, clusterDisableClickZoom: false })
  objectManager.value.objects.options.set('preset', 'islands#greenDeliveryIcon')
  objectManager.value.clusters.options.set('preset', 'islands#greenClusterIcons')
  objectManager.value.add({
    type: 'FeatureCollection',
    features: offices.value.map((o, index) => ({
      type: 'Feature',
      id: o.code || index,
      geometry: { type: 'Point', coordinates: [o.location.latitude, o.location.longitude] },
      properties: { balloonContentHeader: `СДЭК ${o.code}`, balloonContentBody: `${officeAddress(o)}<br>${o.work_time || ''}`, hintContent: officeAddress(o) },
    }))
  })
  objectManager.value.objects.events.add('click', (e: any) => {
    const id = e.get('objectId')
    const office = offices.value.find(o => o.code === id)
    if (office) selectOffice(office)
  })
  map.value.geoObjects.add(objectManager.value)
  const coords = offices.value.map(o => [o.location.latitude, o.location.longitude])
  if (coords.length > 1) map.value.setBounds(ymaps.util.bounds.fromPoints(coords), { checkZoomRange: true, zoomMargin: 32 })
}

function chooseCity(city: CdekCity) {
  selectedCityCode.value = Number(city.code)
}

function selectOffice(office: CdekOffice) {
  selected.value = office
  emit('update:modelValue', office)
  emit('select', office)
  if (map.value) map.value.setCenter([office.location.latitude, office.location.longitude], 15, { duration: 250 })
}

onBeforeUnmount(() => {
  if (map.value) map.value.destroy()
})
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-[#E5E7EB] bg-white p-4 space-y-3">
      <label class="block text-sm font-medium">Город для поиска ПВЗ СДЭК</label>
      <input v-model="cityQuery" type="text" class="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 outline-none focus:border-primary transition" placeholder="Например: Москва" />
      <div v-if="loadingCities" class="text-sm text-gray-500">Ищем город…</div>
      <div v-if="cities.length" class="flex flex-wrap gap-2">
        <button v-for="c in cities" :key="c.code" type="button" class="rounded-lg border px-3 py-2 text-sm transition" :class="selectedCityCode === c.code ? 'border-primary bg-primary/10' : 'border-[#E5E7EB] bg-white hover:border-primary'" @click="chooseCity(c)">
          {{ cityLabel(c) }}
        </button>
      </div>
    </div>

    <div v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</div>
    <div v-if="!canLoadMap" class="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">Карта временно недоступна.</div>
    <div v-if="loadingOffices" class="text-sm text-gray-500">Загружаем ПВЗ…</div>

    <div v-if="offices.length" class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      <div ref="mapEl" class="min-h-[420px] rounded-2xl border border-[#E5E7EB] bg-[#F7F7F7] overflow-hidden"></div>
      <div
        class="cdek-office-list max-h-[420px] overflow-y-auto overscroll-contain rounded-2xl border border-[#E5E7EB] bg-white divide-y"
        data-lenis-prevent
        tabindex="0"
        aria-label="Список пунктов выдачи СДЭК"
        @wheel.stop
        @touchmove.stop
      >
        <button v-for="o in offices" :key="o.code" type="button" class="w-full text-left p-4 hover:bg-[#F7F7F7] transition" :class="selected?.code === o.code ? 'bg-primary/10' : ''" @click="selectOffice(o)">
          <div class="font-medium">{{ officeAddress(o) }}</div>
          <div class="mt-1 text-xs text-gray-500">{{ o.work_time }}</div>
          <div v-if="o.nearest_station" class="mt-1 text-xs text-gray-500">{{ o.nearest_station }}</div>
          <div class="mt-2 text-xs text-primary">Код ПВЗ: {{ o.code }}</div>
        </button>
      </div>
    </div>

    <div v-if="selectedOffice" class="rounded-2xl border border-primary bg-primary/10 p-4">
      <div class="font-medium">Выбран ПВЗ СДЭК</div>

      <div class="text-sm mt-1">
        {{ selectedOfficeAddress }}
      </div>

      <div v-if="selectedOffice.work_time" class="text-xs text-gray-600 mt-1">
        {{ selectedOffice.work_time }}
      </div>

      <div class="text-xs text-primary mt-1">
        Код ПВЗ: {{ selectedOffice.code }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.cdek-office-list {
  scrollbar-gutter: stable;
  -webkit-overflow-scrolling: touch;
}
</style>
