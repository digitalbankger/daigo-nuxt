export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },
  image: {
    domains: ['api.daigo.ru'],
  },
  runtimeConfig: {
    dadataToken: process.env.NUXT_DADATA_TOKEN,
    public: {
      apiBase: process.env.API_BASE || '/api',
      daigoApiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.daigo.ru',
      testApiBase: process.env.NUXT_PUBLIC_TEST_API_BASE || 'https://nuxt.daigo.ru',
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

  plugins: [
    '~/plugins/directives.ts',
    '~/plugins/auth-init.client.ts',
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
