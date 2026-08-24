<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import UiIcon from '~/components/ui/UiIcon.vue'
import AddressSuggest from '@/components/checkout/AddressSuggest.vue' // автодополнение улица+дом
import CdekPvzMap from '@/components/checkout/CdekPvzMap.vue'
import CitySuggest from '@/components/checkout/CitySuggest.vue'

const store = useCheckoutStore()

/** Варианты доставки по видам */
const courierOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'courier'))
const pvzOptions     = computed(() => store.deliveryOptions.filter(o => o.kind === 'pvz'))
const pickupOptions  = computed(() => store.deliveryOptions.filter(o => o.kind === 'pickup'))
const toDoorOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'todoor'))
const savedAddresses = computed(() => store.savedAddresses || [])
const savedAddressSelectValue = ref('')
const dadataSuggestionsDisabled = computed(() => Boolean((store as any).isApplyingSavedAddress))
type UiDeliveryKind = 'courier' | 'pvz' | 'pickup'

const city = computed<string>({
  get: () => store.state.address.city || '',
  set: (value) => {
    const nextCity = value || ''
    if (nextCity === (store.state.address.city || '')) return

    store.setAddress({
      city: nextCity,
      city_fias_id: null,
      region: null,
      geo_lat: null,
      geo_lon: null,
    })
    store.errors.recipient.city = ''
    store.setCdekPvz?.(null)
  },
})

type CityItem = {
  value: string
  full: string
  fias_id: string | null
  region: string | null
  city: string | null
  city_with_type: string | null
  geo_lat: number | null
  geo_lon: number | null
  postal_code: string | null
}

function onCitySelect(item: CityItem) {
  store.setAddress({
    city: item.value,
    city_fias_id: item.fias_id,
    region: item.region,
    postal_code: item.postal_code ?? undefined,
    geo_lat: item.geo_lat,
    geo_lon: item.geo_lon,
  })
  store.errors.recipient.city = ''
  store.setCdekPvz?.(null)
}

const selectedKind = computed<UiDeliveryKind>({
  get() {
    const current = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
    if (!current) return store.deliveryOptions[0]?.kind === 'pvz' ? 'pvz' : 'courier'

    return current.kind === 'todoor' ? 'courier' : current.kind
  },
  set(value) {
    let list
    if (value === 'courier') list = [...courierOptions.value, ...toDoorOptions.value]
    else if (value === 'pvz') list = pvzOptions.value
    else if (value === 'pickup') list = pickupOptions.value

    if (list && list.length) {
      store.setDelivery(list[0].id)
    }

    if (value === 'pvz') store.setAddress({ private_house: false })
  },
})

const deliveryTabs = computed(() => [
  {
    kind: 'courier' as const,
    title: 'Курьером',
    eta:
      courierOptions.value[0]?.eta
      || toDoorOptions.value[0]?.eta
      || '1–2 рабочих дня',
    icon: 'delivery-courier' as const,
    isAvailable:
      courierOptions.value.length > 0
      || toDoorOptions.value.length > 0,
  },
  {
    kind: 'pvz' as const,
    title: 'ПВЗ',
    eta: pvzOptions.value[0]?.eta || '1–2 рабочих дня',
    icon: 'delivery-pvz' as const,
    isAvailable: pvzOptions.value.length > 0,
  },
  {
    kind: 'pickup' as const,
    title: 'Самовывоз',
    eta:
      pickupOptions.value[0]?.eta
      || 'пн–пт, с 9:00 до 18:00',
    icon: 'delivery-pickup' as const,
    isAvailable: pickupOptions.value.length > 0,
  },
].filter(tab => tab.isAvailable))

const openKind = ref<UiDeliveryKind | null>(selectedKind.value)

function selectDeliveryKind(kind: UiDeliveryKind) {
  if (selectedKind.value === kind && openKind.value === kind) {
    openKind.value = null
    return
  }

  selectedKind.value = kind
  openKind.value = kind
}

function selectDeliveryOption(optionId: string) {
  store.setDelivery(optionId)
}

watch(selectedKind, (kind) => {
  openKind.value = kind
})

const isCourierSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'courier' || opt?.kind === 'todoor'
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

const privateHouse = computed<boolean>({
  get: () => Boolean(store.state.address.private_house),
  set: v => store.setAddress({ private_house: Boolean(v) }),
})

const cdekPvz = computed({
  get: () => (store.state.address as any).cdekPvz || null,
  set: value => (store as any).setCdekPvz?.(value),
})

