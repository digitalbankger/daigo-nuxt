<script setup lang="ts">
import { ref } from 'vue'
import BaseContainer from '~/components/layout/BaseContainer.vue'
import MicrobiomeReviewModal from '~/components/promotions/MicrobiomeReviewModal.vue'

definePageMeta({ layout: 'main' })

const isReviewOpen = ref(false)

useSeoMeta({
  title: 'День микробиома Daigo — подарки за отзывы',
  description: 'Акция Daigo ко Дню микробиома: оставьте фото- или видеоотзыв о продукте и получите подарок после модерации.',
  ogTitle: 'День микробиома Daigo — подарки за отзывы',
  ogDescription: 'Расскажите о своём опыте Daigo, приложите фото или видео и получите подарок участника акции после проверки.',
  ogType: 'website',
  ogUrl: 'https://daigo.ru/microbiome-day',
})

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: 'День микробиома Daigo',
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'VirtualLocation',
          url: 'https://daigo.ru/microbiome-day',
        },
        organizer: {
          '@type': 'Organization',
          name: 'Daigo',
          url: 'https://daigo.ru',
        },
        offers: {
          '@type': 'Offer',
          name: 'Подарки за отзывы Daigo',
          description: 'Фото- и видеоотзывы участвуют в акции. Подарок открывается после модерации.',
          availability: 'https://schema.org/InStock',
        },
      }),
    },
  ],
})

const steps = [
  {
    title: 'Выберите продукт Daigo',
    text: 'Подойдёт любой продукт из каталога: метабиотик, аминобиотик или другой продукт, который вы уже знаете.',
  },
  {
    title: 'Оставьте отзыв',
    text: 'Напишите текст и приложите фото или короткое видео. Со смартфона можно выбрать файл из галереи или снять сразу.',
  },
  {
    title: 'Получите подарок',
    text: 'После проверки модератором мы откроем подарок участника акции и пришлём дальнейшие условия.',
  },
]

const facts = [
  'Микробиом — это микромир, который каждый день взаимодействует с организмом.',
  'Отзывы помогают другим людям спокойнее выбирать продукты и понимать реальный пользовательский опыт.',
  'Мы говорим о заботе без громких обещаний: честно, спокойно и по делу.',
]
</script>

<template>
  <BaseContainer>
    <main class="micro-page">
      <section class="micro-page__hero">
        <div class="micro-page__hero-content">
          <p class="micro-page__eyebrow">27 июня · День микробиома</p>
          <h1 class="font-haido">Ваш отзыв — это подарок для нас обоих</h1>
          <p>
            Расскажите о своём опыте с Daigo. Ваш отзыв поможет другим сделать выбор,
            а мы подготовим подарок участника акции после проверки.
          </p>
          <div class="micro-page__actions">
            <button type="button" class="micro-page__primary" @click="isReviewOpen = true">
              Оставить отзыв
            </button>
            <a href="#rules" class="micro-page__secondary">Условия акции</a>
          </div>
        </div>
      </section>

      <section id="rules" class="micro-page__reward-grid" aria-label="Форматы отзывов">
        <article class="micro-page__reward-card micro-page__reward-card_big">
          <span>Видеоотзыв</span>
          <strong>Скидка 20% + Dent</strong>
          <p>Снимите короткое видео с продуктом и расскажите, почему выбрали Daigo.</p>
          <button type="button" @click="isReviewOpen = true">Отправить видео</button>
        </article>

        <article class="micro-page__reward-card">
          <span>Фото или текст</span>
          <strong>Скидка 10%</strong>
          <p>Приложите фото продукта или напишите отзыв о своём опыте.</p>
          <button type="button" @click="isReviewOpen = true">Отправить отзыв</button>
        </article>
      </section>

      <section class="micro-page__info">
        <div>
          <h2>Микробиом — тема, о которой важно говорить просто</h2>
          <p>
            Ко Дню микробиома мы собираем живые отзывы без сложных обещаний.
            Нам важны реальные истории людей, которые уже знакомы с продуктами Daigo.
          </p>
        </div>
        <ul>
          <li v-for="fact in facts" :key="fact">{{ fact }}</li>
        </ul>
      </section>

      <section class="micro-page__steps" aria-label="Как принять участие">
        <h2>Как принять участие</h2>
        <div class="micro-page__steps-grid">
          <article v-for="(step, index) in steps" :key="step.title" class="micro-page__step-card">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </article>
        </div>
      </section>

      <section class="micro-page__game-block">
        <div>
          <p class="micro-page__eyebrow">Для первого знакомства</p>
          <h2>Игра с каплей Daigo</h2>
          <p>
            Сыграйте в мини-игру: ловите вредные бактерии каплей Daigo и наполняйте баночку энергии. Чем больше заполнение — тем приятнее подарок.
          </p>
        </div>
        <div id="review" class="micro-page__game-jar" aria-hidden="true">
          <span></span>
          <strong>15%</strong>
        </div>
      </section>

      <section class="micro-page__cta">
        <h2>Ваш опыт важен для всего сообщества</h2>
        <p>Выберите товар, прикрепите фото или видео и отправьте отзыв прямо с телефона.</p>
        <button type="button" class="micro-page__primary" @click="isReviewOpen = true">
          Открыть форму отзыва
        </button>
      </section>
    </main>
  </BaseContainer>

  <MicrobiomeReviewModal v-model:show="isReviewOpen" />
