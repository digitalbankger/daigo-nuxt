<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import AddressSuggest from '@/components/checkout/AddressSuggest.vue' // автодополнение улица+дом

const store = useCheckoutStore()

/** Варианты доставки по видам */
const courierOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'courier'))
const pvzOptions     = computed(() => store.deliveryOptions.filter(o => o.kind === 'pvz'))
const pickupOptions  = computed(() => store.deliveryOptions.filter(o => o.kind === 'pickup'))
const toDoorOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'todoor'))
const savedAddresses = computed(() => store.savedAddresses || [])
const savedAddressSelectValue = ref('')
const dadataSuggestionsDisabled = computed(() => Boolean((store as any).isApplyingSavedAddress))

/** Активный вид доставки и переключение между видами */
const selectedKind = computed<'courier' | 'pvz' | 'pickup'>({
  get() {
    const current = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
    if (!current) return store.deliveryOptions[0]?.kind === 'pvz' ? 'pvz' : 'courier'

    // todoor показываем под вкладкой "Курьером"
    return current.kind === 'todoor' ? 'courier' : current.kind
  },
  set(value) {
    let list
    if (value === 'courier') list = [...courierOptions.value, ...toDoorOptions.value]
    else if (value === 'pvz') list = pvzOptions.value
    else if (value === 'pickup') list = pickupOptions.value

    if (list && list.length) {
      // при переключении вкладки выбираем первый вариант в этом типе
      store.setDelivery(list[0].id)
    }

    if (value === 'pvz') store.setAddress({ private_house: false })
  },
})

const isCourierSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'courier' || opt?.kind === 'todoor'
})

const isPvzSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'pvz'
})

/** Поля адреса — ЕДИНЫЕ для всех способов */
const addressLine = computed<string>({
  get: () => store.state.address.address_line ?? '',
  set: v => store.setAddress({ address_line: v || undefined }),
})

const house = computed<string>({
  get: () => store.state.address.house ?? '',
  set: v => store.setAddress({ house: v || undefined }),
})

const apartment = computed<string>({
  get: () => store.state.address.apartment ?? '',
  set: v => store.setAddress({ apartment: v || undefined }),
})
const entrance = computed<string>({
  get: () => store.state.address.entrance ?? '',
  set: v => store.setAddress({ entrance: v || undefined }),
})
const floor = computed<string>({
  get: () => store.state.address.floor ?? '',
  set: v => store.setAddress({ floor: v || undefined }),
})
const intercom = computed<string>({
  get: () => store.state.address.intercom ?? '',
  set: v => store.setAddress({ intercom: v || undefined }),
})

/** FIAS выбранного города — приходит из шага с CitySuggest */
const cityFiasId = computed<string | null>(() => store.state.address.city_fias_id ?? null)

/** Тип подсказки адреса */
type AddrItem = {
  value: string
  full: string
  fias_id: string | null
  postal_code: string | null
  street: string | null
  house: string | null
  block: string | null
  flat: string | null
}

/** НОРМАЛИЗАТОР выбора адреса (единый для курьера и ПВЗ) */
function applyAddressFromSuggest(it: AddrItem) {
  store.setAddress?.({
    address_line: it.value,                 // полная строка в инпуте
    street: it.street || it.value,          // «улица»
    // если DaData не дала дом — не трогаем уже введённый вручную дом
    house: it.house || store.state.address.house || undefined,
    block: it.block || undefined,
    postal_code: it.postal_code ?? undefined,
  })
}

/** Обработка выбора адреса из DaData (КУРЬЕР) */
function onAddressSelectCourier(it: AddrItem) {
  applyAddressFromSuggest(it)
}

/** Обработка выбора адреса из DaData (ПВЗ) — ТОЧНО ТАК ЖЕ */
function onAddressSelectPvz(it: AddrItem) {
  applyAddressFromSuggest(it)
}

