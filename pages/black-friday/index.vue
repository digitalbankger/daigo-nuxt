<script setup lang="ts">
import BaseContainer from '~/components/layout/BaseContainer.vue'
import { useCatalogStore } from '@/stores/catalogStore'
import CatalogBanner from '~/components/catalog/CatalogBanner.vue'

definePageMeta({
  layout: 'main',
  title: 'Грандиозная Чёрная Пятница в Daigo!',
})

const catalogStore = useCatalogStore()
await catalogStore.fetchCatalogBanner()

const origin = process.client ? window.location.origin : ''

</script>

<template>
  <BaseContainer>
    <section class="relative w-full pb-12 lg:pb-20">
      <!-- Хлебные крошки -->
      <nav
        class="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6"
      >
        <NuxtLink to="/" class="hover:text-black hover:underline">Главная</NuxtLink>
        <span>/</span>
        <NuxtLink to="/actions" class="hover:text-black hover:underline">Акции</NuxtLink>
        <span>/</span>
        <span class="text-neutral-700">Чёрная пятница</span>
      </nav>

      <!-- Блок 1: баннер + описание -->
      <section class="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-10 lg:mb-14">
        <!-- Левая колонка: большой баннер -->
        <div class="w-full sm:w-1/2 flex items-start justify-center">
          <img
            src="/images/black-friday/business-box-main.jpg"
            alt="Персональная скидка для твоего кишечника"
            class="hidden sm:block w-full h-auto rounded-[18px] object-contain"
          />
          <img
            src="/images/black-friday/business-box-main-mob.jpg"
            alt="Персональная скидка для твоего кишечника"
            class="block sm:hidden w-full h-auto rounded-[18px] object-contain"
          />
        </div>

        <!-- Правая колонка: текст -->
        <div class="flex-1 text-base leading-relaxed space-y-6">
                  <!-- Заголовок -->
      <h1 class="text-product leading-tight font-medium ">
        Грандиозная Чёрная Пятница в Daigo!
      </h1>

          <div class="space-y-3">
            <p>
              УНИКАЛЬНЫЕ СКИДКИ на всю продукцию! 
              Дни сумасшедших покупок! 
              Наша Чёрная Пятница – это целых <strong>10 дней с 21 по 30 Ноября</strong>, дающих возможность купить желанный товар по выгоднейшей цене. 
              <br></br><br></br>Помимо скидок мы предлагаем всем возможность попытать удачу в нашем <strong>КОЛЕСЕ ФОРТУНЫ</strong> - специальной механике, которая даст возможность каждому покупателю получить дополнительные скидки и ценные призы в течение следующих 10 дней!  
            </p>
          </div>

          <div class="space-y-3">
                  <h2 class="text-xl sm:text-[42px] leading-tight font-medium ">
Испытайте удачу и получите подарок или скидку!</h2>
            <p>
              
Скидка по акции «Чёрная Пятница» не суммируется с другими действующими скидками и бонусными программами.
<br></br>НО! Есть одно приятное исключение.
<br></br>Ваша скидка, полученная на «Колесе Фортуны», действует!
<br></br>Крутите колесо, получайте персональный промокод и используйте его вместе со скидками Чёрной Пятницы для двойной выгоды!

            </p>
          </div>

        </div>
      </section>

      <!-- Мобильная вертикальная картинка -->
      <img
        src="/images/black-friday/sticks-vertical-mob.jpg"
        alt="Daigo стики на красной ленте"
        class="block sm:hidden w-auto object-contain"
      />

      <!-- Блок 2: Колесо фортуны + вертикальные стики -->
      <section class="flex flex-col lg:flex-row gap-6 lg:gap-10 mb-10 lg:mb-14">
        <!-- Текст слева -->
        <div class="flex-1 text-base leading-relaxed space-y-6">

          <div class="space-y-3">
            <h3 class="text-xl sm:text-[42px] pb-3 font-medium">Как узнать свою скидку?</h3>
            <p>Вам предстоит участие в динамической и интересной акции! Размеры скидок будет меняться каждый день - ловите момент. </p>

            <ol class="list-disc list-inside space-y-1.5">
              <li>
                Узнать об актуальных предложениях можно следующим образом:
              </li>
              <li>
                В каталоге товаров на сайте. Цены будут обновляться ежедневно.
              </li>
              <li>
                У вашего личного менеджера. Пишите и уточняйте лучшие условия.
              </li>
              <li>
                По телефону, указанному на сайте. Наши менеджеры всегда в курсе всех актуальных акций и предложений!
              </li>
            </ol>

            <br></br>
            <p>Если вы решили попытать удачу в Колесе Фортуны, выполните всего несколько простых действий. Ваш уникальный промокод сохранится в корзине.</p>
            <br></br>
            
            <ol class="list-decimal list-inside space-y-1.5">
              <li>
                Зарегистрируйтесь. Перейдите на страницу акции и укажите свой номер телефона.
              </li>
              <li>
                Крутите колесо! Нажмите на кнопку – и через 5 секунд вы узнаете свой выигрыш.
              </li>
              <li>
                Совершите покупку. Чтобы забрать подарок или воспользоваться скидкой, просто оформите заказ на любую продукцию на нашем сайте.
              </li>
              <li>
                Для применения промокода авторизуйтесь на сайте и добавьте товары в корзину. Ваш промокод можно будет применить в специальном поле в корзине, также он отобразится в вашем профиле.
              </li>
            </ol>
          </div>

          <div class="space-y-3">
            <h3 class="text-xl sm:text-[42px] pb-3 font-medium">Важные моменты:</h3>
            <p>
              Акция для всех совершеннолетних, кто живет в России. Подарки из Колеса Фортуны можно получить при оформлении заказа на сайте . Отдельно подарки не отправляются. Пока не использован выигранный промокод в покупке, крутить колесо снова нельзя. Но есть хорошая новость!  Как только вы оформили о оплатили заказ с промокодом – возвращайтесь и крутите колесо снова! И так много раз в течение всей акции.
            </p>
          </div>

<NuxtLink
  to="/docs/black-friday-rules.pdf"
  target="_blank"
  class="inline-flex mt-2 text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
>
  Подробные условия акции (PDF)
</NuxtLink>
        </div>

        <!-- Картинка справа -->
        <div class="w-full sm:w-5/12">
          <img
            src="/images/black-friday/sticks-vertical.jpg"
            alt="Daigo стики на красной ленте"
            class="hidden sm:block w-auto object-contain"
          />
        </div>
      </section>

      <!-- Блок 3: Баннер «Как выбрать правильный товар?» -->
      <CatalogBanner
        v-if="catalogStore.catalogBanner"
        :banner="catalogStore.catalogBanner"
        class="my-5 md:my-10"
      />
    </section>
  </BaseContainer>
</template>
