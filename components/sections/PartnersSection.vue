<template>
  <section class="relative w-full">
    <h2 class="text-slider font-medium mb-2 sm:mb-4">Наши партнёры</h2>
    <div class="">
      <PartnersSlider
      />
    </div>

    <div class="hidden sm:block w-full py-12">
      <!-- Картинка с ограничением высоты -->
      <div
        class="overflow-hidden transition-all duration-500"
        :class="expanded ? 'max-h-[1000px]' : 'max-h-[100px]'"
      >
        <img
          src="https://daigo.ru/images/partners/partners-all.webp"
          alt="Наши партнёры"
          format="webp"
          loading="lazy"
          class="w-full object-contain"
        />
      </div>

      <!-- Кнопка переключения -->
      <div class="w-full flex justify-center">
        <Button
          @click="expanded = !expanded"
          class="!w-72 mt-6"
        >
          {{ expanded ? 'Скрыть' : 'Посмотреть все' }}
        </Button>
      </div>     

    </div>

    <div class="block sm:hidden w-full pt-12 pb-2">
      <img
        src="/images/partners-mob.png"
        alt="Наши партнёры"
        class="w-full object-contain"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import PartnersSlider from '~/components/sections/PartnersSlider.vue'
import Button from '../ui/Button.vue';

const expanded = ref(false)

</script>