/** Нормализованный payload для отправки на бэкенд (если нужно показать) */
const shippingAddressPayload = computed(() => ({
  // абсолютно одинаково для всех способов
  address_line : store.state.address.address_line || '',
  street       : store.state.address.street || '',
  house        : store.state.address.house || '',
  block        : store.state.address.block || '',
  postal_code  : store.state.address.postal_code || '',
  apartment    : store.state.address.apartment || '',
  entrance     : store.state.address.entrance || '',
  floor        : store.state.address.floor || '',
  intercom     : store.state.address.intercom || '',
  private_house: Boolean(store.state.address.private_house) && selectedKind.value !== 'pvz',

  // если нужно, можно передать тип доставки
  delivery_kind: selectedKind.value,
  delivery_id  : store.state.deliveryId,
}))

function formatSavedAddressOption(address: any) {
  return address?.label || [
    address?.city,
    address?.street,
    address?.house ? `д. ${address.house}` : '',
    address?.apartment ? `кв. ${address.apartment}` : '',
  ].filter(Boolean).join(', ') || 'Сохранённый адрес'
}

function applySavedAddress(index: number) {
  const selected = savedAddresses.value.find((address: any) => Number(address.index) === Number(index))
  if (!selected) return

  savedAddressSelectValue.value = String(selected.index)
  store.applySavedAddress?.(selected.index)
}

function onSavedAddressChange(event: Event) {
  const value = (event.target as HTMLSelectElement)?.value || ''
  savedAddressSelectValue.value = value

  if (!value) return
  applySavedAddress(Number(value))
}

watch(savedAddresses, (addresses) => {
  if (!savedAddressSelectValue.value) return
  const exists = addresses.some((address: any) => String(address.index) === savedAddressSelectValue.value)
  if (!exists) savedAddressSelectValue.value = ''
})

function saveAddress() {
  // Здесь можно вызвать API/валидацию/предрасчёт
  // Пример: store.saveAddress(shippingAddressPayload.value)
  console.info('[address] saved', shippingAddressPayload.value)
}
</script>

