<template>
  <div class="hist-page" :style="{ '--hist-bg': bgColor } as any">
    <div class="hist-backdrop" aria-hidden="true" />

    <!-- subtle old-film texture -->
    <div class="hist-grain" aria-hidden="true" />

    <!-- vignette -->
    <div class="hist-vignette" aria-hidden="true" />

    <BaseContainer class="relative z-[2]">
      <header class="pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div class="max-w-3xl">
          <p class="text-xs sm:text-sm uppercase tracking-[0.24em] text-white/70">История продукта</p>
          <h1 class="mt-3 text-3xl sm:text-5xl font-mont font-semibold text-white leading-[1.1]">
            От идеи — к привычке
          </h1>
          <p class="mt-4 text-base sm:text-lg text-white/70">
            Лонгрид-лендинг на 10 секций со скролл-анимациями: появление, затухание, параллакс и смена атмосферы.
          </p>
          <div class="mt-6 flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <span class="text-white/80 text-sm">↓</span>
            </div>
            <p class="text-white/60 text-sm">Скролль вниз</p>
          </div>
        </div>
      </header>
    </BaseContainer>

    <main class="relative z-[2]">
      <section
        v-for="(s, i) in sections"
        :key="s.id"
        :ref="(el) => (sectionEls[i] = el as HTMLElement)"
        class="hist-section"
      >
        <BaseContainer class="h-full">
          <div class="hist-section-inner">
            <div class="hist-kicker" :style="kickerStyle(i)">
              <span class="hist-kicker-dot" />
              <span>{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="opacity-60">/ 10</span>
            </div>

            <div v-if="s.kind === 'videoFull'" class="hist-fullvideo-wrap" :ref="(el) => (videoWrappers[i] = el as HTMLElement)">
  <video
    class="hist-fullvideo-el"
    muted
    playsinline
    loop
    preload="none"
    :poster="s.poster"
    aria-label="Фоновое видео (полный экран)"
  />
  <div class="hist-fullvideo-overlay" aria-hidden="true" />
  <div class="hist-fullvideo-content">
    <p class="hist-kicker" :style="kickerStyle(i)">
      <span class="hist-kicker-badge">{{ s.badge }}</span>
      <span class="hist-kicker-chip" v-if="s.chip">{{ s.chip }}</span>
    </p>

    <h2 class="hist-title" :style="titleStyle(i)">{{ s.title }}</h2>
    <p class="hist-text" :style="textStyle(i)">{{ s.text }}</p>

    <ul v-if="s.bullets?.length" class="hist-bullets" :style="listStyle(i)">
      <li v-for="b in s.bullets" :key="b" class="hist-bullet">
        <span class="hist-bullet-mark" />
        <span>{{ b }}</span>
      </li>
    </ul>

    <div class="mt-5 sm:mt-6 max-w-xl" :style="captionStyle(i)">
      <p class="text-white/85 text-sm sm:text-base font-medium">{{ s.caption }}</p>
      <p class="text-white/60 text-xs sm:text-sm mt-1">{{ s.subcaption }}</p>
    </div>
  </div>
</div>

<div v-else class="hist-grid">

              <div class="hist-copy">
                <h2 class="hist-title" :style="titleStyle(i)">{{ s.title }}</h2>
                <p class="hist-text" :style="textStyle(i)">{{ s.text }}</p>

                <ul v-if="s.bullets?.length" class="hist-bullets" :style="listStyle(i)">
                  <li v-for="(b, bi) in s.bullets" :key="bi" class="hist-bullet">
                    <span class="hist-bullet-mark" />
                    <span>{{ b }}</span>
                  </li>
                </ul>
              </div>

              <div class="hist-visual">
                <!-- one section with looping background video -->
                <div
                  v-if="s.kind === 'video'"
                  class="hist-video"
                  :style="cardStyle(i)"
                  :ref="(el) => (videoWrappers[i] = el as HTMLElement)"
                >
                  <video
                    class="hist-video-el"
                    muted
                    playsinline
                    loop
                    preload="none"
                    :poster="s.poster"
                    aria-label="Фоновое видео"
                  />
                  <div class="hist-video-overlay" aria-hidden="true" />
                  <div class="hist-video-caption" :style="captionStyle(i)">
                    <p class="text-white/85 text-sm sm:text-base font-medium">{{ s.caption }}</p>
                    <p class="text-white/60 text-xs sm:text-sm mt-1">{{ s.subcaption }}</p>
                  </div>
                </div>

                <!-- regular visual card -->
                <div v-else class="hist-card" :style="cardStyle(i)">
                  <div class="hist-card-top">
                    <div class="hist-badge">{{ s.badge }}</div>
                    <div class="hist-chip" v-if="s.chip">{{ s.chip }}</div>
                  </div>

                  <div class="hist-card-body">
                    <p class="hist-card-title">{{ s.cardTitle }}</p>
                    <p class="hist-card-desc">{{ s.cardText }}</p>
                  </div>

                  <div class="hist-card-glow" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </BaseContainer>
      </section>

      <BaseContainer class="pb-16 sm:pb-24">
        <div class="hist-end" :style="endStyle">
          <h3 class="text-white text-2xl sm:text-3xl font-mont font-semibold">Финал</h3>
          <p class="mt-3 text-white/70 max-w-2xl">
            Это демо-история: структура и motion готовы. Тексты/смыслы можно заменить на реальные данные продукта, сохранив анимации.
          </p>
          <NuxtLink to="/catalog" class="mt-6 inline-flex">
            <button class="px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition duration-300">
              Перейти в каталог
            </button>
          </NuxtLink>
        </div>
      </BaseContainer>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'main' })