</template>

<style scoped>
.micro-page {
  --micro-primary: #f24391;
  --micro-primary-end: #ff8550;
  --micro-primary-dark: #d9307a;
  --micro-primary-soft: rgba(242, 67, 145, .12);
  --micro-text: #111827;
  display: flex;
  flex-direction: column;
  gap: clamp(34px, 6vw, 72px);
  padding-bottom: 70px;
}

.micro-page__hero,
.micro-page__info,
.micro-page__game-block,
.micro-page__cta {
  position: relative;
  overflow: hidden;
  border-radius: 25px;
  background:
    radial-gradient(circle at 10% 0%, rgba(242, 67, 145, .16), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(242, 67, 145, .10), transparent 30%),
    #f8fbff;
  box-shadow: 0 20px 60px rgba(242, 67, 145, .10);
}

.micro-page__hero {
  display: flex;
  min-height: 520px;
  align-items: center;
  background:
    url('/images/promotions/microbiome-day-hero.png') right center / 100% no-repeat;
  background-size: cover;
  padding: clamp(20px, 5vw, 30px);
}

.micro-page__info::before,
.micro-page__game-block::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, rgba(242, 67, 145, .12) 0 2px, transparent 2px);
  background-size: 58px 58px;
  opacity: .28;
}

.micro-page__hero-content,
.micro-page__info > *,
.micro-page__game-block > *,
.micro-page__cta > * {
  position: relative;
  z-index: 1;
}

.micro-page__hero-content {
  max-width: 720px;
}

.micro-page__eyebrow {
  margin: 0 0 12px;
  color: var(--micro-primary) !important;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .18em;
}

.micro-page h1,
.micro-page h2,
.micro-page h3,
.micro-page p {
  margin: 0;
}

.micro-page h1 {
  max-width: 578px;
  color: var(--micro-text);
  font-size: clamp(38px, 6vw, 54px);
  font-weight: 600;
  letter-spacing: -.05em;
  line-height: .98;
}

.micro-page h2 {
  color: var(--micro-text);
  font-size: clamp(30px, 5vw, 54px);
  font-weight: 500;
  letter-spacing: -.035em;
  line-height: 1.04;
}

.micro-page h3 {
  color: var(--micro-text);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.15;
}

