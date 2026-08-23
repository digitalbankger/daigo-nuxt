<script setup lang="ts">
withDefaults(
  defineProps<{
    image: string
    imageMobile: string
    alt?: string
    sectionClass?: string
    contentClass?: string
  }>(),
  {
    alt: '',
    sectionClass: '',
    contentClass: '',
  },
)
</script>

<template>
  <section
    :class="['relative w-full overflow-hidden rounded-2xl sm:rounded-4xl', sectionClass]"
    aria-label="Промо-баннер"
  >
    <picture class="absolute inset-0 z-0">
      <source media="(min-width: 768px)" :srcset="image" />
        <img
          :src="imageMobile"
          :alt="alt"
          class="
            h-full
            w-full
            object-cover
            object-[68%_center]
            md:object-center
          "
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
    </picture>

    <div
      :class="[
        'relative z-10 min-h-[320px] px-6 py-8 sm:min-h-[360px] sm:px-10 sm:py-9 lg:min-h-[500px] lg:px-16 lg:py-12',
        contentClass,
      ]"
    >
      <slot />
    </div>
  </section>
</template>
