<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { useFeedback } from '~/composables/useFeedback'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'

definePageMeta({ layout: 'main' })

const showPopup = ref(false)
const togglePopup = () => {
  showPopup.value = !showPopup.value
}

const videoUrl = 'https://s3.amazonaws.com/your-bucket/videos/office.mp4'

useHead({
  title: 'Контакты — Daigo',
  meta: [
    { name: 'description', content: 'Контактная информация и расположение офисов Daigo в Москве и Санкт-Петербурге. Напишите нам через форму на сайте.' },
    { property: 'og:title', content: 'Контакты — Daigo' },
    { property: 'og:description', content: 'Узнайте, где находятся наши офисы, и свяжитесь с нами через удобную форму.' },
    { property: 'og:image', content: '/og-image/contacts.jpg' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Daigo',
        url: 'https://daigo.ru/contacts',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+7-800-555-20-43',
            contactType: 'customer service',
            areaServed: 'RU'
          }
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Москва',
          streetAddress: 'Большой Сухаревский переулок 21 стр.2',
          postalCode: '101000',
          addressCountry: 'RU'
        }
      })
    }
  ]
})


const fio = ref('')
const phone = ref('')          // вводим как есть: +7 (___) ___-__-__
const message = ref('')
const agree = ref(false)

const errors = ref<{ fio?: string; phone?: string; message?: string; agree?: string }>({})
const success = ref<{ shown: boolean; leadId?: number }>({ shown: false })

const { loading, error: sendError, send } = useFeedback()

// простая нормализация телефона в E.164 для RU
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
  if (!fio.value.trim() || fio.value.trim().length < 5) errors.value.fio = 'Укажите ФИО полностью'
  if (!phone.value.trim() || !validPhone(phone.value))  errors.value.phone = 'Телефон в формате +7XXXXXXXXXX'
  if (!message.value.trim() || message.value.trim().length < 5) errors.value.message = 'Напишите сообщение'
  if (!agree.value) errors.value.agree = 'Необходимо согласие'
  return Object.keys(errors.value).length === 0
}

