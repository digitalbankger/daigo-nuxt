export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    dadataToken: process.env.NUXT_DADATA_TOKEN,
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },

  nitro: {
    devErrorHandler: true,
    logLevel: 5,
  },

  app: {
    head: {
      title: 'Официальный сайт Daigo (Дайго) в России и СНГ',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Купить Daigo (Daigo) с бесплатной доставкой у официальныго дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },

  css: [
    '@/assets/styles/fonts.css',
    '@/assets/styles/main.css',
  ],

  plugins: ['~/plugins/directives.ts'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/device',
    '@nuxt/image',
    '@vueuse/nuxt',
  ],

  image: {
    provider: 'ipx',
    ipx: {
    },
    
    presets: {
      product: {
        modifiers: {
          format: 'webp',
          width: 600,
          quality: 75,
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
