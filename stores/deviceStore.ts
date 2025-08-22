import { defineStore } from 'pinia'

export const useDeviceStore = defineStore('device', {
  state: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIos: false,
    isAndroid: false,
    userAgent: ''
  }),
  actions: {
    setDevice(device: any) {
      this.isMobile = device.isMobile
      this.isTablet = device.isTablet
      this.isDesktop = device.isDesktop
      this.isIos = device.isIos
      this.isAndroid = device.isAndroid
      this.userAgent = device.userAgent
    }
  }
})
