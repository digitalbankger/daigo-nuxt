export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    dadataToken: process.env.NUXT_DADATA_TOKEN || 'ac0fc720467713631eff0602ba19a2648c34f21d',
    B24_WEBHOOK_BASE: process.env.B24_WEBHOOK_BASE,
    ipx: {
      baseURL: process.env.NUXT_IPX_BASE_URL || '/_ipx',
      http: {
        domains: [
          'daigo.ru',
          'api.daigo.ru',
          'products.s3.firstvds.ru',
        ],
      },
    },
    public: {
      apiBase: process.env.API_BASE || '/api',
      daigoApiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.daigo.ru',
      daigoFilesBase:
        process.env.NUXT_PUBLIC_FILES_BASE ||
        process.env.NUXT_PUBLIC_API_BASE ||
        'https://api.daigo.ru',
      testApiBase: process.env.NUXT_PUBLIC_TEST_API_BASE || 'https://daigo.ru',
      ymCounterId: process.env.NUXT_PUBLIC_YM_ID || '31773751',
    }
  },

  routeRules: {
    '/': { isr: 600 },

    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },

    '/_ipx/**': {
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800'
      }
    },

    '/api/home': {
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
      }
    },

    '/api/shop/products': {
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
      }
    }
  },

  nitro: {
    devErrorHandler: true,
    logLevel: 5,
    storage: {
      cache: process.env.REDIS_URL
        ? { driver: 'redis', url: process.env.REDIS_URL, base: 'cache' }
        : { driver: 'fs', base: './.nitro/cache' },

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
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700;800;900&display=swap'
        }
      ]
    }
  },

  css: ['@/assets/styles/fonts.css', '@/assets/styles/main.css' ],

  plugins: ['~/plugins/directives.ts', '~/plugins/auth-init.client.ts', '~/plugins/bitrix-tracker.client.ts', '~/plugins/ytm-route.client.ts', '~/plugins/mango.client.ts', '~/plugins/utm-tracker.client.ts', '~/plugins/api.client.ts', '~/plugins/ytm.client.ts' ],

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/device', '@nuxt/image', '@vueuse/nuxt'],

  image: {
    provider: 'ipx',
    inject: true,
    format: ['avif', 'webp'],
    quality: 72,
    domains: ['daigo.ru', 'products.s3.firstvds.ru', 'api.daigo.ru'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    },
    ipx: {},
    presets: {
      product: {
        modifiers: {
          format: 'webp',
          width: 600,
          quality: 75
        }
      },
      catalogCard: {
        modifiers: {
          width: 560,
          height: 560,
          fit: 'inside',
          quality: 72
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
