<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode || 500)
const is404 = computed(() => statusCode.value === 404)

useHead({
  title: () => is404.value ? '404 — Страница не найдена | Daigo' : 'Ошибка | Daigo',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const goHome = () => clearError({ redirect: '/' })
const goCatalog = () => clearError({ redirect: '/catalog' })
const goProfile = () => clearError({ redirect: '/profile' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-white">
    <div class="max-w-xl w-full text-center">
      <div class="text-[68px] sm:text-[128px] font-semibold text-primary">
        {{ statusCode }}
      </div>

      <div class="mt-4 text-2xl font-medium">
        {{ is404 ? 'Страница не найдена' : 'Произошла ошибка' }}
      </div>

      <div class="mt-2 text-gray-500">
        <span v-if="is404">Неверный адрес:</span>
        <span v-else>Детали:</span>
        <span class="break-all"> {{ (error as any)?.url || '' }}</span>
      </div>

      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <button class="px-5 py-2 rounded-md border-none bg-primary text-white hover:bg-hoverbtn hover:text-black transition" @click="goHome">На главную</button>
        <button class="px-5 py-2 rounded-md border-none bg-primary text-white hover:bg-hoverbtn hover:text-black transition" @click="goCatalog">Каталог</button>
        <button class="px-5 py-2 rounded-md border-none bg-primary text-white hover:bg-hoverbtn hover:text-black transition" @click="goProfile">Профиль</button>
      </div>
    </div>
  </div>
</template>
