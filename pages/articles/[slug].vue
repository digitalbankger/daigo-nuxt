<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#app'
import ArticleDetailTemplate from '~/components/articles/ArticleDetailTemplate.vue'

definePageMeta({ layout: 'main', hideGlobalBreadcrumbs: true })

const route = useRoute()
const slug = computed(() => String(route.params.slug))
</script>

<template>
  <ArticleDetailTemplate :key="slug" :slug="slug" />
</template>
