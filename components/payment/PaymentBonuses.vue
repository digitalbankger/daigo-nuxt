<script setup lang="ts">

const promoCards = [
  // {
  //   title: 'Платите бонусами',
  //   text: 'Получайте бонусные баллы за совершенные покупки и используйте их при оплате',
  //   imageSrc: '/images/oplata/bonuces.png',
  //   //extraImage: '/images/Bookmark.webp',
  //   showArrow: false,
  //   arrowSrc: '/icons/Arrow-green.svg',
  //   lazy: true,
  //   button: {
  //     text: 'Баланс бонусов',
  //     link: '/profile/',
  //   },
  //   styles: {
  //     card: 'relative overflow-hidden bg-[#B7FFBA] h-[220px] lg:h-[300px] w-full lg:w-1/2 rounded-3xl md:py-10 px-5 sm:px-10 lg:px-12',
  //     title: 'relative z-10 font-medium leading-tight mb-2 lg:mb-4 text-2xl sm:text-4xl lg:text-[2.5rem]',
  //     text: 'relative z-10 w-[60%] text-sm sm:text-base lg:text-[1.4rem] font-normal',
  //     button: 'bg-transparent p-0 text-lg lg:text-2xl text-cpink mt-6',
  //     image: 'absolute bottom-0 right-0 w-[40%] sm:w-[30%] lg:w-[40%]',
  //     extraImage: 'absolute top-0 left-0 w-[31%] z-0',
  //   }
  // },
  {
    title: 'Акция Daigo',
    text: 'Актуальная информация о скидках и акциях',
    imageSrc: '/images/oplata/promo.png',
    //extraImage: '/images/team.webp',
    showArrow: false,
    arrowSrc: '/icons/Arrow-blue.svg',
    button: {
      text: 'Перейти к акциям',
      link: '/akcii/',
    },
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-[#FFEBF1] h-[220px] lg:h-[300px] w-full lg:w-1/2 rounded-3xl md:py-10 px-5 sm:px-10 lg:px-12',
      title: 'relative z-10 font-medium leading-tight mb-2 lg:mb-4 text-2xl sm:text-4xl lg:text-[2.5rem]',
      button: 'bg-transparent p-0 text-lg lg:text-2xl text-cpink mt-6',
      text: 'relative z-10 w-[60%] text-sm sm:text-base lg:text-[1.4rem] font-normal',
      image: 'absolute bottom-0 right-0 w-[40%] sm:w-[30%] lg:w-[40%]',
      extraImage: 'absolute top-0 left-0 w-[34%] z-0',
    }
  }
]
</script>

<template>
  <section class="w-full">
    <div class="flex flex-col lg:flex-row gap-6 w-full">
      <UiCard v-for="(item, index) in promoCards" :key="index" :card="item" />
    </div>
  </section>
</template>
