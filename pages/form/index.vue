<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useFeedback } from '~/composables/useFeedback'

definePageMeta({ layout: 'main' })

const SUBJECT_OPTIONS = [
  'Партнерство',
  'Технические проблемы',
  'Трудности при оформлении заказа',
  'Трудоустройство',
  'Другое'
] as const

type SubjectOption = typeof SUBJECT_OPTIONS[number]

const subject = ref<SubjectOption | null>(null)

const fio = ref('')
const phone = ref('')
const message = ref('')
const agree = ref(false)

const errors = ref<{ subject?: string; fio?: string; phone?: string; message?: string; agree?: string }>({})
const success = ref<{ shown: boolean; leadId?: number }>({ shown: false })

const { loading, error: sendError, send } = useFeedback()

/** ---- custom select ---- */
const selectRoot = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const activeIndex = ref<number>(0)

const selectedLabel = computed(() => subject.value ?? 'Выберите тему обращения')

function openSelect() {
  if (loading.value) return
  isOpen.value = true
  // подсветить текущее выбранное или первый элемент
  const idx = subject.value ? SUBJECT_OPTIONS.indexOf(subject.value) : 0
  activeIndex.value = Math.max(0, idx)
}

function closeSelect() {
  isOpen.value = false
}

function toggleSelect() {
  isOpen.value ? closeSelect() : openSelect()
}

function choose(opt: SubjectOption) {
  subject.value = opt
  closeSelect()
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    closeSelect()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, SUBJECT_OPTIONS.length - 1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    const opt = SUBJECT_OPTIONS[activeIndex.value]
    choose(opt)
  }
}

function onClickOutside(ev: MouseEvent) {
  if (!isOpen.value) return
  const t = ev.target as Node | null
  if (selectRoot.value && t && !selectRoot.value.contains(t)) closeSelect()
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})

/** ---- validation + submit ---- */
function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('8')) return `+7${digits.slice(1)}`
  if (digits.startsWith('7')) return `+7${digits.slice(1)}`
  if (digits.startsWith('9') && digits.length === 10) return `+7${digits}`
  return input.startsWith('+') ? input : `+${digits}`
}

const validPhone = (p: string) => /^\+7\d{10}$/.test(normalizePhone(p))

function validate() {
  errors.value = {}
  if (!subject.value) errors.value.subject = 'Выберите тему'
  if (!fio.value.trim() || fio.value.trim().length < 5) errors.value.fio = 'Укажите ФИО полностью'
  if (!phone.value.trim() || !validPhone(phone.value)) errors.value.phone = 'Телефон в формате +7XXXXXXXXXX'
  if (!message.value.trim() || message.value.trim().length < 5) errors.value.message = 'Напишите сообщение'
  if (!agree.value) errors.value.agree = 'Необходимо согласие'
  return Object.keys(errors.value).length === 0
}

async function submitCallback() {
  if (loading.value) return
  if (!validate()) return

  const payload = {
    subject: subject.value, // ✅ кастомный select
    fio: fio.value.trim(),
    phone_number: normalizePhone(phone.value),
    message: message.value.trim()
  }

  const res = await send(payload)
  if (res.success) {
    success.value = { shown: true, leadId: res.lead_id }
    subject.value = null
    fio.value = ''
    phone.value = ''
    message.value = ''
    agree.value = false
  } else {
    errors.value = { ...errors.value, message: sendError.value || 'Не удалось отправить' }
  }
}
</script>

<template>
  <BaseContainer>
    <section class="min-h-[70vh] flex items-center justify-center py-10">
      <div class="w-full max-w-[520px]">
        <h1 class="text-2xl md:text-4xl font-medium text-center mb-6">
          Форма обратной связи
        </h1>

        <form class="flex flex-col gap-3 md:gap-4" @submit.prevent="submitCallback" novalidate>
          <p v-if="sendError" class="text-red-600 text-sm -mb-1 text-center">{{ sendError }}</p>

          <!-- ✅ Custom Select -->
          <div ref="selectRoot">
            <button
              type="button"
              class="w-full border rounded-lg p-3 text-left flex items-center justify-between bg-white"
              :class="errors.subject ? 'border-red-500' : 'border-black/15'"
              @click="toggleSelect"
              :aria-expanded="isOpen ? 'true' : 'false'"
              aria-haspopup="listbox"
            >
              <span class="truncate" :class="!subject ? 'text-black/40' : 'text-black'">
                {{ selectedLabel }}
              </span>

              <svg
                class="h-4 w-4 shrink-0 transition-transform"
                :class="isOpen ? 'rotate-180' : ''"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clip-rule="evenodd"/>
              </svg>
            </button>

            <div
              v-if="isOpen"
              class="mt-2 w-full rounded-lg border border-black/10 bg-white shadow-lg overflow-hidden"
              role="listbox"
            >
              <button
                v-for="(opt, i) in SUBJECT_OPTIONS"
                :key="opt"
                type="button"
                class="w-full text-left px-4 py-3 text-sm hover:bg-black/5"
                :class="[
                  i === activeIndex ? 'bg-black/5' : '',
                  subject === opt ? 'font-medium' : ''
                ]"
                @mouseenter="activeIndex = i"
                @click="choose(opt)"
              >
                {{ opt }}
              </button>
            </div>

            <p v-if="errors.subject" class="text-red-600 text-sm mt-1">{{ errors.subject }}</p>
          </div>

          <!-- ФИО -->
          <div>
            <input
              v-model="fio"
              type="text"
              placeholder="ФИО"
              class="border rounded-lg p-3 w-full"
              :class="errors.fio ? 'border-red-500' : 'border-black/15'"
              autocomplete="name"
              aria-label="ФИО"
            />
            <p v-if="errors.fio" class="text-red-600 text-sm mt-1">{{ errors.fio }}</p>
          </div>

          <!-- Телефон -->
          <div>
            <input
              v-model="phone"
              type="tel"
              placeholder="+7 (999) 999-99-99"
              class="border rounded-lg p-3 w-full"
              :class="errors.phone ? 'border-red-500' : 'border-black/15'"
              inputmode="tel"
              autocomplete="tel"
              aria-label="Телефон"
            />
            <p v-if="errors.phone" class="text-red-600 text-sm mt-1">{{ errors.phone }}</p>
          </div>

          <!-- Сообщение -->
          <div>
            <textarea
              v-model="message"
              placeholder="Сообщение"
              rows="5"
              class="border rounded-lg p-3 w-full"
              :class="errors.message ? 'border-red-500' : 'border-black/15'"
              aria-label="Сообщение"
            />
            <p v-if="errors.message" class="text-red-600 text-sm mt-1">{{ errors.message }}</p>
          </div>

          <!-- honeypot -->
          <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

          <!-- согласие -->
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="agree" />
            <span class="text-xs text-black/50 text-left">Принимаю политику конфиденциальности</span>
          </label>
          <p v-if="errors.agree" class="text-red-600 text-sm -mt-2">{{ errors.agree }}</p>

          <button
            type="submit"
            class="bg-primary text-white tracking-wide py-3 rounded-lg disabled:opacity-60"
            :disabled="loading"
          >
            {{ loading ? 'Отправка…' : 'Отправить' }}
          </button>

          <div v-if="success.shown" class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
            Заявка отправлена! {{ success.leadId ? `ID обращения: ${success.leadId}` : '' }}
          </div>
        </form>
      </div>
    </section>
  </BaseContainer>
</template>
