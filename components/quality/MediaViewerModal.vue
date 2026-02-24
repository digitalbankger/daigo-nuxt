<script setup lang="ts">
type DocType = 'pdf' | 'image' | 'video'
type DocItem = {
  id: string
  type: DocType
  title: string
  src: string
  thumb?: string
  year?: number
  tag?: string
}

const props = defineProps<{
  open: boolean
  item: DocItem | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const isYoutube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be')

const toYoutubeEmbed = (url: string) => {
  // простой конвертер
  const id =
    url.includes('youtu.be/')
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : new URL(url).searchParams.get('v')
  return id ? `https://www.youtube.com/embed/${id}` : url
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open && item" class="fixed inset-0 z-[300] flex items-center justify-center px-4 py-6">
      <button class="absolute inset-0 bg-black/50" @click="emit('close')" aria-label="Закрыть" />

      <div class="relative z-[301] w-full max-w-[1100px] bg-white rounded-2xl overflow-hidden shadow-xl">
        <div class="flex items-center justify-between px-4 md:px-6 py-4 border-b">
          <div class="font-medium text-base md:text-lg pr-4">{{ item.title }}</div>

          <div class="flex items-center gap-2">
            <a
              v-if="item.type === 'pdf' || item.type === 'image'"
              :href="item.src"
              target="_blank"
              class="text-sm underline text-black/70 hover:text-black"
            >
              Открыть в новой вкладке
            </a>

            <button
              class="w-10 h-10 rounded-full hover:bg-black/5 transition flex items-center justify-center"
              @click="emit('close')"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="max-h-[80vh] overflow-auto p-4 md:p-6">
          <!-- PDF -->
          <div v-if="item.type === 'pdf'" class="w-full">
            <iframe
              :src="item.src"
              class="w-full h-[70vh] rounded-xl border"
              loading="lazy"
            />
          </div>

          <!-- Image -->
          <div v-else-if="item.type === 'image'" class="w-full">
            <img
              :src="item.src"
              :alt="item.title"
              class="w-full h-auto object-contain rounded-xl"
              loading="lazy"
            />
          </div>

          <!-- Video -->
          <div v-else class="w-full">
            <iframe
              v-if="isYoutube(item.src)"
              :src="toYoutubeEmbed(item.src)"
              class="w-full aspect-video rounded-xl border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            />
            <video v-else controls class="w-full rounded-xl">
              <source :src="item.src" />
            </video>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>