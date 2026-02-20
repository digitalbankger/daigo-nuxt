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

const linkFor = (c: Category) => {
  if (!c.slug || c.slug === 'catalog') return '/catalog'
  return { path: '/catalog', query: { napravlennost: c.slug } }
}
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 class="w-11/12 lg:w-full text-slider sm:text-product lg:text-slider leading-tight font-medium mb-6 sm:mb-10">
      Выбор продуктов <br class="lg:hidden"/>по направлениям
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
      <template v-for="category in categories" :key="category.id">
        <div
          v-if="category.isPromo"
          class="col-span-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 
             bg-cover bg-bottom rounded-2.5xl px-6 sm:px-10 py-7 sm:py-12 lg:py-7 flex flex-row gap-3 relative overflow-hidden bg-[#83A255]"
        >
          <img src="/icons/deal.svg" class="w-[90px] sm:w-[140px] absolute top-0 left-2 z-0"/>

          <div class="relative z-10 flex flex-col gap-3 w-[80%] sm:w-[55%] justify-center">
            <h3 class="xs-max:text-2xl text-[32px] sm:text-product font-medium text-white">
              Акции <span class="text-[#fff]">Daigo</span>
            </h3>
            <p class="text-sm sm:text-2xl text-gray-800 my-0 sm:mb-4 lg:my-4 leading-snug text-white/90">
              Актуальная информация<br></br>о скидках и акциях
            </p>
            <NuxtLink
              to="/akcii"
              class="text-[#fff] inline-flex items-center gap-2 text-sm sm:text-2xl font-normal transition duration-300 group"
            >
              Перейти к акциям
              <img
                src="/icons/arrow-white.svg"
                alt="→"
                class="w-6 h-6 pt-0.5 transition-transform duration-300 transform group-hover:translate-x-1"
              />
            </NuxtLink>
          </div>

          <div class="absolute lg:relative right-0 bottom-0 z-10 sm:h-[258px] lg:h-auto w-[40%] sm:w-[45%]">
            <img src="/images/categories/akcii.png" class="w-full sm:w-10/12 lg:w-full absolute bottom-4 lg:bottom-0 lg:block"/>
          </div>
        </div>

        <NuxtLink
          v-else
          :to="linkFor(category)"
          class="relative overflow-hidden group bg-hoverbtn border border-hoverbtn rounded-xl sm:rounded-2.5xl px-2.5 sm:px-6 py-3 sm:py-7 flex flex-col justify-between items-start min-h-[190px] sm:min-h-[280px] transition-transform duration-300  hover:shadow-productcard hover:no-underline"
        >
          <img
            src="/icons/arrow-up-right.svg"
            alt="→"
            class="absolute top-2 sm:top-4 right-2 sm:right-4 w-6 sm:w-10 h-6 sm:h-10 transition-transform duration-300 transform rotate-0 group-hover:rotate-45"
          />

          <h3 
            class="text-base sm:text-2xl mb-4 w-[74%] leading-tight font-light sm:font-normal"
            :class="{
              'w-[86%]': category.slug === 'catalog',
              '!w-[90%] sm:!w-[70%]': category.slug === 'mozg-i-nervnaya-sistema'
            }"

          >
            {{ category.title }}
          </h3>

          <img
            :src="category.image"
            :alt="category.title"
            class="absolute bottom-0 right-0 mt-auto"
            :class="category.slug === 'catalog' ? 'w-full' : 'w-[70%] sm:w-[60%]'"
          />
          
        </NuxtLink>
      </template>
    </div>
  </section>
</template>
