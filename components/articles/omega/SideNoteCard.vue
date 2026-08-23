<script setup lang="ts">
defineProps<{
  title: string;
  text: string;
  icon?: string;
}>();
</script>

<template>
  <div
    class="relative bg-hoverbtn rounded-[25px] p-6 md:p-8 flex flex-col overflow-hidden"
  >
    <img
      v-if="icon"
      :src="icon"
      alt=""
      class="pointer-events-none select-none absolute right-2 top-3 w-14 md:w-20 h-auto"
    />
    <h3
      class="pr-14 md:pr-20 text-2xl md:text-product font-medium leading-none"
    >
      {{ title }}
    </h3>
    <hr class="border-black/10 my-4 md:my-6" />
    <div class="flex flex-col gap-3 text-sm md:text-base italic text-black">
      <p v-for="(paragraph, i) in text.split('\n\n')" :key="i">
        {{ paragraph }}
      </p>
    </div>
  </div>
</template>
