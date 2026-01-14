<template>
  <div @click="toLink()" @keydown.enter="toLink" @keydown.space.prevent="toLink" tabindex="0" role="link" class="relative bg-hoverbtn rounded-3xl px-4 py-6 md:p-8 min-h-[430px] h-full flex flex-col justify-start items-start cursor-pointer hover:shadow-productcard transition-shadow duration-300">
  <img
    v-if="partner.logo"
    :src="partner.logo"
    :alt="partner.name"
    class="max-h-[80px] md:max-h-[92px] mb-4"
  />

  <div class="w-[100%]">
    <h3 class="text-xl md:text-2xl font-medium mb-2">{{ partner.name }}</h3>
    <p class="text-xs md:text-base text-black/70 mb-4">{{ partner.about }}</p>
    <p class="border-l-2 border-black ps-2 md:ps-4 text-sm md:text-base whitespace-pre-line" v-html="partner.description"></p>
    <a
      v-if="partner.link"
      @click.stop
      :href="partner.link"
      target="_blank"
      rel="noopener noreferrer"
      class="font-mont inline-block mt-4 underline text-sm md:text-base"
    >Перейти на сайт партнера</a>
  </div>

  <img
    src="/icons/arrow-up-right.svg"
    alt="arrow"
    class="absolute w-10 md:w-8 h-10 md:h-8 top-4 right-4"
  />
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  partner: {
    name: string
    about: string
    description: string
    logo?: string
    link?: string
  }
}>()

function toLink(): void {
  const url = props.partner.link
  if (!url) return
  try {
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (e) {
    // fallback to assigning location in case window.open is blocked
    window.location.href = url
  }
}
</script>
