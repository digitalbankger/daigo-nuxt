<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import ProfileField from '~/components/profile/ProfileField.vue'
import AddressDropdown from '~/components/profile/AddressDropdown.vue'
import VipActivationBlock from '~/components/profile/VipActivationBlock.vue'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, watch, ref } from 'vue'
import { navigateTo } from '#imports'
import { useCookie } from '#app'
import { getFirstUtm, getLastUtm, type StoredUtmSet } from '@/composables/useUtmTracker'
import { getSpinHistory, type SpinHistoryItem } from '@/services/gamificationService'
import { fetchPhoneRaffleCoupons, type RaffleCoupon } from '@/services/raffleService'

definePageMeta({
  layout: 'main',
  ssr: false,
})

const userStore = useUserStore()
const authStore = useAuthStore()

// реактивные поля из стора
const { profile, isLoaded } = storeToRefs(userStore)
const { isAuthenticated } = storeToRefs(authStore)

const activePromo = ref<SpinHistoryItem | null>(null)

// ---------- Лотерейные билеты ----------

const raffleCoupons = ref<RaffleCoupon[]>([])
const raffleTotalCount = ref(0)
const raffleLoading = ref(false)
const raffleError = ref<string | null>(null)

const raffleGroups = computed(() => {
  const groups: Record<string, RaffleCoupon[]> = {}
  for (const c of raffleCoupons.value) {
    const key = (c.raffle_name || 'Розыгрыш').trim() || 'Розыгрыш'
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  }
  return Object.entries(groups)
    .map(([raffleName, coupons]) => ({
      raffleName,
      coupons: [...coupons].sort((a, b) => String(a.coupon_number).localeCompare(String(b.coupon_number)))
    }))
    .sort((a, b) => a.raffleName.localeCompare(b.raffleName))
})

async function loadRaffleCouponsByPhone(phone: string) {
  raffleLoading.value = true
  raffleError.value = null
  try {
    const res = await fetchPhoneRaffleCoupons(phone)
    raffleCoupons.value = Array.isArray(res?.coupons) ? res.coupons : []
    raffleTotalCount.value = Number(res?.total_count ?? raffleCoupons.value.length ?? 0)
  } catch (e: any) {
    raffleCoupons.value = []
    raffleTotalCount.value = 0
    const status = e?.response?.status
    if (status === 401 || status === 403) {
      raffleError.value = 'Для просмотра билетов необходимо авторизоваться.'
    } else {
      raffleError.value = 'Не удалось загрузить номера билетов. Попробуйте позже.'
    }
  } finally {
    raffleLoading.value = false
  }
}

const activePromoTitle = computed(() =>
  activePromo.value?.prizeName || 'Промокод от колеса фортуны'
)

const activePromoDescription = computed(
  () => activePromo.value?.prizeDescription || ''
)

const promoMessage = computed(() => {
  const expiresRaw = activePromo.value?.expiresAt
  if (!expiresRaw) return ''

  const expires = new Date(expiresRaw)

  if (
    expires.getFullYear() === 2025 &&
    expires.getMonth() === 11 &&
    expires.getDate() === 31
  ) {
    return 'Промокод будет активен 1 декабря'
  }

  return `Промокод действителен до: ${expires.toLocaleDateString('ru-RU')}`
})

async function copyActivePromo() {
  if (!activePromoCode.value) return

  try {
    await navigator.clipboard.writeText(activePromoCode.value)
    copyStatus.value = 'success'
    setTimeout(() => (copyStatus.value = 'idle'), 1500)
  } catch {
    copyStatus.value = 'error'
    setTimeout(() => (copyStatus.value = 'idle'), 1500)
  }
}


const activePromoCode = computed(() => activePromo.value?.couponCode || '')
const hasActivePromo = computed(() => !!activePromo.value && !!activePromoCode.value)

const copyStatus = ref<'idle' | 'success' | 'error'>('idle')

watch(
  profile,
  async (p) => {
    if (!p?.phone_number) return

    try {
      const history = await getSpinHistory(p.phone_number, {
        limit: 20,
        offset: 0
      })

      const now = new Date()
      activePromo.value =
        history.find(item => {
          if (!item.couponCode) return false
          if (item.status !== 'active') return false
          return new Date(item.expiresAt) > now
        }) || null
    } catch {
      activePromo.value = null
    }
  },
  { immediate: true }
)

watch(
  () => profile.value?.phone_number,
  async (phone) => {
    if (!isAuthenticated.value) {
      raffleCoupons.value = []
      raffleTotalCount.value = 0
      raffleError.value = null
      return
    }

    if (!phone) {
      raffleCoupons.value = []
      raffleTotalCount.value = 0
      raffleError.value = null
      return
    }

    await loadRaffleCouponsByPhone(phone)
  },
  { immediate: true }
)

// ---------- VIP по UTM (для показа блока) ----------

