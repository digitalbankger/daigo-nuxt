<template>
  <footer class="hidden md:block bg-white mt-10">
    <div class="container mx-auto py-10 gap-8">

      <div class="flex flex-row justify-between">
        <div>
          <NuxtLink to="/" class="block mb-2">
            <img src="/logo.svg" alt="Daigo" class="w-32" loading="lazy" />
          </NuxtLink>
          <p class="text-xs">С 1905 г. заботимся о вашем здоровье</p>
        </div>

        <div class="flex gap-5">
          <a href="https://dzen.ru/daigoru" target="_blank" rel="noopener">
            <img src="/icons/social/dzen.svg" alt="Дзен" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://vk.com/daigoru?roistat_visit=429655" target="_blank" rel="noopener">
            <img src="/icons/social/vk.svg" alt="VK" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://t.me/daigoru" target="_blank" rel="noopener">
            <img src="/icons/social/telegram.svg" alt="Telegram" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://www.youtube.com/@daigojp_ru" target="_blank" rel="noopener">
            <img src="/icons/social/youtube.svg" alt="YouTube" class="w-6 h-6" loading="lazy" />
          </a>
          <a href="https://daigo.store" target="_blank" rel="noopener">
            <img src="/icons/social/yam.svg" alt="Daigo" class="w-6 h-6" loading="lazy" />
          </a>
        </div>
      </div>

      <div class="flex flex-row justify-between items-start gap-4 md:gap-8">
        <div class="md:w-3/4">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 py-8">
            <div>
              <p class="font-medium text-xl mb-2 order-2 lg:order-1">О нас</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/akcii">Акции</NuxtLink></li>
                <li><NuxtLink to="/about">О нас</NuxtLink></li>
                <li><NuxtLink to="/articles">Статьи</NuxtLink></li>
                <li><NuxtLink to="/researches">Исследования</NuxtLink></li>
                <li><NuxtLink to="/otzyvy">Отзывы</NuxtLink></li>
                <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
              </ul>
            </div>

            <div>
              <p class="font-medium text-xl mb-2 order-1 lg:order-2">Покупателям</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/oplata">Оплата</NuxtLink></li>
                <li><NuxtLink to="/usloviya-dostavki">Доставка</NuxtLink></li>
                <li><NuxtLink to="/certificates">Подарочные сертификаты</NuxtLink></li>
                <!-- <li><NuxtLink to="/referral">Реферальная программа</NuxtLink></li> -->
                <!-- <li><NuxtLink to="/loyalty">Программа лояльности</NuxtLink></li> -->
              </ul>
            </div>

            <div>
              <p class="font-medium text-xl mb-2">Юридическая информация</p>
              <div class="pb-2 mb-4 md:text-sm">
                <p class="w-5/6 leading-[1.5]">
                  ООО «МЕТАБИОТИК» <br>107051, г. Москва, Большой Сухаревский переулок, дом.21, <br>стр. 2  
                  <br>ИНН 9718234724 <br>КПП 770201001 <br>ОГРН 1237700627988
                </p>
              </div>
            </div>
          </div>
          <ul class="space-y-2 w-5/6 text-base">
            <li><NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh">Согласие на обработку персональных данных</NuxtLink></li>
            <li><NuxtLink to="/soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok">Согласие на получение рассылок</NuxtLink></li>
            <li><NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink></li>
          </ul>

        </div>

        <div class="md:w-1/4 text-center">
          <img src="/icons/social/qr.svg" alt="QR-код приложения" class="w-4/6 md:w-full lg:w-4/6 ms-auto" loading="lazy" />
          <p class="w-4/6 md:w-full lg:w-4/6 my-2 ms-auto text-base md:text-sm lg:text-base leading-tight">Наведите камеру<br />и скачайте мобильное приложение Дайго!</p>
          <div class="w-4/6 md:w-full lg:w-4/6 ms-auto flex justify-center gap-4 mt-2">
            <a href="https://play.google.com/store/apps/details?id=ru.daigo.appmobile"><img src="/icons/social/gp.svg" alt="Google Play" class="w-8" loading="lazy" /></a>
            <img src="/icons/social/appstore.svg" alt="App Store" class="w-8" loading="lazy" />
            <a href="https://www.rustore.ru/catalog/app/ru.daigo.appmobile"><img src="/icons/social/rustore.svg" alt="Ru Store" class="w-8" loading="lazy" /></a>
          </div>
        </div>
      </div>

      <p class="text-lg font-medium py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>
    </div>
  </footer>
  <footer class="block md:hidden bg-white mt-10 pb-12">
    <div class="container mx-auto py-10 gap-8">

      <div class="flex flex-row justify-between">
        <div>
          <NuxtLink to="/" class="block mb-2">
            <img src="/logo.svg" alt="Daigo" class="w-24" loading="lazy" />
          </NuxtLink>
          <p class="text-[6px]">С 1905 г. заботимся о вашем здоровье</p>
        </div>

        <div class="flex gap-3 md:gap-5 mt-1">
          <a href="https://dzen.ru/daigoru" target="_blank" rel="noopener">
            <img src="/icons/social/dzen.svg" alt="Дзен" class="w-5 md:w-6 h-6" loading="lazy" />
          </a>
          <a href="https://vk.com/daigoru?roistat_visit=429655" target="_blank" rel="noopener">
            <img src="/icons/social/vk.svg" alt="VK" class="w-5 md:w-6 h-6" loading="lazy" />
          </a>
          <a href="https://t.me/daigoru" target="_blank" rel="noopener">
            <img src="/icons/social/telegram.svg" alt="Telegram" class="w-5 md:w-6 h-6" loading="lazy" />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener">
            <img src="/icons/social/youtube.svg" alt="YouTube" class="w-5 md:w-6 h-6" loading="lazy" />
          </a>
          <a href="https://daigo.store" target="_blank" rel="noopener">
            <img src="/icons/social/yam.svg" alt="Daigo" class="w-5 md:w-6 h-6" loading="lazy" />
          </a>
        </div>
      </div>

      <div class="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8">
        <div class="w-full md:w-3/4">
          <div class="grid grid-cols-1 md:grid-cols-3 pt-8 pb-2 space-y-6">
            <div>
              <p class="font-medium text-lg: md:text-xl mb-2">Покупателям</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/oplata">Оплата</NuxtLink></li>
                <li><NuxtLink to="/usloviya-dostavki">Доставка</NuxtLink></li>
                <li><NuxtLink to="/certificates">Подарочные сертификаты</NuxtLink></li>
                <!-- <li><NuxtLink to="/referral">Реферальная программа</NuxtLink></li> -->
                <!-- <li><NuxtLink to="/loyalty">Программа лояльности</NuxtLink></li> -->
              </ul>
            </div>

            <div>
              <p class="font-medium text-lg: md:text-xl mb-2">О нас</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/akcii">Акции</NuxtLink></li>
                <li><NuxtLink to="/about">О нас</NuxtLink></li>
                <li><NuxtLink to="/articles">Статьи</NuxtLink></li>
                <li><NuxtLink to="/researches">Исследования</NuxtLink></li>
                <li><NuxtLink to="/otzyvy">Отзывы</NuxtLink></li>
                <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
              </ul>
            </div>

            <!-- <div>
              <p class="font-medium text-xl mb-2">Юридическая информация</p>
              <ul class="space-y-2 w-5/6 text-base">
                <li><NuxtLink to="/legal/consent">Согласие на обработку персональных данных</NuxtLink></li>
                <li><NuxtLink to="/legal/personal-data">Политика обработки персональных данных</NuxtLink></li>
                <li><NuxtLink to="/legal/privacy">Политика конфиденциальности</NuxtLink></li>
              </ul>
              <div class="pb-2 mt-4 md:text-sm text-black/50">
                <p class="w-5/6 leading-[1.5]">
                  ООО «МЕТАБИОТИК» 107051, г. Москва, Большой Сухаревский переулок, дом.21, стр. 2  
                  ИНН 9718234724 КПП 771801001 ОГРН 1237700627988
                </p>
              </div>
            </div> -->

            <button
              type="button"
              @click="toggle"
              :aria-expanded="open"
              class="w-full flex items-center justify-start cursor-pointer select-none gap-3"
            >
              <span class="font-medium text-lg: md:text-xl">Юридическая информация</span>
              <img
                src="/icons/arrow-right-pag.svg"
                alt=""
                class="w-4 h-4 transition-transform duration-200 mt-1"
                :class="open ? 'rotate-360' : 'rotate-90'"
              />
            </button>

            <transition name="accordion" @enter="onEnter" @after-enter="onAfterEnter" @leave="onLeave">
              <div v-show="open" class="overflow-hidden">
                <div class="pt-2">
                  <div class="pb-2 mb-4 md:text-sm">
                    <p class="w-5/6 leading-[1.5]">
                      ООО «МЕТАБИОТИК» <br>107051, г. Москва, Большой Сухаревский переулок, дом.21, стр. 2  
                  <br>ИНН 9718234724 <br>КПП 770201001 <br>ОГРН 1237700627988
                    </p>
                  </div>
                  <ul class="space-y-2 w-5/6 text-base">
                    <li><NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh">Согласие на обработку персональных данных</NuxtLink></li>
                    <li><NuxtLink to="/soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok">Политика обработки персональных данных</NuxtLink></li>
                    <li><NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink></li>
                  </ul>
                </div>
              </div>
            </transition>
          </div>

          <p class="text-lg font-medium py-4 w-full">БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ</p>

        </div>

        <div class="w-full md:w-1/4 text-left">
          <!-- <img src="/icons/social/qr.svg" alt="QR-код приложения" class="w-4/6 ms-auto" loading="lazy" /> -->
          <p class="block md:hidden w-full my-2 ms-0 md:ms-auto text-sm md:text-base leading-tight">Скачать мобильное приложение Дайго</p>
          <p class="hidden md:block w-4/6 my-2 ms-0 md:ms-auto text-base leading-tight">Наведите камеру<br />и скачайте мобильное приложение Дайго!</p>
          <div class="w-full ms-0 md:ms-auto flex justify-start gap-4 mt-4">
            <a href="https://play.google.com/store/apps/details?id=ru.daigo.appmobile"><img src="/icons/social/gp.svg" alt="Google Play" class="w-8" loading="lazy" /></a>
            <img src="/icons/social/appstore.svg" alt="App Store" class="w-8" loading="lazy" />
            <a href="https://www.rustore.ru/catalog/app/ru.daigo.appmobile"><img src="/icons/social/rustore.svg" alt="Ru Store" class="w-8" loading="lazy" /></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)

function toggle() {
  open.value = !open.value
}

function onEnter(el: Element) {
  const e = el as HTMLElement
  e.style.height = '0px'
  e.style.transition = 'height 200ms ease'
  requestAnimationFrame(() => {
    e.style.height = e.scrollHeight + 'px'
  })
}
function onAfterEnter(el: Element) {
  const e = el as HTMLElement
  e.style.height = 'auto'
}
function onLeave(el: Element) {
  const e = el as HTMLElement
  e.style.height = e.scrollHeight + 'px'
  e.style.transition = 'height 200ms ease'
  requestAnimationFrame(() => {
    e.style.height = '0px'
  })
}
</script>

<style scoped>
.accordion-enter-from,
.accordion-leave-to { opacity: 0 }
.accordion-enter-active,
.accordion-leave-active { transition: opacity 200ms ease }
</style>