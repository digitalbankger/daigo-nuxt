<script setup lang="ts">
import { computed } from 'vue'
import { useCheckoutStore } from '~/stores/checkoutStore'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'

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
    if (list && list.length) {
      store.setDelivery(list[0].id)
    }
    // NEW: при выборе ПВЗ гарантируем отсутствие флага private_house
    if (value === 'pvz') {
      store.setAddress({ private_house: false })
    }
  },
})

/** Прокси-поля адреса */
const street = computed<string>({
  get: () => store.state.address.street ?? '',
  set: v => store.setAddress({ street: v || undefined }),
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

function saveAddress() {
  // тут может быть валидация/вызов API
  console.info('[address] saved', { ...store.state.address })
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
        class="px-4 py-2 rounded-xl border transition min-w-[120px] text-center"
        :class="selectedKind === 'pvz' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pvz'"
      >ПВЗ</button>

      <button
        class="px-4 py-2 rounded-xl border transition min-w-[120px] text-center"
        :class="selectedKind === 'pickup' ? 'bg-[#EEF4FF] text-black border-primary' : 'bg-white border-gray-300'"
        @click="selectedKind = 'pickup'"
      >Самовывоз</button>
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
          <input
            type="radio"
            class="form-radio"
            :value="opt.id"
            v-model="store.state.deliveryId"
          />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
      </div>

      <!-- Адресные поля -->
      <div v-if="isCourierSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UiInput v-model="street" placeholder="Улица и дом" background="bg-white" :error="store.errors.address.street" />
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

    <!-- ПВЗ -->
    <div v-if="selectedKind === 'pvz'" class="space-y-4">
      <!-- провайдер ПВЗ -->
      <div v-if="pvzOptions.length" class="space-y-2">
        <label
          v-for="opt in pvzOptions"
          :key="opt.id"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            class="form-radio"
            :value="opt.id"
            v-model="store.state.deliveryId"
          />
          <span class="font-medium">{{ opt.title }}</span>
          <span class="text-sm text-gray-500" v-if="opt.subtitle">— {{ opt.subtitle }}</span>
        </label>
      </div>

      <!-- NEW: те же поля, что и у курьера (без 'Частный дом') -->
      <div v-if="isPvzSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Для ПВЗ в качестве «улица и дом» вводим адрес пункта -->
          <UiInput
            v-model="street"
            placeholder="Адрес пункта выдачи (улица, дом)"
            background="bg-white"
            :error="store.errors.address.street || store.errors.address.pvzAddress"
          />
          <UiInput v-model="apartment" placeholder="Квартира/Офис (необязательно)" background="bg-white" />

          <!-- подъезд/этаж/домофон можно оставить на случай доп.инструкций -->
          <UiInput v-model="entrance" placeholder="Подъезд (необязательно)" background="bg-white" />
          <UiInput v-model="floor" placeholder="Этаж (необязательно)" background="bg-white" />
          <UiInput v-model="intercom" placeholder="Домофон (необязательно)" background="bg-white" />
        </div>

        <!-- Чекбокс «Частный дом» для ПВЗ не показываем -->

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
          <img src="/icons/clock.svg" class="w-5" />
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
