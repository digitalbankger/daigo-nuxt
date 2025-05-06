import type { Pinia } from 'pinia'
import { useDeviceStore } from '~/store/deviceStore'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = nuxtApp.$pinia as Pinia
  const deviceStore = useDeviceStore(pinia)

  if (nuxtApp.$device) {
    deviceStore.setDevice(nuxtApp.$device)
  }
})
