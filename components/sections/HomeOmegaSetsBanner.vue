<script setup lang="ts">
type StaticBanner = {
  image: string
  mobileImage: string
  period: string
  title: string
  description: string
}

const banner: StaticBanner = {
  image: '/images/banners/omega-sets-august.jpg',
  mobileImage: '/images/banners/omega-sets-august-mob.png',
  period: '3–8 августа',
  title: 'Супервыгода на наборы с Омега-3',
  description:
    'Омега-3 в усиленных комплексах направленной поддержки с аминобиотиками Daigo',
}
</script>

<template>
  <section
    class="omega-sets-banner"
    aria-labelledby="omega-sets-banner-title"
  >
    <picture class="omega-sets-banner__picture">
      <source
        :srcset="banner.mobileImage"
        media="(max-width: 767px)"
      />

      <img
        :src="banner.image"
        width="1312"
        height="500"
        alt=""
        aria-hidden="true"
        class="omega-sets-banner__image"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
    </picture>

    <div
      class="omega-sets-banner__shade"
      aria-hidden="true"
    />

    <div class="omega-sets-banner__content">
      <p class="omega-sets-banner__period">
        {{ banner.period }}
      </p>

      <h1
        id="omega-sets-banner-title"
        class="omega-sets-banner__title"
      >
        {{ banner.title }}
      </h1>

      <p class="omega-sets-banner__description">
        {{ banner.description }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.omega-sets-banner {
  position: relative;
  width: 100%;
  min-height: 500px;
  overflow: hidden;
  border-radius: 20px;
  isolation: isolate;
  color: #303b86;
}

.omega-sets-banner__picture,
.omega-sets-banner__image,
.omega-sets-banner__shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.omega-sets-banner__picture {
  z-index: -2;
  display: block;
}

.omega-sets-banner__image {
  display: block;
  object-fit: cover;
  object-position: center;
}

.omega-sets-banner__shade {
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(245, 242, 239, 0.94) 0%,
    rgba(245, 242, 239, 0.72) 36%,
    rgba(245, 242, 239, 0) 60%
  );
}

.omega-sets-banner__content {
  display: flex;
  width: min(53%, 690px);
  min-height: 500px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 42px clamp(24px, 3.5vw, 46px);
}

.omega-sets-banner__period {
  display: inline-flex;
  min-width: clamp(220px, 25vw, 325px);
  min-height: 55px;
  align-items: center;
  justify-content: center;
  margin: 0;
  border-radius: 8px;
  padding: 10px 24px;
  background: linear-gradient(90deg, #242775 0%, #8270bd 100%);
  color: #fff;
  font-size: clamp(19px, 1.9vw, 26px);
  font-weight: 400;
  line-height: 1.2;
  text-align: center;
}

.omega-sets-banner__title {
  max-width: 650px;
  margin: clamp(28px, 4vw, 52px) 0 0;
  font-size: clamp(38px, 4.25vw, 56px);
  font-weight: 500;
  line-height: 1.18;
  letter-spacing: -0.025em;
  text-wrap: balance;
}

.omega-sets-banner__description {
  max-width: 590px;
  margin: clamp(24px, 3vw, 38px) 0 0;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 400;
  line-height: 1.22;
  text-wrap: balance;
}

@media (max-width: 1023px) {
  .omega-sets-banner,
  .omega-sets-banner__content {
    min-height: 430px;
  }

  .omega-sets-banner__content {
    width: 58%;
  }
}

@media (max-width: 767px) {
  .omega-sets-banner {
    min-height: clamp(620px, 150vw, 760px);
    border-radius: 14px;
  }

  .omega-sets-banner__image {
    /*
     * Мобильный файл уже имеет вертикальную композицию,
     * поэтому показываем его целиком по высоте баннера.
     */
    object-fit: cover;
    object-position: center bottom;
  }

  .omega-sets-banner__shade {
    background: linear-gradient(
      180deg,
      rgba(245, 242, 239, 0.94) 0%,
      rgba(245, 242, 239, 0.82) 32%,
      rgba(245, 242, 239, 0.18) 58%,
      rgba(245, 242, 239, 0) 76%
    );
  }

  .omega-sets-banner__content {
    width: 100%;
    min-height: 0;
    justify-content: flex-start;
    padding: 20px 18px 40px;
  }

  .omega-sets-banner__period {
    min-width: 176px;
    min-height: 42px;
    border-radius: 7px;
    padding: 8px 18px;
    font-size: 17px;
  }

  .omega-sets-banner__title {
    max-width: 440px;
    margin-top: 22px;
    font-size: clamp(30px, 9vw, 40px);
    line-height: 1.08;
    letter-spacing: -0.03em;
  }

  .omega-sets-banner__description {
    max-width: 420px;
    margin-top: 16px;
    font-size: clamp(17px, 4.8vw, 21px);
    line-height: 1.26;
  }
}

@media (max-width: 374px) {
  .omega-sets-banner {
    min-height: 600px;
  }

  .omega-sets-banner__content {
    padding: 16px 15px 32px;
  }

  .omega-sets-banner__period {
    min-width: 160px;
    min-height: 40px;
    padding-inline: 14px;
    font-size: 16px;
  }

  .omega-sets-banner__title {
    margin-top: 18px;
    font-size: 29px;
  }

  .omega-sets-banner__description {
    margin-top: 14px;
    font-size: 17px;
  }
}
</style>