import { onBeforeUnmount, onMounted, computed, reactive, ref } from 'vue'
import { useHead } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'

type SectionKind = 'card' | 'video' | 'videoFull'
type HistSection = {
  id: string
  kind: SectionKind
  title: string
  text: string
  bullets?: string[]
  badge?: string
  chip?: string
  cardTitle?: string
  cardText?: string

  // video
  caption?: string
  subcaption?: string
  poster?: string
}

const sections: HistSection[] = [
  {
    id: 's1',
    kind: 'card',
    title: 'Зерно идеи',
    text: 'Появляется первый смысл: зачем продукт существует и какую привычку он закрепляет.',
    bullets: ['Фокус на результате для человека', 'Минимум лишнего', 'Стабильность и повторяемость'],
    badge: 'Старт',
    chip: '1990–2000',
    cardTitle: 'Когда всё начинается с одного наблюдения',
    cardText: 'Мы фиксируем сигнал рынка и превращаем его в ясную гипотезу.'
  },
  {
    id: 's2',
    kind: 'card',
    title: 'Первые формулы',
    text: 'Из десятков вариантов остаются те, что проходят простую проверку: работает ли это в реальности.',
    bullets: ['Отбор по эффективности', 'Отбор по безопасности', 'Отбор по стабильности'],
    badge: 'R&D',
    chip: 'Итерации',
    cardTitle: 'Меньше обещаний — больше тестов',
    cardText: 'Никакой магии: только проверки и аккуратные улучшения.'
  },
  {
    id: 's3',
    kind: 'card',
    title: 'Честная упаковка',
    text: 'Появляется форма: как продукт выглядит, ощущается, читается и запоминается.',
    bullets: ['Визуальная дисциплина', 'Простые смыслы', 'Сильный контраст'],
    badge: 'Дизайн',
    chip: 'Brand',
    cardTitle: 'Упаковка — это интерфейс доверия',
    cardText: 'Если человек понял с первого взгляда — мы всё сделали правильно.'
  },
  {
    id: 's4',
    kind: 'card',
    title: 'Путь пользователя',
    text: 'Мы строим сценарий: от первого касания до повторной покупки — без “провалов”.',
    bullets: ['Понятная навигация', 'Мягкие подсказки', 'Отсутствие трения'],
    badge: 'UX',
    chip: 'Funnel',
    cardTitle: 'Точка “ага” должна случиться быстро',
    cardText: 'Скролл, карточки, CTA — всё синхронизировано с вниманием.'
  },
  {
    id: 's5',
    kind: 'video',
    title: 'Материя времени',
    text: 'Одна секция — как кинопауза: фон-видео работает как атмосфера, а текст плавает поверх.',
    caption: 'Тихий ритм, который держит историю',
    subcaption: 'Видео — цикличное, загружается лениво',
    poster: ''
  },
  {
    id: 's6',
    kind: 'card',
    title: 'Качество и повторяемость',
    text: 'Когда продукт масштабируется, важнее всего становится стабильность.',
    bullets: ['Контроль партии', 'Трассируемость', 'Одинаковый результат'],
    badge: 'QA',
    chip: 'Batch',
    cardTitle: 'Повторяемость важнее “вау-эффекта”',
    cardText: 'Клиент возвращается, если всё стабильно.'
  },
  {
    id: 's7',
    kind: 'card',
    title: 'Доверие',
    text: 'Информация должна быть прозрачной: состав, применение, ограничения.',
    bullets: ['Простые объяснения', 'Никаких двусмысленностей', 'Ответы на вопросы заранее'],
    badge: 'Trust',
    chip: 'Docs',
    cardTitle: 'Честность — это интерфейс',
    cardText: 'Пользователь ощущает “здесь всё ясно”.'
  },
  {
    id: 's8',
    kind: 'videoFull',
    title: 'Сообщество',
    text: 'Когда продукт становится привычкой, вокруг появляется язык и ритуал.',
    caption: 'Целая секция — как сцена: видео во весь экран',
    subcaption: 'Фон-видео цикличное, поверх — текст и ритм',
    poster: ''
    bullets: ['Истории пользователей', 'Рекомендации', 'Повторное касание'],
    badge: 'Community',
    chip: 'UGC',
    cardTitle: 'Люди лучше всего объясняют людям',
    cardText: 'Отзывы и истории — часть продукта.'
  },
  {
    id: 's9',
    kind: 'card',
    title: 'Сервис',
    text: 'Любой контакт — доставка, поддержка, оплата — должен оставлять ощущение контроля.',
    bullets: ['Прогнозируемые сроки', 'Понятные статусы', 'Быстрые ответы'],
    badge: 'Service',
    chip: 'Ops',
    cardTitle: 'Хороший сервис незаметен',
    cardText: 'И заметен только тогда, когда он плохой. Мы делаем наоборот.'
  },
  {
    id: 's10',
    kind: 'card',
    title: 'Новая глава',
    text: 'История не заканчивается: продукт живёт, обновляется и становится точнее.',
    bullets: ['Обратная связь', 'Новые версии', 'Эволюция'],
    badge: 'Next',
    chip: 'v2+',
    cardTitle: 'Стабильное улучшение',
    cardText: 'Движение маленькими шагами — самый быстрый путь.'
  }
]

