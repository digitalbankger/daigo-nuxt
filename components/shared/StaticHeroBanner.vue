<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  image?: string
  imageMobile?: string
  title?: string
  class?: string
}>(), {
  image: '/images/new-year/ny-gen.png',
  imageMobile: '/images/new-year/ny-mob-gen.jpg',
  title: 'Дарите\nздоровье!',
  class: ''
})

const titleLines = computed(() => (props.title || '').split('\n'))
</script>

<template>
  <section :class="['w-full mt-0 rounded-2xl sm:rounded-4xl', props.class]" aria-label="Промо-баннер">
    <NuxtLink
      to="/bonusopad"
      class="relative block w-full overflow-hidden rounded-2xl sm:rounded-4xl"
    >

      <!-- Фон-картинка -->
      <picture class="absolute inset-0 z-0 rounded-2xl sm:rounded-4xl">
        <source media="(min-width: 768px)" :srcset="props.image" />
        <img
          :src="props.imageMobile"
          alt=""
          class="w-full h-full object-cover"
          aria-hidden="true"
        />
      </picture>

      <!-- Свет от лампочек: фаза 1 -->
<!-- Свет: фаза 1 (desktop/mobile) -->
<picture class="lights-overlay lights-1" aria-hidden="true">
  <source media="(min-width: 768px)" srcset="/images/new-year/light-shad.png" />
  <img
    src="/images/new-year/light-shad-mob.png"
    alt=""
    class="lights-img"
    loading="eager"
    decoding="async"
  />
</picture>

<!-- Свет: фаза 2 (desktop/mobile) -->
<picture class="lights-overlay lights-2" aria-hidden="true">
  <source media="(min-width: 768px)" srcset="/images/new-year/light-shad-2.png" />
  <img
    src="/images/new-year/light-shad-mob-2.png"
    alt=""
    class="lights-img"
    loading="eager"
    decoding="async"
  />
</picture>


      <!-- Снег (поверх фона) -->
      <!-- <div class="snow-layer pointer-events-none" aria-hidden="true">
        <div class="snow snow--1"></div>
        <div class="snow snow--2"></div>
        <div class="snow snow--3"></div>
      </div> -->

      <!-- Контент -->
      <div class="relative z-[3] flex items-end h-[420px] sm:h-[360px] lg:h-[500px] px-5 md:px-12 py-5 md:py-10 rounded-2xl sm:rounded-4xl">
        <!-- <h2 class="text-white font-semibold leading-[1] text-[clamp(2rem,12vw,4.6rem)]">
          <template v-for="(line, idx) in titleLines" :key="idx">
            <span>{{ line }}</span>
            <br v-if="idx < titleLines.length - 1" />
          </template>
        </h2> -->
      </div>
    </NuxtLink>
  </section>
</template>

<style scoped>
/* ===== СНЕГ ===== */

/* ===== СНЕГ (БЕЗ РЫВКОВ) ===== */

.snow-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
}

.snow {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  pointer-events: none;
}

/* Ближний слой */
.snow--1 {
  opacity: 0.85;
  background-size: 120px 120px;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.95) 2.8px, transparent 3px),
    radial-gradient(circle, rgba(255,255,255,0.75) 1.8px, transparent 2px),
    radial-gradient(circle, rgba(255,255,255,0.85) 3.6px, transparent 3.8px);
  animation: snow-fall-1 6s linear infinite;
}

/* Средний слой */
.snow--2 {
  opacity: 0.55;
  background-size: 220px 220px;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.7) 3px, transparent 3.2px),
    radial-gradient(circle, rgba(255,255,255,0.5) 2.4px, transparent 2.6px);
  animation: snow-fall-2 10s linear infinite;
}

/* Дальний слой */
.snow--3 {
  opacity: 0.35;
  background-size: 400px 400px;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.55) 3.6px, transparent 3.8px),
    radial-gradient(circle, rgba(255,255,255,0.35) 2.8px, transparent 3px);
  animation: snow-fall-3 16s linear infinite;
}

/* Бесшовные анимации */
@keyframes snow-fall-1 {
  from { background-position-y: 0; }
  to   { background-position-y: 120px; }
}

@keyframes snow-fall-2 {
  from { background-position-y: 0; }
  to   { background-position-y: 320px; }
}

@keyframes snow-fall-3 {
  from { background-position-y: 0; }
  to   { background-position-y: 600px; }
}

/* prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .snow--1,
  .snow--2,
  .snow--3 {
    animation: none;
  }
}

.lights-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;

  /* можно убрать, если не нравится эффект */
  mix-blend-mode: screen;

  opacity: 0;
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-timing-function: steps(1, end);
}

.lights-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Фаза 1: 0-1с ON, 1-2с OFF, дальше OFF */
.lights-1 { animation-name: lights1; }

/* Фаза 2: 2-3с ON, остальное OFF */
.lights-2 { animation-name: lights2; }

@keyframes lights1 {
  0%   { opacity: 1; }
  25%  { opacity: 1; }
  25.01% { opacity: 0; }
  100% { opacity: 0; }
}

@keyframes lights2 {
  0%   { opacity: 0; }
  50%  { opacity: 0; }
  50.01% { opacity: 1; }
  75%  { opacity: 1; }
  75.01% { opacity: 0; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .lights-overlay { animation: none; opacity: 0; }
}


</style>
