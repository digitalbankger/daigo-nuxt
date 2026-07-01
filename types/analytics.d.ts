export {}

declare global {
  interface Window {
    ym?: (...args: any[]) => void
    clarity?: (...args: any[]) => void
    dataLayer: any[]
    __daigoSendRoistatEvent?: (eventName: string, payload?: Record<string, any>, source?: string) => void
    roistat?: {
      event?: {
        send?: (id: string, data?: Record<string, any>) => void
      }
    }
  }
}
