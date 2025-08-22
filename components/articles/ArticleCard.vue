<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="flex flex-col text-left group w-full max-w-[416px]">
    <div class="w-full h-[350px] overflow-hidden rounded-[15px] mb-4">
      <img
        :src="article.image"
        :alt="article.title"
        class="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        width="416"
        height="350"
      />
    </div>

    <h3 class="text-cardhead font-medium text-black leading-tight mb-4">
      {{ article.title }}
    </h3>
    <p class="text-base text-left text-black  mb-4 line-clamp-3">
      {{ article.preview }}
    </p>
    <div class="text-base text-black/50 flex gap-4 mt-auto">
        <span class="flex flex-row gap-2 items-center">          
            <img src="/icons/calendar.svg" width="20" class="opacity-50" />
            {{ article.date }}
        </span>
        <span class="flex flex-row gap-2 items-center">          
            <img src="/icons/clock.svg" width="20" class="opacity-50" />
            {{ article.time }} мин
        </span>
        <span class="flex flex-row gap-2 items-center">          
            <img src="/icons/eye.svg" width="20" class="opacity-50" />
            {{ article.views }}
        </span>
        <span class="flex flex-row gap-2 items-center">          
            <img src="/icons/comments.svg" width="20" class="opacity-50" />
            {{ article.comments }}
        </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Article } from '~/types/articles'

defineProps<{ article: Article }>()
</script>
