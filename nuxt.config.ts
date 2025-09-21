export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    dadataToken: process.env.NUXT_DADATA_TOKEN,
    public: {
      apiBase: process.env.API_BASE || '/api',
      daigoApiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.daigo.ru',
      testApiBase: process.env.NUXT_PUBLIC_TEST_API_BASE || 'https://nuxt.daigo.ru'
    }
  },

  routeRules: {
    // Главная: ISR каждые 10 минут
    '/': { isr: 600 },

    // Долгий кэш статики Nuxt
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },

    // IPX-трансформации (для @nuxt/image) — кэш для CDN + SWR
    '/_ipx/**': {
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
      }
    },

    // Пример серверного API с кэш-заголовками (под ISR)
    '/api/home': {
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
      }
    }
  },

  nitro: {
    devErrorHandler: true,
    logLevel: 5,
    storage: {
      // Кэш Nitro (для cachedEventHandler/cachedFunction)
      cache: process.env.REDIS_URL
        ? { driver: 'redis', url: process.env.REDIS_URL, base: 'cache' }
        : { driver: 'fs', base: './.nitro/cache' },

      // Кэш IPX (@nuxt/image)
      'ipx:cache': process.env.IPX_CACHE_DRIVER === 'redis' && process.env.REDIS_URL
        ? { driver: 'redis', url: process.env.REDIS_URL, base: 'ipx' }
        : { driver: 'fs', base: './.nitro/ipx' }
    }
  },

  app: {
    head: {
      title: 'Официальный сайт Daigo (Дайго) в России и СНГ',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content:
            'Купить Daigo (Daigo) с бесплатной доставкой у официальныго дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  css: ['@/assets/styles/fonts.css', '@/assets/styles/main.css'],

  plugins: ['~/plugins/directives.ts', '~/plugins/auth-init.client.ts'],

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/device', '@nuxt/image', '@vueuse/nuxt'],

  image: {
    provider: 'static',
    // Добавлены все возможные источники, чтобы IPX не отбрасывал редиректнувшиеся картинки
    domains: ['nuxt.daigo.ru', 'api.daigo.ru', 'daigo.ru'],
    ipx: {
      // при необходимости можно включить TTL: maxAge: 60 * 60 * 24
    },
    presets: {
      product: {
        modifiers: {
          format: 'webp',
          width: 600,
          quality: 75
        }
      }
    }
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  typescript: {
    strict: true
  }
})