<template>
  <div class="mt-12 space-y-6">
    <h3 class="text-slider font-medium">Способ доставки</h3>

    <!-- Переключатель способов -->
    <div class="flex flex-wrap gap-4">
      <button
        class="px-4 py-3 rounded-lg text-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'courier' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'courier'"
      >Курьером</button>

      <button
        class="px-4 py-3 rounded-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'pvz' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pvz'"
      >ПВЗ</button>

      <button
        class="px-4 py-3 rounded-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'pickup' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pickup'"
      >Самовывоз</button>
    </div>

    <!-- Сохранённые адреса пользователя -->
    <div
      v-if="selectedKind !== 'pickup' && savedAddresses.length"
      class="space-y-2"
    >
      <label class="block text-sm font-medium text-black/70" for="saved-checkout-address">
        Сохранённый адрес
      </label>

      <select
        id="saved-checkout-address"
        :value="savedAddressSelectValue"
        class="w-full h-[52px] rounded-lg border border-gray-300 bg-white px-4 text-sm font-light tracking-wide outline-none transition hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
        @change="onSavedAddressChange"
      >
        <option value="">Выберите сохранённый адрес</option>
        <option
          v-for="address in savedAddresses"
          :key="address.index"
          :value="String(address.index)"
        >
          {{ formatSavedAddressOption(address) }}
        </option>
      </select>
    </div>

    <!-- Курьерская доставка -->
    <div v-if="selectedKind === 'courier'" class="space-y-4">
      <!-- Служба курьерской доставки -->
      <div class="space-y-2">
        <label
          v-for="opt in courierOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" class="form-radio" :value="opt.id" v-model="store.state.deliveryId" />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="hidden sm:block text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>

        <label
          v-for="opt in toDoorOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" class="form-radio" :value="opt.id" v-model="store.state.deliveryId" />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="hidden sm:block text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
      </div>

      <!-- Адресные поля -->
      <div v-if="isCourierSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Улица (подсказки DaData) -->
          <div class="md:col-span-2">
            <AddressSuggest
              v-model="addressLine"
              :cityFiasId="cityFiasId"
              @select="onAddressSelectCourier"
              :suggestions-disabled="dadataSuggestionsDisabled"
              placeholder="Улица"
              background="bg-white"
            />
            <p v-if="!cityFiasId" class="mt-1 text-xs text-gray-500">
              Сначала выберите город — подсказки адреса будут точнее.
            </p>
            <p v-if="store.errors.address.street" class="mt-1 text-xs text-red-600">
              {{ store.errors.address.street }}
            </p>
          </div>

          <!-- Дом отдельно, чтобы нельзя было оставить только улицу -->
          <UiInput v-model="house" placeholder="Дом" background="bg-white" />
          <p v-if="store.errors.address.house" class="md:col-span-2 mt-1 text-xs text-red-600">
            {{ store.errors.address.house }}
          </p>

          <UiInput v-model="apartment" placeholder="Квартира/Офис" background="bg-white" />

          <UiInput
            v-if="!store.state.address.private_house"
            v-model="entrance"
            placeholder="Подъезд"
            background="bg-white"
          />
          <UiInput
            v-if="!store.state.address.private_house"
            v-model="floor"
            placeholder="Этаж"
            background="bg-white"
          />
          <UiInput
            v-if="!store.state.address.private_house"
            v-model="intercom"
            placeholder="Домофон"
            background="bg-white"
          />
        </div>


        <div>
          <BaseCheckbox v-model="store.state.address.private_house">Частный дом</BaseCheckbox>
        </div>

        <div class="flex justify-start">
          <Button variant="solid" type="button" @click="saveAddress">Сохранить</Button>
        </div>
      </div>
    </div>

    <!-- ПВЗ — та же модель адреса -->
    <div v-if="selectedKind === 'pvz'" class="space-y-4">
      <!-- провайдер ПВЗ -->
      <div v-if="pvzOptions.length" class="space-y-2">
        <label
          v-for="opt in pvzOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" class="form-radio" :value="opt.id" v-model="store.state.deliveryId" />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="hidden text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
        
      </div>

      <div v-if="isPvzSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Адрес пункта выдачи: через DaData — ПИШЕМ В ТЕ ЖЕ ПОЛЯ -->
          <div class="md:col-span-2">
            <AddressSuggest
              v-model="addressLine"
              :cityFiasId="cityFiasId"
              @select="onAddressSelectPvz"
              :suggestions-disabled="dadataSuggestionsDisabled"
              background="bg-white"
              placeholder="Адрес пункта выдачи (улица)"
            />
            <p v-if="!cityFiasId" class="mt-1 text-xs text-gray-500">
              Сначала выберите город — подсказки адреса будут точнее.
            </p>
            <p v-if="store.errors.address.street" class="mt-1 text-xs text-red-600">
              {{ store.errors.address.street }}
            </p>
          </div>

          <!-- Дом для ПВЗ -->
          <UiInput v-model="house" placeholder="Дом" background="bg-white" />
          <p v-if="store.errors.address.house" class="md:col-span-2 mt-1 text-xs text-red-600">
            {{ store.errors.address.house }}
          </p>

          <!-- Доп. поля — опционально -->
          <UiInput v-model="apartment" placeholder="Квартира/Офис (необязательно)" background="bg-white" />
          <UiInput v-model="entrance"  placeholder="Подъезд (необязательно)"     background="bg-white" />
          <UiInput v-model="floor"     placeholder="Этаж (необязательно)"        background="bg-white" />
          <UiInput v-model="intercom"  placeholder="Домофон (необязательно)"     background="bg-white" />
        </div>


        <div class="flex justify-start">
          <Button variant="solid" type="button" @click="saveAddress">Сохранить</Button>
        </div>
      </div>
    </div>

    <!-- Самовывоз -->
    <div v-if="selectedKind === 'pickup'" class="space-y-4">
      <div v-for="opt in pickupOptions" :key="opt.id" class="space-y-2">
        <div class="text-lg">
          {{ opt.subtitle || 'г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2' }}
        </div>
        <div class="flex flex-row gap-2 items-center text-lg" v-if="opt.eta">
          <img src="/icons/clock.svg" class="w-5" alt="" />
          <span>{{ opt.eta }}</span>
        </div>
        <div class="text-red-600 text-sm" v-if="store.errors.address.pickupAddress">
          {{ store.errors.address.pickupAddress }}
        </div>
        <Button variant="outline" class="!mt-4" type="button" @click="store.setDelivery(opt.id)">
          Посмотреть на карте
        </Button>
      </div>
    </div>
  </div>
