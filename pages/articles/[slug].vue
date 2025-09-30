<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useArticlesStore } from '~/stores/articlesStore'
import type { ArticleDetail, ArticleComment } from '~/types/articles'
import { defineAsyncComponent } from 'vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import YouWillLearn from '~/components/articles/YouWillLearn.vue'
import Button from '~/components/ui/Button.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import RecommendedCarousel from '~/components/articles/RecommendedCarousel.vue'
import PopularArticles from '~/components/articles/PopularArticles.vue'

definePageMeta({ layout: 'main' }) 

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const articles = useArticlesStore()
const { detailBySlug, loading, errors } = storeToRefs(articles)

const ClientFAQ = defineAsyncComponent(() => import('../../components/FAQ/ClientFAQ.vue'))
const ClientComments = defineAsyncComponent(() => import('../../components/Comments/ClientComments.vue'))

// SSR fetch
const { data: article, error } = await useAsyncData<ArticleDetail>(`article:${slug.value}`, async () => {
  return await articles.fetchArticle(slug.value)
})

// параллельные виджеты (SSR)
const [related, faq, top, bundled] = await Promise.all([
  articles.fetchRelated(slug.value),
  articles.fetchFaq(slug.value),
  articles.fetchTop(),
  articles.fetchBundledProducts(slug.value)
])

if (error.value) {
  // передадим нуксту корректный статус
  throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' })
}

// SEO
const title = article.value?.title ?? 'Статья'
const description = article.value?.description ?? article.value?.preview ?? ''
const cover = article.value?.cover || article.value?.image || '/og-default.jpg'
const canonical = `https://example.com/articles/${slug.value}`

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
useHead({
  link: [{ rel: 'canonical', href: canonical }]
})

// schema.org Article + Breadcrumbs (JSON-LD)
const breadcrumbs = (article.value?.breadcrumbs || []).map((b, idx) => ({
  '@type': 'ListItem',
  position: idx + 1,
  name: b.label,
  item: `https://example.com${b.to}`
}))
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  image: [cover],
  datePublished: article.value?.date,
  author: article.value?.author?.name ? { '@type': 'Person', name: article.value.author.name } : undefined,
  description
}
useHead({
  script: [
    { type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs }) },
    { type: 'application/ld+json', children: JSON.stringify(articleJsonLd) }
  ]
})

// anchor to comments
const goToComments = () => {
  const el = document.getElementById('comments')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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
  const data = { title, text: description, url: canonical }
  if (navigator.share) {
    try { await navigator.share(data) } catch {}
  }
}

const socialIcon = (type?: string) => {
  switch (type) {
    case 'tg': return '/icons/social/telegram.svg'
    case 'vk': return '/icons/social/vk.svg'
    default: return '/icons/social/dzen.svg'
  }
}

const topFive = [
  { id: 3, slug: 'sindrom-puteshestvennika', title: 'Синдром путешественника', image: '/images/articles/th.jpg', date: '2025-05-31', time: 6 },
  { id: 2, slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu', title: 'Как подготовить кожу к пляжному сезону?', image: '/images/articles/sec.jpg', date: '2025-06-24', time: 10 },
  { id: 1, slug: 'vse-o-koronavirusah', title: 'Все о коронавирусах', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8 },
  { id: 4, slug: 'vse-o-koronavirusah', title: 'Все о коронавирусах', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8  },
  { id: 5, slug: 'vse-o-koronavirusah', title: 'Все о коронавирусах', image: '/images/articles/one.jpg', date: '2025-07-15', time: 8 }
]

function toUrl(article: { slug: string, title: string }) {
  return `/articles/${article.slug}`
}

const list = topFive.map((item, index) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  date: item.date,
  time: item.time
}))

