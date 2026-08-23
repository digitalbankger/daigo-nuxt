<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta, useHead } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'
definePageMeta({ layout: 'main', hideFooter: true })

import { useCartStore } from '~/stores/cartStore'
import { useYtm } from '@/composables/useYtm'
import { useRoute } from '#imports'
import type { ProductCard } from '~/types/product'

const route = useRoute()
const ytm = useYtm()
const cartStore = useCartStore()

// Пример: твой массив товаров для промо
const promoProducts: ProductCard[] = [
  {
    product_id: "ce6225f7-bfbb-4701-a731-e7001740c9f3",
    title: 'DAIGO Jointic',
    price: '22 500 ₽',
    bonus: '11 250',
    image: '/media-s3/products/jointic/product-1.png',
    href: '/catalog/daigo-jointic'
  },
  {
    product_id: "cafac368-1074-417d-bb3e-4470b4e28190",
    title: 'Daigo 10 мл',
    price: '27 900 ₽',
    bonus: '13 850',
    image: '/media-s3/products/daigo-10/product-1.png',
    href: '/metabiotik-daigo-10ml'
  },
  {
    product_id: "83abaeab-b593-4733-a364-a895e6ff02ff",
    title: 'Набор “Волны баланса”',
    price: '214 745 ₽',
    bonus: '107 373',
    image: 'https://api.daigo.ru/uploads/products_photo/e742eb4b-a4b4-4863-bd87-eb5cac352deb.jpg',
    href: '/balance-wave'
  },
  {
    product_id: "8631769b-3431-4fa7-9e36-5a9fe0da2412",
    title: 'Набор “Ее цветение”',
    price: '58 270 ₽',
    bonus: '29 135',
    image: 'https://api.daigo.ru/uploads/products_photo/cba1d83c-4947-4e58-ae28-01655b636dc4.png',
    href: '/her-bloom'
  },
]

// helper для qty как в каталоге
const quantityInCart = (p: ProductCard) => {
  const item = cartStore.items.find(i => String(i.id) === String(p.product_id))
  return item?.quantity ?? 0
}

const PREORDER_IDS = new Set<string>(['old-02417fb2-3a7d-40fd-a2fd-02446eef174f'])
const isPreorder = (p: ProductCard) => PREORDER_IDS.has(String(p.product_id))

function addToCartHandler(p: ProductCard) {
  cartStore.addToCart({
    id: String(p.product_id),
    title: p.name,
    subtitle: p.subtitle,
    price: p.price,
    oldPrice: p.oldPrice,
    quantity: 1,
    image: p.image,
    tag: p.tag,
    // meta: { preorder: isPreorder(p) } // если нужно
  })
}

function incrementHandler(p: ProductCard) {
  cartStore.updateItem(String(p.product_id), quantityInCart(p) + 1)
}
function decrementHandler(p: ProductCard) {
  cartStore.updateItem(String(p.product_id), quantityInCart(p) - 1)
}

// если карточка кликабельна и ведёт на страницу товара — как у тебя в каталоге
function onOpen(p: ProductCard, navigate: () => void) {
  const productObj = {
    id: p.product_id,
    name: p.name,
    price: Number(p.price) || 0,
    position: 1, // можно считать индексом в списке
    category: p.tag ? [p.tag] : undefined,
    url: `/catalog/${p.slug}`,
    image_url: p.image
  }

  ytm.productClick(productObj, route.path, 'Бонусопад')
  navigate()
}

