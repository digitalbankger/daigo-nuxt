<script setup lang="ts">

const categories = [
  { id: 1, title: 'Бронзовая карта', subtitle: 'Скидка 3%', text: 'От 100 000 ₽ до 499 999 ₽', image: '/images/promotions/bronze.png', 
    styles: {
      card: 'w-full h-[200px] sm:h-[260px] lg:h-[360px] relative',
      title: 'text-2xl lg:text-cardhead leading-tight mb-1 sm:mb-3 font-medium w-full lg:w-2/3',
      subtitle: 'text-2xl mb-2',
      text: 'text-sm sm:text-lg text-black/60 mb-4',
      image: 'absolute bottom-0 right-0 w-[40%] lg:w-[78%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 2, title: 'Серебряная карта', subtitle: 'Скидка 3%', text: 'От 100 000 ₽ до 499 999 ₽', image: '/images/promotions/silver.png', 
    styles: {
      card: 'w-full h-[200px] sm:h-[260px] lg:h-[360px] relative',
      title: 'text-2xl lg:text-cardhead leading-tight mb-1 sm:mb-3 font-medium w-full lg:w-2/3',
      subtitle: 'text-2xl mb-2',
      text: 'text-sm sm:text-lg text-black/60 mb-4',
      image: 'absolute bottom-0 right-0 w-[40%] lg:w-[78%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 3, title: 'Золотая карта', subtitle: 'Скидка 3%', text: 'От 100 000 ₽ до 499 999 ₽', image: '/images/promotions/gold.png', 
    styles: {
      card: 'w-full h-[200px] sm:h-[260px] lg:h-[360px] relative',
      title: 'text-2xl lg:text-cardhead leading-tight mb-1 sm:mb-3 font-medium w-full lg:w-2/3',
      subtitle: 'text-2xl mb-2',
      text: 'text-sm sm:text-lg text-black/60 mb-4',
      image: 'absolute bottom-0 right-0 w-[40%] lg:w-[78%]',
    }, 
    slug: 'aminopeptidobiotiki' 
  },
  { id: 4, title: 'Платиновая карта', subtitle: 'Скидка 3%', text: 'От 100 000 ₽ до 499 999 ₽', image: '/images/promotions/platinum.png', 
    styles: {
      card: 'w-full h-[200px] sm:h-[260px] lg:h-[360px] relative',
      title: 'text-2xl lg:text-cardhead leading-tight mb-1 sm:mb-3 font-medium w-full lg:w-2/3',
      subtitle: 'text-2xl mb-2',
      text: 'text-sm sm:text-lg text-black/60 mb-4',
      image: 'absolute bottom-0 right-0 w-[40%] lg:w-[78%]',
    }, 
    slug: 'factory' 
  },
]
</script>

<template>
  <section class="relative w-full overflow-hidden">

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="relative h-[200px] sm:h-[260px] lg:h-[360px] overflow-hidden group bg-hoverbtn rounded-2.5xl flex flex-col justify-between items-start transition-transform duration-300 hover:-translate-y-1 hover:no-underline"
        >
          <UiCard  
            :card="{
              title: category.title,
              subtitle: category.subtitle,
              text: category.text,
              imageSrc: category.image,
              lazy: true,
              styles: category.styles,
              showArrow: false
            }"
          />
          </div>
      </div>
    </div>
  </section>
</template>