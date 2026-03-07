<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import type { Swiper as SwiperCore } from 'swiper'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import 'swiper/css'

import { toPng } from 'html-to-image'

const YM_COUNTER_ID = 31773751
const YM_SHARE_HIT = '/ym_events/share8marta'

definePageMeta({
  layout: 'womens',
})

const heroTitle = 'XX и XXI век'
const heroSubtitle = 'время великих женщин'

const heroNote =
  'Они меняли науку,\nискусство, историю.\nНо величие измеряется\nне только наградами.'

const handQuote =
  'Бывают достижения, которые остаются в учебниках.\nА бывают — которые меняют чью-то жизнь сегодня.'


const rightHand =
  'Величие не всегда громкое.\nВеличие — это быть собой.'

const ctaTitle = 'Ты великая.'
const ctaSub =
  'потому что…\nдержишься, даже когда никто не\nвидит, как тебе сложно'


// если переименуешь "kurie 1.png" -> "kurie-1.png", поменяй:
const heroPhoto = '/images/women/head.webp'

type Slide = { name: string; desc: string; image: string }

const slides = ref<Slide[]>([
  { name: 'Майя Плисекцкая', desc: 'Одна из величайших балерин XX века, изменившая язык современного балета', image: '/images/women/w0.webp' },
  { name: 'Каталин Карико', desc: 'Биохимик, чьи исследования стали основой технологии mRNA-вакцин', image: '/images/women/w1.webp' },
  { name: 'Коко Шанель', desc: 'Дизайнер, радикально изменившая представление о женской моде', image: '/images/women/w2.webp' },
  { name: 'Эммануэль Шарпантье', desc: 'Лауреат Нобелевской премии за разработку технологии редактирования генома CRISPR', image: '/images/women/w3.webp' },
  { name: 'Заха Хадид', desc: 'Архитектор, ставшая первой женщиной-лауреатом Притцкеровской премии', image: '/images/women/w4.webp' },
  { name: 'Мария Кюри', desc: 'Физик и химик, дважды лауреат Нобелевской премии за открытия в области радиоактивности', image: '/images/women/w5.webp' },
  { name: 'Джоан Роулинг', desc: 'Писательница, создавшая одну из самых известных литературных вселенных современности', image: '/images/women/w6.webp' },
  { name: 'Розалинд Франклин', desc: 'Учёная, чьи исследования позволили раскрыть структуру молекулы ДНК', image: '/images/women/w7.webp' },
  { name: 'Ту Юю', desc: 'Лауреат Нобелевской премии за открытие лекарства против малярии, спасшего миллионы жизней', image: '/images/women/w8.webp' },
  { name: 'Валентина Терешкова', desc: 'Первая женщина в истории, совершившая космический полёт', image: '/images/women/w9.webp' },
])

const swiper = ref<SwiperCore | null>(null)
const isHovered = ref(false)

const onSwiper = (sw: SwiperCore) => {
  swiper.value = sw
}

const pauseCarousel = () => {
  isHovered.value = true
  const sw = swiper.value
  if (!sw) return
  sw.autoplay?.stop()
}

const resumeCarousel = () => {
  isHovered.value = false
  const sw = swiper.value
  if (!sw) return
  sw.autoplay?.start()
}

/* =========================
   ✅ НОВОЕ: открытка + share
   ========================= */

