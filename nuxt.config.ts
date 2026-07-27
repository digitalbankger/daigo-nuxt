const parsePublicJsonRecord = (value?: string): Record<string, string> => {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

const roistatProjectId = process.env.NUXT_PUBLIC_ROISTAT_PROJECT_ID || '8d6f3bc978e0a498604ac6d0377f7a8b'
const roistatHost = process.env.NUXT_PUBLIC_ROISTAT_HOST || 'cloud.roistat.com'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    dadataToken: process.env.NUXT_DADATA_TOKEN || 'ac0fc720467713631eff0602ba19a2648c34f21d',
    B24_WEBHOOK_BASE: process.env.B24_WEBHOOK_BASE,
    public: {
      apiBase: process.env.API_BASE || '/api',
      daigoApiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://tg.daigo.ru',
      testApiBase: process.env.NUXT_PUBLIC_TEST_API_BASE || 'https://daigo.ru',
      // Все маркетинговые идентификаторы держим здесь.
      // При необходимости маркетолог может дать новые значения для .env:
      // NUXT_PUBLIC_YM_ID, NUXT_PUBLIC_CLARITY_ID, NUXT_PUBLIC_ROISTAT_PROJECT_ID,
      // NUXT_PUBLIC_ROISTAT_HOST, NUXT_PUBLIC_ROISTAT_EVENT_PREFIX,
      // NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP={"metrika_goal":"roistat_event_id"}
      ymCounterId: process.env.NUXT_PUBLIC_YM_ID || '31773751',
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_ID || 'xbgiz9fpnd',
      roistatProjectId,
      roistatHost,
      roistatEventPrefix: process.env.NUXT_PUBLIC_ROISTAT_EVENT_PREFIX || '',
      roistatEventIdMap: parsePublicJsonRecord(process.env.NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP),
      roistatBridgeYmGoals: process.env.NUXT_PUBLIC_ROISTAT_BRIDGE_YM_GOALS !== 'false',
      roistatBridgeDataLayerEvents: process.env.NUXT_PUBLIC_ROISTAT_BRIDGE_DATALAYER_EVENTS !== 'false',
      yandexMapsApiKey: process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY || '6740c47c-f45a-4ec8-8a1e-4d219917b4fc',
    }
  },

  routeRules: {
    // Главная: ISR каждые 10 минут
    '/': { isr: 600 },

    // Долгий кэш статики Nuxt
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
        'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600'
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
            'Купить Daigo (Daigo) с бесплатной доставкой у официального дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.'
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
      ],
      script: [
        {
        innerHTML: `
(function(w, d, s, h, id) {
    w.roistatProjectId = id;
    w.roistatHost = h;
    w.roistatPage = d.location.href;
    w.roistatReferrer = d.referrer;
    var p = d.location.protocol == "https:" ? "https://" : "http://";
    var u = /^.*roistat_visit=[^;]+(.*)?$/.test(d.cookie)
      ? "/dist/module.js"
      : "/api/site/1.0/"+id+"/init?referrer="+encodeURIComponent(d.location.href);
    var js = d.createElement(s);
    js.charset="UTF-8";
    js.async = 1;
    js.src = p+h+u;
    var js2 = d.getElementsByTagName(s)[0];
    js2.parentNode.insertBefore(js, js2);
})(window, document, 'script', '${roistatHost}', '${roistatProjectId}');
        `,
        tagPosition: 'head'
        },
      ]
    }
  },

  css: [
    '@/assets/styles/fonts.css',
    '@/assets/styles/main.css'
  ],

  plugins: ['~/plugins/directives.ts', '~/plugins/auth-init.client.ts', '~/plugins/bitrix-tracker.client.ts', '~/plugins/ytm.client.ts', '~/plugins/roistat-events.client.ts', '~/plugins/ytm-route.client.ts', '~/plugins/mango.client.ts', '~/plugins/utm-tracker.client.ts', '~/plugins/api.client.ts' ],

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/device', '@nuxt/image', '@vueuse/nuxt'],

  image: {
    provider: 'ipx',
    // Добавлены все возможные источники, чтобы IPX не отбрасывал редиректнувшиеся картинки
    domains: ['daigo.ru', 'tg.daigo.ru', 's3.firstvds.ru', 'products.s3.firstvds.ru'],
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
