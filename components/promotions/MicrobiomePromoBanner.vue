<script setup lang="ts">
import { ref } from "vue";
import MicrobiomeReviewModal from "~/components/promotions/MicrobiomeReviewModal.vue";

const isReviewOpen = ref(false);
</script>

<template>
  <section class="micro-hero" aria-label="Акция ко Дню микробиома Daigo">
    <div class="micro-hero__content">
      <h1 class="font-haido">
        Поделитесь отзывом —
        <span>получите больше пользы</span>
      </h1>

      <p class="micro-hero__lead">
        Оставьте отзыв о любом продукте Daigo <br class="hidden md:block" />
      </p>

      <div class="micro-hero__offers" aria-label="Форматы отзыва">
        <button
          type="button"
          class="micro-hero__offer micro-hero__offer_photo"
          aria-label="Открыть форму фотоотзыва"
          @click="isReviewOpen = true"
        >
          <span class="micro-hero__offer-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none">
              <path
                d="M8.5 9.2l1.4-2.1h8.2l1.4 2.1h2.1a2.6 2.6 0 012.6 2.6v7.7a2.6 2.6 0 01-2.6 2.6H6.4a2.6 2.6 0 01-2.6-2.6v-7.7a2.6 2.6 0 012.6-2.6h2.1z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
              <circle
                cx="14"
                cy="15.6"
                r="4.1"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </span>
          <span class="micro-hero__offer-text">
            Фотоотзыв
            <!-- <strong>Подарок</strong> -->
          </span>
        </button>

        <button
          type="button"
          class="micro-hero__offer micro-hero__offer_video"
          aria-label="Открыть форму видеоотзыва"
          @click="isReviewOpen = true"
        >
          <span class="micro-hero__offer-icon" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none">
              <rect
                x="3.5"
                y="7.5"
                width="14.5"
                height="13"
                rx="3"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M18 12l5.8-3.2v10.4L18 16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="micro-hero__offer-text">
            Видеоотзыв
            <!-- <strong>Подарок + бонус</strong> -->
          </span>
        </button>
      </div>

      <div class="micro-hero__bottom">
        <NuxtLink to="/microbiome-day" class="micro-hero__button">
          <span>Оставить отзыв</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <MicrobiomeReviewModal v-model:show="isReviewOpen" />
  </section>
</template>

<style scoped>
.micro-hero {
  position: relative;
  display: flex;
  min-height: 410px;
  border-radius: 30px;
  align-items: center;
  overflow: hidden;
  background: url("/images/promotions/microbiome-day-hero.png") right center /
    100% no-repeat;
  padding: 48px 30px;
}

.micro-hero__content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 720px;
}

