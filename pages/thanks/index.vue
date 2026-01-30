<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo } from '#imports'

definePageMeta({ layout: 'main', ssr: false })

onMounted(() => {
  // Если пользователь попал на /thanks без id — отправим в профиль (заказы/статусы видны там)
  navigateTo('/profile')
})
</script>

<template>
  <div />
</template>