const toCatalog = (href?: string) => {
  const h = (href || '').trim()
  if (!h) return '/akcii'

  // внешние ссылки не трогаем
  if (/^https?:\/\//i.test(h)) return h

  // уже корректно
  if (h.startsWith('/catalog/')) return h

  // если случайно передали "catalog/..." без ведущего слеша
  if (h.startsWith('catalog/')) return '/' + h

  // если передали "/slug" или "slug" — считаем что это slug товара
  const slug = h.replace(/^\//, '')
  return `/catalog/${slug}`
}

useSeoMeta({
  title: 'Новогодний бонусопад',
  description: 'Промо-страница акции: бонусы за покупки и розыгрыш призов.',
  ogTitle: 'Новогодний бонусопад',
  ogDescription: 'Бонусы за покупки и розыгрыш призов.',
  twitterCard: 'summary_large_image',

})

useHead({
  link: [
    { rel: 'preconnect', href: 'https://images.unsplash.com' }
  ],
  bodyAttrs: {
    class: 'page-bonusopad'
  }
})
</script>

<template>
    <img src="/images/new-year/mf-bonusopad.png" class="sm:hidden block" />
                      <img
    src="/images/new-year/konkurs-snow.png"
    class="block absolute w-full left-[0%] top-[110%] sm:top-[50%]"
    alt=""
  />  
<BaseContainer>
  <img
    src="/images/new-year/li.png"
    class="hidden sm:block absolute -top-20 inset-0 w-full -scale-x-100"
    alt=""
  />  

  <main class="bonusopad">
    <!-- HERO -->
    <section class="-mt-[30%] sm:mt-[5%] px-2 sm:px-6"  >
      <div class="container hero__content">
          <img
    src="/images/new-year/toy.png"
    class="hidden sm:block absolute w-[500px] -right-[10%] top-[17%]"
    alt=""
  />  

        <!-- Текст/условия -->
        <h1 class="hidden sm:block font-mont text-light font-light text-[120px] leading-tight">
            НОВОГОДНИЙ
        </h1>
        <p
          class=" hidden sm:block leading-tight uppercase italic text-transparent bg-clip-text text-[120px] font-nauryz flex flex-row items-center justify-center gap-1 sm:gap-2"
          style="background-image: radial-gradient(circle, #FFED68, #FFB830);"
        >
            БОНУСОПАД
        </p>
        <p class="font-mont text-[16px] sm:text-[35px] font-normal mt-20 mb-4">НОВОГОДНИЕ ЧУДЕСА НА DAIGO.RU</p>
        <div class="font-mont text-sm sm:text-[26px] leading-tight font-light w-full sm:w-8/12">
          <p class="mb-8">
            Мы объявляем беспрецендентный бонусопад. За каждую покупку совершенную до 31 Января 2026 года
            мы начисляем 50% от ее стоимости баллами! Условия очень простые:
          </p>

          <ol class="list-decimal ps-5 sm:ps-10 space-y-6">
            <li>
              Совершите любую покупку в нашем интернет магазине в период с 20 Декабря до 31 Января и получите
              50% от ее суммы Дайго бонусами!
            </li>
            <li>
              Сразу после покупки вы получите уведомление об успешном зачислении бонусов на ваш счет и они
              отобразятся в вашем <NuxtLink to="/profile">личном кабинете</NuxtLink>.
            </li>
            <li>
              Полученными бонусами вы можете оплатить до 20% любой последующей покупки в нашем магазине с 1 января до
              31 Марта 2026 года.
              <!-- <a class="link" href="/promotions">Подробные условия акции.</a> -->
            </li>
          </ol>
        </div>

        <!-- Карточки -->
        <div class="promo-grid mt-20">
<NuxtLink
  v-for="(p, i) in promoProducts"
  :key="i"
  :to="toCatalog(p.href)"
  class="promo-card block"
>
  <article
    class="promo-card cursor-pointer"
  >
    <!-- Badge -->
    <div class="promo-badge">
      <span class="promo-badge__text">
        {{ p.bonus }}
      </span>
      <img src="/images/new-year/b.png" class="promo-badge__icon" alt="" />
    </div>

    <!-- Image frame -->
    <div class="promo-media">
      <img
        :src="p.image"
        :alt="p.title"
        loading="lazy"
        decoding="async"
        class="promo-media__img"
      />
    </div>

    <!-- Content -->
    <div class="promo-body">
      <h3 class="promo-title">{{ p.title }}</h3>

      <div class="promo-price">
        {{ p.price }} 
      </div>

      <!-- CTA: add / counter -->
      <button
        v-if="quantityInCart(p) === 0"
        type="button"
        @click.stop="addToCartHandler(p)"
        :aria-label="isPreorder(p) ? 'Предзаказ' : 'В корзину'"
        class="promo-btn"
      >
        <span class="promo-btn__shine" aria-hidden="true"></span>
        <img src="/icons/add-to-cart.svg" alt="" class="promo-btn__icon" />
        <span class="promo-btn__text">{{ isPreorder(p) ? 'Предзаказ' : 'В корзину' }}</span>
      </button>

      <div v-else class="promo-counter">
        <button
          type="button"
          @click.stop="decrementHandler(p)"
          class="promo-counter__btn"
          aria-label="Уменьшить количество"
        >
          <img src="/icons/decrement.svg" alt="" class="w-5 h-5" />
        </button>

        <span class="promo-counter__qty">{{ quantityInCart(p) }} шт</span>

        <button
          type="button"
          @click.stop="incrementHandler(p)"
          class="promo-counter__btn"
          aria-label="Увеличить количество"
        >
          <img src="/icons/increment.svg" alt="" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </article>
  </NuxtLink>
</div>


        <div class="hero__cta pointer items-center gap-6 my-10 sm:mb-10">
          <a href="/catalog" class="text-[16px] sm:text-[35px] py-10 font-medium">
            БОЛЬШЕ БОНУСОВ В КАТАЛОГЕ
          </a>
          <img
                src="/icons/arrow-white.svg"
                alt="→"
                class="w-4 sm:w-8 h-4 sm:h-8 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
              />
        </div>
      </div>
    </section>

  </main>
</BaseContainer>
</template>

<style scoped>

    .full-bleed {
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  max-width: 100vw;
}


.hero-bg{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;              /* под твой отступ */
  background: url('/images/new-year/ny-bonusopad.png') top center / contain no-repeat;
}


/* Контейнер без зависимости от конкретного компонента BaseContainer */
.container{
  margin: 0 auto;
}

.bonusopad{
  color: #fff;
}

/* HERO */
.hero{
  position: relative;
background-size: cover;
background-position: 0px -100px;
  background-repeat: no-repeat;
  padding: 56px 0 40px;
}

.hero__overlay{
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.45), rgba(0,0,0,.55));
}

