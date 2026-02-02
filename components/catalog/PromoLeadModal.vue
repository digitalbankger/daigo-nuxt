<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-[200] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('update:open', false)"></div>

      <div class="relative w-[92%] sm:w-[460px] rounded-2xl bg-[#FFF3F8] p-6 sm:p-8 shadow-2xl">
        <button
          class="absolute top-3 right-3 text-black/50 hover:text-black"
          @click="$emit('update:open', false)"
        >✕</button>

        <img src="/images/promo-neakciya.png" class="w-7/12 mx-auto mb-2" />

        <h3 class="text-3xl font-medium text-black">{{ title }}</h3>
        <p class="mt-1 text-black/70 w-10/12">{{ subtitle }}</p>

        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <!-- ФИО -->
          <div>
            <label class="text-sm text-black/60">Ваше имя</label>
            <UiInput
              ref="nameRef"
              v-model="form.fullName"
              name="full_name"
              autocomplete="name"
              placeholder="Имя"
              type="text"
              :maxlength="120"
              :error="errors.fullName"
              background="bg-white"
              @blur="onBlurName"
            />
          </div>

          <!-- телефон -->
          <div>
            <label class="text-sm text-black/60">Телефон*</label>
            <UiInput
              ref="phoneRef"
              v-model="form.phone"
              name="phone"
              type="tel"
              inputmode="tel"
              mask="ru-phone"
              autocomplete="tel"
              placeholder="+7 (___) ___-__-__"
              background="bg-white"
              :error="errors.phone"
              @blur="onBlurPhone"
            />
          </div>

          <!-- honeypot для антиспама -->
          <input v-model="form.trap" type="text" class="hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />

          <BaseCheckbox v-model="agreeRequired">
            <span class="text-xs text-black/60">
              Я принимаю <a href="/privacy" class="underline">политику конфиденциальности</a> и <a href="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">согласие на обработку персональных данных</a>
            </span>
          </BaseCheckbox>
          <p v-if="agreeErr" class="text-sm text-red-600 -mt-2">{{ agreeErr }}</p>

        <button
            type="submit"
            :disabled="busy || !isValid"
            class="w-full rounded-xl bg-primary text-white py-3 disabled:opacity-60"
          >
            {{ busy ? 'Отправляем…' : 'Отправить' }}
          </button>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <p v-if="ok" class="text-sm text-green-600">Спасибо! Мы свяжемся в течение часа.</p>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick } from 'vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'

const emits = defineEmits<{(e:'update:open', v:boolean):void; (e:'done'):void }>()
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  subtitle?: string
}>(), {
  open: false,
  title: 'Получите свой подарок',
  subtitle: 'Менеджер свяжется с вами в течение часа'
})

const nameRef = ref<InstanceType<typeof UiInput> | null>(null)
const phoneRef = ref<InstanceType<typeof UiInput> | null>(null)

const form = reactive({ fullName: '', phone: '', trap: '' })
const errors = reactive<{ fullName: string; phone: string }>({ fullName: '', phone: '' })
const busy = ref(false)
const error = ref('')
const ok = ref(false)
const touched = reactive({ name: false, phone: false })

const agreeRequired = ref(false)
const agreeErr = ref('')

// нормализация телефона
const normalizePhone = (val: string) => {
  let d = (val || '').replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d.length === 10 && d[0] !== '7') d = '7' + d
  return d
}

// проверки
function isNameValid() {
  return form.fullName.trim().length > 1
}
function isPhoneValid() {
  const d = normalizePhone(form.phone)
  return d.length === 11 && d.startsWith('7')
}

// обработчики blur
function onBlurName() {
  touched.name = true
  errors.fullName = isNameValid() ? '' : 'Введите ФИО'
}
function onBlurPhone() {
  touched.phone = true
  errors.phone = isPhoneValid() ? '' : 'Введите телефон'
}

const isValid = computed(() => isNameValid() && isPhoneValid() && !form.trap && agreeRequired.value)

async function submit() {
  touched.name = touched.phone = true
  errors.fullName = isNameValid() ? '' : 'Введите ФИО'
  errors.phone = isPhoneValid() ? '' : 'Введите телефон'
  agreeErr.value = agreeRequired.value ? '' : 'Необходимо согласие'
  agreeErr.value = agreeRequired.value ? '' : 'Необходимо согласие'

  if (!isValid.value) {
    if (!isNameValid()) {
      await nextTick()
      nameRef.value?.$el?.querySelector('input')?.focus?.()
    } else if (!isPhoneValid()) {
      await nextTick()
      phoneRef.value?.$el?.querySelector('input')?.focus?.()
    }
    return
  }

  if (form.trap) return // бот

  error.value = ''
  ok.value = false
  busy.value = true

  try {
    await $fetch('/api/lead', {
      method: 'POST',
      body: {
        name: form.fullName.trim(),
        phone: normalizePhone(form.phone),
        source: 'PromoHero',
      }
    })
    ok.value = true
    setTimeout(() => emits('update:open', false), 1200)
    emits('done')
  } catch (e:any) {
    error.value = e?.data?.message || 'Не удалось отправить. Попробуйте позже.'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>
