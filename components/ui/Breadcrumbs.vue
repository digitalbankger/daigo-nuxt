<template>
  <nav
    aria-label="breadcrumb"
    class="text-sm text-gray-500 mb-4"
    itemscope
    itemtype="https://schema.org/BreadcrumbList"
  >
    <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <li
        v-for="(crumb, index) in withHome"
        :key="index"
        class="flex items-center"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        <NuxtLink
          v-if="index < withHome.length - 1"
          :to="crumb.to"
          class="hover:underline"
          itemprop="item"
        >
          <span itemprop="name">{{ crumb.title }}</span>
        </NuxtLink>
        <span v-else class="text-black" itemprop="name">{{ crumb.title }}</span>

        <meta itemprop="position" :content="(index + 1).toString()" />
        <span v-if="index < withHome.length - 1" class="mx-1">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Crumb {
  title: string
  to: string
}

const props = defineProps<{
  crumbs: Crumb[]
}>()

const withHome = computed(() => [
  { title: 'Главная', to: '/' },
  ...props.crumbs
])
</script>
