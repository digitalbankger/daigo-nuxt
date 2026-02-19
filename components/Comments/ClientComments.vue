<script setup lang="ts">
import { useArticlesStore } from '~/stores/articlesStore'
import type { ArticleComment } from '~/types/articles'
import Button from '../ui/Button.vue';
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'

const props = withDefaults(defineProps<{
  slug: string
  /** Заглушка авторизации: только авторизованные могут писать */
  canPost?: boolean
}>(), {
  canPost: false
})

const store = useArticlesStore()

// первичная загрузка (CSR-компонент — грузим на клиенте)
const comments = ref<ArticleComment[]>([])
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function load(force = false) {
  try {
    loading.value = true
    errorMsg.value = null
    comments.value = await store.fetchComments(props.slug, force)
  } catch (e: any) {
    errorMsg.value = e?.message || 'Не удалось загрузить комментарии'
  } finally {
    loading.value = false
  }
}
await load()

// форма
const message = ref('')
const sending = ref(false)
const agree = ref(false)
const agreeError = ref('')

async function submit() {
  if (!props.canPost) return
  const text = message.value.trim()
  if (!text) return
  agreeError.value = agree.value ? '' : 'Нужно согласиться с политикой'
  if (!agree.value) return
  sending.value = true
  try {
    await store.addComment(props.slug, text)
    message.value = ''
    await load(true)
  } catch (e) {
    // можно показать toast
  } finally {
    sending.value = false
  }
}

// утилиты
function fmtDateISOtoRU(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}.${mm}.${yy}`
}

const count = computed(() => comments.value.length)
</script>

<template>
  <section>
    <!-- Заголовок -->
    <div class="flex items-baseline gap-3">
      <h3 class="text-xl md:text-slider font-medium mb-5">Комментарии</h3>
      <span class="text-xl md:text-product text-black/50">{{ count }}</span>
    </div>

    <!-- Форма -->
    <form
      class="mt-4"
      @submit.prevent="submit"
    >
      <div class="relative rounded-2xl bg-black/[0.04] p-2 md:p-2">
        <textarea
          v-model="message"
          :disabled="!canPost || sending"
          rows="6"
          class="w-full resize-y rounded-xl border-0 bg-transparent px-3 py-3 outline-none ring-1 ring-transparent focus:ring-primary"
          placeholder="Оставьте свой комментарий"
          aria-label="Комментарий"
        />
        <Button 
          variant="solid"
          type="submit"
          class="w-48 absolute right-4 bottom-4 transition
                 disabled:opacity-60 disabled:pointer-events-none
                 bg-primary hover:opacity-95"
          :disabled="!canPost || !message.trim() || sending"
        >
          {{ sending ? 'Отправляем…' : 'Отправить' }}
        </Button>
      </div>

      <div class="mt-3 space-y-1">
        <BaseCheckbox v-model="agree" @click="agreeError = ''">
          <span class="text-xs text-black/50">
            Я согласен(на) с
            <NuxtLink to="/privacy" class="underline">политикой конфиденциальности</NuxtLink>
            и
            <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">обработкой персональных данных</NuxtLink>.
          </span>
        </BaseCheckbox>
        <p v-if="agreeError" class="text-xs text-red-600">{{ agreeError }}</p>
      </div>

      <!-- Заглушка авторизации -->
      <p v-if="!canPost" class="mt-2 text-xs text-black/50">
        Оставлять комментарии могут только авторизованные пользователи.
      </p>
    </form>

    <!-- Ошибка/загрузка/пусто -->
    <div v-if="loading" class="mt-6 text-black/40">Загрузка…</div>
    <div v-else-if="errorMsg" class="mt-6 text-red-600">Ошибка: {{ errorMsg }}</div>
    <div v-else-if="!comments.length" class="mt-6 text-black/50">
      Пока нет комментариев. Будьте первым!
    </div>

    <!-- Список -->
    <ul v-else class="mt-6 space-y-6">
      <li
        v-for="c in comments"
        :key="c.id"
        class="flex gap-4"
      >
        <!-- <nuxt-img
          :src="c.author.avatarUrl || '/images/mock/avatars/default.png'"
          :alt="c.author.name"
          class="h-14 w-14 rounded-full object-cover"
          loading="lazy"
          decoding="async"
        /> -->
        <div class="min-w-0">
          <p class="font-medium text-base md:text-lg">{{ c.author.name }}</p>
          <p class="mt-2 text-sm md:text-lg leading-relaxed">
            {{ c.message }}
          </p>
          <div class="mt-2 flex items-center gap-4 text-xs text-black/50">
            <span>{{ fmtDateISOtoRU(c.createdAt) }}</span>
            <button
              type="button"
              class="hover:underline"
              aria-label="Ответить"
            >
              Ответить
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
