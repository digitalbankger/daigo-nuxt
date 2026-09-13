import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CATALOG_SEO_ROUTE_PATTERN } from "./constants/catalogSeoFilters";

const parsePublicJsonRecord = (value?: string): Record<string, string> => {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
};

const roistatProjectId =
  process.env.NUXT_PUBLIC_ROISTAT_PROJECT_ID ||
  "8d6f3bc978e0a498604ac6d0377f7a8b";
const roistatHost = process.env.NUXT_PUBLIC_ROISTAT_HOST || "cloud.roistat.com";

const articlesContentDir = fileURLToPath(
  new URL("./content/articles-json", import.meta.url),
);

const articlePrerenderRoutes = readdirSync(articlesContentDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => `/articles/${entry.name.replace(/\.json$/, "")}`)
  .sort();

const ARTICLE_LIST_PAGE_SIZE = 15;
const articlePaginationPrerenderRoutes = Array.from(
  { length: Math.max(0, Math.ceil(articlePrerenderRoutes.length / ARTICLE_LIST_PAGE_SIZE) - 1) },
  (_, index) => `/articles/page${index + 2}`,
);

// Новые SEO URL используют те же реальные page-компоненты, что и базовые страницы.
// Не оборачиваем pages/*.vue в промежуточные компоненты: layout/meta должны быть
// известны роутеру до первого render, иначе при текущей app/layout архитектуре
// NuxtLayout может отдать пустую страницу.
const catalogIndexPage = fileURLToPath(
  new URL("./pages/catalog/index.vue", import.meta.url),
);
const articlesIndexPage = fileURLToPath(
  new URL("./pages/articles/index.vue", import.meta.url),
);

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  ssr: true,
  devtools: { enabled: process.env.NODE_ENV !== "production" },

  hooks: {
    "pages:extend"(pages) {
      // SEO-фильтры каталога имеют ровно один SEO-сегмент после /catalog.
      // Route приоритетнее обычной карточки /catalog/[slug], но regex не перехватывает товары.
      pages.unshift({
        name: "catalog-seo-filter",
        path: `/catalog/:filters(${CATALOG_SEO_ROUTE_PATTERN})`,
        file: catalogIndexPage,
        meta: { layout: "main", hideGlobalBreadcrumbs: true },
      });

      // /articles/page2, /articles/page3 ... приоритетнее /articles/[slug].
      pages.unshift({
        name: "articles-pagination",
        path: "/articles/page:page(\\d+)",
        file: articlesIndexPage,
        meta: { layout: "main" },
      });
    },
  },

  runtimeConfig: {
    dadataToken:
      process.env.NUXT_DADATA_TOKEN ||
      "ac0fc720467713631eff0602ba19a2648c34f21d",
    B24_WEBHOOK_BASE: process.env.B24_WEBHOOK_BASE,

    // Единый server-side snapshot каталога. По умолчанию живёт 15 минут;
    // после TTL stale snapshot отдаётся сразу, а обновление идёт в фоне.
    // 0 = без автоматического истечения, только ручной refresh/clear.
    catalogSnapshotTtlSeconds: Number(
      process.env.CATALOG_SNAPSHOT_TTL_SECONDS || 900,
    ),
    // Необязательный ключ только для удалённого refresh/clear cache endpoint.
    // Прямой curl на 127.0.0.1 к Nitro может обновлять cache без ключа.
    catalogCacheResetKey: process.env.CATALOG_CACHE_RESET_KEY || "",

    public: {
      apiBase: process.env.API_BASE || "/api",
      daigoApiBase: process.env.NUXT_PUBLIC_API_BASE || "https://api.daigo.ru",
      daigoFilesBase:
        process.env.NUXT_PUBLIC_FILES_BASE ||
        process.env.NUXT_PUBLIC_API_BASE ||
        "https://api.daigo.ru",
      testApiBase: process.env.NUXT_PUBLIC_TEST_API_BASE || "https://daigo.ru",
      // Все маркетинговые идентификаторы держим здесь.
      // При необходимости маркетолог может дать новые значения для .env:
      // NUXT_PUBLIC_YM_ID, NUXT_PUBLIC_CLARITY_ID, NUXT_PUBLIC_ROISTAT_PROJECT_ID,
      // NUXT_PUBLIC_ROISTAT_HOST, NUXT_PUBLIC_ROISTAT_EVENT_PREFIX,
      // NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP={"metrika_goal":"roistat_event_id"}
      ymCounterId: process.env.NUXT_PUBLIC_YM_ID || "31773751",
      clarityProjectId: process.env.NUXT_PUBLIC_CLARITY_ID || "xbgiz9fpnd",
      roistatProjectId,
      roistatHost,
      roistatEventPrefix: process.env.NUXT_PUBLIC_ROISTAT_EVENT_PREFIX || "",
      roistatEventIdMap: parsePublicJsonRecord(
        process.env.NUXT_PUBLIC_ROISTAT_EVENT_ID_MAP,
      ),
      roistatBridgeYmGoals:
        process.env.NUXT_PUBLIC_ROISTAT_BRIDGE_YM_GOALS !== "false",
      roistatBridgeDataLayerEvents:
        process.env.NUXT_PUBLIC_ROISTAT_BRIDGE_DATALAYER_EVENTS !== "false",
      yandexMapsApiKey:
        process.env.NUXT_PUBLIC_YANDEX_MAPS_API_KEY ||
        "6740c47c-f45a-4ec8-8a1e-4d219917b4fc",
    },
  },

  routeRules: {
    "/": { isr: 600 },

    // Изолированная тестовая карточка 5 мл: не должна попадать в индекс.
    "/catalog/5ml-test": {
      headers: { "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet" },
    },
    "/__isolated/5ml-test/**": {
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
        "cache-control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://daigoworld.com https://img.youtube.com; media-src 'self' https://daigoworld.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self'; frame-src https://www.youtube-nocookie.com; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'",
      },
    },

    // Статьи собираются заранее в отдельные HTML + Nuxt payload.
    // HTML остаётся быстро обновляемым после деплоя, а не живёт в браузерном кеше неделями.
    "/articles": {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      },
    },
    "/articles/**": {
      headers: {
        "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
      },
    },

    // Долгий кэш статики Nuxt
    "/_nuxt/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
    "/images/**": {
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },

    "/_ipx/**": {
      headers: {
        "cache-control":
          "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      },
    },

    "/api/home": {
      headers: {
        "cache-control":
          "public, max-age=0, s-maxage=600, stale-while-revalidate=86400",
      },
    },

    // Каталог кэшируется внутри Nitro snapshot/storage. Отдельный HTTP s-maxage
    // здесь не нужен: иначе ручной refresh snapshot мог бы ещё несколько минут
    // отдавать старую API-страницу из промежуточного shared cache.
    "/api/shop/products": {
      headers: { "cache-control": "private, max-age=0, must-revalidate" },
    },
    "/api/shop/catalog-counts": {
      headers: { "cache-control": "private, max-age=0, must-revalidate" },
    },
    "/api/shop/catalog-cache": {
      headers: { "cache-control": "no-store" },
    },
  },

  nitro: {
    devErrorHandler: true,
    logLevel: 5,
    prerender: {
      // /articles + каждый JSON из content/articles-json превращаются в статический HTML
      // во время pnpm build. Новый JSON автоматически попадёт в следующий деплой.
      routes: [...articlePaginationPrerenderRoutes, ...articlePrerenderRoutes],
      crawlLinks: false,
      failOnError: true,
    },
    // Локальные JSON-статьи включаются в production-сборку Nitro.
    // Благодаря этому страницы /articles не зависят от Go API и от cwd процесса PM2.
    serverAssets: [
      {
        baseName: "articles",
        dir: articlesContentDir,
      },
    ],
    storage: {
      // Кэш Nitro (для cachedEventHandler/cachedFunction)
      cache: process.env.REDIS_URL
        ? { driver: "redis", url: process.env.REDIS_URL, base: "cache" }
        : { driver: "fs", base: "./.nitro/cache" },

      // Кэш IPX (@nuxt/image)
      "ipx:cache":
        process.env.IPX_CACHE_DRIVER === "redis" && process.env.REDIS_URL
          ? { driver: "redis", url: process.env.REDIS_URL, base: "ipx" }
          : { driver: "fs", base: "./.nitro/ipx" },
    },
  },

  app: {
    head: {
      title: "Официальный сайт Daigo (Дайго) в России и СНГ",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content:
            "Купить Daigo (Daigo) с бесплатной доставкой у официального дистрибьютора в РФ и СНГ. Программа лояльности. Консультация экспертов.",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        // Каталог и основной layout больше не зависят от Google Fonts.
        // Montserrat подключается точечно только там, где он действительно нужен.
        { rel: "preconnect", href: "https://api.daigo.ru", crossorigin: "anonymous" },
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
          tagPosition: "head",
        },
      ],
    },
  },

  css: ["@/assets/styles/fonts.css", "@/assets/styles/main.css", "@/assets/styles/deal.css"],

  plugins: [
    "~/plugins/directives.ts",
    "~/plugins/auth-init.client.ts",
    "~/plugins/bitrix-tracker.client.ts",
    "~/plugins/ytm.client.ts",
    "~/plugins/roistat-events.client.ts",
    "~/plugins/ytm-route.client.ts",
    "~/plugins/mango.client.ts",
    "~/plugins/utm-tracker.client.ts",
    "~/plugins/api.client.ts",
  ],

  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@nuxtjs/device",
    "@nuxt/image",
    "@vueuse/nuxt",
  ],

  // main.css уже содержит @tailwind base/components/utilities.
  // Без этого @nuxtjs/tailwindcss добавлял второй Tailwind stylesheet,
  // из-за чего Lighthouse видел два почти одинаковых блока preflight (~43 KiB unused CSS).
  tailwindcss: {
    cssPath: false,
  },

  image: {
    provider: "ipx",
    // Добавлены все возможные источники, чтобы IPX не отбрасывал редиректнувшиеся картинки
    domains: [
      "daigo.ru",
      "api.daigo.ru",
      "s3.firstvds.ru",
      "products.s3.firstvds.ru",
    ],
    ipx: {
      // при необходимости можно включить TTL: maxAge: 60 * 60 * 24
    },
    presets: {
      product: {
        modifiers: {
          format: "webp",
          width: 600,
          quality: 75,
        },
      },
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  typescript: {
    strict: true,
  },
});