useHead(() => {
  const title = 'История продукта — Daigo'
  const description = 'Анимированная страница истории продукта (10 секций) со скролл-эффектами и цикличным видео.'
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url: '/hist'
        })
      }
    ]
  }
})

const sectionEls = reactive<HTMLElement[]>([])
const videoWrappers = reactive<HTMLElement[]>([])
const state = reactive({
  scrollY: 0,
  vh: 1,
  bgIndex: 0,
  bgT: 0,
  edge: 0,
  prefersReduced: false
})

const palette = [
  '#0b0f14',
  '#081724',
  '#0b1a13',
  '#141024',
  '#0a1016',
  '#12170f',
  '#0f0f12',
  '#07121b',
  '#0f1410',
  '#10121a'
]

const bgColor = computed(() => {
  const a = hexToRgb(palette[clampInt(state.bgIndex, 0, palette.length - 1)])
  const b = hexToRgb(palette[clampInt(state.bgIndex + 1, 0, palette.length - 1)])
  const t = clamp01(state.bgT)
  const r = Math.round(lerp(a.r, b.r, t))
  const g = Math.round(lerp(a.g, b.g, t))
  const bl = Math.round(lerp(a.b, b.b, t))
  return `rgb(${r}, ${g}, ${bl})`
})

function clamp01(v: number) { return Math.max(0, Math.min(1, v)) }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
function clampInt(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }

