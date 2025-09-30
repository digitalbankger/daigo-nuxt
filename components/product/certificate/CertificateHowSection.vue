<script setup lang="ts">
type SmallCard = {
  title: string
  subtitle?: string
  number: string | number
  image: string
}
type Hero = { title: string; description?: string; image: string }
type Section = { heading: string; hero: Hero; cards: SmallCard[] }

const props = withDefaults(defineProps<{
  heading?: string
  hero?: Hero
  cards?: SmallCard[]
  /** альтернативный способ — одним объектом */
  section?: Section
}>(), {
  heading: undefined,
  hero: undefined,
  cards: undefined,
  section: undefined
})

/** Нормализуем вход: берём из явных пропов, иначе из section */
const headingFinal = computed(() => props.heading ?? props.section?.heading ?? '')
const heroFinal = computed<Hero>(() => (props.hero ?? props.section?.hero) as Hero)
const cardsFinal = computed<SmallCard[]>(() => (props.cards ?? props.section?.cards ?? []) as SmallCard[])
</script>

<template>
  <section class="space-y-4 sm:space-y-6">
    <h2 class="text-2xl sm:text-4xl font-semibold leading-tight">
      {{ headingFinal }}
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      <!-- Левая 50% -->
      <div class="lg:col-span-6 bg-primary text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 relative overflow-hidden">
        <h3 class="text-xl sm:text-3xl font-semibold leading-tight mb-3 sm:mb-4">
          {{ heroFinal.title }}
        </h3>
        <p v-if="heroFinal.description" class="text-sm sm:text-base max-w-[48ch] opacity-90 whitespace-pre-line">
          {{ heroFinal.description }}
        </p>
        <img
          :src="heroFinal.image"
          alt=""
          class="absolute right-3 bottom-3 sm:right-6 sm:bottom-6 max-h-44 sm:max-h-56 object-contain pointer-events-none select-none"
          loading="lazy"
          decoding="async"
        />
      </div>

      <!-- Правая часть 4× -->
      <div class="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
        <div
          v-for="card in cardsFinal"
          :key="card.number + '-' + card.title"
          class="bg-hoverbtn rounded-2xl sm:rounded-3xl p-4 sm:p-6 relative overflow-hidden"
        >
          <h4 class="text-base sm:text-xl font-semibold leading-tight mb-1">
            {{ card.title }}
          </h4>
          <p v-if="card.subtitle" class="text-xs sm:text-sm text-black/60 mb-12 sm:mb-16">
            {{ card.subtitle }}
          </p>

          <img
            :src="card.image"
            alt=""
            class="absolute right-2 bottom-2 sm:right-4 sm:bottom-4 h-14 sm:h-20 object-contain pointer-events-none select-none"
            loading="lazy"
            decoding="async"
          />

          <span class="absolute left-3 bottom-2 sm:left-4 sm:bottom-3 text-2xl sm:text-4xl font-semibold text-[#5DA3FF]">
            {{ String(card.number).padStart(2,'0') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
