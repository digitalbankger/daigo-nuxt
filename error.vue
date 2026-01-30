<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode || 500)
const is404 = computed(() => statusCode.value === 404)

const goHome = () => clearError({ redirect: '/' })
const goCatalog = () => clearError({ redirect: '/catalog' })
const goProfile = () => clearError({ redirect: '/profile' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 bg-white">
    <div class="max-w-xl w-full text-center">
      <div class="text-7xl font-bold">
        {{ statusCode }}
      </div>

      <div class="mt-4 text-2xl font-semibold">
        {{ is404 ? 'Страница не найдена' : 'Произошла ошибка' }}
      </div>

      <div class="mt-2 text-gray-500">
        <span v-if="is404">Неверный адрес:</span>
        <span v-else>Детали:</span>
        <span class="break-all"> {{ (error as any)?.url || '' }}</span>
      </div>

      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <button class="px-5 py-2 rounded-lg border" @click="goHome">На главную</button>
        <button class="px-5 py-2 rounded-lg border" @click="goCatalog">Каталог</button>
        <button class="px-5 py-2 rounded-lg border" @click="goProfile">Профиль</button>
      </div>
    </div>
  </div>
</template>