const phrases = [
  'решилась первой.',
  'сделала то, что раньше считалось невозможным.',
  'не побоялась выйти за пределы привычного.',
  'выбрала путь, даже если он был непростым.',
  'открыла новое — для себя или для других.',
  'доказала, что «нельзя» — это не навсегда.',
  'сделала шаг туда, где ещё не было протоптанной дороги.',
  'веришь в идею, даже если пока в неё веришь только ты.',
  'не отступила, когда было трудно.',
  'осталась верной себе, несмотря ни на что.',
  'учишься и не перестаёшь задавать вопросы.',
  'сомневаешься — но всё равно пробуешь.',
  'создаёшь что-то своё.',
  'берёшь ответственность за свой выбор.',
  'меняешь правила — мягко, но настойчиво.',
  'разрешаешь себе быть амбициозной.',
  'видишь дальше, чем сегодняшний день.',
  'не боишься быть заметной.',
  'не боишься быть тихой.',
  'делаешь по-своему.',
  'знаешь, что твой вклад важен.',
  'не обесцениваешь свои усилия.',
  'помнишь, сколько всего уже пройдено.',
  'начинаешь сначала — и это тоже сила.',
  'остаёшься устойчивой, даже если всё меняется.',
  'поддерживаешь других на их пути.',
  'сохраняешь внутренний стержень.',
  'мечтаешь масштабно.',
  'двигаешься шаг за шагом.',
  'просто продолжаешь',
] as const

const selectedPhrase = ref<string | null>(null)
const isSharing = ref(false)
const cardRef = ref<HTMLElement | null>(null)

const revealedText = ref('')
const isRevealing = ref(false)
let rafId: number | null = null

const showPhrase = ref(false)
const phraseKey = ref(0)

const pickPhrase = () => {
  const idx = Math.floor(Math.random() * phrases.length)
  selectedPhrase.value = phrases[idx]
  phraseKey.value++
}

const POSTCARD_BG = '/images/women/template.png'


const waitForImages = async (el: HTMLElement) => {
  const imgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[]
  await Promise.all(imgs.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  }))
}

const preloadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })

const isSafariBrowser = () => {
  if (!import.meta.client) return false
  const ua = navigator.userAgent
  return /^((?!chrome|android).)*safari/i.test(ua)
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

const shareOrDownload = async () => {
  if (!cardRef.value || !import.meta.client) return
  isSharing.value = true

  const el = cardRef.value
  const safari = isSafariBrowser()

  try {
    await (document.fonts?.ready ?? Promise.resolve())

    // фон открытки
    await preloadImage(POSTCARD_BG)

    // если внутри карточки будут обычные img — тоже дождаться
    await waitForImages(el)

    // даём Safari ещё чуть времени после загрузки картинок и шрифтов
    await nextFrame()
    await nextFrame()

    // на время экспорта выключаем анимации
    el.classList.add('capture-mode')

    const options = {
      cacheBust: true,
      pixelRatio: safari ? 1 : 2,
      backgroundColor: '#ffffff00',
      skipAutoScale: true,
      canvasWidth: el.clientWidth,
      canvasHeight: el.clientHeight,
    }

    let dataUrl = ''

    if (safari) {
      // первый проход "прогревает" Safari
      try {
        await toPng(el, options)
      } catch (_) {}

      await nextFrame()
      await new Promise(resolve => setTimeout(resolve, 80))

      dataUrl = await toPng(el, options)
    } else {
      dataUrl = await toPng(el, options)
    }

    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], 'daigo-card.png', { type: 'image/png' })

    const canShare = !!navigator.canShare && navigator.canShare({ files: [file] })

    if (canShare && navigator.share) {
      await navigator.share({
        files: [file],
        title: 'Открытка',
        text: 'С 8 Марта! Ты — великая 💐 https://daigo.ru/WD',
      })

      ;(window as any).ym?.(YM_COUNTER_ID, 'hit', YM_SHARE_HIT)
      return
    }

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'daigo-card.png'
    a.click()

    ;(window as any).ym?.(YM_COUNTER_ID, 'hit', YM_SHARE_HIT)
  } catch (error) {
    console.error('shareOrDownload error:', error)
  } finally {
    el.classList.remove('capture-mode')
    isSharing.value = false
  }
}

/* =========================
   ✅ Вертикальный параллакс (заметнее) + без лагов
   ========================= */

const bgRef = ref<HTMLElement | null>(null)

let parRaf = 0
let targetY = 0
let currentY = 0

