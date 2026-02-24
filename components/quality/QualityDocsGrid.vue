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

defineProps<{ items: DocItem[] }>()
defineEmits<{ (e: 'open', item: DocItem): void }>()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
    <button
      v-for="doc in items"
      :key="doc.id"
      type="button"
      class="group rounded-2xl border border-black/10 bg-white p-3 sm:p-4 text-left hover:border-black/20 hover:shadow-sm transition"
      @click="$emit('open', doc)"
    >
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
          <span v-if="doc.type === 'pdf'" class="text-xs font-medium">PDF</span>
          <span v-else-if="doc.type === 'image'" class="text-xs font-medium">IMG</span>
          <span v-else class="text-xs font-medium">VID</span>
        </div>

        <div class="opacity-60 group-hover:opacity-100 transition">⋯</div>
      </div>

      <div class="text-xs sm:text-sm font-medium leading-snug line-clamp-2">
        {{ doc.title }}
      </div>

      <div v-if="doc.tag" class="mt-2 inline-flex text-[11px] px-2 py-1 rounded-full bg-[#d1c7a9] text-white">
        {{ doc.tag }}
      </div>
    </button>
  </div>
</template>