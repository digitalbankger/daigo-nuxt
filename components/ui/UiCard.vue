<template>
  <div class="relative p-6 transition" :class="card.styles?.card">
    <div v-if="card.tags?.length" class="flex flex-wrap gap-3 mb-4 w-4/5" :class="card.styles?.tags">
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
      <div class="flex flex-col gap-4 items-start">
        <h3 v-if="card.title" :class="card.styles?.title">
          {{ card.title }}
        </h3>
        <ul v-if="card.list?.length" class="mt-2 space-y-4">
          <li v-for="(it, i) in card.list" :key="i" class="flex items-start gap-3">
            <img :src="it.icon || '/icons/checkbox-blue.svg'" alt="" class="w-5 h-5 mt-0.5" />
            <span class="text-xl md:text-2xl leading-snug">{{ it.text }}</span>
          </li>
        </ul>
        <p v-if="card.subtitle" :class="card.styles?.subtitle">
          {{ card.subtitle }}
        </p>
        <p v-if="card.text" :class="card.styles?.text">
          {{ card.text }}
        </p>
        <NuxtLink
          v-if="card.button"
          :to="card.button.link"
          class="btn btn-primary mt-auto"
          :class="card.styles?.button"
        >
          {{ card.button.text }}
        </NuxtLink>

      </div>
      <img
        v-if="card.imageSrc"
        :src="card.imageSrc"
        :alt="card.title"
        :loading="card.lazy ? 'lazy' : 'eager'"
        :class="card.styles?.image"
        lazy="true"
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
      class="absolute w-10 h-10 transition-transform duration-300 transform rotate-0 group-hover:rotate-45"
      :class="card.styles?.arrow ?? 'top-4 right-4'"
    />

  </div>
</template>

<script setup lang="ts">
defineProps<{
  card: {
    button?: any;
    title?: string
    subtitle?: string
    text?: string
    imageSrc?: string
    extraImage?: string
    lazy?: boolean
    showArrow?: boolean
    arrowSrc?: string
    tags?: { label: string; color: string }[]
    list?: { text: string; icon?: string }[]
    styles?: {
      card?: string
      tags?: string
      title?: string
      subtitle?: string
      text?: string
      button?: string
      image?: string
      extraImage?: string
      arrow?: string
    }
  }
}>()
</script>
