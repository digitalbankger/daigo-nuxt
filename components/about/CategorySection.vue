<script setup lang="ts">
interface Category {
  id: number
  title?: string
  content?: string
  image?: string
  slug?: string
  isPromo?: boolean
}

const categories: Category[] = [
  { id: 0, title: '>25', content: 'Опубликованных исследований в Японии, России и Европе', image: '/images/about/feat1.png', },
  { id: 1, title: '>500', content: 'Врачей сотрудничают с Daigo', image: '/images/about/feat2.png',},
  { id: 2, title: '>400 000', content: 'Eдиниц проданной продукции', image: '/images/about/feat3.png',},
]
</script>

<template>
  <section class="relative w-full overflow-hidden">

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      <template v-for="category in categories" :key="category.id">
        <div
          class="relative overflow-hidden group bg-hoverbtn rounded-2.5xl px-6 py-7 flex flex-col justify-between items-start min-h-[150px] md:min-h-[280px] transition-transform duration-300"
        >

          <h3 class="text-[32px] md:text-[56px] font-medium mb-2 w-[70%]">
            {{ category.title }}
          </h3>
          <p 
            class="text-sm md:text-base text-gray-600 mb-auto"
            :class="category.id === 0 ? 'w-[70%]' : 'w-[56%] md:w-[50%]'"
          >
            {{ category.content }}
          </p>

          <img
            :src="category.image"
            :alt="category.title"
            class="absolute bottom-0 right-0 mt-auto"
            :class="category.id === 2 ? 'w-[36%] md:w-[40%]' : 'w-[40%] md:w-[50%]'"
          />
          
        </div>
      </template>
    </div>
  </section>
</template>