.micro-page__hero-content > p:not(.micro-page__eyebrow),
.micro-page__info p,
.micro-page__game-block p,
.micro-page__cta p {
  max-width: 540px;
  margin-top: 20px;
  color: rgb(17 24 39 / 79%);
  font-size: clamp(15px, 1.6vw, 21px);
  line-height: 1.5;
}

.micro-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
}

.micro-page__primary,
.micro-page__secondary,
.micro-page__reward-card button {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  padding: 14px 22px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.micro-page__primary,
.micro-page__reward-card button {
  border: 0;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
  color: #fff;
  box-shadow: 0 18px 40px rgba(242, 67, 145, .25);
}

.micro-page__primary:hover,
.micro-page__reward-card button:hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, var(--micro-primary-dark) 0%, var(--micro-primary-end) 100%);
}

.micro-page__secondary {
  border: 1px solid rgba(242, 67, 145, .22);
  background: rgba(255,255,255,.76);
  color: var(--micro-primary-dark);
  text-decoration: none;
}

.micro-page__hero-art {
  min-height: 410px;
}

.micro-page__ribbon {
  position: absolute;
  inset: 12% -8% auto 2%;
  height: 230px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 70% 34%, rgba(255,255,255,.92), transparent 18%),
    linear-gradient(135deg, rgba(79,142,255,.26), rgba(255,255,255,.78));
  filter: blur(.1px);
  transform: rotate(-8deg);
}

.micro-page__gift {
  position: absolute;
  right: 13%;
  top: 24%;
  width: 190px;
  height: 150px;
  border: 2px solid rgba(242, 67, 145, .46);
  border-radius: 24px;
  background: linear-gradient(135deg, #fff, #eef4ff);
  box-shadow: 0 28px 70px rgba(79,142,255,.18);
  transform: rotate(8deg);
}

.micro-page__gift::before,
.micro-page__gift::after {
  content: '';
  position: absolute;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
}

.micro-page__gift::before {
  left: 50%;
  top: 0;
  width: 26px;
  height: 100%;
  transform: translateX(-50%);
}

.micro-page__gift::after {
  left: -10px;
  right: -10px;
  top: 38px;
  height: 24px;
  border-radius: 999px;
}

.micro-page__gift span {
  position: absolute;
  left: 50%;
  top: -52px;
  width: 138px;
  height: 76px;
  border: 8px solid var(--micro-primary);
  border-bottom: 0;
  border-radius: 999px 999px 0 0;
  transform: translateX(-50%);
}

.micro-page__card {
  position: absolute;
  left: 7%;
  bottom: 13%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 26px;
  background: rgba(255,255,255,.78);
  padding: 22px 24px;
  box-shadow: 0 26px 64px rgba(79,142,255,.16);
  backdrop-filter: blur(14px);
}

.micro-page__card strong {
  color: var(--micro-primary-dark);
  font-size: 32px;
  line-height: 1;
}

.micro-page__card small {
  color: rgba(17,24,39,.56);
  font-size: 14px;
  font-weight: 500;
}

.micro-page__reward-grid {
  display: grid;
  grid-template-columns: 1.18fr .82fr;
  gap: 18px;
}

.micro-page__reward-card {
  min-height: 280px;
  border-radius: 25px;
  background: #fff;
  padding: clamp(24px, 4vw, 40px);
  box-shadow: 0 18px 55px rgba(17, 24, 39, .08);
}

.micro-page__reward-card_big {
  background:
    radial-gradient(circle at 90% 10%, rgba(242, 67, 145, .16), transparent 28%),
    linear-gradient(135deg, #f2f7ff, #ffffff);
}

.micro-page__reward-card span {
  display: inline-flex;
  margin-bottom: 16px;
  border-radius: 999px;
  background: var(--micro-primary-soft);
  padding: 8px 12px;
  color: var(--micro-primary-dark);
  font-size: 13px;
  font-weight: 500;
}

.micro-page__reward-card strong {
  display: block;
  color: var(--micro-text);
  font-size: clamp(28px, 4vw, 54px);
  font-weight: 500;
  letter-spacing: -.04em;
  line-height: .96;
}

.micro-page__reward-card p {
  margin-top: 18px;
  color: rgba(17, 24, 39, .62);
  font-size: 16px;
  line-height: 1.45;
}

.micro-page__reward-card button {
  margin-top: 26px;
}

.micro-page__info,
.micro-page__game-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, .72fr);
  gap: 32px;
  align-items: center;
  padding: clamp(26px, 5vw, 54px);
}