function isVipUtm(utm?: StoredUtmSet | null): boolean {
  if (!utm) return false

  const src = (utm.source ?? '').toLowerCase().trim()
  const med = (utm.medium ?? '').toLowerCase().trim()
  const camp = (utm.campaign ?? '').toLowerCase().trim()
  const cont = (utm.content ?? '').toLowerCase().trim()
  const term = (utm.term ?? '').toLowerCase().trim()

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

// кука, которую ставит vip.global.ts
const vipFromCard = useCookie<string | null>('vip_from_card', { path: '/' })

// общий флаг «этот пользователь когда-то пришёл по VIP-ссылке»
const hasVipFlag = computed(() => hasVipUtm.value || vipFromCard.value === '1')

// показывать ли блок ввода VIP-кода/сканера
const showVipBlock = computed(() => isAuthenticated.value)

// после успешной активации можно убрать флаг из куки
function handleVipActivated() {
  vipFromCard.value = '0'
}

// ---------- Проверка токена в localStorage ----------

const hasValidStoredToken = computed(() => {
  if (!process.client) return false
  const token = localStorage.getItem('token')
  const expires = Number(localStorage.getItem('auth_expires_at') || 0)
  const now = Date.now()
  return Boolean(token && expires && now < expires)
})

const authRequested = ref(false)

// ---------- Загрузка профиля при авторизации ----------

watch(
  isAuthenticated,
  async (authed) => {
    if (authed && !isLoaded.value) {
      await userStore.loadProfile()
    }
  },
  { immediate: true }
)

// ---------- Автоматическое открытие модалки авторизации ----------

onMounted(() => {
  // если стор уже считает, что пользователь авторизован — ничего не делаем
  if (isAuthenticated.value) return

  // если в localStorage есть ещё валидный токен — ждём, пока стор подтянется (без модалки)
  if (hasValidStoredToken.value) return

  // токена нет вообще — реально гость, открываем авторизацию
  if (!authRequested.value) {
    authStore.openAuth('/profile')
    authRequested.value = true
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

async function updateField(field: string, value: string) {

  const v = String(value ?? '').trim()

  const nullableFields = new Set(['email', 'last_name', 'birth_day'])

  const payload: Record<string, any> = {
    [field]: nullableFields.has(field) && v === '' ? null : v
  }

  await userStore.saveProfile(payload)
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
      <!-- <div 
        v-if="cardImage" 
        class="w-full max-w-full md:max-w-[48%] rounded-xl overflow-hidden mb-4 md:mb-8"
      >
        <img :src="cardImage" alt="Карта лояльности" class="w-full h-auto" />
      </div> -->

      <!-- Bonuses Block -->
      <div class="relative bg-[#14350C] text-white text-sm md:text-lg rounded-xl min-h-20 px-4 py-3 mb-4 md:mb-6 flex flex-col sm:flex-row gap-3 items-start justify-between max-w-full md:max-w-[70%]">
        <div class="my-auto">
          <div class="flex flex-row gap-2 ">
            <!-- <img src="/icons/bi_stars.svg" class="w-6" /> -->
            <!-- Количество бонусов: -->
            <span class="font-nauryz uppercase text-3xl sm:text-6xl my-auto font-normal md:font-medium text-transparent bg-clip-text" style="background-image: radial-gradient(circle, #FFED68, #FFB830);">{{ profile.bonuses.valid.value }}</span>
          </div>
          <span v-if="profile.bonuses.expiring.value > 0" class="text-sm">
            {{ profile.bonuses.expiring.value }} бонусов сгорят {{ formatDate(profile.bonuses.expiring.date_end) }}
          </span>
        </div>
        <!-- <div class="absolute right-4 top-3 text-xl mb-auto mt-1">
          <img src="/icons/arrow-primary.svg" class="w-4" />
        </div> -->
        <p class="font-nauryz uppercase text-3xl sm:text-6xl my-auto font-normal md:font-medium text-transparent bg-clip-text" style="background-image: radial-gradient(circle, #FFED68, #FFB830);">
          Бонусов
        </p>
      </div>

      <!-- Личные промокоды -->
<div

  class="relative bg-primary/10 border border-primary text-sm md:text-lg rounded-xl px-4 py-3 mb-4 md:mb-6 flex flex-col gap-2 max-w-full md:max-w-[70%]"
>
  <div class="flex items-center gap-2">
    <img src="/icons/bi_stars.svg" class="w-6" />
    <span>Личные промокоды:</span>

    <span
      class="text-primary font-medium cursor-pointer"
      @click="copyActivePromo"
    >
      {{ activePromoCode }}
    </span>

    <span v-if="copyStatus === 'success'" class="text-xs text-primary">
      Скопировано
    </span>
    <span v-else-if="copyStatus === 'error'" class="text-xs text-red-500">
      Ошибка
    </span>
  </div>

  <span class="text-sm">
    {{ promoMessage }}
  </span>
</div>


      <!-- 🔹 VIP блок — только для тех, кто пришёл по VIP-ссылке и уже авторизован -->
      <VipActivationBlock
        v-if="isAuthenticated"
        class="max-w-full md:max-w-[70%] mb-6"
        :has-vip-flag="hasVipFlag"
        @activated="handleVipActivated"
      />

      <!-- Bank Cards -->
      <!-- <div class="bg-gray-100 rounded-xl p-4 mb-6 max-w-full md:max-w-[70%]">
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
      </div> -->

      <!-- Editable Fields -->
      <div class="flex flex-col gap-4 text-sm max-w-full md:max-w-[70%]">
        <ProfileField
          v-for="it in [
            { field: 'first_name',  label: 'Имя',          placeholder: 'Имя',          value: profile.first_name },
            { field: 'last_name',   label: 'Фамилия',      placeholder: 'Фамилия',      value: profile.last_name },
            { field: 'phone_number',label: 'Телефон',      placeholder: '+7 (___) ___-__-__', value: profile.phone_number, type: 'tel' },
            { field: 'email',       label: 'Email',        placeholder: 'Email',        value: profile.email, type: 'email' },
            { field: 'birth_day', label: 'Дата рождения', placeholder: 'Дата рождения', value: profile.birth_day, type: 'date' }
          ]"
          :key="it.field"
          :label="it.label"
          :value="it.value"
          :field="it.field"
          :placeholder="it.placeholder"
          :type="it.type"
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
    <section v-else class="py-10 text-sm md:text-base">
      <p>Для просмотра личного кабинета авторизуйтесь в открывшемся окне.</p>
    </section>
  </BaseContainer>
</template>
