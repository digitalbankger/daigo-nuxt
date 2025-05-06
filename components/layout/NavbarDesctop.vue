<template>
  <nav class="flex flex-row items-center justify-between py-9 gap-7 px-5">
    <div class="flex items-center gap-7 shrink-0">
      <NuxtLink to="/" aria-label="Главная">
        <img src="/logo.svg" alt="daigo logo" class="h-8" />
      </NuxtLink>

      <ul class="flex items-center gap-5 text-xl font-normal tracking-wide text-black">
        <li><NuxtLink to="/catalog">Каталог</NuxtLink></li>
        <li><NuxtLink to="/articles">Статьи</NuxtLink></li>
        <li><NuxtLink to="/promotions">Акции</NuxtLink></li>
        <li><NuxtLink to="/reviews">Отзывы</NuxtLink></li>
        <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
      </ul>
    </div>

    <div class="hidden lg:block ms-auto w-[420px]">
      <SearchBar />
    </div>

    <div class="flex flex-row items-center gap-5 shrink-0 text-xl text-black">
      <NuxtLink to="/cart" aria-label="Корзина" class="hover:text-blue-500 transition">
        <img src="/icons/cart.svg"/>
      </NuxtLink>
      <NuxtLink to="/profile" aria-label="Профиль" class="hover:text-blue-500 transition">
        <img src="/icons/person.svg"/>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
    import SearchBar from '~/components/ui/SearchInput.vue'
</script>