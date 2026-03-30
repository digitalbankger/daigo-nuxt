<template>
  <div class="catalog-hover-menu text-white">
    <div class="catalog-hover-menu__top">
      <div class="catalog-hover-menu__tabs">
        <button class="catalog-hover-menu__tab catalog-hover-menu__tab--active" type="button">
          Каталог
        </button>
        <NuxtLink to="/researches" class="catalog-hover-menu__tab">
          Исследования
        </NuxtLink>
        <NuxtLink to="/articles" class="catalog-hover-menu__tab">
          Статьи
        </NuxtLink>
      </div>

      <button
        type="button"
        class="catalog-hover-menu__close"
        aria-label="Закрыть каталог"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <div class="catalog-hover-menu__body">
      <div class="catalog-hover-menu__list">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="catalog-hover-menu__item"
          :class="{ 'catalog-hover-menu__item--active': activeId === item.id }"
          @mouseenter="activeId = item.id"
          @focus="activeId = item.id"
        >
          <div class="catalog-hover-menu__thumb">
            <img :src="item.image" :alt="item.title" loading="lazy" />
          </div>

          <div class="catalog-hover-menu__meta">
            <div class="catalog-hover-menu__code-row">
              <span class="catalog-hover-menu__code">{{ item.code }}</span>
              <span v-if="item.badge" class="catalog-hover-menu__badge">
                {{ item.badge }}
              </span>
            </div>

            <div class="catalog-hover-menu__title">
              {{ item.title }}
            </div>
          </div>
        </button>
      </div>

      <div class="catalog-hover-menu__preview">
        <div class="catalog-hover-menu__preview-card">
          <div class="catalog-hover-menu__preview-image">
            <img :src="activeItem.image" :alt="activeItem.title" loading="lazy" />
          </div>

          <div class="catalog-hover-menu__preview-content">
            <p class="catalog-hover-menu__preview-code">
              {{ activeItem.code }}
            </p>

            <h3 class="catalog-hover-menu__preview-title">
              {{ activeItem.title }}
            </h3>

            <p class="catalog-hover-menu__preview-text">
              {{ activeItem.description }}
            </p>

            <div class="catalog-hover-menu__actions">
              <NuxtLink :to="activeItem.href" class="catalog-hover-menu__btn catalog-hover-menu__btn--solid">
                Открыть товар
              </NuxtLink>

              <NuxtLink to="/catalog" class="catalog-hover-menu__btn catalog-hover-menu__btn--ghost">
                Весь каталог
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="catalog-hover-menu__footer">
      <NuxtLink to="/catalog" class="catalog-hover-menu__all">
        Смотреть все товары →
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineEmits<{
  (e: 'close'): void
}>()

type CatalogItem = {
  product_id: string
  code: string
  title: string
  badge?: string
  image: string
  href: string
  description: string
}

const items = ref<CatalogItem[]>([
  {
    product_id: 'daigo',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo 5мл',
    image: 'https://products.s3.firstvds.ru/daigo-5/product-1.png',
    href: '/catalog/metabiotik-daigo',
    description: 'Поддержка микробиома, пищеварения и общего баланса организма.'
  },
  {
    product_id: 'daigo',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo 10мл',
    image: 'https://products.s3.firstvds.ru/daigo-10/product-1.png',
    href: '/catalog/metabiotik-daigo',
    description: 'Поддержка микробиома, пищеварения и общего баланса организма.'
  },
  {
    product_id: 'daigo-lux',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo Lux',
    badge: 'Хит',
    image: 'https://s3.firstvds.ru/products/lux/lux-effect.jpg',
    href: '/catalog/lux-daigo-metabiotik',
    description: 'Усиленная формула для курсового приема и комплексной поддержки.'
  },
  {
    product_id: 'tamotsu',
    code: 'TM-01',
    title: 'Tamotsu',
    image: '/images/catalog-hover/tamotsu.webp',
    href: '/catalog/tamotsu',
    description: 'Поддержка энергии, клеточного обмена и возрастного ресурса.'
  },
  {
    product_id: 'jointic',
    code: 'JT-01',
    title: 'Daigo Jointic',
    image: '/images/catalog-hover/jointic.webp',
    href: '/catalog/daigo-jointic',
    description: 'Поддержка суставов, связок и подвижности.'
  },
  {
    product_id: 'brainy',
    code: 'BR-01',
    title: 'Daigo Brainy',
    image: '/images/catalog-hover/brainy.webp',
    href: '/catalog/daigo-brainy',
    description: 'Поддержка концентрации, памяти и когнитивной активности.'
  },
  {
    product_id: 'dermic',
    code: 'DR-01',
    title: 'Daigo Dermic',
    image: '/images/catalog-hover/dermic.webp',
    href: '/catalog/daigo-dermic',
    description: 'Поддержка кожи, волос и общего внешнего тонуса.'
  }
])

