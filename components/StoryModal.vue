<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/pagination'

const props = defineProps<{
  slides: string[]
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
    <div class="bg-white w-full max-w-3xl h-[80vh] relative">
      <button @click="emit('close')" class="absolute top-4 right-4 text-white z-10">✕</button>
      <Swiper :loop="false" :pagination="true" class="w-full h-full">
        <SwiperSlide v-for="(slide, index) in props.slides" :key="index">
          <img :src="slide" class="w-full h-full object-contain" />
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>