</template>






<!-- <script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import AddressSuggest from '@/components/checkout/AddressSuggest.vue' // автодополнение улица+дом

const store = useCheckoutStore()

/** Варианты доставки по видам */
const courierOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'courier'))
const pvzOptions     = computed(() => store.deliveryOptions.filter(o => o.kind === 'pvz'))
const pickupOptions  = computed(() => store.deliveryOptions.filter(o => o.kind === 'pickup'))

/** Активный вид доставки и переключение между видами */
const selectedKind = computed<'courier' | 'pvz' | 'pickup'>({
  get() {
    const current = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
    return current?.kind || (store.deliveryOptions[0]?.kind ?? 'courier')
  },
  set(value) {
    let list
    if (value === 'courier') list = courierOptions.value
    else if (value === 'pvz') list = pvzOptions.value
    else if (value === 'pickup') list = pickupOptions.value
    if (list && list.length) store.setDelivery(list[0].id)

    // при выборе ПВЗ гарантируем отсутствие флага private_house
    if (value === 'pvz') store.setAddress({ private_house: false })
  },
})

/** Поля адреса */
const addressLine = computed<string>({
  // ТЕКСТ в инпуте: полная строка "город, улица, дом"
  get: () => store.state.address.address_line ?? '',
  set: v => store.setAddress({ address_line: v || undefined }),
})

const apartment = computed<string>({
  get: () => store.state.address.apartment ?? '',
  set: v => store.setAddress({ apartment: v || undefined }),
})
const entrance = computed<string>({
  get: () => store.state.address.entrance ?? '',
  set: v => store.setAddress({ entrance: v || undefined }),
})
const floor = computed<string>({
  get: () => store.state.address.floor ?? '',
  set: v => store.setAddress({ floor: v || undefined }),
})
const intercom = computed<string>({
  get: () => store.state.address.intercom ?? '',
  set: v => store.setAddress({ intercom: v || undefined }),
})

/** Отдельная строка для адреса ПВЗ (если храните отдельно) */
const pvzAddr = computed<string>({
  get: () => store.state.address.pvzAddress ?? store.pvzAddress ?? '',
  set: v => store.setAddress({ pvzAddress: v || undefined }),
})

/** Активен ли конкретный вид */
const isCourierSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'courier'
})
const isPvzSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'pvz'
})

/** FIAS выбранного города — приходит из шага с CitySuggest */
const cityFiasId = computed<string | null>(() => store.state.address.city_fias_id ?? null)

/** Тип подсказки адреса */
type AddrItem = {
  value: string
  full: string
  fias_id: string | null
  postal_code: string | null
  street: string | null
  house: string | null
  block: string | null
  flat: string | null
}

/** Обработка выбора адреса из DaData (КУРЬЕР) */
function onAddressSelectCourier(it: AddrItem) {
  store.setAddress?.({
    address_line: it.value,            // показать в инпуте полную строку
    street: it.street || it.value,     // короткая форма (улица)
    house: it.house || undefined,
    block: it.block || undefined,
    postal_code: it.postal_code ?? undefined,
  })
}

/** Обработка выбора адреса из DaData (ПВЗ) */
function onAddressSelectPvz(it: AddrItem) {
  store.setAddress?.({
    address_line: it.value,            // можно держать единое поле для отправки на бэк
    pvzAddress: it.value,
    postal_code: it.postal_code ?? undefined,
  })
}

function saveAddress() {
  // тут может быть валидация/вызов API/предрасчёт
  console.info('[address] saved', { ...store.state.address })
}
</script>

