<script setup lang="ts">
import { computed } from 'vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import PopularArticles from '~/components/articles/PopularArticles.vue'
import ProductsCarousel from '~/components/articles/ProductsCarousel.vue'

definePageMeta({ layout: 'main' })

const IMAGE_BASE = '/images/articles/summer'
const ARTICLE_TITLE = 'Лето — это не только отдых'
const ARTICLE_DESCRIPTION = 'Почему многие летние проблемы начинаются гораздо глубже, чем кажется'
const ARTICLE_URL = 'https://daigo.ru/articles/leto-eto-ne-tolko-otdyh'
const ARTICLE_IMAGE = `http://localhost:3000${IMAGE_BASE}/art-1.jpg`

type MetaItem = {
  label: string
  icon: 'calendar' | 'time' | 'views' | 'comments'
}

type TagItem = string

type RecommendedArticle = {
  title: string
  image: string
  url: string
}

type SummerCard = {
  title: string
  image: string
  imageClass: string
  text: string[]
  sources: string[]
  sourceIcon: string
  fact: string
  factIcon: string
}

type FaqItem = {
  title: string
  text: string
}

const metaItems: MetaItem[] = [
  { label: '1.07.26', icon: 'calendar' },
  { label: '8 мин', icon: 'time' },
  { label: '200', icon: 'views' },
  { label: '2', icon: 'comments' },
]

const tags: TagItem[] = [
  'Кишечник и иммунитет',
  'ЖКТ',
  'Метабиотики',
  'С чего начать?',
  'Дайго',
  'Метабиотик Дайго',
]

const recommendations: RecommendedArticle[] = [
  {
    title: 'Как подготовить кожу к пляжному сезону?',
    image: `${IMAGE_BASE}/rec-1.jpg`,
    url: '/articles/kak-podgotovit-kozhu-k-plyazhnomu-sezonu',
  },
  {
    title: 'Синдром путешественника',
    image: `${IMAGE_BASE}/rec-2.jpg`,
    url: '/articles/sindrom-puteshestvennika',
  },
  {
    title: 'Аллергический ринит. Симптомы. Диагноз. Терапия',
    image: `${IMAGE_BASE}/rec-3.jpg`,
    url: '/articles/allergicheskiy-rinit-simptomy-diagnoz-terapiya',
  },
]