.hero__content{
  position: relative;
  z-index: 1;
}

.hero__titles{
  text-align: center;
  margin-bottom: 18px;
}

.hero__kicker{
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
  opacity: .9;
  margin-bottom: 8px;
}

.hero__h1{
  line-height: 1;
  font-weight: 800;
  margin: 0;
}

.hero__h1Top{
  display: block;
  font-size: clamp(34px, 6vw, 64px);
  letter-spacing: .04em;
}

.hero__h1Bottom{
  display: block;
  font-size: clamp(46px, 8vw, 92px);
  letter-spacing: .03em;
  color: #f4d35e;
  text-shadow: 0 6px 18px rgba(0,0,0,.35);
}

.hero__text{
  max-width: 920px;
  margin: 0 auto 18px;
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px;
  padding: 14px 14px;
  backdrop-filter: blur(6px);
}

.hero__lead{
  font-size: 14px;
  line-height: 1.45;
  margin: 0 0 10px;
  opacity: .95;
}

.hero__list{
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  font-size: 14px;
  line-height: 1.45;
}

.link{
  color: #f4d35e;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Cards */
.cards{
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;

}

@media (min-width: 640px){
  .cards{ grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 1024px){
  .cards{ grid-template-columns: repeat(4, 1fr); }
}

.card{
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0,0,0,.38);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(6px);
}

.card__badge{
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,.55);
  border: 1px solid rgba(255,255,255,.18);
}

.card__imageWrap{
  height: 156px;
  background: rgba(0,0,0,.15);
}

