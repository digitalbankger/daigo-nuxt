<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  to: string
  image?: string
  imageMobile?: string
  title?: string
  subtitle?: string
  class?: string

  // перенос после слова на мобилке
  mobileBreakAfterWord?: string

  // === СТИЛИ КАК ПЕРЕМЕННЫЕ ===
  contentClass?: string
  titleClass?: string
  subtitleClass?: string
}>(), {
  image: '/images/feb/main-desc.jpg',
  imageMobile: '/images/feb/main-mob.jpg',
  title: 'Потратьте бонусы на любимых!',
  subtitle: 'Премиальные подарочные наборы для самых близких!',
  class: '',
  mobileBreakAfterWord: '',

  contentClass:
    'relative z-[3] flex flex-col items-start justify-end ' +
    'h-[420px] sm:h-[360px] lg:h-[500px] ' +
    'px-5 md:px-10 py-5 md:py-10 gap-2 ' +
    'rounded-2xl sm:rounded-4xl',

  titleClass:
    'text-white font-haido font-bold leading-[1] ' +
    'text-[clamp(1.5rem,4.5vw,4.2rem)]',

  subtitleClass:
    'mt-2 text-white font-haido font-medium leading-snug mb-4 sm:mb-2 ' +
    'text-[clamp(1.05rem,2.2vw,1.875rem)]',
})

const titleLines = computed(() => {
  const t = (props.title || '').trim()
  if (!t) return []
  if (t.includes('\n')) return t.split('\n').map(s => s.trim()).filter(Boolean)
  return [t]
})

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// проверка "буква/цифра" (чтобы не матчить "о насущном")
function isWordChar(ch?: string) {
  if (!ch) return false
  return /[0-9A-Za-zА-Яа-яЁё]/.test(ch)
}

const titleHtml = computed(() => {
  const t = (props.title || '').trim()
  if (!t) return ''
  if (t.includes('\n')) return ''

  // ====== НОВОЕ: "о нас" всегда второй строкой + italic ======
  const phrase = 'о себе'
  const lower = t.toLowerCase()
  const idx = lower.indexOf(phrase)

  if (idx !== -1) {
    const afterChar = t[idx + phrase.length]
    // если дальше идёт буква/цифра — это типа "о насущном", пропускаем
    if (!isWordChar(afterChar)) {
      const before = t
        .slice(0, idx)
        .trim()
        // ВАЖНО: исправленный регэксп (дефис экранирован)
        .replace(/[—–:\-]\s*$/g, '')
        .trim()

      const originalPhrase = t.slice(idx, idx + phrase.length) // сохраняем регистр как в строке
      const after = t.slice(idx + phrase.length).trim()

      const secondLine = `<span class="italic font-medium">${escapeHtml(originalPhrase)}</span>${after ? ` ${escapeHtml(after)}` : ''}`

      if (!before) return secondLine
      return `${escapeHtml(before)}<br>${secondLine}`
    }
  }
  // ====== /НОВОЕ ======

  // старая логика переноса на мобилке (не ломаем)
  if (props.mobileBreakAfterWord && t.startsWith(props.mobileBreakAfterWord + ' ')) {
    const rest = t.replace(new RegExp(`^${escapeRegExp(props.mobileBreakAfterWord)}\\s+`), '')
    return `${escapeHtml(props.mobileBreakAfterWord)}<span class="inline sm:hidden"><br></span>${escapeHtml(rest)}`
  }

  return ''
})

const sectionClass = computed(() => ['w-full mt-0 rounded-2xl sm:rounded-3xl', props.class].join(' '))
const linkClass = computed(() => 'relative block w-full overflow-hidden rounded-2xl sm:rounded-3xl')
const pictureClass = computed(() => 'absolute inset-0 z-0 rounded-2xl sm:rounded-3xl')
const contentClass = computed(() => props.contentClass)
const titleClass = computed(() => props.titleClass)
const subtitleClass = computed(() => props.subtitleClass)
</script>

<template>
  <section :class="sectionClass" aria-label="Промо-баннер">
    <NuxtLink :to="props.to" :class="linkClass">
      <picture :class="pictureClass" aria-hidden="true">
        <source media="(min-width: 768px)" :srcset="props.image" />
        <img
          :src="props.imageMobile || props.image"
          alt=""
          class="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
      </picture>

      <div :class="contentClass">
        <h2 v-if="(props.title || '').includes('\n')" :class="titleClass">
          <template v-for="(line, idx) in titleLines" :key="idx">
            <span>{{ line }}</span>
            <br v-if="idx < titleLines.length - 1" />
          </template>
        </h2>

        <h2
          v-else
          :class="titleClass"
          v-html="titleHtml || (props.title || '')"
        />

        <p v-if="props.subtitle" :class="[subtitleClass, 'whitespace-pre-line']">
          {{ props.subtitle }}
        </p>

        <a
          v-if="props.subtitle"
          :href="props.to"
          class="mt-6 border border-white h-[54px] w-[310px] flex items-center justify-center rounded-lg py-2 px-6 text-xl text-white hover:bg-white hover:text-black transition-colors duration-300"
        >Пройти квиз
        </a>
      </div>
    </NuxtLink>
  </section>
</template>