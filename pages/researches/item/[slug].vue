<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { defineAsyncComponent } from 'vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import YouWillLearn from '~/components/articles/YouWillLearn.vue'
import Button from '~/components/ui/Button.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import { useResearchStore } from '~/stores/researchStore'
import type { ArticleDetail } from '~/types/articles'
import UiInput from '~/components/ui/UiInput.vue'

definePageMeta({ layout: 'main' })

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const store = useResearchStore()
const { currentResearch } = storeToRefs(store)

// SSR fetch (берём по slug)
const { data: research, error } = await useAsyncData<ArticleDetail>(`research:${slug.value}`, () =>
  store.fetchResearchById(slug.value).then(() => store.currentResearch as ArticleDetail)
)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Исследование не найдено' })
}

// SEO
const title = research.value?.title ?? 'Исследование'
const description = research.value?.description ?? research.value?.preview ?? ''
const cover = research.value?.cover || research.value?.image || '/og-default.jpg'
const canonical = `https://daigo.ru/researches/item/${slug.value}`

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogType: 'article',
  ogImage: cover,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })

// schema.org Article + Breadcrumbs
const breadcrumbs = (research.value?.breadcrumbs || []).map((b, i) => ({
  '@type': 'ListItem', position: i + 1, name: b.label, item: `https://example.com${b.to}`
}))
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  image: [cover],
  datePublished: research.value?.date,
  author: research.value?.author?.name ? { '@type': 'Person', name: research.value.author.name } : undefined,
  description
}
useHead({
  script: [
    { type: 'application/ld+json', children: JSON.stringify({ '@context':'https://schema.org','@type':'BreadcrumbList', itemListElement: breadcrumbs }) },
    { type: 'application/ld+json', children: JSON.stringify(articleJsonLd) }
  ]
})

// якорь к комментариям
const goToComments = () => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// шаринг
const shareUrl = computed(() => encodeURIComponent(canonical))
const shareTitle = computed(() => encodeURIComponent(title))
const shareLinks = computed(() => ({
  whatsapp: `https://wa.me/?text=${shareTitle.value}%20${shareUrl.value}`,
  telegram: `https://t.me/share/url?url=${shareUrl.value}&text=${shareTitle.value}`,
  viber:   `viber://forward?text=${shareTitle.value}%20${shareUrl.value}`,
  vk:      `https://vk.com/share.php?url=${shareUrl.value}&title=${shareTitle.value}`,
  ok:      `https://connect.ok.ru/offer?url=${shareUrl.value}&title=${shareTitle.value}`
}))
const shareNative = async () => {
  if (navigator.share) { try { await navigator.share({ title, text: description, url: canonical }) } catch {} }
}

const socialIcon = (type?: string) => type === 'tg' ? '/icons/social/telegram.svg'
  : type === 'vk' ? '/icons/social/vk.svg'
  : '/icons/social/dzen.svg'

