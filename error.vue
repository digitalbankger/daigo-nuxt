<script setup lang="ts">
import type { NuxtError } from '#app'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import NavbarDesctop from '~/components/layout/NavbarDesctop.vue'
import FooterDesctop from '~/components/layout/FooterDesctop.vue'
import MobileNav from '~/components/MobileNav.vue'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error?.statusCode || 500)
const is404 = computed(() => statusCode.value === 404)

useHead({
  title: () => is404.value ? '404 — Страница не найдена | Daigo' : 'Ошибка | Daigo',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const goHome = () => clearError({ redirect: '/' })
const goCatalog = () => clearError({ redirect: '/catalog' })
const goProfile = () => clearError({ redirect: '/profile' })
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-white">
    <header>
      <BaseContainer>
        <NavbarDesctop />
      </BaseContainer>
    </header>

    <main class="flex flex-1 items-center py-12 sm:py-16 lg:py-20">
      <BaseContainer>
        <section class="mx-auto w-full max-w-[860px] text-center">
          <div
            class="text-[112px] font-medium leading-[0.82] tracking-[-0.07em] text-primary sm:text-[168px] lg:text-[220px]"
            aria-hidden="true"
          >
            {{ statusCode }}
          </div>

          <h1 class="mt-7 text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl">
            {{ is404 ? 'Страница не найдена' : 'Произошла ошибка' }}
          </h1>

          <p class="mx-auto mt-4 max-w-[620px] text-base leading-relaxed text-black/55 sm:text-lg">
            <template v-if="is404">
              Возможно, страница была перемещена или адрес указан неверно. Перейдите на главную страницу или в каталог.
            </template>
            <template v-else>
              Попробуйте обновить страницу. Если проблема повторяется, вернитесь немного позже.
            </template>
          </p>

          <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              class="min-w-[160px] rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              @click="goHome"
            >
              На главную
            </button>
            <button
              type="button"
              class="min-w-[160px] rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              @click="goCatalog"
            >
              В каталог
            </button>
            <button
              type="button"
              class="min-w-[160px] rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              @click="goProfile"
            >
              Профиль
            </button>
          </div>
        </section>
      </BaseContainer>
    </main>

    <BaseContainer>
      <FooterDesctop />
      <MobileNav class="block lg:hidden" />
    </BaseContainer>
  </div>
</template>