const cards: SummerCard[] = [
  {
    title: 'Смена климата',
    image: `${IMAGE_BASE}/climate.png`,
    imageClass: 'right-0 bottom-2 w-[145px] sm:w-[245px] lg:w-[230px]',
    text: [
      'После перелёта многие замечают не только усталость или сонливость. Появляются вздутие, тяжесть, изменения аппетита и нестабильное пищеварение. Сегодня учёные всё чаще используют термин «gut jet lag» — кишечный джетлаг.',
      'У микробиоты кишечника есть собственные циркадные ритмы. Некоторые кишечные бактерии меняют активность в зависимости от времени суток: днём и ночью отличается их метаболизм, поведение и даже набор производимых метаболитов.',
      'Это означает, что при резкой смене режима сна джетлаг испытывает не только мозг — джетлаг получает и микробиом. Исследования показывают, что нарушение циркадных ритмов может влиять на кишечный барьер, иммунную регуляцию и состав микробиоты.',
    ],
    sources: [
      'Thaiss C.A. et al. Transkingdom control of microbiota diurnal oscillations promotes metabolic homeostasis.',
      'Savvidis C. et al. The Gut Microbiota Axis in Social Jetlag.',
    ],
    sourceIcon: `${IMAGE_BASE}/source-brain.png`,
    fact: 'После перелёта через 6–8 часовых поясов организму может потребоваться до недели для полной синхронизации биологических ритмов.',
    factIcon: `${IMAGE_BASE}/fact-plane.png`,
  },
  {
    title: 'Лето и пищеварение',
    image: `${IMAGE_BASE}/digestion.png`,
    imageClass: 'right-1 bottom-5 w-[135px] sm:w-[215px] lg:w-[205px]',
    text: [
      'Летом меняется не только климат. Меняется само пищевое поведение.',
      'Мы чаще едим вне дома, пробуем новые продукты, позже ужинаем, пьём холодные напитки и сталкиваемся с хранением пищи при высокой температуре.',
      'По данным ВОЗ, ежегодно сотни миллионов случаев кишечных инфекций связаны с пищевыми патогенами и загрязнённой водой.',
      'Но есть важный нюанс. Одни люди спокойно адаптируются к новой пище. Другие сталкиваются с выраженным дискомфортом уже в первые дни отпуска.',
      'Современные исследования всё чаще связывают это не только с самими патогенами, но и с состоянием кишечного барьера, локального иммунитета и микробиоты.',
    ],
    sources: ['David L.A. et al. Diet rapidly and reproducibly alters the human gut microbiome.'],
    sourceIcon: `${IMAGE_BASE}/source-microscope.png`,
    fact: 'Во время путешествий состав микробиоты может меняться уже в течение нескольких дней из-за новой воды, еды и режима питания.',
    factIcon: `${IMAGE_BASE}/fact-cutlery.png`,
  },
  {
    title: 'Жара — это стресс',
    image: `${IMAGE_BASE}/heat.png`,
    imageClass: 'right-1 bottom-5 w-[135px] sm:w-[220px] lg:w-[205px]',
    text: [
      'Мы редко воспринимаем жару как серьёзную нагрузку. Но высокая температура заставляет организм постоянно перераспределять ресурсы для охлаждения тела.',
      'Во время жары меняется кровоток, активируется потоотделение, увеличивается потеря жидкости и электролитов.',
      'На этом фоне нагрузку получает и кишечник. Исследования показывают, что тепловой стресс способен влиять на состояние кишечного барьера, локальные иммунные реакции и состав микробиоты.',
    ],
    sources: ['Karl J.P. et al. Effects of psychological, environmental and physical stressors on the gut microbiota.'],
    sourceIcon: `${IMAGE_BASE}/source-brain.png`,
    fact: 'Учёные рассматривают микробиоту как потенциальный биомаркер теплового стресса. Жара влияет не только на самочувствие человека, но и на внутреннюю экосистему организма.',
    factIcon: `${IMAGE_BASE}/fact-hot.png`,
  },
  {
    title: 'Адаптация к жаре',
    image: `${IMAGE_BASE}/adaptation.png`,
    imageClass: 'right-1 bottom-5 w-[135px] sm:w-[230px] lg:w-[215px]',
    text: [
      'Особенно интересно, что адаптация к жаре может происходить и на уровне микробиоты.',
      'В одном из исследований после периода тепловой акклиматизации у участников наблюдалось снижение ряда потенциально патогенных бактерий и увеличение количества полезных микробных групп.',
      'Одновременно улучшалась переносимость жары.',
    ],
    sources: ['Liu S. et al. Alteration of gut microbiota after heat acclimation may reduce organ damage.'],
    sourceIcon: `${IMAGE_BASE}/source-books.png`,
    fact: 'К жаре адаптируется не только человек. К жаре адаптируется целая экосистема внутри него.',
    factIcon: `${IMAGE_BASE}/fact-sun.png`,
  },
  {
    title: 'Отпуск и выходные',
    image: `${IMAGE_BASE}/vacation.png`,
    imageClass: 'right-0 bottom-2 w-[140px] sm:w-[230px] lg:w-[215px]',
    text: [
      'Даже отпуск на выходных может влиять на микробиом.',
      'Исследователи King’s College London обнаружили, что разница всего в 90 минут между режимом сна в будни и выходные уже связана с изменениями состава кишечной микробиоты.',
    ],
    sources: ['Bermingham K.M. et al. Exploring the relationship between social jetlag with gut microbial composition and diet.'],
    sourceIcon: `${IMAGE_BASE}/source-microscope.png`,
    fact: 'Получается, что кишечник замечает ваш отпуск ещё до того, как вы успеваете добраться до аэропорта.',
    factIcon: `${IMAGE_BASE}/fact-umbrella.png`,
  },
  {
    title: 'Аллергия не в носу',
    image: `${IMAGE_BASE}/allergy.png`,
    imageClass: 'right-1 bottom-2 w-[140px] sm:w-[235px] lg:w-[220px]',
    text: [
      'Когда мы говорим о сезонной аллергии, кажется, что проблема находится исключительно в дыхательных путях.',
      'Но современные иммунологические исследования показывают более сложную картину.',
      'Кишечная микробиота участвует в формировании иммунной толерантности — способности иммунной системы спокойно реагировать на безопасные сигналы окружающей среды.',
    ],
    sources: [
      'Pascal M. et al. Microbiome and Allergic Diseases.',
      'Wang C. et al. Microbiome-immune crosstalk in allergic rhinitis.',
    ],
    sourceIcon: `${IMAGE_BASE}/source-brain.png`,
    fact: 'Некоторые кишечные бактерии способны стимулировать образование регуляторных T-клеток (Treg). Именно эти клетки помогают иммунной системе не реагировать чрезмерно на безопасные раздражители.',
    factIcon: `${IMAGE_BASE}/fact-light.png`,
  },
]

