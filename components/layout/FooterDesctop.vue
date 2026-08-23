<template>
  <footer class="bg-white mt-10 pb-12">
    <div class="container mx-auto py-10">
      <div class="flex flex-row items-start justify-between gap-6">
        <div>
          <NuxtLink to="/" class="block mb-2" aria-label="Главная Daigo">
            <img
              src="/logo.svg"
              alt="Daigo"
              class="w-24 md:w-32"
              loading="lazy"
              decoding="async"
            />
          </NuxtLink>
          <p class="text-[8px] md:text-xs">С 1914 г. заботимся о вашем здоровье</p>
        </div>

        <div class="flex gap-3 md:gap-5 mt-1">
          <a href="https://dzen.ru/daigoru" target="_blank" rel="noopener noreferrer" aria-label="Daigo в Дзене">
            <img src="/icons/social/dzen.svg" alt="" class="w-5 md:w-6 h-6" loading="lazy" decoding="async" />
          </a>
          <a href="https://vk.com/daigoru?roistat_visit=429655" target="_blank" rel="noopener noreferrer" aria-label="Daigo во ВКонтакте">
            <img src="/icons/social/vk.svg" alt="" class="w-5 md:w-6 h-6" loading="lazy" decoding="async" />
          </a>
          <a href="https://t.me/daigoru" target="_blank" rel="noopener noreferrer" aria-label="Daigo в Telegram">
            <img src="/icons/social/telegram.svg" alt="" class="w-5 md:w-6 h-6" loading="lazy" decoding="async" />
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8">
        <section>
          <h2 class="font-medium text-lg md:text-xl mb-2">О нас</h2>
          <ul class="space-y-2 text-base">
            <li><NuxtLink to="/akcii">Акции</NuxtLink></li>
            <li><NuxtLink to="/about">О нас</NuxtLink></li>
            <li><NuxtLink to="/articles">Статьи</NuxtLink></li>
            <li><NuxtLink to="/researches">Исследования</NuxtLink></li>
            <li><NuxtLink to="/quality-and-safety">Качество и безопасность</NuxtLink></li>
            <li><NuxtLink to="/faq">Частые вопросы</NuxtLink></li>
            <li><NuxtLink to="/otzyvy">Отзывы</NuxtLink></li>
            <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
            <li>
              <a href="https://lp.daigo.ru/daigob2b" target="_blank" rel="noopener noreferrer">
                Корпоративным клиентам
              </a>
            </li>
            <li>
              <a href="https://lp.daigo.ru/vns-welcome-daigo" target="_blank" rel="noopener noreferrer">
                Партнёрская программа
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="font-medium text-lg md:text-xl mb-2">Покупателям</h2>
          <ul class="space-y-2 text-base">
            <li><NuxtLink to="/oplata">Оплата</NuxtLink></li>
            <li><NuxtLink to="/usloviya-dostavki">Доставка</NuxtLink></li>
            <li><NuxtLink to="/usloviya-vozvrata-i-obmena">Условия возврата и обмена</NuxtLink></li>
            <li>
              <NuxtLink :to="{ path: '/catalog', query: { podarochnye: 'sertificate' } }">
                Подарочные сертификаты
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="font-medium text-lg md:text-xl mb-2">Юридическая информация</h2>
          <p class="text-sm leading-[1.5]">
            ООО «МЕТАБИОТИК»<br />
            127051, г. Москва, Большой Сухаревский переулок, д. 21, стр. 2<br />
            ИНН 9718234724<br />
            КПП 770201001<br />
            ОГРН 1237700627988
          </p>
        </section>

        <section>
          <h2 class="font-medium text-lg md:text-xl mb-2">Информация</h2>
          <ul class="space-y-2 text-base">
            <li>
              <NuxtLink to="/soglasie-na-obrabotku-personalnykh-dannykh">
                Согласие на обработку персональных данных
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok">
                Согласие на получение рассылок
              </NuxtLink>
            </li>
            <li><NuxtLink to="/privacy">Политика конфиденциальности</NuxtLink></li>
            <li><NuxtLink to="/user-agreement">Пользовательское соглашение</NuxtLink></li>
            <li><NuxtLink to="/terms-sale">Условия продажи товаров</NuxtLink></li>
          </ul>
        </section>
      </div>

      <p class="text-sm md:text-lg font-medium py-4 max-w-4xl">
        БАД. НЕ ЯВЛЯЕТСЯ ЛЕКАРСТВЕННЫМ СРЕДСТВОМ, ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ.
        НЕОБХОДИМО ПРОКОНСУЛЬТИРОВАТЬСЯ СО СПЕЦИАЛИСТОМ
      </p>
    </div>
  </footer>
</template>
