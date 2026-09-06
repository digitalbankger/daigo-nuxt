<script setup lang="ts">
interface Category {
  id: number
  title: string
  image: string
  slug: string
}

const categories: Category[] = [
  { id: 0, title: 'Посмотреть весь каталог', image: '/images/categories/all.png', slug: 'catalog' },
  { id: 1, title: 'Кишечник и иммунитет', image: '/images/categories/kishechnik.png', slug: 'kishechnik-i-immunitet' },
  { id: 2, title: 'Кожа и волосы', image: '/images/categories/hair.png', slug: 'kozha-i-volosy' },
  { id: 3, title: 'Зубы и десны', image: '/images/categories/zuby.png', slug: 'zuby-i-desna' },
  { id: 4, title: 'Кости и мышцы', image: '/images/categories/kosti.png', slug: 'kosti-i-myshtsy' },
  { id: 5, title: 'Мозг и нервная система', image: '/images/categories/brain.png', slug: 'mozg-i-nervnaya-sistema' },
]

const doctorsProgramUrl = 'https://res.daigo.ru'

const linkFor = (c: Category) => {
  if (c.slug === 'catalog') return '/catalog'
  return `/catalog/${c.slug}`
}
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 class="w-11/12 lg:w-full text-slider sm:text-product lg:text-slider leading-tight font-medium mb-6 sm:mb-10">
      Выбор продуктов <br class="lg:hidden"/>по направлениям
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="linkFor(category)"
        class="relative overflow-hidden group bg-hoverbtn border border-hoverbtn rounded-xl sm:rounded-2.5xl px-2.5 sm:px-6 py-3 sm:py-7 flex flex-col justify-between items-start min-h-[190px] sm:min-h-[280px] transition-transform duration-300 hover:shadow-productcard hover:no-underline"
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

      <NuxtLink
        to="/akcii"
        class="relative overflow-hidden group bg-cpinklight border border-cpinklight rounded-xl sm:rounded-2.5xl px-2.5 sm:px-6 py-3 sm:py-7 flex flex-col justify-between items-start min-h-[190px] sm:min-h-[280px] transition-transform duration-300 hover:shadow-productcard hover:no-underline"
      >
        <span class="absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full bg-white/35 p-1.5 sm:p-2.5">
          <img
            src="/icons/arrow-right-b.svg"
            alt="→"
            class="w-4 sm:w-5 h-4 sm:h-5 rotate-[-45deg] transition-transform duration-300 transform group-hover:rotate-0"
          />
        </span>

        <h3 class="text-base sm:text-2xl mb-4 w-[78%] leading-tight font-light sm:font-normal text-black">
          Актуальные<br />скидки и акции
        </h3>

        <img
          src="/images/categories/akcii.png"
          alt="Актуальные скидки и акции"
          class="absolute bottom-0 right-0 w-[78%] sm:w-[70%] lg:w-[70%] mt-auto"
        />
      </NuxtLink>

      <a
        :href="doctorsProgramUrl"
        target="_blank"
        rel="noopener"
        class="relative overflow-hidden group bg-[#458D89] border border-[#458D89] rounded-xl sm:rounded-2.5xl px-2.5 sm:px-6 py-3 sm:py-7 flex flex-col justify-between items-start min-h-[190px] sm:min-h-[280px] transition-transform duration-300 hover:shadow-productcard hover:no-underline"
      >
        <span class="absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full bg-white/20 p-1.5 sm:p-2.5">
          <img
            src="/icons/arrow-right-b.svg"
            alt="→"
            class="w-4 sm:w-5 h-4 sm:h-5 rotate-[-45deg] transition-transform duration-300 transform group-hover:rotate-0"
          />
        </span>

        <h3 class="relative z-10 text-base sm:text-2xl mb-4 w-[74%] leading-tight font-light sm:font-normal text-white">
          Наблюдательная<br />программа
        </h3>

        <span class="medical-cross" aria-hidden="true" />

        <p class="relative z-10 text-sm sm:text-xl leading-tight text-white/90 mt-auto mb-1 sm:mb-0 w-[100%]">
          Для врачей<br />амбулаторного звена
        </p>
      </a>
    </div>
  </section>
</template>

<style scoped>
.medical-cross {
  position: absolute;
  opacity: 0.7;
  right: 6%;
  bottom: 22%;
  width: 50%;
  max-width: 150px;
  aspect-ratio: 1;
  color: #a8cfcd;
}

.medical-cross::before,
.medical-cross::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 10px;
  background: currentColor;
  transform: translate(-50%, -50%);
}

.medical-cross::before {
  width: 44%;
  height: 100%;
}

.medical-cross::after {
  width: 100%;
  height: 44%;
}

@media (min-width: 640px) {
  .medical-cross::before,
  .medical-cross::after {
    border-radius: 14px;
  }
}
</style>
