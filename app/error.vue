<template>
  <div class="min-h-[70vh] bg-white">
    <BaseContainer>
      <div class="py-16 sm:py-24">
        <div class="max-w-[720px]">
          <p class="text-sm font-medium text-gray-500">Ошибка {{ statusCode }}</p>
          <h1 class="mt-3 text-3xl sm:text-5xl font-semibold leading-tight">
            {{ title }}
          </h1>
          <p class="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
            {{ description }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <button
              class="px-5 py-3 rounded-xl bg-black text-white hover:opacity-90"
              @click="goHome"
            >
              На главную
            </button>

            <NuxtLink
              to="/catalog"
              class="px-5 py-3 rounded-xl border border-gray-200 hover:border-gray-300"
            >
              В каталог
            </NuxtLink>

            <NuxtLink
              to="/profile"
              class="px-5 py-3 rounded-xl border border-gray-200 hover:border-gray-300"
            >
              Профиль
            </NuxtLink>
          </div>

          <div v-if="details" class="mt-10 rounded-2xl bg-gray-50 p-5">
            <p class="text-xs font-medium text-gray-500">Техническая информация</p>
            <pre class="mt-2 whitespace-pre-wrap text-xs text-gray-600">{{ details }}</pre>
          </div>
        </div>
      </div>
    </BaseContainer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useError, clearError, useRoute } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'

const err = useError()
const route = useRoute()

const statusCode = computed(() => (err.value as any)?.statusCode || 500)

const title = computed(() => {
  if (statusCode.value === 404) return 'Страница не найдена'
  return 'Произошла ошибка'
})

const description = computed(() => {
  if (statusCode.value === 404) {
    return `Мы не нашли страницу по адресу “${route.fullPath}”. Проверьте ссылку или перейдите в каталог.`
  }
  return 'Попробуйте обновить страницу. Если проблема повторяется — вернитесь позже.'
})

// В продакшене технические детали обычно не показывают.
// В дев-режиме Nuxt всё равно покажет оверлей, но пусть будет компактно.
const details = computed(() => {
  const e: any = err.value
  if (!e) return ''
  const msg = e.message || e.statusMessage || ''
  return msg ? String(msg) : ''
})

const goHome = () => {
  clearError({ redirect: '/' })
}
</script>