function hexToRgb(hex: string) {
  const h = hex.replace('#', '').trim()
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function sectionProgress(i: number) {
  const el = sectionEls[i]
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  const center = rect.top + rect.height * 0.5
  const d = Math.abs(center - state.vh * 0.5)
  const maxD = state.vh * 1.25
  return clamp01(1 - d / maxD)
}

function appearStyle(i: number, power = 1) {
  const p0 = sectionProgress(i)
  const p = Math.pow(p0, power)

  const y = lerp(22, 0, p)
  const s = lerp(0.985, 1, p)

  // blur only near very top/bottom of the whole page
  const blur = lerp(12, 0, p) * (state.edge || 0)

  // keep content readable most of the time
  const op = lerp(0.72, 1, p)

  return {
    opacity: String(op),
    transform: `translate3d(0, ${y}px, 0) scale(${s})`,
    filter: blur > 0.35 ? `blur(${blur}px)` : 'none'
  } as Record<string, string>
}


const kickerStyle = (i: number) => ({
  ...appearStyle(i, 0.85),
  transition: state.prefersReduced ? 'none' : 'transform 80ms linear, opacity 80ms linear, filter 80ms linear'
})

const titleStyle = (i: number) => ({
  ...appearStyle(i, 1),
  transition: state.prefersReduced ? 'none' : 'transform 90ms linear, opacity 90ms linear, filter 90ms linear'
})

const textStyle = (i: number) => ({
  ...appearStyle(i, 1.12),
  transition: state.prefersReduced ? 'none' : 'transform 90ms linear, opacity 90ms linear, filter 90ms linear'
})

const listStyle = (i: number) => ({
  ...appearStyle(i, 1.25),
  transition: state.prefersReduced ? 'none' : 'transform 90ms linear, opacity 90ms linear, filter 90ms linear'
})

const captionStyle = (i: number) => ({
  ...appearStyle(i, 1.05),
  transition: state.prefersReduced ? 'none' : 'transform 90ms linear, opacity 90ms linear, filter 90ms linear'
})

const cardStyle = (i: number) => {
  const p = sectionProgress(i)
  const y = lerp(26, 0, p)
  const rot = lerp(-0.55, 0, p)

  // blur only near very top/bottom of the whole page
  const blur = lerp(14, 0, p) * (state.edge || 0)

  const op = lerp(0.78, 1, p)

  return {
    opacity: String(op),
    transform: `translate3d(0, ${y}px, 0) rotate(${rot}deg)`,
    filter: blur > 0.35 ? `blur(${blur}px)` : 'none',
    transition: state.prefersReduced ? 'none' : 'transform 90ms linear, opacity 90ms linear, filter 90ms linear'
  } as Record<string, string>
}


const endStyle = computed(() => ({
  opacity: '1',
  transform: 'translate3d(0,0,0)'
}))

let raf = 0
let io: IntersectionObserver | null = null

function tick() {
  state.scrollY = window.scrollY || 0
  state.vh = Math.max(1, window.innerHeight || 1)

  const doc = document.documentElement
  const maxScroll = Math.max(1, (doc?.scrollHeight ?? 1) - state.vh)
  const distTop = state.scrollY
  const distBottom = maxScroll - state.scrollY
  const edgeBand = Math.max(180, Math.floor(state.vh * 0.18)) // band where blur/fade is allowed
  const edgeTop = clamp01(1 - distTop / edgeBand)
  const edgeBottom = clamp01(1 - distBottom / edgeBand)
  state.edge = Math.max(edgeTop, edgeBottom)


  // determine background crossfade index by section positions
  const centers = sectionEls.map((el) => {
    const r = el?.getBoundingClientRect()
    return r ? r.top + r.height * 0.5 : 1e9
  })

  // find nearest to viewport center
  const vpCenter = state.vh * 0.5
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < centers.length; i++) {
    const d = Math.abs(centers[i] - vpCenter)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }

  const next = clampInt(best + 1, 0, sections.length - 1)
  const elA = sectionEls[best]
  const elB = sectionEls[next]
  if (elA && elB && best !== next) {
    const a = elA.getBoundingClientRect()
    const b = elB.getBoundingClientRect()
    const aCenter = a.top + a.height * 0.5
    const bCenter = b.top + b.height * 0.5
    const span = Math.max(1, Math.abs(bCenter - aCenter))
    const t = clamp01(Math.abs(vpCenter - aCenter) / span)
    state.bgIndex = best
    state.bgT = t
  } else {
    state.bgIndex = best
    state.bgT = 0
  }

  raf = window.requestAnimationFrame(tick)
}

