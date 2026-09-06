<script setup lang="ts">
import { createError } from '#app'

definePageMeta({
  layout: 'main',
  hideGlobalBreadcrumbs: true,
})

throw createError({
  statusCode: 404,
  statusMessage: 'Страница не найдена',
  fatal: true,
})
</script>

<template></template>