const activeId = ref(items.value[0]?.id ?? '')

const activeItem = computed(() => {
  return items.value.find((item) => item.id === activeId.value) ?? items.value[0]
})
</script>

<style scoped>
.catalog-hover-menu {
  position: absolute;
  left: 0;
  top: calc(54% + 16px);
  z-index: 100;
  width: min(calc(100vw - 32px), 860px);
  max-height: calc(100vh - 9rem);
  display: flex;
  flex-direction: column;
  padding: 16px;
  border-radius: 28px;
  background: #4d525a6b;
  backdrop-filter: blur(38px);
  -webkit-backdrop-filter: blur(38px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  transform-origin: top left;
  will-change: opacity, transform, filter;
}

.catalog-hover-menu__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.catalog-hover-menu__tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.catalog-hover-menu__tab {
  height: 40px;
  padding: 0 18px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.08);
  text-decoration: none;
  transition: 0.2s ease;
}

.catalog-hover-menu__tab:hover {
  background: rgba(255, 255, 255, 0.14);
}

.catalog-hover-menu__tab--active {
  background: rgba(255, 255, 255, 0.16);
}

.catalog-hover-menu__close {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border: 0;
  cursor: pointer;
  transition: 0.2s ease;
}

.catalog-hover-menu__close:hover {
  background: rgba(255, 255, 255, 0.14);
}

.catalog-hover-menu__body {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 16px;
  min-height: 0;
  flex: 1;
}

.catalog-hover-menu__list {
  min-height: 0;
  overflow-y: auto;
  padding-right: 6px;
}

.catalog-hover-menu__list::-webkit-scrollbar {
  width: 8px;
}

.catalog-hover-menu__list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.catalog-hover-menu__list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.35);
  border-radius: 999px;
}

.catalog-hover-menu__item {
  width: 100%;
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  text-align: left;
  border: 0;
  background: transparent;
  color: white;
  cursor: pointer;
  transition: 0.2s ease;
  margin-bottom: 15px;
}

.catalog-hover-menu__item:hover,
.catalog-hover-menu__item--active {
  background: rgba(255, 255, 255, 0.08);
}

.catalog-hover-menu__thumb {
  width: 96px;
  height: 96px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.catalog-hover-menu__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-hover-menu__meta {
  min-width: 0;
}

.catalog-hover-menu__code-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.catalog-hover-menu__code {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.68);
}

.catalog-hover-menu__badge {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 14px;
  background: #b7e36e;
  color: #2f4025;
  font-size: 14px;
  font-weight: 500;
}

.catalog-hover-menu__title {
  margin-top: 6px;
  font-size: 18px;
  line-height: 1.2;
  font-weight: 500;
}

.catalog-hover-menu__preview {
  min-height: 0;
}

.catalog-hover-menu__preview-card {
  height: 100%;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  display: grid;
  grid-template-rows: 260px 1fr;
}

.catalog-hover-menu__preview-image {
  background: rgba(255, 255, 255, 0.08);
}

.catalog-hover-menu__preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.catalog-hover-menu__preview-content {
  padding: 20px;
}

.catalog-hover-menu__preview-code {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.68);
}

.catalog-hover-menu__preview-title {
  margin-top: 8px;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 700;
}

.catalog-hover-menu__preview-text {
  margin-top: 12px;
  font-size: 16px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.85);
}

.catalog-hover-menu__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.catalog-hover-menu__btn {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: 0.2s ease;
}

.catalog-hover-menu__btn--solid {
  background: white;
  color: #2c322a;
}

.catalog-hover-menu__btn--solid:hover {
  background: rgba(255, 255, 255, 0.9);
}

.catalog-hover-menu__btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.catalog-hover-menu__btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

.catalog-hover-menu__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.catalog-hover-menu__all {
  color: rgba(255, 255, 255, 0.92);
  font-size: 16px;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.catalog-hover-menu__preview-card {
  grid-template-rows: 330px 1fr;
}
@media (max-width: 1279px) {
  .catalog-hover-menu {
    width: min(calc(100vw - 32px), 760px);
  }

  .catalog-hover-menu__body {
    grid-template-columns: 300px 1fr;
  }

  .catalog-hover-menu__preview-card {
    grid-template-rows: 330px 1fr;
  }
}
</style>