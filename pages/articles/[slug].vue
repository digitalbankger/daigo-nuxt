<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#app'
import ArticleDetailTemplate from '~/components/articles/ArticleDetailTemplate.vue'

definePageMeta({ layout: 'main' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))
</script>

<template>
  <ArticleDetailTemplate :slug="slug" />
</template>
