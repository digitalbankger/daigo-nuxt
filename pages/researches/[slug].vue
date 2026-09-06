<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import Button from '~/components/ui/Button.vue'
import UiInput from '~/components/ui/UiInput.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'
import { useNewsletter } from '~/composables/useNewsletter'

definePageMeta({ layout: 'main' })

import { useRoute } from 'vue-router'
import { useResearchStore } from '~/stores/researchStore'
import { useSeoMeta, useHead } from '#imports'

const route = useRoute()
const store = useResearchStore()

// SSR-фетч. Неизвестная категория должна быть настоящей 404,
// а не пустой страницей или неявным fallback на другую категорию.
const { error: categoryError } = await useAsyncData(
  `research-category:${String(route.params.slug || '')}`,
  () => store.fetchCategoryItems(route.params.slug as string),
)

if (categoryError.value || !store.currentCategory) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Категория исследований не найдена',
    fatal: true,
  })
}

// вычисления для верстки
const featured = computed(() => store.researches.filter(i => i.isFeatured))
const others = computed(() => store.researches.filter(i => !i.isFeatured))

// SEO
const pageTitle = computed(() =>
  `${store.currentCategory?.title ?? ''} — Исследования Daigo`
)
useSeoMeta({
  title: pageTitle.value,
  description: pageTitle.value,
  ogTitle: pageTitle.value,
  ogDescription: pageTitle.value
})
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle.value
      })
    }
  ]
})

function fmt(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('ru-RU')
}

const email = ref('')
const success = ref(false)
const emailErr = ref<string | boolean>('')

const { loading, error, subscribe } = useNewsletter()

const agree = ref(false)
const agreeError = ref('')

const emailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)

function validateEmail() {
  if (!email.value.trim()) { emailErr.value = 'Введите e-mail'; return false }
  if (!emailValid.value)   { emailErr.value = 'Некорректный e-mail'; return false }
  emailErr.value = ''
  return true
}

