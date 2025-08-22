import { defineStore } from 'pinia'

export const useModalStore = defineStore('modalStore', {
  state: () => ({
    isOpen: false,
    title: '',
    message: '',
    icon: null as any,
  }),
  actions: {
    show({ title, message, icon = null }: { title: string; message: string; icon?: any }) {
      this.title = title
      this.message = message
      this.icon = icon
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
  },
})
