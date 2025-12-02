<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProfileField from '~/components/profile/ProfileField.vue'
import AddressDropdown from '~/components/profile/AddressDropdown.vue'
import VipActivationBlock from '~/components/profile/VipActivationBlock.vue'

import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch } from 'vue'
import { navigateTo } from '#imports'
import { useCookie } from '#app'
import { getFirstUtm, getLastUtm, type StoredUtmSet } from '@/composables/useUtmTracker'

definePageMeta({
  layout: 'main',
  ssr: false,
})

const userStore = useUserStore()
const authStore = useAuthStore()

// реактивные поля из стора
const { profile, isLoaded } = storeToRefs(userStore)
const { isAuthenticated } = storeToRefs(authStore)   // ВАЖНО: именно поле из authStore

// ---------- VIP по UTM (только для показа блока, НЕ для открытия модалки) ----------

function isVipUtm(utm?: StoredUtmSet | null): boolean {
  if (!utm) return false

  const src = (utm.source ?? '').toLowerCase().trim()
  const med = (utm.medium ?? '').toLowerCase().trim()
  const camp = (utm.campaign ?? '').toLowerCase().trim()
  const cont = (utm.content ?? '').toLowerCase().trim()
  const term = (utm.term ?? '').toLowerCase().trim()

  // utm_source=vip card&utm_medium=offline&utm_campaign=art catalogue card&utm_content=vip&utm_term=vip
  return (
    src === 'vip card' &&
    med === 'offline' &&
    camp === 'art catalogue card' &&
    cont === 'vip' &&
    term === 'vip'
  )
}

const hasVipUtm = computed(() => {
  if (!process.client) return false
  const first = getFirstUtm()
  const last = getLastUtm()
  return isVipUtm(first) || isVipUtm(last)
})

// если есть ещё кука из middleware — учитываем и её как доп. флаг
const vipFromCard = useCookie<string | null>('vip_from_card', { path: '/' })

// общий флаг «этот пользователь когда-то пришёл по VIP-ссылке»
const hasVipFlag = computed(() => hasVipUtm.value || vipFromCard.value === '1')

// показывать ли блок ввода VIP-кода
const showVipBlock = computed(() => hasVipFlag.value && isAuthenticated.value)

function handleVipActivated() {
  // после успешной активации можно скрыть блок (сбрасываем куку)
  vipFromCard.value = '0'
}

// ---------- Загрузка профиля при авторизации ----------

// Гарантируем, что после появления авторизации профиль подтянется и скелетон исчезнет
watch(
  isAuthenticated,
  async (authed) => {
    if (authed && !isLoaded.value) {
      await userStore.load()   // или loadProfile — используй метод, который есть в userStore
    }
  },
  { immediate: true }
)

// ---------- Автоматическое открытие модалки авторизации ----------

onMounted(() => {
  // КЛЮЧЕВАЯ правка:
  // если пользователь не авторизован и зашёл в /profile — ВСЕГДА открываем окно входа,
  // НЕ только для VIP
  if (!isAuthenticated.value) {
    authStore.openAuth('/profile')
  }
})

// ---------- Остальная логика профиля ----------

const fullName = computed(() =>
  profile.value ? `${profile.value.first_name} ${profile.value.last_name}` : ''
)

const cardImage = computed(() => {
  if (!profile.value?.loyalty_status || profile.value.loyalty_status === 'none') {
    return null
  }
  return `/images/profile/${profile.value.loyalty_status}.webp`
})

function logout() {
  authStore.logout()
  navigateTo('/')
}

