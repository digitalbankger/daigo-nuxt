<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  number: string
  src?: string
}>()

</script>

<template>
  <div class="ticket relative inline-block select-none">
    <!-- сам билет -->
    <img src="/images/new-year/tick.svg" alt="" class="ticket__img block" loading="lazy" />

    <!-- номер внутри -->
    <span class="ticket__text font-mont uppercase my-auto font-normal md:font-medium text-transparent bg-clip-text" style="background-image: radial-gradient(circle, #FFED68, #FFB830);">
      {{ number }}
    </span>
  </div>
</template>

<style scoped>
.ticket {
  /* управляет общим размером билета */
  width: 140px;
  max-width: 45vw;
}

.ticket__img {
  width: 100%;
  height: auto;
  display: block;
}

/* позиционирование номера внутри билета */
.ticket__text {
  position: absolute;
  left: 50%;
  top: 56%;            /* подстрой под твой SVG */
  transform: translate(-50%, -50%);

  font-size: 13px;     /* подстрой */
  letter-spacing: 1.5px;

}
</style>
