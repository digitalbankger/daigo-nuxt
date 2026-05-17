<script setup lang="ts">
import InlineVideoPlayer from '~/components/ui/InlineVideoPlayer.vue'

interface UsageStep { icon?: string; text: string }
interface UsageGroup { title: string; steps: UsageStep[] }
interface UsageCombo { title: string; groups: UsageGroup[] }

interface ProductUsageInstruction {
  comboTitle?: string
  groups?: UsageGroup[]

  comboTitle2?: string
  groups2?: UsageGroup[]

  combos?: UsageCombo[]

  text?: string
  image?: string
  videoUrl?: string
  videoPoster?: string
  footnote?: string
}

// 👇 делаем data необязательным и допускаем null
const props = defineProps<{
  data?: ProductUsageInstruction | null
}>()


/** Кол-во колонок с учётом наличия картинки */
const gridCols = (len = 0, hasImage = false) => {
  if (len <= 1) return 'sm:grid-cols-1 lg:grid-cols-1'
  if (len === 2) return 'sm:grid-cols-2 lg:grid-cols-2'
  return hasImage ? 'sm:grid-cols-2 lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
}
</script>

<template>
  <!-- 👇 защита от undefined/null -->
  <section v-if="data" class="space-y-8">
    <!-- Заголовок -->
    <h2 class="text-product leading-tight font-medium">
      Инструкция <br class="block sm:hidden" /> по применению
    </h2>

    <div class="flex flex-col sm:flex-row gap-6 items-start">
      <!-- Картинка -->
      <div
        v-if="data.image"
        class="w-full sm:w-[40%] bg-hoverbtn rounded-3xl overflow-hidden"
      >
        <img
          :src="data.image"
          alt="Инструкция"
          class="w-full h-auto object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="w-full" :class="{ 'sm:w-[60%]': data.image }">
        <!-- Блок 1 -->
        <div v-if="data.comboTitle || data.groups?.length">
          <h3
            v-if="data.comboTitle"
            class="text-2xl sm:text-4xl font-medium leading-tight mb-8 mt-4"
          >
            {{ data.comboTitle }}
          </h3>

          <div
            v-if="data.groups?.length"
            class="grid grid-cols-1 gap-8"
            :class="gridCols(data.groups.length, !!data.image)"
          >
            <div
              v-for="group in data.groups"
              :key="group.title"
              class="space-y-2"
            >
              <h4 class="font-medium text-xl xl:text-cardhead mb-5">
                {{ group.title }}
              </h4>
              <ul class="space-y-3">
                <li
                  v-for="(step, i) in group.steps"
                  :key="i"
                  class="flex items-start gap-2 text-sm xl:text-lg"
                >
                  <img
                    v-if="step.icon"
                    :src="step.icon"
                    alt=""
                    class="w-5 sm:w-6 h-5 sm:h-6"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{{ step.text }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Отступ -->
        <div
          v-if="(data.comboTitle && data.comboTitle2) || (data.groups?.length && data.groups2?.length)"
          class="h-6 sm:h-8"
        />

        <!-- Блок 2 -->
        <div v-if="data.comboTitle2 || data.groups2?.length">
          <h3
            v-if="data.comboTitle2"
            class="text-2xl sm:text-4xl font-medium leading-tight mb-8 mt-4"
          >
            {{ data.comboTitle2 }}
          </h3>

          <div
            v-if="data.groups2?.length"
            class="grid grid-cols-1 gap-8"
            :class="gridCols(data.groups2.length, !!data.image)"
          >
            <div
              v-for="group in data.groups2"
              :key="group.title"
              class="space-y-2"
            >
              <h4 class="font-medium text-xl xl:text-cardhead mb-5">
                {{ group.title }}
              </h4>
              <ul class="space-y-3">
                <li
                  v-for="(step, i) in group.steps"
                  :key="i"
                  class="flex items-start gap-2 text-sm xl:text-lg"
                >
                  <img
                    v-if="step.icon"
                    :src="step.icon"
                    alt=""
                    class="w-5 sm:w-6 h-5 sm:h-6"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{{ step.text }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- combos -->
        <div v-if="data.combos?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(combo, cIdx) in data.combos"
            :key="combo.title + '-' + cIdx"
            class="space-y-4"
            :class="(combo.groups?.length || 0) > 1 ? 'sm:col-span-2 lg:col-span-3' : ''"
          >
            <h3 class="text-2xl sm:text-4xl font-medium leading-tight mb-8 mt-4">
              {{ combo.title }}
            </h3>

            <div
              class="grid grid-cols-1 gap-8"
              :class="gridCols(combo.groups?.length || 0)"
            >
              <div
                v-for="group in combo.groups"
                :key="group.title"
                class="space-y-2"
              >
                <h4 class="font-medium text-xl xl:text-cardhead mb-5">
                  {{ group.title }}
                </h4>
                <ul class="space-y-3">
                  <li
                    v-for="(step, i) in group.steps"
                    :key="i"
                    class="flex items-start gap-2 text-sm xl:text-lg"
                  >
                    <img
                      v-if="step.icon"
                      :src="step.icon"
                      alt=""
                      class="w-5 sm:w-6 h-5 sm:h-6"
                      loading="lazy"
                      decoding="async"
                    />
                    <span>{{ step.text }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Чисто текстовый формат -->
        <div
          v-if="!data.groups?.length && !data.groups2?.length && !data.combos?.length && data.text"
          class="prose max-w-none text-lg leading-tight mt-6"
          v-html="data.text"
        />

        <!-- Подвал -->
        <p v-if="data.footnote" class="mt-8 text-lg text-black/50 whitespace-pre-line">
          {{ data.footnote }}
        </p>
      </div>
    </div>

    <!-- Видео-блок -->
    <div v-if="data.videoUrl" class="mt-6">
      <h3 class="text-xl sm:text-3xl lg:text-product leading-tight font-medium mb-4 sm:mb-8 sm:mt-6">
        Видео инструкция <br class="block sm:hidden" />по применению
      </h3>

      <InlineVideoPlayer
        :src="data.videoUrl"
        :poster="data.videoPoster || '/images/default-video.jpg'"
        title="Видео инструкция по применению"
        class="w-full h-[210px] sm:h-[350px] lg:h-[610px] aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-hoverbtn"
      />
    </div>
  </section>
</template>