function formatDate(date?: string | null) {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

function updateField(field: string, value: string) {
  userStore.saveProfile({ [field]: value })
}

function saveAddress(index: number, address: any) {
  if (!profile.value) return
  const newAddresses = [...profile.value.addresses]
  newAddresses[index] = address
  userStore.saveProfile({ addresses: newAddresses })
}

function deleteAddress(index: number) {
  if (!profile.value) return
  const newAddresses = [...profile.value.addresses]
  newAddresses.splice(index, 1)
  userStore.saveProfile({ addresses: newAddresses })
}
</script>

<template>
  <BaseContainer>
    <!-- Показываем контент только когда профиль реально загружен -->
    <section v-if="userStore.isLoaded && profile" class="w-full py-2 md:py-10 relative">
      <NuxtLink to="/" class="inline-flex gap-2 mb-4 text-lg">
        <img src="/icons/arrow-right-pag.svg" class="w-2 rotate-180" /> Вернуться назад
      </NuxtLink>

      <div class="w-full flex felx-row items-center justify-between gap-8 mb-6">
        <h1 class="text-[clamp(1.8rem,6vw,4.8rem)] font-medium">Личный кабинет</h1>

        <div class="hidden md:block text-xl pb-1 border-b cursor-pointer" @click="logout">
          Выйти из профиля
        </div>
      </div>

      <!-- Loyalty Card -->
      <div 
        v-if="cardImage" 
        class="w-full max-w-full md:max-w-[48%] rounded-xl overflow-hidden mb-4 md:mb-8"
      >
        <img :src="cardImage" alt="Карта лояльности" class="w-full h-auto" />
      </div>

      <!-- Bonuses Block -->
      <div class="relative bg-primary/10 border border-primary text-sm md:text-lg rounded-xl px-4 py-3 mb-4 md:mb-6 flex flex-col gap-3 items-start justify-start max-w-full md:max-w-[70%]">
        <div class="flex flex-row gap-2 ">
          <img src="/icons/bi_stars.svg" class="w-6" />
          Количество бонусов:
          <span class="text-primary font-normal md:font-medium">{{ profile.bonuses.valid.value }}</span>
        </div>
        <span v-if="profile.bonuses.expiring.value > 0" class="text-sm">
          {{ profile.bonuses.expiring.value }} бонусов сгорят {{ formatDate(profile.bonuses.expiring.date_end) }}
        </span>
        <div class="absolute right-4 top-3 text-xl mb-auto mt-1">
          <img src="/icons/arrow-primary.svg" class="w-4" />
        </div>
      </div>

      <!-- 🔹 VIP блок — только для тех, кто пришёл по VIP-ссылке и уже авторизован -->
      <VipActivationBlock
        v-if="showVipBlock"
        class="max-w-full md:max-w-[70%] mb-4 md:mb-6"
        @activated="handleVipActivated"
      />

      <!-- Bank Cards -->
      <div class="bg-gray-100 rounded-xl p-4 mb-6 max-w-full md:max-w-[70%]">
        <div class="text-base font-medium mb-4">Банковские карты</div>
        <div class="flex flex-row items-center w-full max-w-[70%] mb-6">
          <div class="relative w-[82%] md:w-[60%] h-[90px]">
            <template v-if="profile.cards && profile.cards.length">
              <div
                v-for="(card, index) in profile.cards"
                :key="card.card_number"
                class="absolute transition-all duration-300 ease-in-out group"
                :style="{ zIndex: profile.cards.length - index, transform: `translateX(${index * 30}px)` }"
              >
                <div
                  class="w-full h-[90px] bg-cover bg-center p-2 flex flex-col justify-end rounded-lg shadow-lg transition-all duration-300 ease-in-out"
                  :class="index !== 0 ? 'group-hover:translate-x-4' : ''"
                  style="background-image: linear-gradient(31deg, #659cff, #a6c6ff);"
                >
                  <span class="text-xs text-white/70">{{ card.issuer_name }} — {{ card.card_type.toUpperCase() }} {{ card.expiry_date }}</span>
                  <span class="text-white text-xs xs:text-[10px] mt-auto mb-1 font-medium xs:font-normal">
                    **** **** **** {{ card.card_number }}
                  </span>
                  <div class="flex flex-row items-center justify-between">
                    <span class="text-white text-xs xs:text-[10px]">{{ card.expiry_date }}</span>
                    <span class="text-white text-xs xs:text-[10px]">{{ card.cvc || '***' }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Editable Fields -->
      <div class="flex flex-col gap-4 text-sm max-w-full md:max-w-[70%]">
        <ProfileField
          v-for="(value, field) in {
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone_number: profile.phone_number,
            email: profile.email,
            birth_day: profile.birth_day
          }"
          :key="field"
          :label="field"
          :value="value"
          :field="field"
          @save="updateField"
        />
      </div>

      <!-- Addresses Dropdown -->
      <div class="mt-6 max-w-full md:max-w-[70%]">
        <AddressDropdown
          :addresses="profile.addresses"
          @save="saveAddress"
          @delete="deleteAddress"
        />
      </div>

      <div class="flex md:hidden items-center justify-center mx-auto text-center w-40 text-base pb-1 border-b cursor-pointer mt-6" @click="logout">
        Выйти из профиля
      </div>
    </section>

    <!-- Скелетон только когда авторизован, но профиль ещё грузится -->
    <section v-else-if="isAuthenticated && !userStore.isLoaded" class="py-10">
      <div class="animate-pulse space-y-4">
        <div class="h-8 w-48 bg-gray-200 rounded" />
        <div class="h-40 w-full bg-gray-200 rounded" />
        <div class="h-6 w-2/3 bg-gray-200 rounded" />
      </div>
    </section>

    <!-- Неавторизованный пользователь: ждём авторизации в модалке -->
    <section v-else class="py-10 text-center text-sm md:text-base text-gray-600">
      <p>Для просмотра личного кабинета авторизуйтесь в открывшемся окне.</p>
    </section>
  </BaseContainer>
</template>
