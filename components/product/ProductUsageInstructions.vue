<template>
  <section class="space-y-8">
    <!-- Заголовок -->
    <h2 class="text-product leading-tight font-medium">Инструкция <br class="block sm:hidden" /> по применению</h2>

    <!-- Содержимое -->
    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <!-- Картинка (если есть) -->
      <div
        v-if="data.image"
        class="w-full sm:w-[40%] bg-hoverbtn rounded-3xl overflow-hidden"
      >
        <img :src="data.image" alt="Инструкция" class="w-full h-auto object-cover" />
      </div>

      <!-- Текстовые блоки -->
      <div class="w-full" :class="{ 'sm:w-[60%]': data.image }">
        <!-- Формат с группами -->
        <div v-if="data.groups" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="group in data.groups"
            :key="group.title"
            class="space-y-2"
          >
            <h3 class="font-medium text-xl xl:text-cardhead mb-5">{{ group.title }}</h3>
            <ul class="space-y-3">
              <li
                v-for="(step, i) in group.steps"
                :key="i"
                class="flex items-start gap-2 text-sm xl:text-lg"
              >
                <img v-if="step.icon" :src="step.icon" alt="" class="w-5 sm:w-6 h-5 sm:h-6" />
                <span>{{ step.text }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Формат с обычным текстом -->
        <div
          v-else-if="data.text"
          class="prose max-w-none text-lg leading-relaxed"
          v-html="data.text"
        />

        <!-- Подвал -->
        <p v-if="data.footnote" class="mt-8 text-lg text-black/50 whitespace-pre-line">
          {{ data.footnote }}
        </p>
      </div>
    </div>

    <!-- Видео -->
    <div v-if="data.videoUrl" class="mt-6">
      <h3 class="text-xl sm:text-3xl lg:text-product leading-tight font-medium mb-4 sm:mb-8 sm:mt-6">Видео инструкция <br class="block sm:hidden" />по применению</h3>
      <div
        class="relative w-full h-[210px] sm:h-[350px] lg:h-[610px] aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-hoverbtn cursor-pointer"
        @click="showVideo = true"
      >
        <img
          :src="data.videoPoster || '/images/default-video.jpg'"
          alt="Видео постер"
          class="w-full h-full object-cover"
        />
        <!-- <div class="absolute inset-0 flex items-center justify-center">
          <div class="bg-white bg-opacity-80 rounded-full p-4 shadow">
            <img src="/icons/play.svg" class="w-10 h-10" />
          </div>
        </div> -->
      </div>

      <div class="mt-8 space-y-4 text-sm sm:text-2xl" v-html="data.text" ></div>

      <MediaModal
        :show="showVideo"
        type="video"
        :src="data.videoUrl"
        :onClose="() => (showVideo = false)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import MediaModal from '~/components/reviews/MediaModal.vue'
import { ref } from 'vue'

interface UsageStep {
  icon?: string
  text: string
}

interface UsageGroup {
  title: string
  steps: UsageStep[]
}

interface ProductUsageInstruction {
  text?: string
  groups?: UsageGroup[]
  image?: string
  videoUrl?: string
  videoPoster?: string
  footnote?: string
}

defineProps<{
  data: ProductUsageInstruction
}>()

const showVideo = ref(false)
</script>
