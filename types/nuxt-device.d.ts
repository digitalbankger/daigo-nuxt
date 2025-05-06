export {}

declare module '#app' {
  interface NuxtApp {
    $device: {
      isMobile: boolean
      isDesktop: boolean
      isTablet: boolean
      isWindows: boolean
      isMacOS: boolean
      isAndroid: boolean
      isIos: boolean
      isFirefox: boolean
      isChrome: boolean
      isEdge: boolean
      isSafari: boolean
      userAgent?: string
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $device: NuxtApp['$device']
  }
}
