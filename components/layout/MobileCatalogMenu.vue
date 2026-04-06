<template>
  <div class="mobile-catalog-menu text-white">
    <div class="mobile-catalog-menu__top">
      <div class="mobile-catalog-menu__tabs">
        <button type="button" class="mobile-catalog-menu__tab mobile-catalog-menu__tab--active">
          Каталог
        </button>

        <NuxtLink
          to="/researches"
          class="mobile-catalog-menu__tab"
          @click="$emit('close')"
        >
          Исследования
        </NuxtLink>

        <NuxtLink
          to="/articles"
          class="mobile-catalog-menu__tab"
          @click="$emit('close')"
        >
          Статьи
        </NuxtLink>
      </div>

      <button
        type="button"
        class="mobile-catalog-menu__close"
        aria-label="Закрыть меню"
        @click="$emit('close')"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M4 4L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M14 4L4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div
      class="mobile-catalog-menu__content"
      @wheel.stop
      @touchmove.stop
    >
      <div class="mobile-catalog-menu__actions">
        <button
          type="button"
          class="mobile-catalog-menu__action"
          @click="$emit('go-orders')"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g clip-path="url(#clip0_1905_4439)">
                <path
                    d="M16.372 2.22582C16.1332 2.13013 15.8668 2.13013 15.628 2.22582L3.692 6.99982L8.5 8.92182L20.808 3.99982L16.372 2.22582ZM23.5 5.07782L11.192 9.99982L16 11.9218L28.308 6.99982L23.5 5.07782ZM30 8.47782L17 13.6778V29.5218L30 24.3218V8.47782ZM15 29.5238V13.6758L2 8.47782V24.3238L15 29.5238ZM14.886 0.367821C15.6011 0.0818199 16.3989 0.0818199 17.114 0.367821L31.372 6.07182C31.5574 6.14611 31.7163 6.27421 31.8282 6.4396C31.9401 6.605 32 6.80011 32 6.99982V24.3238C31.9997 24.7235 31.8798 25.1139 31.6555 25.4447C31.4313 25.7755 31.1131 26.0316 30.742 26.1798L16.372 31.9278C16.1332 32.0235 15.8668 32.0235 15.628 31.9278L1.26 26.1798C0.888502 26.0319 0.569885 25.7759 0.345284 25.4451C0.120683 25.1143 0.000412659 24.7237 0 24.3238L0 6.99982C4.64799e-05 6.80011 0.0598875 6.605 0.171814 6.4396C0.283741 6.27421 0.442625 6.14611 0.628 6.07182L14.886 0.367821Z"
                    fill="currentColor"
                />
                </g>
                <defs>
                <clipPath id="clip0_1905_4439">
                    <rect width="32" height="32" fill="white" />
                </clipPath>
                </defs>
            </svg>
            <span>Заказы</span>
        </button>

        <NuxtLink
          to="/cart"
          class="mobile-catalog-menu__action"
          @click="$emit('close')"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                fill="currentColor"
                />
            </svg>
            <span>Корзина</span>
        </NuxtLink>

        <button
          type="button"
          class="mobile-catalog-menu__action"
          @click="$emit('go-profile')"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                d="M16 16C17.5913 16 19.1174 15.3679 20.2426 14.2426C21.3679 13.1174 22 11.5913 22 10C22 8.4087 21.3679 6.88258 20.2426 5.75736C19.1174 4.63214 17.5913 4 16 4C14.4087 4 12.8826 4.63214 11.7574 5.75736C10.6321 6.88258 10 8.4087 10 10C10 11.5913 10.6321 13.1174 11.7574 14.2426C12.8826 15.3679 14.4087 16 16 16ZM20 10C20 11.0609 19.5786 12.0783 18.8284 12.8284C18.0783 13.5786 17.0609 14 16 14C14.9391 14 13.9217 13.5786 13.1716 12.8284C12.4214 12.0783 12 11.0609 12 10C12 8.93913 12.4214 7.92172 13.1716 7.17157C13.9217 6.42143 14.9391 6 16 6C17.0609 6 18.0783 6.42143 18.8284 7.17157C19.5786 7.92172 20 8.93913 20 10ZM28 26C28 28 26 28 26 28H6C6 28 4 28 4 26C4 24 6 18 16 18C26 18 28 24 28 26ZM26 25.992C25.998 25.5 25.692 24.02 24.336 22.664C23.032 21.36 20.578 20 16 20C11.422 20 8.968 21.36 7.664 22.664C6.308 24.02 6.004 25.5 6 25.992H26Z"
                fill="currentColor"
                />
            </svg>
            <span>Профиль</span>
        </button>
      </div>

      <div class="mobile-catalog-menu__list">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="item.href"
          class="mobile-catalog-menu__card"
          @click="$emit('close')"
        >
          <div class="mobile-catalog-menu__thumb">
            <img :src="item.image" :alt="item.title" loading="lazy" />
          </div>

          <div class="mobile-catalog-menu__meta">
            <div class="mobile-catalog-menu__code-row">
              <span class="mobile-catalog-menu__code font-mont">{{ item.code }}</span>
              <span v-if="item.badge" class="mobile-catalog-menu__badge">
                {{ item.badge }}
              </span>
            </div>

            <div class="mobile-catalog-menu__title font-mont">
              {{ item.title }}
            </div>
          </div>
        </NuxtLink>
      </div>

      <NuxtLink
        to="/catalog"
        class="mobile-catalog-menu__all border-b border-white pb-1"
        @click="$emit('close')"
      >
        Смотреть все товары
        <span aria-hidden="true">→</span>
      </NuxtLink>

      <div class="mobile-catalog-menu__links">
        <NuxtLink to="/akcii" class="mobile-catalog-menu__link" @click="$emit('close')">Акции</NuxtLink>
        <NuxtLink to="/about" class="mobile-catalog-menu__link" @click="$emit('close')">О нас</NuxtLink>
        <NuxtLink to="/otzyvy" class="mobile-catalog-menu__link" @click="$emit('close')">Отзывы</NuxtLink>
        <NuxtLink to="/contacts" class="mobile-catalog-menu__link" @click="$emit('close')">Контакты</NuxtLink>

      </div>
      <div class="flex flex-col gap-2 mt-2">
        <NuxtLink to="/faq" class="mobile-catalog-menu__link" @click="$emit('close')">Частые вопросы</NuxtLink>

        <a
          href="https://lp.daigo.ru/daigob2b"
          target="_blank"
          rel="noopener"
          class="mobile-catalog-menu__link"
          @click="$emit('close')"
        >
          Корпоративным клиентам
        </a>

        <a
          href="https://lp.daigo.ru/vns-welcome-daigo"
          target="_blank"
          rel="noopener"
          class="mobile-catalog-menu__link"
          @click="$emit('close')"
        >
          Партнерская программа
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { catalogMenuProducts } from '~/constants/catalogMenu'

