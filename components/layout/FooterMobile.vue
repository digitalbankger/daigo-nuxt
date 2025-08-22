<template>
  <footer class="bg-white mt-10">
    <div class="container mx-auto py-10 gap-8">

      <div class="flex flex-row justify-between">
        <div>
          <NuxtLink to="/" class="block mb-2">
            <img src="/logo.svg" alt="Daigo" class="w-24" loading="lazy" />
          </NuxtLink>
          <p class="text-[6px]">С 1905 г. заботимся о вашем здоровье</p>
        </div>

        <div class="flex gap-5 mt-1">
          <a href="https://ya.ru" target="_blank" rel="noopener">
            <img src="/icons/social/dzen.svg" alt="Дзен" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://vk.com" target="_blank" rel="noopener">
            <img src="/icons/social/vk.svg" alt="VK" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener">
            <img src="/icons/social/telegram.svg" alt="Telegram" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener">
            <img src="/icons/social/youtube.svg" alt="YouTube" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://daigo.store" target="_blank" rel="noopener">
            <img src="/icons/social/yam.svg" alt="Daigo" class="w-6 h-6" loading="lazy" />
          </a>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start gap-8">
        <div class="w-full md:w-3/4">
          <div class="grid grid-cols-1 md:grid-cols-3 py-8 space-y-6">
            <div>
              <p class="font-medium text-xl mb-2">Покупателям</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/payment">Оплата</NuxtLink></li>
                <li><NuxtLink to="/delivery">Доставка</NuxtLink></li>
                <li><NuxtLink to="/certificates">Подарочные сертификаты</NuxtLink></li>
                <li><NuxtLink to="/referral">Реферальная программа</NuxtLink></li>
                <li><NuxtLink to="/partners">Партнерская программа</NuxtLink></li>
              </ul>
            </div>

            <div>
              <p class="font-medium text-xl mb-2">О нас</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/promotions">Акции</NuxtLink></li>
                <li><NuxtLink to="/about">О нас</NuxtLink></li>
                <li><NuxtLink to="/articles">Статьи</NuxtLink></li>
                <li><NuxtLink to="/research">Исследования</NuxtLink></li>
                <li><NuxtLink to="/reviews">Отзывы</NuxtLink></li>
                <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
              </ul>
            </div>

            <div>
              <p class="font-medium text-xl mb-2">Юридическая информация</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/legal/consent">Согласие на обработку персональных данных</NuxtLink></li>
                <li><NuxtLink to="/legal/personal-data">Политика обработки персональных данных</NuxtLink></li>
                <li><NuxtLink to="/legal/privacy">Политика конфиденциальности</NuxtLink></li>
              </ul>
            </div>
          </div>
          <div class="pb-4 md:text-sm text-black/50">
            <p class="w-5/6 leading-[1.5]">
              ООО «МЕТАБИОТИК» 107051, г. Москва, Большой Сухаревский переулок, дом.21, стр. 2  
              ИНН 9718234724 КПП 771801001 ОГРН 1237700627988
            </p>
          </div>

        </div>

        <div class="w-full md:w-1/4 text-center">
          <!-- <img src="/icons/social/qr.svg" alt="QR-код приложения" class="w-4/6 ms-auto" loading="lazy" /> -->
          <p class="block md:hidden w-4/6 my-2 ms-auto text-base leading-tight">Скачать мобильное приложение Дайго</p>
          <p class="hidden md:block w-4/6 my-2 ms-auto text-base leading-tight">Наведите камеру<br />и скачайте мобильное приложение Дайго!</p>
          <div class="w-4/6 ms-auto flex justify-center gap-4 mt-2">
            <img src="/icons/social/huawei.svg" alt="Huawei" class="w-8" loading="lazy" />
            <img src="/icons/social/gp.svg" alt="Google Play" class="w-8" loading="lazy" />
            <img src="/icons/social/appstore.svg" alt="App Store" class="w-8" loading="lazy" />
            <img src="/icons/social/rustore.svg" alt="Ru Store" class="w-8" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>