.card__image{
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card__body{
  padding: 12px;
  display: grid;
  gap: 10px;
}

.card__title{
  font-size: 14px;
  line-height: 1.25;
  font-weight: 500;
  margin: 0;
  min-height: 36px;
}

.card__priceRow{
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.card__price{
  font-size: 16px;
  font-weight: 800;
}

.hero__cta{
  margin-top: 16px;
  display: flex;
  justify-content: start;
}

/* Buttons */
.btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .06em;
  font-size: 12px;
  transition: transform .12s ease, opacity .12s ease;
  user-select: none;
  text-decoration: none;
}

.btn:hover{ transform: translateY(-1px); }

.btn--primary{
  background: #cf2d2d;
  border: 1px solid rgba(255,255,255,.12);
  color: #fff;
}

.btn--ghost{
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.22);
  color: #fff;
}

.btn--secondary{
  background: rgba(244, 211, 94, .95);
  border: 1px solid rgba(0,0,0,.2);
  color: #1b1b1b;
}

/* PRIZES */
.prizes{
  position: relative;
  padding: 44px 0 56px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.prizes__overlay{
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.70));
}

.prizes__content{
  position: relative;
  z-index: 1;
}

.prizes__header{
  text-align: center;
  margin-bottom: 16px;
}

.prizes__kicker{
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
  opacity: .9;
  margin-bottom: 8px;
}

.prizes__title{
  margin: 0;
  line-height: 1;
  font-weight: 900;
}

.prizes__titleLeft{
  display: inline-block;
  font-size: clamp(28px, 5vw, 54px);
  margin-right: 10px;
  opacity: .92;
}

.prizes__titleRight{
  display: inline-block;
  font-size: clamp(40px, 7vw, 84px);
  color: #f4d35e;
  text-shadow: 0 6px 18px rgba(0,0,0,.35);
}

.prizes__grid{
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

@media (min-width: 1024px){
  .prizes__grid{
    grid-template-columns: 1.2fr .8fr;
  }
}

.prizes__text{
  background: rgba(0,0,0,.35);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 16px;
  padding: 14px;
  backdrop-filter: blur(6px);
}

.prizes__lead{
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.45;
  opacity: .95;
}

.prizes__list{
  margin: 10px 0 14px;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  font-size: 14px;
  line-height: 1.45;
}

.prizes__media{
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.25);
}

.prizes__image{
  width: 100%;
  height: 100%;
  min-height: 260px;
  object-fit: cover;
  display: block;
}

.btn-cart {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: #AF1701; /* базовый цвет кнопки */
  transition: transform 0.2s ease-out, background-color 0.25s ease-out;
}

/* мягкое затемнение на hover (как у тебя) */
.btn-cart:hover {
  background-color: rgba(175, 23, 1, 0.85);
}

/* БЛИК "СТЕКЛО" — циклический, плавный */
.btn-cart::before {
  content: "";
  position: absolute;
  top: -40%;
  left: -35%;
  width: 55%;
  height: 180%;
  pointer-events: none;

  /* стеклянный блик */
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgba(255,255,255,0.0) 25%,
    rgba(255, 255, 255, 0.174) 35%,
    rgba(255,255,255,0.55) 50%,
    rgba(255, 255, 255, 0.237) 65%,
    rgba(255,255,255,0.0) 75%,
    transparent 100%
  );

  /* мягкость */
  filter: blur(1.1px);
  opacity: 0.85;

  /* наклон и старт за пределами */
  transform: translateX(-140%) skewX(-18deg);

  /* цикл */
  animation: btn-shine 3.8s ease-in-out infinite;
}

/* чтобы блик не перекрывал текст/иконки (но он и так pointer-events:none) */
.btn-cart > * {
  position: relative;
  z-index: 1;
}

