<script setup lang="ts">

const promoCards = [
  {
    title: 'Платите бонусами',
    text: 'Получайте бонусные баллы за совершенные покупки и используйте их при оплате',
    imageSrc: '/images/oplata/bonuces.png',
    //extraImage: '/images/Bookmark.webp',
    showArrow: false,
    arrowSrc: '/icons/Arrow-green.svg',
    lazy: true,
    button: {
      text: 'Баланс бонусов',
      link: '/personal/',
    },
    styles: {
      card: 'relative overflow-hidden bg-[#B7FFBA] h-[300px] w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'relative z-10 font-medium leading-tight mb-4 text-[clamp(2rem,6vw,2.5rem)]',
      text: 'relative z-10 w-[60%] text-[clamp(1rem,6vw,1.4rem)] font-normal',
      button: 'bg-transparent p-0 text-2xl text-cpink mt-6',
      image: 'absolute bottom-0 right-0 w-[40%]',
      extraImage: 'absolute top-0 left-0 w-[31%] z-0',
    }
  },
  {
    title: 'Акция Daigo',
    text: 'Актуальная информация о скидках и акциях',
    imageSrc: '/images/oplata/promo.png',
    //extraImage: '/images/team.webp',
    showArrow: false,
    arrowSrc: '/icons/Arrow-blue.svg',
    button: {
      text: 'Перейти к акциям',
      link: '/promotions/',
    },
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#FFEBF1] h-[300px] w-1/2 rounded-3xl md:py-10 md:px-12',
      title: 'relative z-10 font-medium leading-tight mb-4 text-[clamp(2rem,6vw,2.5rem)]',
      button: 'bg-transparent p-0 text-2xl text-cpink mt-6',
      text: 'relative z-10 w-[60%] text-[clamp(1rem,6vw,1.4rem)] font-normal',
      image: 'absolute bottom-0 right-0 w-[40%]',
      extraImage: 'absolute top-0 left-0 w-[34%] z-0',
    }
  }
]
</script>

<template>
  <section class="w-full">
    <div class="flex flex-row gap-6 w-full">
      <UiCard v-for="(item, index) in promoCards" :key="index" :card="item" />
    </div>
  </section>
</template>