const faqItems: FaqItem[] = [
  {
    title: 'Можно ли взять Daigo с собой в отпуск как часть «дорожной аптечки»?',
    text: 'Да. Daigo удобно брать в поездку: он не содержит живых бактерий и подходит как часть регулярной поддержки микробиома в период смены питания, режима и климата.',
  },
  {
    title: 'Почему Daigo может быть особенно актуален летом?',
    text: 'Летом организм чаще сталкивается с жарой, новой едой, перелётами, сменой воды и режима сна. Всё это может влиять на кишечный барьер, иммунную регуляцию и состав микробиоты.',
  },
  {
    title: 'Почему в материалах Daigo так много внимания уделяется микробиому?',
    text: 'Микробиом участвует в пищеварении, работе иммунной системы, состоянии кишечного барьера и адаптации организма к внешним изменениям. Поэтому поддержка микробиома — базовый элемент заботы о здоровье.',
  },
  {
    title: 'Нужно ли ждать проблем с пищеварением, чтобы начать принимать Daigo?',
    text: 'Нет. Логика Daigo — поддерживать организм заранее, до появления выраженного дискомфорта, особенно в периоды повышенной нагрузки: поездки, жара, стресс, смена питания.',
  },
  {
    title: 'Можно ли принимать Daigo после алкоголя, тяжёлой еды или вечеринки?',
    text: 'Daigo можно использовать как часть восстановления обычного режима питания и поддержки кишечной экосистемы. При хронических заболеваниях или выраженных симптомах лучше проконсультироваться со специалистом.',
  },
]

const productsIds: string[] = [
  '71700acb-3584-490b-a5f7-62e8cb57b3c9',
  'cafac368-1074-417d-bb3e-4470b4e28190',
  '8631769b-3431-4fa7-9e36-5a9fe0da2412',
  'f4b6d734-7eea-4926-8bfa-dfe0969e19ee',
]

const productIds = computed<(string | number)[]>(() => productsIds)