// статичный топ-5 (как у статьи)
const topFive = [
  { id: 3, slug: 'sindrom-puteshestvennika', title: 'Синдром путешественника', image: '/images/articles/th.jpg', date: '2025-05-31', time: 6 },
  { id: 2, slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu', title: 'Как подготовить кожу к пляжному сезону?', image: '/images/articles/sec.jpg', date: '2025-06-24', time: 10 },
  { id: 1, slug: 'vse-o-koronavirusah', title: 'Все о коронавирусах', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8 },
  { id: 4, slug: 'vse-o-koronavirusah-2', title: 'Все о коронавирусах (2)', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8  },
  { id: 5, slug: 'vse-o-koronavirusah-3', title: 'Все о коронавирусах (3)', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8 }
]
const list = topFive.map(i => ({ id: i.id, slug: i.slug, title: i.title, date: i.date, time: i.time }))
const toUrl = (it: { slug: string }) => `/articles/${it.slug}`

// скачать все файлы (как у статьи)
function downloadAllFiles() {
  const files = research.value?.materials?.files || []
  files.forEach(file => {
    const a = document.createElement('a')
    a.href = file.url; a.download = file.title; document.body.appendChild(a); a.click(); document.body.removeChild(a)
  })
}

// клиенсткие виджеты
const ClientFAQ = defineAsyncComponent(() => import('~/components/FAQ/ClientFAQ.vue'))
const ClientComments = defineAsyncComponent(() => import('~/components/Comments/ClientComments.vue'))


const email = ref('')
const loading = ref(false)
const success = ref(false)
const emailErr = ref<string | boolean>('')

const emailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)
function validateEmail() {
  if (!email.value.trim()) { emailErr.value = 'Введите e-mail'; return false }
  if (!emailValid.value)   { emailErr.value = 'Некорректный e-mail'; return false }
  emailErr.value = ''
  return true
}
const sleep = (ms:number) => new Promise(r => setTimeout(r, ms))
async function submitSubscribe() {
  if (loading.value) return
  if (!validateEmail()) return
  loading.value = true
  try {
    await sleep(900)
    success.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseContainer>
    <div class="container mx-auto py-2 lg:py-4">
      <!-- breadcrumbs -->
      <nav aria-label="Хлебные крошки" class="mb-4 text-base text-black/50">
        <ul class="flex flex-wrap items-center gap-1">
          <li v-for="(bc, i) in research?.breadcrumbs" :key="bc.to" class="flex items-center gap-2">
            <NuxtLink :to="bc.to" class="hover:text-black underline-offset-4 hover:underline">{{ bc.label }}</NuxtLink>
            <span v-if="i < (research?.breadcrumbs?.length || 0) - 1">/</span>
          </li>
        </ul>
      </nav>
 
      <!-- title + мета -->
      <h1 class="text-[22px] sm:text-[46px] lg:text-[60px] font-medium leading-tight">{{ research?.title }}</h1>
      <div class="flex flex-col md:flex-row gap-8 justify-between my-16">
        <div 
          v-if="research?.author"
          class="w-full md:w-1/2 flex flex-col sm:flex-row gap-4 sm:gap-8"
        >
          <img :src="research?.author?.avatarUrl" class="w-1/3 "/>
          <div class="flex flex-col">
            <p class="text-lg text-black/50">{{ research!.author!.position }}</p>
            <p class="mt-1 text-2xl font-medium">{{ research!.author!.name }}</p>
            <p v-if="research!.author!.about" class="my-2 text-base">
              {{ research!.author!.about }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-6" :class="research?.author ? 'w-full md:w-1/2' : 'w-full'">
          <div class="flex flex-wrap items-center gap-6 text-black sm:ms-auto">
            <div class="text-sm md:text-2xl flex items-center gap-2">
              <img src="/icons/publications/calendar.svg" class="w-4 md:w-5"/><span>{{ new Date(research?.date || '').toLocaleDateString('ru-RU') }}</span>
            </div>
            <div class="text-sm md:text-2xl flex items-center gap-2">
              <img src="/icons/publications/clock.svg" class="w-4 md:w-5"/><span aria-label="Время чтения">{{ research?.time }} мин</span>
            </div>
            <div class="text-sm md:text-2xl flex items-center gap-2">
              <img src="/icons/publications/ye.svg" class="w-4 md:w-5"/><span aria-label="Просмотры">{{ research?.views }}</span>
            </div>
            <div class="text-sm md:text-2xl flex items-center gap-2">
              <img src="/icons/publications/comment.svg" class="w-4 md:w-5"/><span aria-label="Комментарии">{{ research?.comments }}</span>
            </div>
          </div>

          <div class="flex gap-8 ms-auto">
            <button type="button" class="text-sm md:text-2xl flex items-center gap-2" @click="goToComments">
              <img src="/icons/publications/comment.svg" class="w-5"/><span>Комментарии</span>
            </button>
            <button type="button" class="text-sm md:text-2xl flex items-center gap-2" @click="shareNative">
              <img src="/icons/publications/share.svg" class="w-5"/><span class="text-[#FF64E7]">Поделиться</span>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- main -->
        <main class="lg:col-span-8 space-y-8">
          <!-- cover -->
          <img :src="research?.cover || research?.image" :alt="research?.title || ''" format="webp" quality="80"
            loading="lazy" decoding="async" class="w-full rounded-2xl object-cover h-[200px] sm:h-[460px]" />

          <!-- Вы узнаете -->
          <YouWillLearn :key="slug" :container-ids="['research-top','research-bottom']" />

          <!-- top content -->
          <section v-if="research?.contentTop" id="research-top" class="prose max-w-none prose-img:rounded-xl">
            <div v-html="research?.contentTop" />
          </section>

          <!-- Полезные материалы -->
          <section v-if="research?.materials" class="mt-12 border-y border-black/10 py-6 md:py-8">
            <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              <div class="w-full md:w-8/12">
                <h2 class="text-product leading-tight font-medium">Полезные материалы</h2>
                <div v-if="research!.materials!.text" class="text-xl mt-3 text-black" v-html="research!.materials!.text" />
                <ul class="mt-5 space-y-3">
                  <li v-for="file in research!.materials!.files" :key="file.id" class="flex items-start gap-4">
                    <img src="/icons/file.svg" class="w-5 h-5 flex-shrink-0" />
                    <p class="text-xl text-black">{{ file.title }}</p>
                  </li>
                </ul>
                <Button v-if="research!.materials!.files?.length" class="mt-6" @click="downloadAllFiles">Скачать все материалы</Button>
              </div>

              <div v-if="research!.materials!.specialist" class="w-full md:w-4/12 flex md:justify-end">
                <div class="w-full md:w-auto flex flex-col items-start gap-5">
                  <img :src="research!.materials!.specialist!.avatarUrl" alt="" width="96" height="96"
                    class="h-32 w-32 rounded-full object-cover" loading="lazy" decoding="async" />
                  <div class="min-w-0">
                    <p class="text-base text-black/50">{{ research!.materials!.specialist!.position }}</p>
                    <p class="mt-1 text-xl font-medium">{{ research!.materials!.specialist!.name }}</p>
                    <p v-if="research!.materials!.specialist!.description" class="my-2 text-sm">
                      {{ research!.materials!.specialist!.description }}
                    </p>
                    <div v-if="research!.materials!.specialist!.social?.length" class="mt-6 flex items-center gap-4">
                      <NuxtLink v-for="s in research!.materials!.specialist!.social" :key="s.url" :to="s.url" target="_blank" rel="noopener"
                        class="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10 transition" :aria-label="s.type">
                        <img :src="socialIcon(s.type)" :alt="s.type" class="h-8 w-8" />
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- bottom content -->
          <section v-if="research?.contentBottom" id="research-bottom" class="prose max-w-none mt-12 prose-img:rounded-xl">
            <div v-html="research?.contentBottom" />
          </section>

          <!-- Топ 5 -->
          <section class="mt-12">
            <h2 class="text-xl md:text-product font-medium">Топ 5 популярных статей</h2>
            <ul class="mt-8 space-y-4 list-disc pl-6">
              <li v-for="i in list" :key="i.id" class="marker:text-primary marker:font-semibold md:marker:text-2xl">
                <NuxtLink :to="toUrl(i)" class="text-sm md:text-2xl text-primary hover:border-b hover:border-primary transition-colors duration-300">
                  {{ i.title }}
                </NuxtLink>
              </li>
            </ul>
          </section>

          <!-- FAQ (как заглушка) -->
          <section class="mt-16 flex flex-col gap-6">
            <h2 class="text-xl md:text-product font-medium">Часто задаваемые вопросы</h2>
            <div class="w-full flex flex-col">
              <AccordionItem title="Что такое коэнзим Q10?">Антиоксидант, участвующий в выработке энергии…</AccordionItem>
              <AccordionItem title="Чем полезен Tamotsu?">Улучшает память и когнитивные функции…</AccordionItem>
              <AccordionItem title="Как хранить Tamotsu?">В сухом месте, при температуре до 25°C…</AccordionItem>
              <AccordionItem title="Где производят Tamotsu?">В Японии, Хоккайдо, по стандарту GMP.</AccordionItem>
            </div>
          </section>

          <!-- Понравилось? -->
          <section class="md:w-5/12 mt-12 py-5">
            <hr class="border-black/10 mb-6 w-5/6" />
            <h2 class="text-xl md:text-cardhead font-medium !leading-tight">Понравилось исследование?</h2>
            <p class="mt-2 text-sm text-lg">Поделитесь с друзьями в социальных сетях</p>
            <div class="mt-4 flex items-center gap-4">
              <a :href="shareLinks.whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp"><img src="/icons/social/whatsapp.svg" class="w-7 h-7" /></a>
              <a :href="shareLinks.telegram" target="_blank" rel="noopener" aria-label="Telegram"><img src="/icons/social/telegram.svg" class="w-7 h-7" /></a>
              <a :href="shareLinks.viber" aria-label="Viber"><img src="/icons/social/viber.svg" class="w-7 h-7" /></a>
              <a :href="shareLinks.vk" target="_blank" rel="noopener" aria-label="VK"><img src="/icons/social/vk.svg" class="w-7 h-7" /></a>
              <a :href="shareLinks.ok" target="_blank" rel="noopener" aria-label="OK"><img src="/icons/social/ok.svg" class="w-7 h-7" /></a>
              <button type="button" class="sr-only" @click="shareNative" aria-label="Поделиться" />
            </div>
          </section>

          <!-- Комментарии -->
          <section id="comments" class="mt-12">
            <ClientComments :slug="slug" :can-post="false" />
          </section>
        </main>

        <!-- sidebar -->
        <aside class="lg:col-span-4">
          <!-- <div v-if="research?.tags?.length">
            <h3 class="text-cardhead font-medium">Теги</h3>
            <div class="mt-3 flex flex-wrap gap-3">
              <NuxtLink v-for="tag in research!.tags!" :key="tag.id" :to="`/articles?napravlennost=${tag.slug}`"
                class="px-3 py-2 rounded-lg bg-hoverbtn hover:bg-gray-100 text-base">
                {{ tag.label }}
              </NuxtLink>
            </div>
          </div> -->
          <div v-if="research?.recommended?.length" class="">
            <h3 class="text-xl md:text-cardhead font-medium">Больше исследований</h3>
            <ul class="mt-4 space-y-4">
              <li v-for="it in research.recommended" :key="it.id" class="flex gap-4">
                <div class="w-5/12"><img :src="it.image" :alt="it.title" class="w-full rounded-xl object-cover" loading="lazy" decoding="async" /></div>
                <div class="w-7/12"><NuxtLink :to="`/articles/${it.slug}`" class="text-xl line-clamp-4">{{ it.title }}</NuxtLink></div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
<section
  class="relative overflow-hidden w-full flex items-center justify-center rounded-2xl md:min-h-[415px] bg-primary bg-no-repeat px-6 md:px-6 lg:px-10 py-8 md:py-8 text-white mt-16"
>
  <img src="/images/subscription-product.png" alt="" class="absolute z-0 right-0 hidden md:block" />
  <img src="/images/subscription-left.png" alt="" class="absolute z-0 left-0 hidden md:block" />

  <div class="relative z-10 md:w-full flex flex-col gap-4 items-start justify-center my-auto">
    <h2 class="font-medium leading-tight text-3xl md:text-slider">
      Подпишитесь на <span class="ms-1 rounded-md px-3 py-1 text-black bg-[#C3FF00]">рассылку</span>
    </h2>

    <p class="text-sm md:text-2xl leading-5 md:leading-10 text-left max-w-[90%] md:max-w-[60%] mb-1">
      Оставьте свою электронную почту и получайте дайджест полезных материалов раз в неделю, а также узнавайте первыми о новых акциях и предложениях.
    </p>

    <!-- успех -->
    <transition name="fade">
      <div v-if="success" class="mt-2 bg-white/20 rounded-lg px-4 py-3 backdrop-blur">
        <p class="text-white text-base md:text-lg">🎉 Спасибо! Подписка успешно оформлена.</p>
        <p class="text-white/80 text-sm">(сейчас это тестовый успех)</p>
      </div>
    </transition>

    <!-- форма (без v-else, чтобы не было ошибки «v-else без v-if» ) -->
    <form
      v-if="!success"
      class="mt-2 flex w-full max-w-xl gap-3 flex-col sm:flex-row"
      @submit.prevent="submitSubscribe"
      novalidate
    >
      <UiInput
        v-model="email"
        type="email"
        placeholder="Ваш e-mail"
        autocomplete="email"
        background="!bg-white"
        class="!text-black/70 placeholder:text-black/70 !border-0"
        :error="emailErr"
        @enter="submitSubscribe"
      />
      <Button
        variant="solid"
        class="!text-black text-lg bg-white hover:bg-gray-100 w-full sm:w-60"
        type="submit"
        :disabled="loading"
      >
        {{ loading ? 'Отправка…' : 'Отправить' }}
      </Button>
    </form>

    <p v-if="!success" class="text-xs md:text-sm text-white/80 mt-1">
      Нажимая «Отправить», вы соглашаетесь с условиями обработки персональных данных.
    </p>
  </div>
</section>

    </div>
  </BaseContainer>
</template>

<style scoped>
.btn { @apply inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition; }
.btn-primary { @apply bg-black text-white hover:bg-gray-800; }
.btn-outline { @apply border border-gray-300 hover:bg-gray-100; }
.btn-sm { @apply px-3 py-1.5 text-xs; }
.prose :where(img) { @apply my-4; }
</style>
