import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isHeadInformerVisible = ref(true)

  function closeHeadInformer() {
    isHeadInformerVisible.value = false
  }

  function openHeadInformer() {
    isHeadInformerVisible.value = true
  }

  return { isHeadInformerVisible, closeHeadInformer, openHeadInformer }
})

