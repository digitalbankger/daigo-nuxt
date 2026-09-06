<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { CATALOG_FILTER_SLUGS } from '~/constants/catalogFilters'
import {
  buildCatalogFilterLocation,
  parseLegacyCatalogFilterSegments,
} from '~/utils/catalogFilterRoute'

const route = useRoute()
const allowedFilterKeys = new Set(CATALOG_FILTER_SLUGS)
const filters = parseLegacyCatalogFilterSegments(route.params.filters, allowedFilterKeys)
const location = buildCatalogFilterLocation(filters)

const query: Record<string, string | string[]> = { ...location.query }
for (const [key, value] of Object.entries(route.query)) {
  if (allowedFilterKeys.has(key) || value == null) continue
  query[key] = Array.isArray(value) ? value.map(String) : String(value)
}

await navigateTo(
  { path: location.path, query, hash: route.hash },
  { redirectCode: 307 },
)
</script>

<template></template>