function setupVideoLazyLoad() {
  const videoSrc = '/videos/hist-bg.mp4'

  const applySrc = (v: HTMLVideoElement) => {
    if (v.dataset.loaded === '1') return
    v.dataset.loaded = '1'
    const source = document.createElement('source')
    source.src = videoSrc
    source.type = 'video/mp4'
    v.appendChild(source)
    v.load()
    v.play().catch(() => {})
  }

  const observeWrapper = (wrapper: HTMLElement | undefined) => {
    if (!wrapper) return
    const v = wrapper.querySelector('video') as HTMLVideoElement | null
    if (!v) return

    io = io || new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const vv = (e.target as HTMLElement).querySelector('video') as HTMLVideoElement | null
          if (vv) applySrc(vv)
        }
      }
    }, { root: null, threshold: 0.2 })

    io.observe(wrapper)
  }

  // observe all video wrappers (both inline block and full-screen section)
  for (let i = 0; i < sections.length; i++) observeWrapper(videoWrappers[i])
}

onMounted(() => {
(() => {
  state.prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  raf = window.requestAnimationFrame(tick)
  setupVideoLazyLoad()
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  if (io) io.disconnect()
})
</script>

<style scoped>
.hist-page {
  position: relative;
  min-height: 100vh;
  background: var(--hist-bg);
  color: white;
  overflow: hidden;
}

/* Backdrop that follows computed color */
.hist-backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(1200px 800px at 20% 20%, rgba(154, 183, 92, 0.18), transparent 60%),
    radial-gradient(900px 700px at 80% 40%, rgba(40, 81, 59, 0.22), transparent 55%),
    radial-gradient(1100px 900px at 50% 80%, rgba(240, 240, 255, 0.06), transparent 62%);
  pointer-events: none;
  opacity: 0.9;
  transform: translateZ(0);
}

/* Old film grain texture */
.hist-grain {
  position: fixed;
  inset: -20%;
  z-index: 1;
  pointer-events: none;
  background-image: url('/textures/film-grain.png');
  background-size: 320px 320px;
  opacity: 0.08;
  mix-blend-mode: overlay;
  filter: contrast(110%) brightness(110%);
  animation: histGrainMove 1.8s steps(2, end) infinite;
  transform: translateZ(0);
}

@keyframes histGrainMove {
  0% { transform: translate3d(0, 0, 0) rotate(0.001deg); }
  20% { transform: translate3d(-2%, 1%, 0) rotate(0.001deg); }
  40% { transform: translate3d(1%, -2%, 0) rotate(0.001deg); }
  60% { transform: translate3d(3%, 2%, 0) rotate(0.001deg); }
  80% { transform: translate3d(-1%, 3%, 0) rotate(0.001deg); }
  100% { transform: translate3d(0, 0, 0) rotate(0.001deg); }
}

.hist-vignette {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(120% 85% at 50% 40%, transparent 30%, rgba(0,0,0,0.55) 100%);
  opacity: 0.65;
}

.hist-section {
  position: relative;
  min-height: 100vh;
  padding: 48px 0;
  display: flex;
  align-items: center;
}

@media (min-width: 640px) {
  .hist-section { padding: 72px 0; }
}

.hist-section-inner {
  position: relative;
  height: 100%;
}

.hist-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.65);
}

