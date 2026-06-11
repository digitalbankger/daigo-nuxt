<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { CATALOG_FILTER_SLUGS } from '~/constants/catalogFilters'

const route = useRoute()
const allowedFilterKeys = new Set(CATALOG_FILTER_SLUGS)

const query: Record<string, string> = {}
const segments = Array.isArray(route.params.filters)
  ? route.params.filters.map(String)
  : typeof route.params.filters === 'string'
    ? String(route.params.filters).split('/')
    : []

for (let i = 0; i < segments.length; i += 2) {
  const key = decodeURIComponent(String(segments[i] || '').trim())
  const value = decodeURIComponent(String(segments[i + 1] || '').trim())

  if (!key || !value || !allowedFilterKeys.has(key)) continue
  query[key] = value
}

for (const [key, value] of Object.entries(route.query)) {
  if (allowedFilterKeys.has(key)) continue
  if (value == null) continue

  if (Array.isArray(value)) {
    const firstValue = value.find((item): item is string => typeof item === 'string' && item !== '')
    if (firstValue) query[key] = firstValue
    continue
  }

  const stringValue = String(value)
  if (stringValue) query[key] = stringValue
}

await navigateTo({ path: '/catalog', query, hash: route.hash }, { redirectCode: 301 })
</script>

<template></template>
