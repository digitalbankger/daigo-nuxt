<script setup lang="ts">
const partners = [
  { name: 'Ddrop', logo: '/images/delivery/dc1.png?width=190' },
  { name: 'Major', logo: '/images/delivery/dc2.png?width=190' },
  { name: 'СДЭК', logo: '/images/delivery/dc3.png?width=190' },
  { name: 'Почта России', logo: '/images/delivery/dc4.png?width=190' },
  { name: 'Boxberry', logo: '/images/delivery/dc5.png?width=190' }
]
</script>

<template>
  <section class="w-full py-3 lg:py-8">
    <p class="text-lg sm:text-2xl lg:text-3xl font-medium mb-6 text-left">
      Вы можете выбрать несколько вариантов доставки
    </p>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-start items-center gap-4 md:gap-8">
      <div 
        v-for="partner in partners" 
        :key="partner.name"
        class="flex items-center justify-center bg-white rounded-2xl hover:shadow-md transition-shadow"
      >
        <img 
          :src="partner.logo" 
          :alt="partner.name"
          class="w-auto object-contain"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>