.hist-kicker-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(255,255,255,0.55);
  box-shadow: 0 0 0 6px rgba(255,255,255,0.06);
}

.hist-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

@media (min-width: 900px) {
  .hist-grid {
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
  }
}

.hist-copy {
  max-width: 720px;
}

.hist-title {
  font-family: var(--font-mont, ui-sans-serif);
  font-weight: 600;
  font-size: 30px;
  line-height: 1.12;
  color: rgba(255,255,255,0.96);
}

@media (min-width: 640px) {
  .hist-title { font-size: 44px; }
}

.hist-text {
  margin-top: 14px;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(255,255,255,0.70);
}

@media (min-width: 640px) {
  .hist-text { font-size: 18px; }
}

.hist-bullets {
  margin-top: 16px;
  display: grid;
  gap: 10px;
  max-width: 560px;
}

.hist-bullet {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: rgba(255,255,255,0.72);
  font-size: 14px;
  line-height: 1.45;
}

.hist-bullet-mark {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 6px;
  background: rgba(154, 183, 92, 0.9);
  box-shadow: 0 0 0 6px rgba(154, 183, 92, 0.12);
}

.hist-visual {
  display: flex;
  justify-content: flex-start;
}

@media (min-width: 900px) {
  .hist-visual { justify-content: flex-end; }
}

.hist-card,
.hist-video {
  position: relative;
  width: 100%;
  max-width: 520px;
  border-radius: 22px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.35),
    0 0 0 1px rgba(255,255,255,0.06) inset;
  overflow: hidden;
  transform: translateZ(0);
  backdrop-filter: blur(10px);
}

.hist-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
}

.hist-badge {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.72);
}

.hist-chip {
  font-size: 12px;
  color: rgba(255,255,255,0.62);
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.18);
}

.hist-card-body {
  padding: 18px 16px 22px;
}

.hist-card-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255,255,255,0.92);
}

.hist-card-desc {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255,255,255,0.68);
}

.hist-card-glow {
  position: absolute;
  inset: -50%;
  background: radial-gradient(closest-side, rgba(154,183,92,0.16), transparent 70%);
  transform: translate3d(10%, 6%, 0);
  pointer-events: none;
  opacity: 0.9;
}

.hist-video {
  min-height: 360px;
}

.hist-video-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
  filter: saturate(1.05) contrast(1.05) brightness(0.9);
}

.hist-video-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55)),
    radial-gradient(800px 520px at 30% 30%, rgba(154,183,92,0.12), transparent 60%);
  pointer-events: none;
}

.hist-video-caption {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  padding: 14px 14px;
  border-radius: 16px;
  background: rgba(0,0,0,0.32);
  border: 1px solid rgba(255,255,255,0.10);
  backdrop-filter: blur(10px);
}

.hist-end {
  margin-top: 18px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 18px 54px rgba(0,0,0,0.35);
}

/* === Full-screen video section === */
.hist-fullvideo-wrap {
  position: relative;
  min-height: 100vh;
  width: 100%;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 18px 60px rgba(0,0,0,0.35);
}

@media (max-width: 640px) {
  .hist-fullvideo-wrap {
    border-radius: 22px;
  }
}

.hist-fullvideo-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translateZ(0);
}

.hist-fullvideo-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(90% 80% at 40% 30%, rgba(0,0,0,0.10), rgba(0,0,0,0.55)),
    linear-gradient(180deg, rgba(0,0,0,0.40), rgba(0,0,0,0.55));
}

.hist-fullvideo-content {
  position: relative;
  z-index: 2;
  padding: 22px;
  max-width: 860px;
}

@media (min-width: 640px) {
  .hist-fullvideo-content {
    padding: 40px;
  }
}

</style>
