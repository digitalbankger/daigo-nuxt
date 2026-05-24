import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // по умолчанию информер виден
  const isHeadInformerVisible = ref(true)

  // просто меняем значение в памяти
  function closeHeadInformer() {
    isHeadInformerVisible.value = false
  }

  function openHeadInformer() {
    isHeadInformerVisible.value = true
  }

  return { isHeadInformerVisible, closeHeadInformer, openHeadInformer }
})



// import { defineStore } from 'pinia'
// import { ref } from 'vue'

// export const useUiStore = defineStore('ui', () => {
//   const isHeadInformerVisible = ref(true)

//   // Гидратация из localStorage (только на клиенте)
//   function initUi() {
//     if (process.client) {
//       const saved = localStorage.getItem('ui.headInformerVisible')
//       if (saved !== null) {
//         isHeadInformerVisible.value = saved === '1'
//       }
//     }
//   }

//   function closeHeadInformer() {
//     isHeadInformerVisible.value = false
//     if (process.client) {
//       localStorage.setItem('ui.headInformerVisible', '0')
//     }
//   }

//   function openHeadInformer() {
//     isHeadInformerVisible.value = true
//     if (process.client) {
//       localStorage.setItem('ui.headInformerVisible', '1')
//     }
//   }

//   return { isHeadInformerVisible, initUi, closeHeadInformer, openHeadInformer }
// })