.micro-hero h1 {
  max-width: 720px;
  margin: 15px 0 0;
  color: #493768;
  font-size: clamp(44px, 3.4vw, 66px);
  font-weight: 600;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.micro-hero h1 span {
  display: block;
  background: linear-gradient(90deg, #cc58b8 0%, #f26e75 58%, #ff8152 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.micro-hero__lead {
  max-width: 720px;
  margin: 26px 0 0;
  color: #2b2f3a;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: -0.015em;
  line-height: 1.4;
}

.micro-hero__offers {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 24px;
}

.micro-hero__offer {
  display: inline-flex;
  min-width: 220px;
  min-height: 70px;
  align-items: center;
  gap: 18px;
  border: 0;
  border-radius: 15px;
  padding: 10px 22px 10px 18px;
  box-shadow: 0 20px 48px rgba(93, 52, 105, 0.08);
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.micro-hero__offer:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 58px rgba(93, 52, 105, 0.14);
  filter: saturate(1.03);
}

.micro-hero__offer_photo {
  background: linear-gradient(
    135deg,
    rgba(255, 232, 226, 0.96),
    rgba(255, 244, 240, 0.82)
  );
}

.micro-hero__offer_video {
  background: linear-gradient(
    135deg,
    rgba(237, 236, 255, 0.98),
    rgba(247, 247, 255, 0.82)
  );
}

.micro-hero__offer-icon {
  display: inline-flex;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
}

.micro-hero__offer_photo .micro-hero__offer-icon {
  background: linear-gradient(135deg, #ff8b88 0%, #ff626f 100%);
  box-shadow: 0 12px 28px rgba(255, 98, 111, 0.26);
}

.micro-hero__offer_video .micro-hero__offer-icon {
  background: linear-gradient(135deg, #7682ff 0%, #5d68df 100%);
  box-shadow: 0 12px 28px rgba(93, 104, 223, 0.26);
}

.micro-hero__offer-icon svg {
  width: 29px;
  height: 29px;
}

.micro-hero__offer-text {
  display: flex;
  flex-direction: column;
  color: #252935;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.1;
}

.micro-hero__offer-text strong {
  margin-top: 4px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.micro-hero__offer_photo strong {
  color: #ff626f;
}

.micro-hero__offer_video strong {
  color: #493768;
}

.micro-hero__bottom {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-top: 28px;
}

.micro-hero__button {
  display: inline-flex;
  min-width: 280px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 26px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f24391 0%, #ff8550 100%);
  color: #fff;
  padding: 10px 15px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.02em;
  text-decoration: none;
  box-shadow: 0 20px 46px rgba(242, 67, 145, 0.26);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.micro-hero__button svg {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
}

.micro-hero__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 54px rgba(242, 67, 145, 0.32);
  filter: saturate(1.05);
}

@media (min-width: 1440px) {
  .micro-hero {
    min-height: 400px;
    padding: 50px 40px;
  }

  .micro-hero__offer:first-child {
    min-width: 260px;
  }

  .micro-hero__content {
    max-width: 850px;
  }

  .micro-hero h1 {
    max-width: 850px;
    font-size: 45px;
  }

  .micro-hero__lead {
    max-width: 720px;
    font-size: 25px;
  }

  .micro-hero__offer {
    min-width: 250px;
    min-height: 70px;
  }

  .micro-hero__button {
    min-width: 328px;
    min-height: 64px;
    font-size: 24px;
  }
}

@media (max-width: 992px) {
  .micro-hero h1 {
    font-size: clamp(36px, 3.4vw, 66px);
  }
  .micro-hero__lead {
    font-size: 18px;
  }
  .micro-hero__offer {
    padding: 10px 14px 10px 14px;
    gap: 10px;
    min-width: 176px;
  }
  .micro-hero__offer-text {
    font-size: 16px;
  }
  .micro-hero__offer-text strong[data-v-ef2385a4] {
    margin-top: 3px;
    font-size: 14px;
  }
  .micro-hero__content {
    max-width: 760px;
  }

  .micro-hero__bottom {
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .micro-hero {
    min-height: 770px;
    padding: 22px 18px 300px;
    background: url("/images/promotions/microbiome-day-hero-mobile.png") center
      bottom / cover no-repeat;
  }
  .micro-hero {
    align-items: flex-start;
  }

  .micro-hero h1 {
    margin-top: 24px;
    font-size: clamp(20px, 6.2vw, 38px);
    letter-spacing: -0.045em;
  }

  .micro-hero__lead {
    margin-top: 18px;
    font-size: 15px;
    line-height: 1.45;
  }

  .micro-hero__offers {
    gap: 12px;
    margin-top: 20px;
  }

  .micro-hero__offer {
    width: auto;
    min-width: 0;
    min-height: 62px;
    gap: 10px;
    border-radius: 15px;
    padding: 10px;
  }

  .micro-hero__offer-icon {
    width: 40px;
    height: 40px;
  }

  .micro-hero__offer-icon svg {
    width: 26px;
    height: 26px;
  }

  .micro-hero__offer-text {
    font-size: 15px;
  }

  .micro-hero__offer-text strong {
    font-size: 12px;
  }

  .micro-hero__offer-text strong {
    font-size: 30px;
  }

  .micro-hero__bottom {
    gap: 18px;
    margin-top: 22px;
  }

  .micro-hero__button {
    min-height: 50px;
    gap: 16px;
    border-radius: 14px;
    padding: 12px 16px;
    font-size: 18px;
  }

  .micro-hero__button svg {
    width: 26px;
    height: 26px;
  }
}
@media (max-width: 420px) {
  .micro-hero__offer-text {
    font-size: 14px;
  }
  .micro-hero__offer-text strong {
    margin-top: 3px;
    font-size: 12px !important;
  }
  .micro-hero__offer-icon svg {
    width: 24px;
    height: 24px;
  }
  .micro-hero__offer-icon {
    width: 38px;
    height: 38px;
  }
  .micro-hero__offer {
    padding: 8px;
    gap: 6px;
  }
  .micro-hero__offers {
    gap: 8px;
  }
}
</style>