/* ключевая анимация */
@keyframes btn-shine {
  0%   { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
  10%  { opacity: 0.9; }
  50%  { opacity: 0.9; }
  90%  { opacity: 0.9; }
  100% { transform: translateX(420%) skewX(-18deg); opacity: 0; }
}

/* уважение prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .btn-cart::before {
    animation: none;
    opacity: 0;
  }
}



/* GRID */
.promo-grid{
  display: grid;
  gap: 22px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* CARD */
.promo-card{
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #1f4416;
  box-shadow: 0 10px 26px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
}
@media screen and (min-width: 640px){
  .promo-grid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
  /* CARD */
.promo-card{
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #1f4416;
  box-shadow: 0 10px 26px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.06);
}
}
@media screen and (min-width: 1024px){
  .promo-grid{ grid-template-columns: repeat(4, minmax(0, 1fr)); }
}



/* BADGE (gold) */
.promo-badge{
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 10px;
  background: #1f4416;
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(6px);
}
.promo-badge__text{
  font-weight: 500;
  font-style: italic;
  text-transform: uppercase;
  font-size: 16px;
  line-height: 1;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: radial-gradient(circle, #FFED68, #FFB830);
}
.promo-badge__icon{
  height: 14px;
  width: auto;
}

/* MEDIA FRAME */
.promo-media{
  position: relative;
  margin-bottom: 10px;
  height: 200px;
  border-radius: 14px 14px 0px 0px;
  background: #f7f7f7;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 640px){
  .promo-media{ height: 160px; }
  .promo-body{
  padding: 0 16px 16px;
}
}
.promo-media__img{
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 0px;
  transform: translateZ(0);
}

/* 3 dots like in screenshot */
.promo-dots{
  position: absolute;
  left: 50%;
  bottom: 8px;
  transform: translateX(-50%);
  display: inline-flex;
  gap: 6px;
  opacity: 0.35;
}
.promo-dots span{
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #000;
}

/* BODY */
.promo-body{
  padding: 0 10px 10px;
}
.promo-title{
  color: rgba(255,255,255,0.92);
  font-size: 16px;
  line-height: 1.25;
  font-weight: 500;
  min-height: 42px;
  margin: 0 0 10px;
}
.promo-price{
  color: #fff;
  font-weight: 500;
  font-size: 18px;
  margin-bottom: 12px;
}

/* BUTTON (red with shine) */
.promo-btn{
  position: relative;
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background: #AF1701;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  overflow: hidden;
  transition: transform .14s ease, background-color .18s ease;
}
.promo-btn:hover{ background-color: rgba(175,23,1,0.88); transform: translateY(-1px); }
.promo-btn:active{ transform: translateY(0); }

.promo-btn__icon{ width: 18px; height: 18px; position: relative; z-index: 2; }
.promo-btn__text{ font-weight: 500; position: relative; z-index: 2; }

.promo-btn__shine{
  content: "";
  position: absolute;
  top: -40%;
  left: -40%;
  width: 55%;
  height: 180%;
  background: linear-gradient(
    115deg,
    transparent 0%,
    rgba(255,255,255,0.0) 25%,
    rgba(255, 255, 255, 0.18) 35%,
    rgba(255,255,255,0.55) 50%,
    rgba(255, 255, 255, 0.22) 65%,
    rgba(255,255,255,0.0) 75%,
    transparent 100%
  );
  filter: blur(1.1px);
  opacity: 0.85;
  transform: translateX(-140%) skewX(-18deg);
  animation: promo-shine 3.8s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}
@keyframes promo-shine{
  0%{ transform: translateX(-140%) skewX(-18deg); opacity: 0; }
  10%{ opacity: .9; }
  90%{ opacity: .9; }
  100%{ transform: translateX(420%) skewX(-18deg); opacity: 0; }
}

@media (prefers-reduced-motion: reduce){
  .promo-btn__shine{ animation: none; opacity: 0; }
}

/* COUNTER */
.promo-counter{
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: #AF1701;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  gap: 10px;
}
.promo-counter__btn{
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #AF1701;
  color: #fff;
}
.promo-counter__qty{
  color: #fff;
  font-weight: 500;
  min-width: 70px;
  text-align: center;
  font-size: 13px;
}


</style>