async function submitCallback() {
  if (loading.value) return
  if (!validate()) return
  const payload = {
    fio: fio.value.trim(),
    phone_number: normalizePhone(phone.value),
    message: message.value.trim()
  }
  const res = await send(payload)
  if (res.success) {
    success.value = { shown: true, leadId: res.lead_id }
    // очистим форму
    fio.value = ''
    phone.value = ''
    message.value = ''
    agree.value = false
  } else {
    // покажем общую ошибку сверху формы (можно и toast)
    errors.value = { ...errors.value, message: sendError.value || 'Не удалось отправить' }
  }
}
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-6 md:gap-10">
      <h1 class="text-cardhead md:text-head leading-tight font-medium mb-4 md:mb-8">Контакты</h1>

      <a
        href="https://yandex.ru/maps/?rtext=~55.770816,37.631017"
        target="_blank"
        class="w-36 text-primary text-sm mt-1 inline-block md:hidden border-b border-primary"
      >
        Проложить маршрут
      </a>
      <div class="hidden md:block relative w-full max-w-full overflow-hidden">

        <img src="/images/russia-map.png" alt="Карта России" class="w-[92%] h-full" />

        <div
          class="absolute md:left-[30%] lg:left-[22%] md:top-[40%] lg:top-[53%] z-10 cursor-pointer"
          @click="togglePopup"
        >
          <span class="block absolute -left-36 top-16 w-6 h-6 bg-blue-400 rounded-full opacity-75 animate-ping"></span>
          <span class="relative -left-36 top-16 block w-6 h-6 bg-primary rounded-full"></span>
        </div>

        <div
          v-if="!showPopup"
          class="backdrop-blur-xl bg-white/30 border border-white/20 rounded-xl shadow-lg shadow-[#0057ED1A] absolute z-20 bg-white p-4 w-[280px] md:left-[20%] lg:left-[0%] md:top-[40%] lg:top-[30%] -translate-y-1/2"
        >
          <div class="flex flex-row gap-2 items-start">
            <img
              src="/images/daigo-office.jpg"
              class="rounded mb-3 w-1/2"
              alt="Офис Daigo"
            />
            <div class="w-1/2 flex flex-col gap-1 items-start">
              <img src="/logo.svg" alt="daigo logo" class="md:h-6" />
              <div class="font-medium">Москва</div>
              <div class="text-sm mb-3 text-black/60">Головной офис компании Да́йго</div>
            </div>
          </div>
          <div class="text-sm">Большой сухаревский переулок 21 строение 2</div>
          <a
            href="https://yandex.ru/maps/?rtext=~55.770816,37.631017"
            target="_blank"
            class="text-primary text-sm mt-1 inline-block border-b border-primary"
          >
            Проложить маршрут
          </a>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-start gap-10 md:gap-24 lg:gap-32">
        <div class="flex flex-col gap-4 md:gap-5">
          <div class="text-xl sm:text-2xl lg:text-3xl font-medium mb-0 md:mb-2">Москва</div>
          <div class="text-sm sm:text-base lg:text-xl font-normal md:font-medium">Большой сухаревский переулок 21 строение 2
          </div>

          <div class="text-sm sm:text-sm lg:text-lg flex flex-row items-center gap-2">
            <img src="/icons/phone.svg" class="w-5 md:w-6"/>
            <span>Телефон: 8 800 555 20 43</span>
          </div>
          <div class="text-sm sm:text-sm lg:text-lg flex flex-row items-center gap-2">
            <img src="/icons/phone.svg" class="w-5 md:w-6"/>
            <span>Телефон отдела кадров: 8 903 599 20 63</span>
          </div>
          <div class="text-sm sm:text-sm lg:text-lg flex flex-row items-center gap-2">
            <img src="/icons/bi_mailbox.svg" class="w-5 md:w-6"/> 
            <span>Электронная почта: info@daigo.ru</span>
          </div>
          <div class="text-sm sm:text-sm lg:text-lg flex flex-row items-center gap-2">
            <img src="/icons/clock.svg" class="w-5 md:w-6"/> 
            <span>Часы работы: пн-пт 9:00 – 18:00</span>
          </div>
        </div>

      </div>

      <div class="flex flex-col lg:flex-col gap-6 items-start mt-6">
        <h2 class="text-xl sm:text-product lg:text-slider font-medium mb-0 md:mb-4">Головной офис в Москве</h2>
        <div class="flex flex-col lg:flex-row gap-6 items-start w-full">
            <div class="w-full lg:w-4/6 rounded-xl overflow-hidden">
              <!-- <video
                controls
                preload="none"
                poster="/images/video-cover.jpg"
                class="w-full h-auto rounded-xl md:rounded-4xl"
              >
                <source :src="videoUrl" type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video> -->
              <img src="/images/office.jpg" alt="Офис Да́йго" class="w-full h-auto rounded-xl md:rounded-4xl"/> 
              <div>
                <p class="text-lg font-medium mb-2 mt-4">Мы в социальных сетях</p>
                <div class="flex gap-4 md:gap-6">
                  <a href="https://dzen.ru/daigoru" target="_blank" rel="noopener">
                    <img src="/icons/social/dzen.svg" alt="Дзен" class="w-6 md:w-8" loading="lazy" />
                  </a>
                  <a href="https://vk.com/daigoru?roistat_visit=429655" target="_blank" rel="noopener">
                    <img src="/icons/social/vk.svg" alt="VK" class="w-6 md:w-8" loading="lazy" />
                  </a>
                  <a href="https://t.me/daigoru" target="_blank" rel="noopener">
                    <img src="/icons/social/telegram.svg" alt="Telegram" class="w-6 md:w-8" loading="lazy" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener">
                    <img src="/icons/social/youtube.svg" alt="YouTube" class="w-6 md:w-8" loading="lazy" />
                  </a>
                  <a href="https://daigo.store" target="_blank" rel="noopener">
                    <img src="/icons/social/yam.svg" alt="Daigo" class="w-6 md:w-8" loading="lazy" />
                  </a>
                </div>
              </div>
            </div>

            <div class="w-full lg:w-2/6 flex flex-col gap-4">
              <form class="flex flex-col gap-3 md:gap-4" @submit.prevent="submitCallback" novalidate>
                <h2 class="text-xl md:text-3xl font-medium mt-2 md:mt-0">Напишите нам</h2>

                <!-- общая ошибка -->
                <p v-if="sendError" class="text-red-600 text-sm -mb-1">{{ sendError }}</p>

                <div>
                  <input
                    v-model="fio"
                    type="text"
                    placeholder="ФИО"
                    class="border rounded-lg p-2 w-full"
                    autocomplete="name"
                    aria-label="ФИО"
                  />
                  <p v-if="errors.fio" class="text-red-600 text-sm mt-1">{{ errors.fio }}</p>
                </div>

                <div>
                  <input
                    v-model="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    class="border rounded-lg p-2 w-full"
                    inputmode="tel"
                    autocomplete="tel"
                    aria-label="Телефон"
                  />
                  <p v-if="errors.phone" class="text-red-600 text-sm mt-1">{{ errors.phone }}</p>
                </div>

                <div>
                  <textarea
                    v-model="message"
                    placeholder="Сообщение"
                    rows="5"
                    class="border rounded-lg p-2 w-full"
                    aria-label="Сообщение"
                  />
                  <p v-if="errors.message" class="text-red-600 text-sm mt-1">{{ errors.message }}</p>
                </div>

                <!-- honeypot (анти-бот, невидимое поле) -->
                <input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

                <div class="space-y-1">
                  <BaseCheckbox v-model="agree" @click="errors.agree = ''">
                    <span class="text-xs text-black/50">
                      Я согласен(на) с
                      <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
                      и
                      <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
                    </span>
                  </BaseCheckbox>
                  <p v-if="errors.agree" class="text-red-600 text-sm -mt-2">{{ errors.agree }}</p>
                </div>

                <button
                  type="submit"
                  class="bg-primary hover:bg-primary text-white tracking-wide py-3 rounded-lg disabled:opacity-60"
                  :disabled="loading"
                >
                  {{ loading ? 'Отправка…' : 'Отправить' }}
                </button>

                <!-- успешная отправка -->
                <div v-if="success.shown" class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3">
                  Заявка отправлена! {{ success.leadId ? `ID обращения: ${success.leadId}` : '' }}
                </div>
              </form>


              <div class="flex flex-col gap-4 mt-4">
                <a href="/media-s3/materials/preza.pdf" class="text-primary flex flex-row gap-2 items-center" download><img src="/icons/download.svg" /> <span>Презентация</span></a>
                <a href="/media-s3/materials/journal.pdf" class="text-primary flex flex-row gap-2 items-center" download><img src="/icons/download.svg" /> <span>Журнал Да́йго</span></a>
              </div>
            </div>
        </div>
      </div>

      <div class="text-xl md:text-3xl font-medium mb-0 md:mt-4 md:-mb-6">Реквизиты</div>
      <ul class="text-sm md:text-xl flex flex-col gap-3 md:gap-2">
        <li class="">ООО «МЕТАБИОТИК»;</li>
        <li class="">127051, г. Москва, вн. тер. г. муниципальный округ Мещанский, пер. Большой Сухаревский,  д. 21, стр. 2;</li>
        <li class="">ИНН: 9718234724;</li>
        <li class="">ОГРН: 1237700627988 от 21.09.2023;</li>
        <li class="">Расчетный счет: 40702 810 8027 8000 6158 в АО "АЛЬФА-БАНК";</li>
        <li class="">БИК 044525593;</li>
        <li class="">Корр. счет: 30101 810 2000 0000 0593;</li>
        <li class="">ОКПО: 94076386;</li>
      </ul>
    </div>
  </BaseContainer>
</template>

<style scoped>
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}
</style>

