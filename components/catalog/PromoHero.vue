<!-- components/promo/PromoHero.vue -->
<template>
  <section class="relative overflow-hidden">
    <div class="grid gap-6 md:grid-cols-12 items-start">
      <!-- ЛЕВАЯ ЧАСТЬ -->
      <div class="md:col-span-8 space-y-3 sm:space-y-5">
        <h1 class="text-2xl sm:text-5xl font-medium !leading-[1.2]">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-gray-600 max-w-2xl">
          {{ subtitle }}
        </p>

        <div class="flex flex-wrap gap-3">
          <Button
            v-if="primary"
            variant="solid"
            :disabled="busy"
            @click="$emit('primary')"
            class="w-full sm:w-auto !bg-[#9AFF9F] hover:!bg-hoverbtn !text-black px-5 py-3"
          >
            {{ primary }}
          </Button>

          <Button
            v-if="secondary"
            :disabled="busy"
            @click="$emit('secondary')"
            class="w-full sm:w-auto px-5 py-3"
          >
            {{ secondary }}
          </Button>
        </div>
      </div>

      <!-- ПРАВАЯ ЧАСТЬ -->
      <aside class="md:col-span-4 md:pl-6">
        <div class="ms-auto w-full sm:w-10/12">
          <p v-if="sideNote" class="text-center sm:text-left text-sm sm:text-lg mb-3">
            {{ sideNote }}
          </p>

          <!-- Таймер -->
          <ClientOnly>
            <div
              class="w-full mt-3 flex flex-row items-center justify-center sm:justify-start gap-2 sm:gap-2"
              aria-live="polite"
            >
              <!-- DAYS -->
              <div class="flex items-center gap-1">
                <span
                  v-for="(d,i) in dDigits"
                  :key="'d'+i"
                  class="digit-box"
                  aria-label="дни"
                >{{ d }}</span>
              </div>

              <span class="colon">:</span>

              <!-- HOURS -->
              <div class="flex items-center gap-1">
                <span v-for="(h,i) in hDigits" :key="'h'+i" class="digit-box" aria-label="часы">{{ h }}</span>
              </div>

              <span class="colon">:</span>

              <!-- MINUTES -->
              <div class="flex items-center gap-1">
                <span v-for="(m,i) in mDigits" :key="'m'+i" class="digit-box" aria-label="минуты">{{ m }}</span>
              </div>

            </div>

            <template #fallback>
              <div class="mt-3 h-[76px] rounded-lg bg-gray-100 animate-pulse" />
            </template>
          </ClientOnly>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import Button from '~/components/ui/Button.vue'

type Emits = {
  (e: 'primary'): void
  (e: 'secondary'): void
}
defineEmits<Emits>()

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  primary?: string
  secondary?: string
  /** Дата окончания акции */
  deadline?: string | Date
  sideNote?: string
  busy?: boolean
  /** Показывать секунды в таймере */
  showSeconds?: boolean
}>(), {
  deadline: '2025-11-02T23:59:59+03:00',
  sideNote: 'Предложение ограничено по времени, до завершения акции осталось:',
  busy: false,
  showSeconds: true
})

const deadlineDate = computed(() => new Date(props.deadline))

const dd = ref('00')
const hh = ref('00')
const mm = ref('00')
const ss = ref('00')

const dDigits = computed(() => dd.value.split(''))
const hDigits = computed(() => hh.value.split(''))
const mDigits = computed(() => mm.value.split(''))
const sDigits = computed(() => ss.value.split(''))

let timer: number | null = null

function updateLeft() {
  const now = Date.now()
  const end = deadlineDate.value.getTime()
  const diff = Math.max(0, end - now)

  const d = Math.floor(diff / 86_400_000) // 1000*60*60*24
  const h = Math.floor((diff / 3_600_000) % 24)
  const m = Math.floor((diff / 60_000) % 60)
  const s = Math.floor((diff / 1_000) % 60)

  dd.value = d.toString().padStart(2, '0')
  hh.value = h.toString().padStart(2, '0')
  mm.value = m.toString().padStart(2, '0')
  ss.value = s.toString().padStart(2, '0')
}