const applyParallax = () => {
  parRaf = 0
  const root = bgRef.value
  if (!root) return

  // плавное сглаживание
  currentY += (targetY - currentY) * 0.12

  const layers = root.querySelectorAll<HTMLElement>('[data-parallax]')
  layers.forEach((el) => {
    const speed = Number(el.dataset.speed || '0.12') // заметнее
    const max = Number(el.dataset.max || '220')      // ограничение амплитуды
    const dyRaw = currentY * speed
    const dy = Math.max(-max, Math.min(max, dyRaw))

    // строго по вертикали
    el.style.transform = `translate3d(0, ${dy}px, 0)`
  })
}

const onScroll = () => {
  targetY = window.scrollY || 0
  if (!parRaf) parRaf = requestAnimationFrame(applyParallax)
}

onMounted(() => {
  if (!import.meta.client) return
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('scroll', onScroll)
  if (parRaf) cancelAnimationFrame(parRaf)
})
</script>

<template>
  <div class="max-w-[1310px] h-full xs-max:px-3 px-4 sm:px-5 xl:px-0 w-full mx-auto relative py-40 -mt-20 bg-[#F2F1ED] no-scrollbar">
<div ref="bgRef" class="absolute inset-0 pointer-events-none no-scrollbar">
  <!-- bg-1 (верх справа) -->
  <img
    data-parallax data-speed="0.13" data-max="240"
    class="absolute w-[130px] top-[5%] right-[6%] will-change-transform
           sm:w-[460px] sm:top-[2.5%] sm:right-[21%]"
    src="/images/women/bg-1.webp" alt="" loading="eager" decoding="async"
  />

  <!-- bg-2 (верх центр) -->
  <img
    data-parallax data-speed="0.17" data-max="260"
    class="absolute w-[100px] top-[8%] right-[28%] will-change-transform
           sm:w-[320px] sm:top-[9%] sm:right-[44%]"
    src="/images/women/bg-2.webp" alt="" loading="lazy" decoding="async"
  />

  <!-- bg-4 (большое пятно) -->
  <img
    data-parallax data-speed="0.09" data-max="200"
    class="absolute w-[320px] top-[10%] right-[4%] will-change-transform
           sm:w-[880px] sm:top-[11%] sm:right-[33%]"
    src="/images/women/bg-4.webp" alt="" loading="lazy" decoding="async"
  />

  <!-- bg-7 (rotate/flip) -->
  <div
    class="absolute w-[160px] top-[7%] right-[-18%] rotate-[16deg] -scale-y-100
           sm:w-[580px] sm:top-[5.5%] sm:right-[1%] sm:rotate-[20deg]"
  >
    <img
      data-parallax data-speed="0.11" data-max="220"
      class="w-full h-auto will-change-transform"
      src="/images/women/bg-7.webp" alt="" loading="lazy" decoding="async"
    />
  </div>

  <!-- bg-5 (низ справа) -->
  <div
    class="absolute w-[180px] bottom-[12%] right-[-4%] -rotate-[90deg]
           sm:w-[780px] sm:-bottom-[10%] sm:right-[2%] sm:-rotate-[80deg]"
  >
    <img
      data-parallax data-speed="0.08" data-max="180"
      class="w-full h-auto will-change-transform"
      src="/images/women/bg-5.webp" alt="" loading="lazy" decoding="async"
    />
  </div>

  <!-- bg-1 (маленькое справа) -->
  <img
    data-parallax data-speed="0.18" data-max="280"
    class="hidden sm:block absolute w-[180px] top-[18%] right-[-22%] will-change-transform
           sm:w-[300px] sm:top-[16%] sm:-right-[16%]"
    src="/images/women/bg-1.webp" alt="" loading="eager" decoding="async"
  />

  <!-- bg-6 (середина слева) -->
  <img
    data-parallax data-speed="0.12" data-max="240"
    class="absolute w-[120px] top-[54%] left-[80%] rotate-[60deg] will-change-transform
           sm:w-[500px] sm:top-[54%] sm:left-[22%]"
    src="/images/women/bg-6.webp" alt="" loading="lazy" decoding="async"
  />

  <!-- bg-2 (середина справа, rotate) -->
  <div
    class="hidden absolute w-[220px] top-[58%] right-[-26%] rotate-[55deg]
           sm:w-[320px] sm:top-[54%] sm:-right-[16%] sm:rotate-[70deg]"
  >
    <img
      data-parallax data-speed="0.16" data-max="280"
      class="w-full h-auto will-change-transform"
      src="/images/women/bg-2.webp" alt="" loading="lazy" decoding="async"
    />
  </div>

  <!-- bg-1 (низ слева, rotate) -->
  <div
    class="absolute w-[320px] top-[60%] left-[-46%] -rotate-[32deg]
           sm:w-[760px] sm:top-[74%] sm:-left-[32%] sm:-rotate-[40deg]"
  >
    <img
      data-parallax data-speed="0.10" data-max="220"
      class="w-full h-auto will-change-transform"
      src="/images/women/bg-1.webp" alt="" loading="eager" decoding="async"
    />
  </div>

  <!-- bg-3 (лево сверху) -->
  <img
    data-parallax data-speed="0.14" data-max="260"
    class="absolute w-[180px] top-[12%] left-[-8%] will-change-transform
           sm:w-[500px] sm:top-[18%] sm:-left-[16%]"
    src="/images/women/bg-3.webp" alt="" loading="lazy" decoding="async"
  />

  <!-- bg-7 (право низ) -->
  <img
    data-parallax data-speed="0.15" data-max="260"
    class="hidden sm:block absolute w-[240px] top-[70%] right-[-28%] will-change-transform
           sm:w-[380px] sm:top-[68%] sm:-right-[18%]"
    src="/images/women/bg-7.webp" alt="" loading="lazy" decoding="async"
  />