defineEmits<{
  (e: 'close'): void
  (e: 'go-profile'): void
  (e: 'go-orders'): void
}>()

const items = catalogMenuProducts
</script>

<style scoped>
.mobile-catalog-menu {
  width: 100%;
  max-height: calc(100dvh - 20px);
  display: flex;
  flex-direction: column;
  padding: 14px;
  border-radius: 32px;
  background: #8e95a0de;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.mobile-catalog-menu__top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.mobile-catalog-menu__tabs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  padding: 6px;
  border-radius: 999px;
  background: rgba(80, 85, 77, 0.22);
  scrollbar-width: none;
}

.mobile-catalog-menu__tabs::-webkit-scrollbar {
  display: none;
}

.mobile-catalog-menu__tab {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.mobile-catalog-menu__tab--active {
  background: rgba(255, 255, 255, 0.2);
}

.mobile-catalog-menu__close {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 999px;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(80, 85, 77, 0.22);
  color: #fff;
}

.mobile-catalog-menu__content {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 2px;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.mobile-catalog-menu__content::-webkit-scrollbar {
  width: 6px;
}

.mobile-catalog-menu__content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}

.mobile-catalog-menu__content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.mobile-catalog-menu__actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.mobile-catalog-menu__action {
  min-height: 42px;
  border-radius: 10px;
  border: 0;
  background: #ffffff14;
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  gap: 5px;
}

.mobile-catalog-menu__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-catalog-menu__card {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 14px;
  align-items: center;
  padding: 8px 0;
  border-radius: 24px;
  text-decoration: none;
  color: white;
  transition: transform 0.18s ease, background 0.18s ease;
}

.mobile-catalog-menu__card:active {
  transform: scale(0.985);
}

.mobile-catalog-menu__thumb {
  width: 88px;
  height: 88px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
}

.mobile-catalog-menu__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mobile-catalog-menu__meta {
  min-width: 0;
}

.mobile-catalog-menu__code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.mobile-catalog-menu__code {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.74);
}

.mobile-catalog-menu__badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  background: #c9f67b;
  color: #29401f;
  font-size: 14px;
  font-weight: 500;
}

.mobile-catalog-menu__title {
  margin-top: 4px;
  font-size: 16px;
  line-height: 1.2;
  font-weight: 500;
}

.mobile-catalog-menu__all {
  margin-top: 16px;
  margin-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  text-underline-offset: 4px;
  font-size: 16px;
  font-weight: 500;
}

.mobile-catalog-menu__links {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mobile-catalog-menu__link {
  min-height: 42px;
  padding: 10px 12px;
  border-radius: 16px;
  text-decoration: none;
  color: #fff;
  background: #ffffff14;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
}

@media (min-width: 1024px) {
  .mobile-catalog-menu {
    display: none;
  }
}
</style>