onMounted(() => {
  updateLeft()
  timer = window.setInterval(updateLeft, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style scoped>
.digit-box{
  @apply w-8 h-10 sm:w-10 sm:h-14 rounded-lg bg-[#FA458A] text-white
         flex items-center justify-center text-xl sm:text-2xl font-medium
         tabular-nums shadow-sm;
}
.colon{
  @apply text-[#EBEBEB] text-3xl sm:text-4xl select-none px-1;
}
</style>







<!-- <template>
  <section class="relative overflow-hidden ">
    <div class="grid gap-6 md:grid-cols-12 items-start">
      <div class="md:col-span-8 space-y-3 sm:space-y-5">
        <h1 class="text-2xl sm:text-5xl font-medium !leading-[1.2]">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-gray-600 max-w-2xl">
          {{ subtitle }}
        </p>

        <div class="flex flex-wrap gap-3">
          <Button v-if="secondary" variant="solid" :disabled="busy" @click="$emit('secondary')" class="w-full sm:w-auto !bg-[#9AFF9F] hover:!bg-hoverbtn !text-black px-5 py-3">
            {{ primary }}
          </Button>
          <Button v-if="primary" :disabled="busy" @click="$emit('primary')" class="w-full sm:w-auto px-5 py-3">
            {{ secondary }}
          </Button>
        </div>
      </div>

      <aside class="md:col-span-4 md:pl-6">
        <div class="ms-auto w-full sm:w-10/12">
          <p v-if="sideNote" class="text-center sm:text-left text-sm sm:text-lg mb-3">
            {{ sideNote }}
          </p>

          <ClientOnly>
            <div class="w-full mt-3 flex flex-row gap-3 justify-center sm:justify-start items-center text-center" aria-live="polite">
              <div class="rounded-lg w-12 sm:w-16 bg-[#FA458A] p-2">
                <div class="text-xl sm:text-3xl font-medium text-white tabular-nums">{{ dd }}</div>
                <div class="text-[11px] text-white">дней</div>
              </div>
              <p class="text-[#EBEBEB] text-3xl">:</p>
              <div class="rounded-lg w-12 sm:w-16 bg-[#FA458A] p-2">
                <div class="text-xl sm:text-3xl font-medium text-white tabular-nums">{{ hh }}</div>
                <div class="text-[11px] text-white">часов</div>
              </div>
              <p class="text-[#EBEBEB] text-3xl">:</p>
              <div class="rounded-lg w-12 sm:w-16 bg-[#FA458A] p-2">
                <div class="text-xl sm:text-3xl font-medium text-white tabular-nums">{{ mm }}</div>
                <div class="text-[11px] text-white">мин</div>
              </div>
            </div>
            <template #fallback>
              <div class="mt-3 h-[76px] rounded-lg bg-gray-100 animate-pulse" />
            </template>
          </ClientOnly>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
// Если используете свой UI-кит:
import Button from '~/components/ui/Button.vue'

type Emits = {
  (e: 'primary'): void
  (e: 'secondary'): void
}

defineEmits<Emits>()

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  primary?: string
  secondary?: string
  deadline?: string | Date
  sideNote?: string
  busy?: boolean
}>(), {
  deadline: '2025-11-02T23:59:59+03:00',
  sideNote: 'Предложение ограничено по времени.',
  busy: false
})

const deadlineDate = computed(() => new Date(props.deadline))
const deadlineReadable = computed(() =>
  deadlineDate.value.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

const dd = ref('00')
const hh = ref('00')
const mm = ref('00')
const ss = ref('00')

let timer: number | null = null

function updateLeft() {
  const now = new Date().getTime()
  const end = deadlineDate.value.getTime()
  const diff = Math.max(0, end - now)

  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const s = Math.floor((diff / 1000) % 60)

  dd.value = d.toString().padStart(2, '0')
  hh.value = h.toString().padStart(2, '0')
  mm.value = m.toString().padStart(2, '0')
  ss.value = s.toString().padStart(2, '0')
}

onMounted(() => {
  updateLeft()
  timer = window.setInterval(updateLeft, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script> -->



<!-- <template>
  <section class="relative overflow-hidden ">
    <div class="grid gap-6 md:grid-cols-12 items-start">
      <div class="md:col-span-8 space-y-5">
        <h1 class="text-2xl sm:text-4xl font-medium">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-gray-600 max-w-2xl">
          {{ subtitle }}
        </p>

        <div class="flex flex-wrap gap-3">
          <Button v-if="secondary" variant="solid" :disabled="busy" @click="$emit('secondary')" class="!bg-[#9AFF9F] !text-black px-5 py-3">
            {{ primary }}
          </Button>
          <Button v-if="primary" :disabled="busy" @click="$emit('primary')" class="px-5 py-3">
            {{ secondary }}
          </Button>
        </div>
      </div>

      <aside class="md:col-span-4 md:pl-6">
        <div class="rounded-xl bg-gray-50 p-4 sm:p-5 border border-gray-200">
          <p v-if="sideNote" class="text-sm text-gray-600 mb-3">
            {{ sideNote }}
          </p>

          <ClientOnly>
            <div class="mt-3 grid grid-cols-4 gap-2 text-center" aria-live="polite">
              <div class="rounded-lg bg-white border p-2">
                <div class="text-2xl font-medium tabular-nums">{{ dd }}</div>
                <div class="text-[11px] text-gray-500">дней</div>
              </div>
              <div class="rounded-lg bg-white border p-2">
                <div class="text-2xl font-medium tabular-nums">{{ hh }}</div>
                <div class="text-[11px] text-gray-500">часов</div>
              </div>
              <div class="rounded-lg bg-white border p-2">
                <div class="text-2xl font-medium tabular-nums">{{ mm }}</div>
                <div class="text-[11px] text-gray-500">мин</div>
              </div>
              <div class="rounded-lg bg-white border p-2">
                <div class="text-2xl font-medium tabular-nums">{{ ss }}</div>
                <div class="text-[11px] text-gray-500">сек</div>
              </div>
            </div>
            <template #fallback>
              <div class="mt-3 h-[76px] rounded-lg bg-gray-100 animate-pulse" />
            </template>
          </ClientOnly>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
// Если используете свой UI-кит:
import Button from '~/components/ui/Button.vue'

type Emits = {
  (e: 'primary'): void
  (e: 'secondary'): void
}

defineEmits<Emits>()

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  primary?: string
  secondary?: string
  deadline?: string | Date
  sideNote?: string
  busy?: boolean
}>(), {
  deadline: '2025-11-02T23:59:59+03:00',
  sideNote: 'Предложение ограничено по времени.',
  busy: false
})

const deadlineDate = computed(() => new Date(props.deadline))
const deadlineReadable = computed(() =>
  deadlineDate.value.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
)

const dd = ref('00')
const hh = ref('00')
const mm = ref('00')
const ss = ref('00')

let timer: number | null = null

function updateLeft() {
  const now = new Date().getTime()
  const end = deadlineDate.value.getTime()
  const diff = Math.max(0, end - now)

  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const m = Math.floor((diff / (1000 * 60)) % 60)
  const s = Math.floor((diff / 1000) % 60)

  dd.value = d.toString().padStart(2, '0')
  hh.value = h.toString().padStart(2, '0')
  mm.value = m.toString().padStart(2, '0')
  ss.value = s.toString().padStart(2, '0')
}

onMounted(() => {
  updateLeft()
  timer = window.setInterval(updateLeft, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script> -->