</div>

    <main class="sheet max-w-[1310px] xs-max:px-2 px-2 sm:px-5 xl:px-0 w-full mx-auto relative z-10">
      <!-- Title -->
      <header class="head relative z-10">
        <div class="font-haido text-cur font-bold text-[2.8rem] sm:text-[180px] -tracking-wide -mt-16 sm:-mt-28">{{ heroTitle }}</div>
        <div class="font-haido text-cur font-medium text-[1.5rem] sm:text-[90px] italic -mt-2 sm:-mt-16">{{ heroSubtitle }}</div>
      </header>

      <!-- Hero row -->
      <section class="hero">
        <!-- Фото с «скотчем» -->
        <div class="relative -top-2 sm:-top-16 -left-5 sm:-left-60 scale-[1.6] sm:scale-[1.3] origin-top-left z-0">
          <img :src="heroPhoto" alt="" class="bigPhoto__img" loading="eager" decoding="async" />
        </div>

        <div class="absolute w-[360px] sm:w-[860px] h-[90px] sm:h-[320px] top-[15%] sm:top-[17%] -right-52 sm:-right-[24%] drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]">
          <!-- подложка -->
          <img
            src="/images/women/plain.webp"
            alt=""
            class="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <!-- текст -->
          <p
            class="absolute left-[26px] sm:left-[80px] top-[20px] sm:top-[70px] right-[36px] sm:right-[44px]
                  text-cur text-[11px] sm:text-[36px] leading-[1.15] italic"
          >
            Они меняли науку,<br>
            искусство, историю.<br>
            Но величие измеряется<br>
            не только наградами.
          </p>
        </div>

      </section>


      <!-- ===== Женщины: СЛАЙДЕР КАК БЫЛ ===== -->
      <section
        class="women-carousel"
        :class="{ 'is-hovered': isHovered }"
        @mouseenter="pauseCarousel"
        @mouseleave="resumeCarousel"
      >
        <ClientOnly>
          <Swiper
            class="women-swiper"
            :modules="[Autoplay]"
            :loop="true"
            :slides-per-view="'auto'"
            :space-between="16"
            :speed="9000"
            :autoplay="{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false
            }"
            :allow-touch-move="true"
            :grab-cursor="isHovered"
            :watch-slides-progress="true"
            @swiper="onSwiper"
          >
            <SwiperSlide v-for="(item, i) in slides" :key="i" class="women-slide">
              <div class="women-card">
                <div class="women-photo">
                  <img :src="item.image" :alt="item.name" loading="lazy" decoding="async" />
                </div>
                <div class="flex flex-col">
                  <div class="text-cur font-atziluth text-[24px] sm:text-[40px]">{{ item.name }}</div>
                  <div class="text-cur font-haido text-[12px] sm:text-lg">{{ item.desc }}</div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </ClientOnly>
      </section>

      <!-- Рукописная цитата на ленте -->
      <div class="relative w-full h-[360px] sm:mt-10">
        <img
          src="/images/women/stroke-new.webp"
          alt=""
          class="absolute inset-0 w-full h-full object-cover scale-[1.2] sm:scale-[1.1] origin-top-center"
          loading="lazy"
          decoding="async"
        />
        <p
          class="absolute sm:left-[70px] sm:right-[70px] top-1/2 -translate-y-1/2
                text-cur font-atziluth italic
                text-[20px] sm:text-[70px] leading-[1.05] -rotate-[6deg] -mt-1 w-full"
        >
          {{ handQuote }}
        </p>
      </div>

      <div class="-mt-10 sm:hidden block relative w-[280px] sm:w-[680px] h-[120px] sm:h-[260px] drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]">
          <img
            src="/images/women/plain.webp"
            alt=""
            class="absolute inset-0 -left-36 sm:-left-40 w-full h-full -scale-x-100"
            loading="lazy"
            decoding="async"
          />
          <p
            class="absolute left-[0px] sm:left-[54px] top-[32px] sm:top-[40px] sm:right-[44px]
                  text-cur text-[11px] sm:text-[36px] leading-[1.15] italic whitespace-pre-line flex flex-col gap-2"
          >
            <span>Великие женщины <br>не только в истории</span><span>Они вокруг нас, и ты <br>одна из них!</span>
          </p>
        </div>

      <!-- mid -->
      <section class="relative -mt-20 sm:mt-16 w-full flex items-center justify-between gap-10">
        <div class="hidden sm:block relative w-[380px] sm:w-[660px] h-[120px] sm:h-[320px] drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]">
          <img
            src="/images/women/plain.webp"
            alt=""
            class="absolute inset-0 -left-0 sm:-left-40 w-full h-full -scale-x-100"
            loading="lazy"
            decoding="async"
          />
          <p
            class="absolute left-[0px] sm:left-[54px] top-[32px] sm:top-[58px] sm:right-[44px]
                  text-cur text-[11px] sm:text-[36px] leading-[1.15] italic whitespace-pre-line flex flex-col gap-2"
          >
            <span>Великие женщины <br>не только в истории</span><span>Они вокруг нас, и ты <br>одна из них!</span>
          </p>
        </div>

        <div class="flex-1 flex justify-end w-[200px]">
          <p
            class="max-w-[720px] text-right
                  text-cur font-atziluth italic
                  text-[24px] sm:text-[70px] leading-[1.05] whitespace-pre-line"
          >
            {{ rightHand }}
          </p>
        </div>
      </section>

      <section class="mt-16">
  <!-- КНОПКА -->
  <div class="w-full flex justify-center">
    <button
      type="button"
      class="rounded-full px-12 py-4 sm:min-w-[300px]
            bg-[#F2F1ED]
            text-[#3F4CC8] text-base sm:text-[24px] font-medium
            shadow-[inset_-6px_-6px_12px_rgba(255,255,255,0.85),_14px_16px_22px_rgba(0,0,0,0.14)]
            hover:shadow-[inset_-6px_-6px_12px_rgba(255,255,255,0.9),_16px_20px_30px_rgba(0,0,0,0.18)]
            active:translate-y-[1px]
            transition"
      @click="pickPhrase"
    >
      Узнать о себе
    </button>
  </div>

  <!-- ОТКРЫТКА (ЭТА ЖЕ ОБЛАСТЬ БУДЕТ РЕНДЕРИТЬСЯ В PNG) -->
  <div class="mt-8 w-full flex justify-center">
    <div
  ref="cardRef"
  class="postcard relative w-full max-w-[720px] aspect-square
         drop-shadow-[0_18px_28px_rgba(0,0,0,0.22)]"
>
      <!-- Блок текста в открытке -->
<div class="absolute left-[18%] right-[18%] top-[52%]">
  <!-- фиксируем высоту, чтобы не было прыжков -->
  <div class="relative min-h-[84px] sm:min-h-[120px]">
    <Transition name="fadePhrase" mode="out-in">
      <p
        v-if="selectedPhrase"
        :key="phraseKey"
        class="absolute inset-0
               text-right text-cur font-haido
               text-[16px] sm:text-[28px]
               leading-[1.2] break-words"
      >
        {{ selectedPhrase }}
      </p>
    </Transition>
  </div>
</div>
    </div>
  </div>

  <!-- КНОПКИ ПОСЛЕ ГЕНЕРАЦИИ -->
  <div v-if="selectedPhrase" class="mt-8 flex justify-center gap-4">
    <button
      type="button"
      class="bg-primary text-white px-6 py-3 rounded-full shadow hover:opacity-90 transition disabled:opacity-60"
      :disabled="isSharing"
      @click="shareOrDownload"
    >
      Поделиться
    </button>

    <button
      type="button"
      class="bg-white/80 text-cur px-6 py-3 rounded-full shadow hover:shadow-md transition"
      @click="pickPhrase"
    >
      Ещё раз
    </button>
  </div>

</section>
    </main>
  </div>
</template>

<style scoped>
/* твой существующий CSS без изменений */
.poster{
  width: 100%;
  position:relative;
  min-height:100vh;
  overflow:hidden;
  background:#F2F1ED;
}
.sheet{
  position:relative;
  z-index:2;
  margin:0 auto;
}
.sheet::before{
  content:"";
  position:absolute;
  inset:-20px;
  background:
    radial-gradient(80% 60% at 30% 10%, rgba(0,0,0,.06), transparent 60%),
    radial-gradient(90% 70% at 80% 90%, rgba(0,0,0,.05), transparent 55%),
    repeating-linear-gradient(0deg, rgba(0,0,0,.012) 0 1px, transparent 1px 3px);
  opacity:.35;
  pointer-events:none;
  z-index:-1;
}
.bg{ position:absolute; inset:0; z-index:1; pointer-events:none; }
.bg__p{ position:absolute; width:auto; height:auto; opacity:1; }
.bg__pinkTop{ top:10px; right:30%; width:220px; transform:rotate(4deg); }
.bg__blueTop{ top:110px; right:42%; width:220px; transform:rotate(-6deg); }
.bg__greenMid{ top:430px; left:110px; width:210px; opacity:.9; transform:rotate(2deg); }
.bg__yellowMid{ top:180px; right:36%; width:500px; opacity:.9; transform:rotate(-6deg); }
.bg__pinkBottom{ top:70px; right:14%; width:420px; opacity:.95; transform:rotate(3deg); }
.bg__blueBottom{ bottom:10px; right:-30px; width:240px; opacity:.95; transform:rotate(-2deg); }
.bg__extra{ top:660px; left:0px; width:260px; opacity:.55; }

.hero{
  display:grid;
  grid-template-columns: 1.18fr .82fr;
  gap:12px;
  align-items:start;
}
.bigPhoto__img{ width:100%; display:block; border-radius:3px; }

.women-carousel{
  margin-top: 120px;
  user-select: none;
}
.women-swiper :deep(.swiper-wrapper){
  transition-timing-function: linear !important;
}
.women-carousel .women-swiper{ pointer-events: none; }
.women-carousel.is-hovered .women-swiper{ pointer-events: auto; cursor: grab; }
.women-carousel.is-hovered:active .women-swiper{ cursor: grabbing; }
@media (hover: none){
  .women-carousel .women-swiper{ pointer-events: auto; }
}
.women-slide{ width: 320px; }
@media (min-width: 640px){ .women-slide{ width: 220px; } }
@media (max-width: 640px){ .women-slide{ width: 180px; } }
@media (min-width: 1024px){ .women-slide{ width: 320px; } }
.women-card{ overflow: hidden; transition: transform 220ms ease; }
.women-carousel.is-hovered .women-card{ transform: translateY(-2px); }
.women-photo{ width: 100%; overflow: hidden; }
@media (max-width: 640px){ .women-photo{ width: 180px; } }
.women-photo img{ width: 100%; height: 100%; object-fit: cover; display: block; }

.bottom{ margin-top:12px; position:relative; }
.label{
  position:absolute;
  right:10px;
  top:-10px;
  background:#17b56f;
  color:#fff;
  border-radius:8px;
  padding:6px 10px;
  box-shadow:0 12px 18px rgba(0,0,0,.14);
}
.label__text{ font-weight:900; font-size:12px; }
.card{
  background:rgba(255,255,255,.75);
  border-radius:14px;
  box-shadow:0 18px 28px rgba(0,0,0,.16);
  padding:12px;
  border:1px solid rgba(0,0,0,.06);
}
.card__inner{
  border-radius:12px;
  background:rgba(255,255,255,.88);
  border:1px dashed rgba(0,0,0,.10);
  padding:12px;
  position:relative;
}
.card__inner::before{
  content:"";
  position:absolute;
  inset:0;
  background:url('/images/women/bg-7.webp') no-repeat 12px 10px;
  background-size:110px auto;
  opacity:.35;
  pointer-events:none;
}
.card__title{
  font-size:30px;
  line-height:1;
  font-weight:900;
  font-style:italic;
  color:#1a3ab2;
}
.card__sub{
  margin-top:8px;
  font-size:12px;
  line-height:1.25;
  color:rgba(20,35,85,.92);
  white-space:pre-line;
}
.brand{
  margin-top:10px;
  display:flex;
  gap:8px;
  align-items:flex-end;
}
.brand__logo{ width:56px; height:auto; }
.brand__text{
  font-size:9px;
  line-height:1.15;
  color:rgba(20,35,85,.70);
}

/* мягкое проявление “чернил” */
.ink-reveal {
  filter: blur(0.4px);
  opacity: 0.92;
  animation: inkIn 420ms ease-out both;
}

@keyframes inkIn {
  from { opacity: 0; transform: translateY(6px); filter: blur(2px); }
  to   { opacity: 0.92; transform: translateY(0); filter: blur(0.4px); }
}

/* блик по оверлею */
.shine{
  background: linear-gradient(
    110deg,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.55) 60%,
    rgba(255,255,255,0) 85%
  );
  transform: skewX(-18deg);
  animation: shineMove 1650ms ease-out infinite;
  opacity: 0.8;
}

@keyframes shineMove{
  from { transform: translateX(-30%) skewX(-18deg); }
  to   { transform: translateX(260%) skewX(-18deg); }
}

.fadePhrase-enter-active,
.fadePhrase-leave-active {
  transition: opacity 1220ms ease, transform 1220ms ease, filter 1220ms ease;
}

.fadePhrase-enter-from {
  opacity: 0;
  transform: translateY(10px);
  filter: blur(6px);
}

.fadePhrase-enter-to {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.fadePhrase-leave-from {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

.fadePhrase-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  filter: blur(4px);
}

.capture-mode,
.capture-mode * {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}

.capture-mode .fadePhrase-enter-active,
.capture-mode .fadePhrase-leave-active {
  transition: none !important;
}

.capture-mode .fadePhrase-enter-from,
.capture-mode .fadePhrase-enter-to,
.capture-mode .fadePhrase-leave-from,
.capture-mode .fadePhrase-leave-to {
  opacity: 1 !important;
  transform: none !important;
  filter: none !important;
}

.postcard {
  background-image: url('/images/women/template.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.postcard {
  background-image: url('/images/women/template.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
</style>