function onCdekPvzSelect(office: any) {
  ;(store as any).setCdekPvz?.(office)
}

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

async function saveAddress() {
  await store.saveCurrentAddress?.()
}
</script>

<template>
  <div class="mt-12 space-y-5">
    <h3 class="text-[clamp(24px,4vw,36px)] font-medium">Способ доставки</h3>

    <div class="space-y-3" aria-label="Способ доставки">
      <section
        v-for="tab in deliveryTabs"
        :key="tab.kind"
        class="overflow-hidden rounded-lg border bg-white transition-colors duration-200"
        :class="selectedKind === tab.kind ? 'border-primary bg-[#f2f6ff]' : 'border-[#B2B2B2]'"
      >
        <button
          type="button"
          class="flex min-h-[54px] w-full items-center gap-2 px-4 py-2.5 text-left sm:gap-3 sm:px-5"
          :class="selectedKind === tab.kind ? 'bg-[#f2f6ff]' : ''"
          :aria-expanded="openKind === tab.kind"
          :aria-controls="`delivery-panel-${tab.kind}`"
          @click="selectDeliveryKind(tab.kind)"
        >
          <span
            class="flex size-[17px] shrink-0 items-center justify-center rounded-full border"
            :class="selectedKind === tab.kind ? 'border-primary' : 'border-black/20'"
            aria-hidden="true"
          >
            <span
              v-if="selectedKind === tab.kind"
              class="size-[9px] rounded-full bg-primary"
            />
          </span>

          <span
            class="flex size-7 shrink-0 items-center justify-center text-[23px]"
            :class="selectedKind === tab.kind ? 'text-primary' : 'text-black/75'"
            aria-hidden="true"
          >
            <UiIcon :name="tab.icon" :size="23" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="block text-base font-normal leading-tight sm:text-lg">
              {{ tab.title }}
            </span>
            <span class="mt-1 block text-xs font-normal text-black/50 sm:hidden">
              {{ tab.eta }}
            </span>
          </span>

          <span class="hidden shrink-0 text-right text-[15px] font-normal text-black/55 sm:block">
            {{ tab.eta }}
          </span>

          <UiIcon
            name="chevron-down"
            :size="18"
            class="shrink-0 text-black/65 transition-transform duration-200"
            :class="{ 'rotate-180': openKind === tab.kind }"
          />
        </button>

        <Transition name="checkout-accordion">
          <div
            v-show="openKind === tab.kind"
            :id="`delivery-panel-${tab.kind}`"
            class="border-t px-4 pb-5 pt-4 sm:px-5"
            :class="selectedKind === tab.kind ? 'border-primary/25' : 'border-black/10'"
          >
            <div
              v-if="tab.kind !== 'pickup'"
              class="mb-4 space-y-2"
            >
              <label
                class="block text-sm font-medium text-black/70"
                :for="`checkout-delivery-city-${tab.kind}`"
              >
                {{ tab.kind === 'pvz' ? 'Город для поиска ПВЗ' : 'Город доставки' }}
              </label>
              <CitySuggest
                :id="`checkout-delivery-city-${tab.kind}`"
                v-model="city"
                :suggestions-disabled="dadataSuggestionsDisabled"
                :error="store.errors.recipient.city"
                background="bg-white"
                placeholder="Начните вводить город*"
                @select="onCitySelect"
              />
              <p class="text-xs leading-relaxed text-black/50">
                {{ tab.kind === 'pvz'
                  ? 'После выбора города покажем доступные пункты выдачи на карте.'
                  : 'Город используется для расчёта и выбора курьерской доставки.' }}
              </p>
            </div>

            <div
              v-if="tab.kind !== 'pickup' && savedAddresses.length"
              class="mb-4 space-y-2"
            >
              <label
                class="block text-sm font-medium text-black/70"
                :for="`saved-checkout-address-${tab.kind}`"
              >
                Сохранённый адрес
              </label>

              <select
                :id="`saved-checkout-address-${tab.kind}`"
                :value="savedAddressSelectValue"
                class="h-[52px] w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-light tracking-wide outline-none transition hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary"
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

            <div v-if="tab.kind === 'courier'" class="space-y-4">
              <div class="space-y-1">
                <BaseCheckbox
                  v-for="opt in [...courierOptions, ...toDoorOptions]"
                  :key="opt.id"
                  :model-value="store.state.deliveryId === opt.id"
                  class="delivery-option-checkbox w-full !items-start rounded-lg bg-white/70 p-1 transition hover:bg-white"
                  @update:model-value="selectDeliveryOption(opt.id)"
                >
                  <span class="min-w-0">
                    <span class="block text-base">{{ opt.title }}</span>
                    <!-- <span v-if="opt.subtitle" class="mt-0.5 block text-sm text-black/55">
                      {{ opt.subtitle }}
                    </span> -->
                  </span>
                </BaseCheckbox>
              </div>

              <div v-if="isCourierSelected" class="space-y-4">
                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div class="md:col-span-2">
                    <AddressSuggest
                      v-model="addressLine"
                      :city-fias-id="cityFiasId"
                      :suggestions-disabled="dadataSuggestionsDisabled"
                      placeholder="Улица"
                      background="bg-white"
                      @select="onAddressSelectCourier"
                    />
                    <p v-if="!cityFiasId" class="mt-1 text-xs text-gray-500">
                      Сначала выберите город — подсказки адреса будут точнее.
                    </p>
                    <p v-if="store.errors.address.street" class="mt-1 text-xs text-red-600">
                      {{ store.errors.address.street }}
                    </p>
                  </div>

                  <UiInput v-model="house" placeholder="Дом" background="bg-white" />
                  <UiInput v-model="apartment" placeholder="Квартира/Офис" background="bg-white" />

                  <p v-if="store.errors.address.house" class="mt-1 text-xs text-red-600 md:col-span-2">
                    {{ store.errors.address.house }}
                  </p>

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

                <BaseCheckbox v-model="privateHouse">Частный дом</BaseCheckbox>

                <div class="flex flex-col items-start gap-2">
                  <Button
                    variant="solid"
                    type="button"
                    :disabled="store.saveAddressLoading"
                    @click="saveAddress"
                  >
                    {{ store.saveAddressLoading ? 'Сохраняем…' : 'Сохранить адрес' }}
                  </Button>
                  <p v-if="store.saveAddressMessage" class="text-sm text-cgreen">
                    {{ store.saveAddressMessage }}
                  </p>
                  <p v-if="store.saveAddressError" class="text-sm text-red-600">
                    {{ store.saveAddressError }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else-if="tab.kind === 'pvz'" class="space-y-4">
              <div class="space-y-3">
                <div class="rounded-lg bg-[#F7F7F7] px-4 py-3">
                  <p class="text-sm font-medium">Выберите удобный пункт выдачи</p>
                  <p class="mt-1 text-xs leading-relaxed text-black/55">
                    Нажмите на метку на карте или на адрес в списке. Выбранный ПВЗ появится ниже карты.
                  </p>
                </div>
                <CdekPvzMap
                  v-model="cdekPvz"
                  :city="store.state.address.city"
                  :show-city-input="false"
                  @select="onCdekPvzSelect"
                />
                <p v-if="store.errors.address.pvzAddress" class="text-xs text-red-600">
                  {{ store.errors.address.pvzAddress }}
                </p>
              </div>
            </div>

            <div v-else class="space-y-4">
              <div v-for="opt in pickupOptions" :key="opt.id" class="space-y-3">
                <BaseCheckbox
                  :model-value="store.state.deliveryId === opt.id"
                  class="delivery-option-checkbox w-full !items-start rounded-lg bg-white/70 p-3 transition hover:bg-white"
                  @update:model-value="selectDeliveryOption(opt.id)"
                >
                  <span class="min-w-0">
                    <span class="block text-base font-medium">{{ opt.title }}</span>
                    <span class="mt-0.5 block text-sm text-black/55">
                      Забрать заказ самостоятельно
                    </span>
                  </span>
                </BaseCheckbox>
                <p class="text-base leading-relaxed sm:text-lg">
                  {{ opt.subtitle || 'г. Москва, Большой Сухаревский переулок, д. 21, стр. 2' }}
                </p>
                <p v-if="opt.eta" class="flex items-center gap-2 text-sm text-black/65 sm:text-base">
                  <UiIcon name="clock" :size="18" />
                  <span>{{ opt.eta }}</span>
                </p>
                <p v-if="store.errors.address.pickupAddress" class="text-sm text-red-600">
                  {{ store.errors.address.pickupAddress }}
                </p>
              </div>
            </div>
          </div>
        </Transition>
      </section>
    </div>
  </div>
</template>

<style scoped>
.checkout-accordion-enter-active,
.checkout-accordion-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.checkout-accordion-enter-from,
.checkout-accordion-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

</style>
