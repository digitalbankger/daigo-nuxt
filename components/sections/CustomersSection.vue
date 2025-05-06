<script setup lang="ts">

const categories = [
  { id: 0, 
    title: 'Принцип действия метабиотиков', 
    text: 'Метабиотики — это новейший класс функциональных добавок, которые не содержат живые микроорганизмы, а их метаболиты и клеточный материал.', 
    image: '/images/customers/allPrinciples.webp', 
    lazy: true,
    styles: {
      card: 'relative overflow-hidden bg-hoverbtn h-[446px] w-full rounded-[30px] md:py-5 md:px-6',
      title: 'relative z-10 w-4/6 font-medium leading-tight mt-6 mb-4 text-[clamp(1.4rem,6vw,2.2rem)]',
      text: 'relative z-10 text-base font-normal w-3/5',
      image: 'absolute bottom-0 right-0 w-[44%]',
    },
    isMetabiotic: true 
  },
  { id: 1, title: 'Принцип действия плазмогенов', image: '/images/customers/tamotsu-group.png', 
    styles: {
      card: 'w-full h-[207px] relative',
      title: 'text-xl',
      image: 'absolute bottom-0 right-0 w-[56%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 2, title: 'Более 100 лет истории', image: '/images/customers/history.png', 
    styles: {
      card: 'w-full h-[207px] relative',
      title: 'text-xl',
      image: 'absolute bottom-0 right-0 w-[70%]',
    }, 
    slug: 'plazmogeny' 
  },
  { id: 3, title: 'Принцип действия аминопептидобиотиков', image: '/images/customers/brainy.png', 
    styles: {
      card: 'w-full h-[207px] relative',
      title: 'text-xl',
      image: 'absolute bottom-0 right-0 w-[56%]',
    }, 
    slug: 'aminopeptidobiotiki' 
  },
  { id: 4, title: 'Производство', image: '/images/customers/factury.png', 
    styles: {
      card: 'w-full h-[207px] relative',
      title: 'text-xl',
      image: 'absolute bottom-0 right-0 w-[50%]',
    }, 
    slug: 'factory' 
  },
]
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <h2 class="text-slider font-medium mb-8">
      Покупателям
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UiCard
        v-if="categories[0]?.isMetabiotic"
        :card="{
          title: categories[0].title,
          text: categories[0].text,
          imageSrc: categories[0].image,
          lazy: categories[0].lazy,
          styles: categories[0].styles,
          showArrow: true,
          tags: [
            { label: 'Зубы и десны', color: 'bg-[#B7F2FF]' },
            { label: 'Кости и мышцы', color: 'bg-[#B7FFBA]' },
            { label: 'Нервная система и мозг', color: 'bg-[#FFD9E3]' },
            { label: 'Кожа и волосы', color: 'bg-[#BDEBFF]' },
            { label: 'Кишечник и иммунитет', color: 'bg-[#FFF48B]' },
          ]
        }"
        class="w-full"
      />

      <div class="grid grid-cols-2 gap-6">
        <NuxtLink
          v-for="category in categories.slice(1)"
          :key="category.id"
          :to="`/catalog?category=${category.slug}`"
          class="relative h-[207px] overflow-hidden group bg-hoverbtn rounded-2.5xl flex flex-col justify-between items-start transition-transform duration-300 hover:-translate-y-1 hover:no-underline"
        >
          <UiCard  
            :card="{
              title: category.title,
              imageSrc: category.image,
              lazy: category.lazy,
              styles: category.styles,
              showArrow: false
            }"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

