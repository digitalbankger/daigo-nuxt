<script setup lang="ts">
interface Category {
  id: number
  title?: string
  image?: string
  slug?: string
  isPromo?: boolean
}

const categories: Category[] = [
  { id: 0, title: 'Посмотреть весь каталог', image: '/images/categories/all.png', slug: 'catalog' },
  { id: 1, title: 'Кишечник и иммунитет', image: '/images/categories/kishechnik.png', slug: 'kishechnik-i-immunitet' },
  { id: 2, title: 'Кожа и волосы', image: '/images/categories/hair.png', slug: 'kozha-i-volosy' },
  { id: 3, title: 'Зубы и десны', image: '/images/categories/zuby.png', slug: 'zuby-i-desna' },
  { id: 4, title: 'Кости и мышцы', image: '/images/categories/kosti.png', slug: 'kosti-i-myshtsy' },
  { id: 5, title: 'Нервная система и мозг', image: '/images/categories/brain.png', slug: 'mozg-i-nervnaya-sistema' },
  { id: 6, image: '/images/categories/akcii.png', isPromo: true },
]
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 class="w-11/12 md:w-full text-slider leading-10 font-medium mb-6 md:mb-10">
      Выбор продуктов по направлениям
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 md:gap-6">
      <template v-for="category in categories" :key="category.id">
        <div
          v-if="category.isPromo"
          class="col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 
             bg-cover bg-bottom rounded-2.5xl px-6 py-7 flex flex-row gap-3 relative overflow-hidden bg-cpinklight"
        >
          <img src="/icons/deal.svg" class="w-[90px] md:w-[140px] absolute top-0 left-2 z-0"/>

          <div class="relative z-10 flex flex-col gap-3 w-[80%] md:w-[55%] justify-center">
            <h3 class="text-[32px] md:text-product font-medium text-black mb-0 md:mb-2">
              Акции <span class="text-[#FA458A]">Daigo</span>
            </h3>
            <p class="text-sm md:text-2xl text-gray-800 my-0 md:my-4 leading-snug">
              Актуальная информация<br></br>о скидках и акциях
            </p>
            <NuxtLink
              to="/akcii"
              class="text-[#FA458A] inline-flex items-center gap-2 text-sm md:text-2xl font-normal transition duration-300 group"
            >
              Перейти к акциям
              <img
                src="/icons/arrow-pink.svg"
                alt="→"
                class="w-6 h-6 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>

          <div class="absolute right-0 md:relative z-10 w-[40%] md:w-[45%]">
            <img src="/images/categories/akcii.png" class="w-full absolute md:block"/>
          </div>
        </div>

        <NuxtLink
          v-else
          :to="`/catalog?category=${category.slug}`"
          class="relative overflow-hidden group bg-hoverbtn border border-hoverbtn rounded-xl md:rounded-2.5xl px-2.5 md:px-6 py-3 md:py-7 flex flex-col justify-between items-start min-h-[190px] md:min-h-[280px] transition-transform duration-300  hover:shadow-productcard hover:no-underline"
        >
          <img
            src="/icons/arrow-up-right.svg"
            alt="→"
            class="absolute top-2 md:top-4 right-2 md:right-4 w-6 md:w-10 h-6 md:h-10 transition-transform duration-300 transform rotate-0 group-hover:rotate-45"
          />

          <h3 
            class="text-base md:text-2xl mb-4 w-[70%] font-light md:font-normal"
            :class="{
              'w-[86%]': category.slug === 'catalog',
              '!w-[90%]': category.slug === 'mozg-i-nervnaya-sistema'
            }"

          >
            {{ category.title }}
          </h3>

          <img
            :src="category.image"
            :alt="category.title"
            class="absolute bottom-0 right-0 mt-auto"
            :class="category.slug === 'catalog' ? 'w-full' : 'w-[60%]'"
          />
          
        </NuxtLink>
      </template>
    </div>
  </section>
</template>
