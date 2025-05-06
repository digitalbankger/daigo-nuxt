export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
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
      title: 'Твой сайт',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Описание сайта' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    }
  },

  css: [
    '@/assets/styles/fonts.css',
    '@/assets/styles/main.css',
  ],

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
