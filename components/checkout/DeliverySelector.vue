<script setup lang="ts">
import { computed } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import Button from '~/components/ui/Button.vue'
import { useCheckoutStore } from '~/stores/checkoutStore'

// Компонент выбора способа доставки. Основан на макете из Figma.
// Три верхних кнопки (Курьером / ПВЗ / Самовывоз) переключают видимость
// соответствующих блоков. Для курьера выводятся варианты служб и поля адреса.

const store = useCheckoutStore()

// Разделяем опции доставки по типу. API /api/checkout/options возвращает
// множество вариантов (например, несколько курьерских служб). Мы группируем
// их по свойству kind: 'courier', 'pvz', 'pickup'.
const courierOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'courier'))
const pvzOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'pvz'))
const pickupOptions = computed(() => store.deliveryOptions.filter(o => o.kind === 'pickup'))

// Текущее выбранное семейство способов доставки определяется по id выбранной
// опции. Если id отсутствует, выбираем вид первого варианта.
const selectedKind = computed({
  get() {
    const current = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
    return current?.kind || (store.deliveryOptions[0]?.kind ?? 'courier')
  },
  set(value: string) {
    // При выборе группы автоматически выбираем первую опцию этого вида
    let list
    if (value === 'courier') list = courierOptions.value
    else if (value === 'pvz') list = pvzOptions.value
    else if (value === 'pickup') list = pickupOptions.value
    if (list && list.length) {
      store.setDelivery(list[0].id)
    }
  },
})

// Прокси-поля для адреса. Используются в разделе курьерской доставки.
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

// Определяем, что выбран именно курьерский вариант
const isCourierSelected = computed(() => {
  const opt = store.deliveryOptions.find(o => o.id === store.state.deliveryId)
  return opt?.kind === 'courier'
})
</script>

<template>
  <div class="mt-12 space-y-6">
    <h3 class="text-slider font-medium">Способ доставки</h3>

    <!-- Переключатель способов: Курьером / ПВЗ / Самовывоз -->
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
      <!-- Выбор службы курьерской доставки -->
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
      <!-- Адресные поля: показываем только если выбран курьер -->
      <div v-if="isCourierSelected" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UiInput
            v-model="street"
            placeholder="Улица и дом"
            background="bg-white"
          />
          <UiInput
            v-model="apartment"
            placeholder="Квартира/Офис"
            background="bg-white"
          />
          <!-- При частном доме скрываем подъезд, этаж и домофон -->
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
        <!-- Частный дом: используем BaseCheckbox -->
        <div>
          <BaseCheckbox v-model="store.state.address.private_house">
            Частный дом
          </BaseCheckbox>
        </div>
        <!-- Кнопка сохранения -->
        <div class="flex justify-start">
          <Button variant="solid" class="" type="button">Сохранить</Button>
        </div>
      </div>
    </div>

    <!-- ПВЗ -->
    <div v-if="selectedKind === 'pvz'" class="space-y-2">
      <Button
        v-for="opt in pvzOptions"
        :key="opt.id"
        variant="outline"
        class=" transition"
        :class="store.state.deliveryId === opt.id ? '' : ''"
        @click="store.setDelivery(opt.id)"
      >Выбрать адрес на карте</Button>
    </div>

    <!-- Самовывоз -->
    <div v-if="selectedKind === 'pickup'" class="space-y-2">
      <div v-for="opt in pickupOptions" :key="opt.id" class="space-y-2">
        <!-- Подробности адреса самовывоза. Используем subtitle как адрес и eta как время работы -->
        <div class="text-lg">{{ opt.subtitle || 'г. Москва, Большой Сухаревский переулок, дом. 21, стр. 2' }}</div>
        <div class="flex flex-row gap-2 items-center text-lg" v-if="opt.eta"><img src="/icons/clock.svg" class="w-5"/><span>пн-пт, с 9:00 до 18:00</span></div>
        <Button
          variant="outline"
          class="!mt-4"
          type="button"
          @click="store.setDelivery(opt.id)"
        >Посмотреть на карте</Button>
      </div>
    </div>
  </div>
</template>