useHead({
  title: `${ARTICLE_TITLE} | Daigo`,
  meta: [
    { name: 'description', content: ARTICLE_DESCRIPTION },
    { property: 'og:title', content: ARTICLE_TITLE },
    { property: 'og:description', content: ARTICLE_DESCRIPTION },
    { property: 'og:image', content: ARTICLE_IMAGE },
    { property: 'og:url', content: ARTICLE_URL },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: ARTICLE_URL },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify([
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: ARTICLE_TITLE,
          description: ARTICLE_DESCRIPTION,
          image: [ARTICLE_IMAGE],
          author: {
            '@type': 'Organization',
            name: 'Daigo',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Daigo',
            logo: {
              '@type': 'ImageObject',
              url: 'https://daigo.ru/logo.png',
            },
          },
          datePublished: '2026-07-01',
          mainEntityOfPage: ARTICLE_URL,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.text,
            },
          })),
        },
      ]),
    },
  ],
})
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10 pb-16 text-black">
      <section class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_270px] gap-6 lg:gap-8 items-start">
        <div class="flex flex-col">
          <nav class="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-black/45 mb-4" aria-label="Хлебные крошки">
            <NuxtLink to="/" class="hover:text-black transition">Главная</NuxtLink>
            <span>/</span>
            <NuxtLink to="/articles" class="hover:text-black transition">Статьи</NuxtLink>
            <span>/</span>
            <span>{{ ARTICLE_TITLE }}</span>
          </nav>

          <h1 class="text-3xl sm:text-product leading-tight font-medium mb-3">
            {{ ARTICLE_TITLE }}
          </h1>

          <p class="text-base sm:text-xl leading-tight font-medium mb-5">
            {{ ARTICLE_DESCRIPTION }}
          </p>

          <div class="flex flex-wrap items-center gap-4 sm:gap-5 text-xs sm:text-sm text-black/70 mb-3">
            <span v-for="item in metaItems" :key="item.label" class="inline-flex items-center gap-1.5">
              <svg v-if="item.icon === 'calendar'" class="w-4 h-4 text-[#4A8DFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 2v3M17 2v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="item.icon === 'time'" class="w-4 h-4 text-[#4A8DFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="item.icon === 'views'" class="w-4 h-4 text-[#4A8DFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="1.8" />
              </svg>
              <svg v-else class="w-4 h-4 text-[#4A8DFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              {{ item.label }}
            </span>
          </div>

          <img
            :src="`${IMAGE_BASE}/art-1.jpg`"
            alt="Летний отпуск, жара, путешествия и микробиом"
            width="820"
            height="365"
            loading="eager"
            decoding="async"
            class="rounded-xl sm:rounded-2xl w-full object-cover aspect-[820/365]"
          />

          <div class="flex items-center gap-5 text-xs sm:text-sm mt-3 mb-4">
            <a href="#comments" class="inline-flex items-center gap-1.5 text-black/75 hover:text-black transition">
              <svg class="w-4 h-4 text-[#4A8DFF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Комментарии
            </a>
            <button type="button" class="inline-flex items-center gap-1.5 text-[#E76FB1] hover:text-[#cf5298] transition">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Поделиться
            </button>
          </div>

          <section class="flex flex-col gap-3">
            <h2 class="text-2xl sm:text-[46px] w-full sm:w-10/12 font-medium leading-tight">
              Памятка Daigo для тех, кто собирается в отпуск
            </h2>
            <h3 class="text-lg sm:text-2xl font-medium leading-tight">
              В новый часовой пояс прилетает не только человек
            </h3>
            <p class="text-sm sm:text-lg leading-relaxed">
              Перед поездкой мы обычно проверяем билеты, документы и багаж. Но редко задумываемся о том,
              как на перелёты, жару, новую еду и смену режима реагирует организм.
            </p>
            <p class="text-sm sm:text-lg leading-relaxed">
              Мы собрали несколько интересных научных фактов, которые помогут подготовиться к летнему сезону
              немного осознаннее.
            </p>
          </section>
        </div>

        <aside class="hidden lg:flex flex-col gap-6 sticky top-24">
          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-medium leading-tight">Теги</h2>
            <div class="flex flex-wrap gap-2">
              <NuxtLink
                v-for="tag in tags"
                :key="tag"
                to="/articles"
                class="rounded-md bg-[#F7F7F7] px-3 py-2 text-xs leading-none text-black/70 hover:text-black transition"
              >
                {{ tag }}
              </NuxtLink>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <h2 class="text-xl font-medium leading-tight">
              Рекомендации<br />для вас
            </h2>
            <div class="flex flex-col gap-3">
              <NuxtLink
                v-for="item in recommendations"
                :key="item.title"
                :to="item.url"
                class="grid grid-cols-[90px_1fr] gap-3 items-start group"
              >
                <img
                  :src="item.image"
                  :alt="item.title"
                  width="90"
                  height="64"
                  loading="lazy"
                  decoding="async"
                  class="rounded-lg w-[90px] h-[64px] object-cover"
                />
                <span class="text-sm font-medium leading-tight group-hover:text-[#4A8DFF] transition">
                  {{ item.title }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <article v-for="card in cards" :key="card.title" class="flex flex-col gap-2">
          <div
            class="relative overflow-hidden w-full bg-[#F7F7F7] px-4 py-6 sm:px-6 sm:py-6 rounded-2xl sm:rounded-3xl min-h-[330px] sm:min-h-[390px]"
          >
            <div class="relative z-10 max-w-[72%] sm:max-w-[66%]">
              <div class="flex items-start gap-2 mb-4">
                <span class="text-2xl sm:text-3xl leading-none -mt-1" aria-hidden="true">📌</span>
                <h3 class="text-2xl sm:text-cardhead leading-tight font-medium">
                  {{ card.title }}
                </h3>
              </div>

              <div class="flex flex-col gap-2 text-xs sm:text-base leading-snug text-black/90">
                <p v-for="paragraph in card.text" :key="paragraph">
                  {{ paragraph }}
                </p>
              </div>
            </div>

            <img
              :src="card.image"
              :alt="card.title"
              loading="lazy"
              decoding="async"
              class="absolute z-0 object-contain pointer-events-none"
              :class="card.imageClass"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div class="bg-[#F7F7F7] rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[112px] shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div class="flex items-start justify-between gap-3 mb-2">
                <h4 class="text-sm sm:text-base font-medium leading-tight">Источники:</h4>
                <img :src="card.sourceIcon" alt="" width="40" height="40" loading="lazy" decoding="async" class="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <div class="flex flex-col gap-1.5 text-[11px] sm:text-xs leading-snug text-black/80">
                <p v-for="source in card.sources" :key="source">
                  {{ source }}
                </p>
              </div>
            </div>

            <div class="bg-[#F7F7F7] rounded-xl sm:rounded-2xl p-3 sm:p-4 min-h-[112px] shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div class="flex items-start justify-between gap-3 mb-2">
                <h4 class="text-sm sm:text-base font-medium leading-tight">Знаете ли вы?</h4>
                <img :src="card.factIcon" alt="" width="40" height="40" loading="lazy" decoding="async" class="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <p class="text-[11px] sm:text-xs leading-snug text-black/80">
                {{ card.fact }}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section class="flex flex-col lg:flex-row gap-6 items-start py-1 sm:py-5">
        <div class="w-full lg:w-7/12 flex flex-col gap-4">
          <h2 class="text-2xl sm:text-[46px] font-medium leading-tight">
            Что объединяет все летние сценарии
          </h2>
          <div class="flex flex-col gap-3 text-sm sm:text-lg leading-relaxed">
            <p>
              Смена климата. Жара. Аллергия. Пищевые отравления. Джетлаг. На первый взгляд это совершенно
              разные проблемы. Но на уровне организма все они связаны с одной задачей — адаптацией к изменяющейся среде.
            </p>
            <p>
              Именно поэтому летом особенно важно поддерживать не только внешний комфорт, но и внутреннюю устойчивость организма.
            </p>
            <p>
              Поддержка организма летом начинается не после появления симптомов. Гораздо важнее заранее помочь системам
              адаптации справляться с нагрузкой. В этот период особенно важно:
            </p>
            <ul class="flex flex-col gap-2 list-disc pl-5">
              <li>поддерживать питьевой режим;</li>
              <li>избегать резкой перегрузки рациона;</li>
              <li>сохранять стабильный режим сна даже в путешествиях;</li>
              <li>поддерживать разнообразие питания;</li>
              <li>уделять внимание состоянию кишечной экосистемы.</li>
            </ul>
          </div>
        </div>

        <div class="w-full lg:w-5/12">
          <img
            :src="`${IMAGE_BASE}/art-2.jpg`"
            alt="Летняя поддержка организма"
            loading="lazy"
            decoding="async"
            class="rounded-xl sm:rounded-2xl object-cover w-full mt-2"
          />
        </div>
      </section>

      <section class="flex flex-col gap-6">
        <h2 class="text-2xl sm:text-[46px] font-medium leading-tight">
          Daigo как часть летней поддержки организма
        </h2>
        <div class="flex flex-col lg:flex-row gap-6 items-start">
          <div class="w-full lg:w-7/12">
            <img
              :src="`${IMAGE_BASE}/art-3.jpg`"
              alt="Daigo как часть летней поддержки организма"
              loading="lazy"
              decoding="async"
              class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
          </div>
          <div class="w-full lg:w-5/12 flex flex-col gap-4 text-sm sm:text-base leading-relaxed">
            <p>
              Daigo — японский метабиотик на основе многолетней ферментации 16 штаммов лактобактерий.
              В отличие от продуктов, содержащих живые бактерии, метабиотики содержат компоненты ферментации
              и микробные метаболиты, которые участвуют в поддержании микробиомной среды кишечника.
            </p>
            <p>
              Лето невозможно сделать полностью предсказуемым. Но можно помочь организму лучше адаптироваться
              к его нагрузкам. Потому что лето начинается не только с солнца и путешествий. Лето начинается внутри.
            </p>
            <p>Daigo — забота о здоровье начинается с микробиома.</p>
          </div>
        </div>
      </section>

      <section id="comments" class="flex flex-col gap-6">
        <h2 class="text-2xl sm:text-[46px] font-medium">Часто задаваемые вопросы</h2>
        <div class="flex flex-col">
          <AccordionItem v-for="item in faqItems" :key="item.title" :title="item.title">
            {{ item.text }}
          </AccordionItem>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h2 class="text-2xl sm:text-[32px] font-medium leading-tight">Понравилась статья?</h2>
        <p class="text-sm sm:text-base leading-relaxed text-black/75">
          Поделитесь статьей с друзьями<br />в социальных сетях
        </p>
        <div class="flex items-center gap-2 pt-1">
          <a href="#" aria-label="Поделиться в WhatsApp" class="w-5 h-5 rounded-full bg-[#24D366] text-white text-[9px] flex items-center justify-center">W</a>
          <a href="#" aria-label="Поделиться в Telegram" class="w-5 h-5 rounded-full bg-[#2CA5E0] text-white text-[9px] flex items-center justify-center">T</a>
          <a href="#" aria-label="Поделиться во ВКонтакте" class="w-5 h-5 rounded-full bg-[#0077FF] text-white text-[8px] flex items-center justify-center">VK</a>
          <a href="#" aria-label="Поделиться в Одноклассниках" class="w-5 h-5 rounded-full bg-[#EE8208] text-white text-[8px] flex items-center justify-center">OK</a>
        </div>
      </section>

      <ProductsCarousel :product-ids="productIds" title="Возьмите в отпуск" />

      <section class="flex flex-col gap-6 py-5">
        <h2 class="text-product font-medium">Популярные статьи</h2>
        <PopularArticles />
      </section>
    </div>
  </BaseContainer>
</template>