<template>
  <div class="mt-12 space-y-6">
    <h3 class="text-slider font-medium">Способ доставки</h3>

    <div class="flex flex-wrap gap-4">
      <button
        class="px-4 py-3 rounded-lg text-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'courier' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'courier'"
      >Курьером</button>

      <button
        class="px-4 py-3 rounded-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'pvz' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pvz'"
      >ПВЗ</button>

      <button
        class="px-4 py-3 rounded-lg border transition min-w-[120px] text-center"
        :class="selectedKind === 'pickup' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pickup'"
      >Самовывоз</button>
    </div>

    <div v-if="selectedKind === 'courier'" class="space-y-4">
      <div class="space-y-2">
        <label
          v-for="opt in courierOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" class="form-radio" :value="opt.id" v-model="store.state.deliveryId" />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="hidden sm:block text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
      </div>

      <div v-if="isCourierSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2">
            <AddressSuggest
              v-model="addressLine"
              :cityFiasId="cityFiasId"
              @select="onAddressSelectCourier"
              placeholder="Улица и дом"
              background="bg-white"
            />
            <p v-if="!cityFiasId" class="mt-1 text-xs text-gray-500">
              Сначала выберите город — подсказки адреса будут точнее.
            </p>
            <p v-if="store.errors.address.street" class="mt-1 text-xs text-red-600">
              {{ store.errors.address.street }}
            </p>
          </div>

          <UiInput v-model="apartment" placeholder="Квартира/Офис" background="bg-white" />

          <UiInput v-if="!store.state.address.private_house" v-model="entrance" placeholder="Подъезд" background="bg-white" />
          <UiInput v-if="!store.state.address.private_house" v-model="floor" placeholder="Этаж" background="bg-white" />
          <UiInput v-if="!store.state.address.private_house" v-model="intercom" placeholder="Домофон" background="bg-white" />
        </div>

        <div>
          <BaseCheckbox v-model="store.state.address.private_house">Частный дом</BaseCheckbox>
        </div>

        <div class="flex justify-start">
          <Button variant="solid" type="button" @click="saveAddress">Сохранить</Button>
        </div>
      </div>
    </div>

    <div v-if="selectedKind === 'pvz'" class="space-y-4">
      <div v-if="pvzOptions.length" class="space-y-2">
        <label
          v-for="opt in pvzOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input type="radio" class="form-radio" :value="opt.id" v-model="store.state.deliveryId" />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="hidden text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
      </div>

      <div v-if="isPvzSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="md:col-span-2">
            <AddressSuggest
              v-model="pvzAddr"
              :cityFiasId="cityFiasId"
              @select="onAddressSelectPvz"
              :suggestions-disabled="dadataSuggestionsDisabled"
              background="bg-white"
              placeholder="Адрес пункта выдачи (улица, дом)"
            />
            <p v-if="!cityFiasId" class="mt-1 text-xs text-gray-500">
              Сначала выберите город — подсказки адреса будут точнее.
            </p>
            <p v-if="store.errors.address.street || store.errors.address.pvzAddress" class="mt-1 text-xs text-red-600">
              {{ store.errors.address.street || store.errors.address.pvzAddress }}
            </p>
          </div>

          <UiInput v-model="apartment" placeholder="Квартира/Офис (необязательно)" background="bg-white" />
          <UiInput v-model="entrance" placeholder="Подъезд (необязательно)" background="bg-white" />
          <UiInput v-model="floor" placeholder="Этаж (необязательно)" background="bg-white" />
          <UiInput v-model="intercom" placeholder="Домофон (необязательно)" background="bg-white" />
        </div>

        <div class="flex justify-start">
          <Button variant="solid" type="button" @click="saveAddress">Сохранить</Button>
        </div>
      </div>
    </div>

    <div v-if="selectedKind === 'pickup'" class="space-y-4">
      <div v-for="opt in pickupOptions" :key="opt.id" class="space-y-2">
        <div class="text-lg">
          {{ opt.subtitle || 'г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2' }}
        </div>
        <div class="flex flex-row gap-2 items-center text-lg" v-if="opt.eta">
          <img src="/icons/clock.svg" class="w-5" alt="" />
          <span>{{ opt.eta }}</span>
        </div>
        <div class="text-red-600 text-sm" v-if="store.errors.address.pickupAddress">
          {{ store.errors.address.pickupAddress }}
        </div>
        <Button variant="outline" class="!mt-4" type="button" @click="store.setDelivery(opt.id)">
          Посмотреть на карте
        </Button>
      </div>
    </div>
  </div>
</template> -->
