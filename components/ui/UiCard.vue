<template>
  <div class="relative p-6 transition" :class="card.styles?.card">
    <div v-if="card.tags?.length" class="flex flex-wrap gap-3 mb-4 w-4/5">
      <span
        v-for="tag in card.tags"
        :key="tag.label"
        class="text-lg px-4 py-1 rounded-md"
        :class="tag.color"
      >
        {{ tag.label }}
      </span>
    </div>

    <div class="flex justify-between items-start">
      <div>
        <h3 v-if="card.title" :class="card.styles?.title">
          {{ card.title }}
        </h3>
        <p v-if="card.text" :class="card.styles?.text">
          {{ card.text }}
        </p>
      </div>
      <img
        v-if="card.imageSrc"
        :src="card.imageSrc"
        :alt="card.title"
        :loading="card.lazy ? 'lazy' : 'eager'"
        :class="card.styles?.image"
      />
    </div>

    <img
      v-if="card.extraImage"
      :src="card.extraImage"
      alt="extra"
      :class="card.styles?.extraImage"
      :loading="card.lazy ? 'lazy' : 'eager'"
    />

    <img
      v-if="card.showArrow"
      :src="card.arrowSrc || '/icons/arrow-up-right.svg'"
      alt="→"
      class="absolute top-4 right-4 w-10 h-10 transition-transform duration-300 transform rotate-0 group-hover:rotate-45"
    />

  </div>
</template>

<script setup lang="ts">
defineProps<{
  card: {
    title?: string
    text?: string
    imageSrc?: string
    extraImage?: string
    lazy?: boolean
    showArrow?: boolean
    arrowSrc?: string
    tags?: { label: string; color: string }[]
    styles?: {
      card?: string
      title?: string
      text?: string
      image?: string
      extraImage?: string
    }
  }
}>()
</script>