const downloadAllFiles = () => {
  const files = article.value?.materials?.files || []
  if (files.length === 0) return

  files.forEach(file => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}
</script>

<template>
  <BaseContainer >
    <div class="container mx-auto py-2 lg:py-4">
      <!-- breadcrumbs -->
      <nav aria-label="Хлебные крошки" class="mb-4 text-sm md:text-base text-black/50">
        <ul class="flex flex-wrap items-center gap-1">
          <li v-for="(bc, i) in article?.breadcrumbs" :key="bc.to" class="flex items-center gap-2">
            <NuxtLink :to="bc.to" class="hover:text-black underline-offset-4 hover:underline">{{ bc.label }}</NuxtLink>
            <span v-if="i < (article?.breadcrumbs?.length || 0) - 1">/</span>
          </li>
        </ul>
      </nav>

      <!-- title -->
      <h1 class="text-3xl md:text-head font-medium leading-tight">{{ article?.title }}</h1>
      <div class="mt-6 md:mt-8 flex flex-wrap items-center gap-3 md:gap-6 text-black">
            <div class="text-sm md:text-2xl flex flex-row items-center gap-2">
              <img src="/icons/publications/calendar.svg" class="w-4 md:w-5"/>
              <span>{{ new Date(article?.date || '').toLocaleDateString('ru-RU') }}</span>
            </div>
          
            <div class="text-sm md:text-2xl flex flex-row items-center gap-2">
              <img src="/icons/publications/clock.svg" class="w-4 md:w-5"/>
              <span aria-label="Время чтения">{{ article?.time }} мин</span>
            </div>
            
            <div class="text-sm md:text-2xl flex flex-row items-center gap-2">
              <img src="/icons/publications/ye.svg" class="w-5 md:w-6"/>
              <span aria-label="Просмотры">{{ article?.views }}</span>
            </div>
            
            <div class="text-sm md:text-2xl flex flex-row items-center gap-2">
              <img src="/icons/publications/comment.svg" class="w-4 md:w-5"/>
              <span aria-label="Комментарии">{{ article?.comments }}</span>
            </div>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- main -->
        <main class="lg:col-span-8 space-y-8">

          <!-- cover -->
          <div class="">
            <nuxt-img
              :src="article?.cover || article?.image"
              :alt="article?.title || ''"
              format="webp"
              quality="80"
              loading="lazy"
              decoding="async"
              class="w-full rounded-2xl object-cover"
            />
          </div>

          <!-- actions -->
          <div class="mt-4 flex gap-8">
            <div
             class="text-sm md:text-2xl flex flex-row items-center gap-2"
             @click="goToComments"
            >
              <img src="/icons/publications/comment.svg" class="w-5"/>
              <span aria-label="Комментарии">Комментарии</span>
            </div>
            <div
             class="text-sm md:text-2xl flex flex-row items-center gap-2"
             @click="shareNative"
            >
              <img src="/icons/publications/share.svg" class="w-5"/>
              <span class="text-[#FF64E7]" aria-label="Комментарии">Поделиться</span>
            </div>
          </div>

          <!-- теги mobile -->
          <div v-if="article?.tags?.length" class="block md:hidden">
            <h3 class="text-xl md:text-cardhead font-medium">Теги</h3>
            <div class="mt-3 flex flex-wrap gap-2 md:gap-3">
              <NuxtLink
                v-for="tag in article!.tags!"
                :key="tag.id"
                :to="`/articles?napravlennost=${tag.slug}`"
                class="px-2 md:px-3 py-2 rounded-lg bg-hoverbtn hover:bg-gray-100 text-sm md:text-base"
              >
                {{ tag.label }}
              </NuxtLink>
            </div>
          </div>

          <YouWillLearn :key="slug" :container-ids="['article-top','article-bottom']" class="py-0 md:py-6"/>

          <!-- content top -->
          <section 
            v-if="article?.contentTop" 
            class="prose max-w-none prose-img:rounded-xl"
            id="article-top"
          >
            <div v-html="article?.contentTop" />
          </section>

          <!-- Полезные материалы -->
          <section
            v-if="article?.materials"
            class="mt-12 border-y border-black/10 py-6 md:py-8"
          >
            <div class="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              <!-- ЛЕВАЯ КОЛОНКА: материалы -->
              <div class="w-full md:w-8/12">
                <h2 class="text-xl md:text-product leading-tight font-medium">
                  {{ article!.materials!.title }}
                </h2>

                <div v-if="article!.materials!.text" class="text-sm md:text-xl mt-3 text-black" v-html="article!.materials!.text">
                </div>

                <!-- список файлов без индивидуальных кнопок, с синими маркерами -->
                <ul class="mt-5 space-y-3">
                  <li
                    v-for="file in article!.materials!.files"
                    :key="file.id"
                    class="flex items-start gap-4"
                  >
                    <img src="/icons/file.svg" class="w-5 h-5 flex-shrink-0" />

                    <div class="min-w-0">
                      <p class="text-base md:text-xl text-black">
                        {{ file.title }}
                      </p>
                    </div>
                  </li>
                </ul>

                <Button
                  variant="solid"
                  v-if="article!.materials!.files?.length"
                  class="mt-6 w-full md:!w-60 hidden md:flex"
                  @click="downloadAllFiles"
                >
                  Скачать все материалы
                </Button>
              </div>

              <!-- ПРАВАЯ КОЛОНКА: специалист -->
              <div v-if="article!.materials!.specialist" class="w-full md:w-4/12 flex md:justify-end">
                <div class="w-full md:w-auto flex flex-row md:flex-col items-start gap-3 md:gap-5">
                  <nuxt-img
                    :src="article!.materials!.specialist!.avatarUrl"
                    alt=""
                    width="96"
                    height="96"
                    class="h-24 md:h-32 w-24 md:w-32 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="min-w-0">
                    <p class="text-xs md:text-base text-black/50"> {{ article!.materials!.specialist!.position }} </p>
                    <p class="mt-1 text-sm md:text-xl font-medium"> {{ article!.materials!.specialist!.name }} </p>
                    <p
                      v-if="article!.materials!.specialist!.description"
                      class="my-2 text-sm hidden md:block"
                    >
                      {{ article!.materials!.specialist!.description }}
                    </p>

                    <div
                      v-if="article!.materials!.specialist!.social?.length"
                      class="mt-3 md:mt-6 flex items-center gap-4"
                    >
                      <NuxtLink
                        v-for="s in article!.materials!.specialist!.social"
                        :key="s.url"
                        :to="s.url"
                        target="_blank"
                        rel="noopener"
                        class="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10 transition"
                        :aria-label="s.type"
                      >
                        <img :src="socialIcon(s.type)" :alt="s.type" class="h-8 w-8" />
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
              <p
                v-if="article!.materials!.specialist!.description"
                class="m-0 text-sm block md:hidden"
              >
                {{ article!.materials!.specialist!.description }}
              </p>
              <Button
                  variant="solid"
                  v-if="article!.materials!.files?.length"
                  class="mt-0 w-full md:!w-60 flex md:hidden"
                  @click="downloadAllFiles"
                >
                  Скачать все материалы
              </Button>
            </div>
          </section>


          <!-- content bottom -->
          <section 
            v-if="article?.contentBottom" 
            class="prose max-w-none mt-12 prose-img:rounded-xl"
            id="article-bottom">
            <div v-html="article?.contentBottom" />
          </section>

          <!-- Топ 5 -->
          <section class="mt-12 py-0 md:py-6">
            <h2 class="text-xl md:text-product font-medium">Топ 5 популярных статей</h2>
            <div class="mt-0 md:mt-4 gap-6">
              <ul  class="mt-4 md:mt-8 space-y-2 md:space-y-4 list-disc pl-4 md:pl-6">
                <li
                  v-for="i in list"
                  :key="i.id"
                  class="marker:text-primary marker:font-semibold md:marker:text-2xl"
                >
                  <NuxtLink
                    :to="toUrl(i)"
                    class="text-sm md:text-2xl text-primary hover:border-b hover:border-primary transition-colors duration-300"
                  >
                    {{ i.title }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </section>    

          <!-- FAQ (клиентский) -->
          <!-- <section v-if="faq?.length" class="mt-12">
            <h2 class="text-2xl font-semibold">Часто задаваемые вопросы</h2>
            <ClientFAQ :items="faq" />
          </section> -->
          <section class="mt-16 flex flex-col gap-6">
              <h2 class="text-xl md:text-product font-medium">Часто задаваемые вопросы</h2>
              <div class="w-full flex flex-col">
                  <AccordionItem title="Что такое коэнзим Q10?">
                      Это антиоксидант, участвующий в выработке энергии в клетках. Поддерживает сердечно-сосудистую систему.
                  </AccordionItem>
                  <AccordionItem title="Чем полезен Tamotsu?">
                      Улучшает память, когнитивные функции и поддерживает работу мозга.
                  </AccordionItem>
                  <AccordionItem title="Как хранить Tamotsu?">
                      В сухом месте, при температуре до 25°C, вдали от света.
                  </AccordionItem>
                  <AccordionItem title="Какая польза от Tamotsu для мозга?">
                      Защищает нейроны, улучшает связь между клетками, снижает возрастные изменения.
                  </AccordionItem>
                  <AccordionItem title="Где производят Tamotsu?">
                      В Японии, Хоккайдо, по стандарту GMP.
                  </AccordionItem>
              </div>
          </section>

          <RecommendedCarousel
            v-if="article?.recommended?.length"
            :items="article!.recommended"
            class="md:hidden"
          />

          <!-- Понравилась статья? -->
          <section class="md:w-5/12 mt-12 py-5">
            <hr class="border-black/10 mb-6 w-5/6" />
            <h2 class="text-xl md:text-cardhead font-medium !leading-tight">Понравилась статья?</h2>
            <p class="mt-2 text-sm text-lg">Поделитесь статьёй с друзьями в социальных сетях</p>

            <div class="mt-4 flex items-center gap-4">
              <a
                :href="shareLinks.whatsapp"
                target="_blank" rel="noopener"
                aria-label="Поделиться в WhatsApp"
                class="inline-flex"
              >
                <img src="/icons/social/whatsapp.svg" alt="" class="w-7 h-7" />
              </a>
              <a
                :href="shareLinks.telegram"
                target="_blank" rel="noopener"
                aria-label="Поделиться в Telegram"
                class="inline-flex"
              >
                <img src="/icons/social/telegram.svg" alt="" class="w-7 h-7" />
              </a>
              <a
                :href="shareLinks.viber"
                aria-label="Поделиться в Viber"
                class="inline-flex"
              >
                <img src="/icons/social/viber.svg" alt="" class="w-7 h-7" />
              </a>
              <a
                :href="shareLinks.vk"
                target="_blank" rel="noopener"
                aria-label="Поделиться во ВКонтакте"
                class="inline-flex"
              >
                <img src="/icons/social/vk.svg" alt="" class="w-7 h-7" />
              </a>
              <a
                :href="shareLinks.ok"
                target="_blank" rel="noopener"
                aria-label="Поделиться в Одноклассниках"
                class="inline-flex"
              >
                <img src="/icons/social/ok.svg" alt="" class="w-7 h-7" />
              </a>

              <button
                type="button"
                class="sr-only"
                @click="shareNative"
                aria-label="Поделиться"
              />
            </div>
          </section>

          <!-- Комментарии -->
          <section id="comments" class="mt-12">
            <ClientComments :slug="slug" :can-post="false" />
          </section>

        </main>

        <!-- sidebar -->
        <aside class="lg:col-span-4">
          <!-- теги -->
          <div v-if="article?.tags?.length" class="hidden md:block">
            <h3 class="text-cardhead font-medium">Теги</h3>
            <div class="mt-3 flex flex-wrap gap-3">
              <NuxtLink
                v-for="tag in article!.tags!"
                :key="tag.id"
                :to="`/articles?napravlennost=${tag.slug}`"
                class="px-3 py-2 rounded-lg bg-hoverbtn hover:bg-gray-100 text-base"
              >
                {{ tag.label }}
              </NuxtLink>
            </div>
          </div>

          <!-- рекомендованные -->
          <div v-if="article?.recommended?.length" class="mt-12 hidden md:block">
            <h3 class="text-cardhead font-medium">Рекомендации для вас</h3>
            <ul class="mt-3 space-y-4">
              <li v-for="it in article.recommended" :key="it.id" class="flex gap-4">
                <div class="w-5/12">
                  <nuxt-img :src="it.image" :alt="it.title" class="w-full rounded-xl object-cover" loading="lazy" decoding="async" />
                </div>
                <div class="w-7/12">
                  <NuxtLink :to="`/articles/${it.slug}`" class="text-xl">{{ it.title }}</NuxtLink>
                </div>
              </li>
            </ul>
          </div>

          <!-- Покупают вместе -->
          <div v-if="bundled?.length" class="mt-12 rounded-xl border p-5">
            <h3 class="font-semibold">Покупают вместе</h3>
            <ul class="mt-3 space-y-4">
              <li v-for="p in bundled" :key="p.id" class="flex gap-3 items-center">
                <nuxt-img :src="p.image" :alt="p.title" class="h-16 w-16 rounded-lg object-cover" loading="lazy" decoding="async" />
                <div class="min-w-0 flex-1">
                  <NuxtLink :to="p.url" class="font-medium hover:underline truncate block">{{ p.title }}</NuxtLink>
                  <p class="text-sm text-gray-500">{{ (p.price / 100).toLocaleString('ru-RU', { style:'currency', currency:'RUB' }) }}</p>
                </div>
                <NuxtLink :to="p.url" class="btn btn-sm btn-primary">Купить</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Популярные материалы -->
          <!-- <div v-if="article?.popular?.length" class="mt-8 rounded-xl border p-5">
            <h3 class="font-semibold">Полезные материалы</h3>
            <ul class="mt-3 space-y-3">
              <li v-for="it in article!.popular!" :key="it.id">
                <NuxtLink :to="`/articles/${it.slug}`" class="hover:underline">{{ it.title }}</NuxtLink>
              </li>
            </ul>
          </div> -->
        </aside>

      </div>

      <section class="w-full flex flex-col gap-6 py-2 md:py-5 mt-6 md:mt-12">
        <h2 class="text-product leading-tight font-medium">Популярные статьи</h2>
        <PopularArticles />
      </section>

      <!-- скелетоны / ошибки -->
      <div v-if="loading[`detail:${slug}`]" class="mt-10 animate-pulse text-gray-400">Загрузка…</div>
      <div v-if="errors[`detail:${slug}`]" class="mt-10 text-red-600">Ошибка: {{ errors[`detail:${slug}`] }}</div>
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
