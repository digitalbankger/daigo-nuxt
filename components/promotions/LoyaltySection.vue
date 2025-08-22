<script setup lang="ts">

const categories = [
  { id: 1, title: 'Бронзовая карта', image: '/images/promotions/bronze.png', 
    styles: {
      card: 'w-full h-[300px] relative',
      title: 'text-3xl font-medium w-2/3',
      image: 'absolute bottom-0 right-0 w-[78%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 2, title: 'Серебряная карта', image: '/images/promotions/silver.png', 
    styles: {
      card: 'w-full h-[300px] relative',
      title: 'text-3xl font-medium w-2/3',
      image: 'absolute bottom-0 right-0 w-[78%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 3, title: 'Золотая карта', image: '/images/promotions/gold.png', 
    styles: {
      card: 'w-full h-[300px] relative',
      title: 'text-3xl font-medium w-2/3',
      image: 'absolute bottom-0 right-0 w-[78%]',
    }, 
    slug: 'aminopeptidobiotiki' 
  },
  { id: 4, title: 'Платиновая карта', image: '/images/promotions/platinum.png', 
    styles: {
      card: 'w-full h-[300px] relative',
      title: 'text-3xl font-medium w-2/3',
      image: 'absolute bottom-0 right-0 w-[78%]',
    }, 
    slug: 'factory' 
  },
]
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 class="text-slider font-medium mb-8">
      Статусы в программе
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <div class="grid grid-cols-4 gap-6">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/catalog?category=${category.slug}`"
          class="relative h-[300px] overflow-hidden group bg-hoverbtn rounded-2.5xl flex flex-col justify-between items-start transition-transform duration-300 hover:-translate-y-1 hover:no-underline"
        >
          <UiCard  
            :card="{
              title: category.title,
              imageSrc: category.image,
              lazy: true,
              styles: category.styles,
              showArrow: false
            }"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>