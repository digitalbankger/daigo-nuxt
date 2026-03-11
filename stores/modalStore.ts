import { defineStore } from 'pinia'
import { ref } from 'vue'

type ModalHandler = null | (() => void | Promise<void>)

type ShowModalPayload = {
  title: string
  message: string
  icon?: any
  buttonText?: string
  onConfirm?: ModalHandler
}

export const useModalStore = defineStore('modalStore', () => {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const icon = ref<any>(null)
  const buttonText = ref('Закрыть')
  const onConfirm = ref<ModalHandler>(null)
  const isProcessing = ref(false)

  function show({ title: nextTitle, message: nextMessage, icon: nextIcon = null, buttonText: nextButtonText = 'Закрыть', onConfirm: nextOnConfirm = null }: ShowModalPayload) {
    title.value = nextTitle
    message.value = nextMessage
    icon.value = nextIcon
    buttonText.value = nextButtonText
    onConfirm.value = nextOnConfirm
    isProcessing.value = false
    isOpen.value = true
  }

  async function confirm() {
    if (!onConfirm.value) {
      close()
      return
    }

    isProcessing.value = true
    try {
      await onConfirm.value()
    } finally {
      isProcessing.value = false
    }
  }

  function close() {
    isOpen.value = false
    title.value = ''
    message.value = ''
    icon.value = null
    buttonText.value = 'Закрыть'
    onConfirm.value = null
    isProcessing.value = false
  }

  return {
    isOpen,
    title,
    message,
    icon,
    buttonText,
    isProcessing,
    show,
    confirm,
    close,
  }
})