.micro-page__info ul {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.micro-page__info li {
  border: 1px solid rgba(242, 67, 145, .16);
  border-radius: 20px;
  background: rgba(255,255,255,.72);
  padding: 16px 18px;
  color: rgba(17, 24, 39, .70);
  line-height: 1.45;
}

.micro-page__steps h2 {
  margin-bottom: 24px;
}

.micro-page__steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.micro-page__step-card {
  border-radius: 25px;
  background: #fff;
  padding: 28px;
  box-shadow: 0 18px 55px rgba(17, 24, 39, .08);
}

.micro-page__step-card span {
  display: inline-flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.micro-page__step-card h3 {
  margin-top: 20px;
}

.micro-page__step-card p {
  margin-top: 10px;
  color: rgba(17, 24, 39, .62);
  font-size: 15px;
  line-height: 1.45;
}

.micro-page__game-jar {
  position: relative;
  justify-self: center;
  width: 128px;
  height: 250px;
  overflow: hidden;
  border: 3px solid rgba(242, 67, 145, .42);
  border-top-width: 14px;
  border-radius: 40px 40px 28px 28px;
  background: rgba(255, 255, 255, .74);
  box-shadow: inset 0 0 0 5px rgba(255,255,255,.8), 0 24px 44px rgba(242, 67, 145, .18);
}

.micro-page__game-jar span {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 78%;
  background: linear-gradient(180deg, #ffe0e9, #f24391 58%, #ff8550);
  animation: micro-page-jar 3.4s ease-in-out infinite;
}

.micro-page__game-jar strong {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 34px;
  font-weight: 900;
  text-shadow: 0 1px 0 rgba(255,255,255,.80);
}

.micro-page__cta {
  padding: clamp(28px, 5vw, 52px);
  text-align: center;
}

.micro-page__cta p {
  margin-left: auto;
  margin-right: auto;
}

.micro-page__cta .micro-page__primary {
  margin-top: 26px;
}

@keyframes micro-page-jar {
  0%, 100% { height: 68%; }
  50% { height: 88%; }
}

@media (max-width: 992px) {
.micro-page h1[data-v-78735475] {
    max-width: 378px;
    color: var(--micro-text);
    font-size: clamp(30px, 6vw, 37px);
}
.micro-page__hero[data-v-78735475] {
    display: flex;
    min-height: 420px;
}
.micro-page__hero-content > p:not(.micro-page__eyebrow), .micro-page__info p, .micro-page__game-block p, .micro-page__cta p {
    max-width: 400px;
    margin-top: 20px;
}
  .micro-page__info,
  .micro-page__game-block,
  .micro-page__reward-grid,
  .micro-page__steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .micro-page__hero,
  .micro-page__info,
  .micro-page__game-block,
  .micro-page__cta {
    border-radius: 15px;
  }

  .micro-page__hero {
    min-height: 770px;
    padding: 22px 18px 400px;
    background: url('/images/promotions/microbiome-day-hero-mobile.png') center bottom / cover no-repeat;
  }
  .micro-page h1 {
        color: var(--micro-text);
        font-size: clamp(28px, 6vw, 37px);
  }
  .micro-page__actions {
    flex-direction: column;
  }

  .micro-page__primary,
  .micro-page__secondary,
  .micro-page__reward-card button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .micro-page__game-jar span {
    animation: none;
  }
}
</style>