async function submitSubscribe() {
  if (loading.value) return
  agreeError.value = agree.value ? '' : 'Нужно согласие с политикой'
  if (!agree.value) return
  if (!validateEmail()) return

  const ok = await subscribe(email.value.trim())
  if (ok) {
    success.value = true
  } else {
    // пробрасываем текст ошибки под инпут
    emailErr.value = error.value || 'Не удалось оформить подписку'
  }
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <div class="flex flex-row items-center justify-between mb-6">
        <h1 class="text-[clamp(32px,8vw,80px)] font-medium">{{ store.currentCategory?.title }}</h1>
      </div>
      <!-- Верхний блок “Основные исследования” -->
      <div v-if="featured.length" class="mb-12 flex flex-col gap-6">
        <h2 class="text-xl md:text-slider font-medium mb-2 lg:mb-6">Основные исследования</h2>

        <div class="flex gap-4 lg:gap-8 flex-col lg:flex-row">
          <!-- слева — первый, большой -->
          <NuxtLink
            :to="`/researches/item/${featured[0].slug}`"
            class="flex flex-col text-left group w-full lg:w-1/2"
          >
            <img
              :src="featured[0].image"
              :alt="featured[0].title"
              class="w-full md:h-[355px] object-cover object-center transition-transform duration-300 mb-4 rounded-xl md:rounded-2xl"
              loading="lazy"
              decoding="async"
            />
            <div>
              <h3 class="text-xl lg:text-cardhead font-medium text-black leading-tight mb-4">
                {{ featured[0].title }}
              </h3>
              <span class="flex flex-row gap-2 items-center text-black/50">
                <img src="/icons/calendar.svg" width="20" class="opacity-50" />
                {{ fmt(featured[0].date) }}
              </span>
            </div>
          </NuxtLink>

          <!-- справа — остальные фичеред -->
          <div class="flex flex-row lg:flex-col gap-4 lg:gap-8 w-full lg:w-1/2">
            <NuxtLink
              v-for="it in featured.slice(1)"
              :key="it.id"
              :to="`/researches/item/${it.slug}`"
              class="flex flex-col lg:flex-row gap-4 group rounded-lg lg:rounded-xl overflow-hidden w-1/2 lg:w-full"
            >
              <img
                :src="it.image"
                :alt="it.title"
                class="w-full h-[130px] lg:h-[210px] object-cover object-center rounded-lg transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 class="font-medium text-xs lg:text-xl">
                  {{ it.title }}
                </h3>
                <span class="flex flex-row gap-2 items-center text-xs lg:text-base text-black/50 mt-auto lg:mt-4">
                  <img src="/icons/calendar.svg" width="20" class="opacity-50" />
                  {{ fmt(it.date) }}
                </span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Все исследования -->
      <h2 class="text-xl lg:text-slider font-medium mb-10">Все исследования</h2>
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        <NuxtLink
          v-for="it in others"
          :key="it.id"
          :to="`/researches/item/${it.slug}`"
          class="group block overflow-hidden bg-white h-full flex flex-col gap-4"
        >
          <img
            :src="it.image"
            :alt="it.title"
            class="h-80 w-full object-cover rounded-xl"
            loading="lazy"
            decoding="async"
          />
          <h3 class="font-medium text-xl">
            {{ it.title }}
          </h3>
          <div class="flex flex-row gap-2 items-center text-black/50 mt-auto">
            <img src="/icons/calendar.svg" width="20" class="opacity-50" />
            {{ fmt(it.date) }}
          </div>
        </NuxtLink>
      </div>
    </section>

    <p class="xs-max:text-base text-lg font-medium mx-auto text-center mt-20 border-y py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

    <!-- Подписка -->
    <section
      class="relative overflow-hidden w-full flex items-center justify-center rounded-2xl md:min-h-[415px] bg-primary bg-no-repeat px-4 md:px-6 lg:px-10 py-8 md:py-8 text-white mt-16"
    >
      <!-- <img src="/images/subscription-product.png" alt="" class="hidden md:block absolute z-0 right-0" />
      <img src="/images/subscription-left.png" alt="" class="hidden md:block absolute z-0 left-0" />
      <img src="/images/subscription-product-mob.png" alt="" class="block md:hidden absolute z-0 right-0" />
      <img src="/images/subscription-left-mob.png" alt="" class="block md:hidden absolute z-0 left-0" /> -->

      <div class="relative z-10 md:w-full flex flex-col gap-4 items-start justify-center my-auto">
        <h2 class="font-medium leading-tight text-3xl md:text-slider w-9/12 md:w-full">
          Подпишитесь на <span class="ms-1 rounded-md px-1 md:px-3 py-1 text-white bg-transparent [#C3FF00]">рассылку</span>
        </h2>

        <p class="text-sm lg:text-lg md:text-2xl leading-5 md:leading-10 text-left max-w-[90%] md:max-w-[60%] mb-1">
          Оставьте свою электронную почту и получайте дайджест полезных материалов раз в неделю —
          а также узнавайте первыми о новых акциях и предложениях.
        </p>

        <!-- успех -->
        <transition name="fade">
          <div v-if="success" class="mt-2 bg-white/20 rounded-lg px-4 py-3 backdrop-blur">
            <p class="text-white text-base md:text-lg">🎉 Спасибо! Подписка успешно оформлена.</p>
          </div>
        </transition>

        <!-- форма -->
        <form
          v-if="!success"
          class="mt-2 flex w-full max-w-xl gap-3 flex-col sm:flex-row"
          @submit.prevent="submitSubscribe"
          novalidate
        >
          <UiInput
            v-model="email"
            type="email"
            placeholder="Ваш e-mail"
            autocomplete="email"
            background="!bg-white"
            class="!text-black/70 placeholder:text-black/70 !border-0"
            :error="emailErr"
            @enter="submitSubscribe"
          />
          <Button
            variant="solid"
            class="!text-white text-lg bg-white hover:bg-gray-100 w-full sm:w-60"
            type="submit"
            :disabled="loading"
          >
            {{ loading ? 'Отправка…' : 'Отправить' }}
          </Button>
        </form>

        <div v-if="!success" class="mt-1 space-y-1">
          <BaseCheckbox v-model="agree" @click="agreeError = ''">
            <span class="text-xs md:text-sm text-white/80">
              Я согласен(на) с
              <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
              и
              <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
            </span>
          </BaseCheckbox>
          <p v-if="agreeError" class="text-xs text-red-200">{{ agreeError }}</p>
        </div>
      </div>
    </section>
  </BaseContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
