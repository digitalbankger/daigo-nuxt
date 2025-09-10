<template>
  <section class="relative w-full pt-6 pb-2 lg:py-16">
    <div class="flex flex-col lg:flex-row gap-10 items-start">
      <div class="w-full lg:w-1/2 order-2 sm:order-1">
        <h2 class="font-medium mb-5 text-slider sm:text-4xl lg:text-slider lg:leading-tight w-10/12 sm:w-full">
          Ключевые свойства Дайго
        </h2>
         <ul class="text-sm sm:text-base lg:text-lg leading-relaxed space-y-4 list-disc list-outside pl-4">
          <li>
            Органический продукт: все ингредиенты проходят строгий контроль и сертификацию
          </li>
          <li>
            Без живых бактерий: безопасен для кишечника, не вызывает дисбаланса микрофлоры
          </li>
          <li>
            Подтверждённая эффективность: клинически доказанная поддержка иммунитета и здоровья
          </li>
          <li>
            Подходит для всех возрастов: безопасен для детей, беременных и пожилых людей
          </li>
          <li>
            Отсутствие побочных эффектов: безопасен при длительном применении и подходит для регулярного использования
          </li>
        </ul>
      </div>

      <div class="w-full lg:w-1/2 flex order-1 lg:order-2">
        <NuxtImg
          src="http://localhost:3000/images/wide-selection.webp"
          alt="Продукты Daigo"
          format="webp"
          loading="lazy"
          width="528"
          height="524"
          placeholder
          class="max-w-full h-auto w-full mx-auto aspect-[1/1] aspect-[12/9] object-cover rounded-3xl"
        />
      </div>
    </div>
  </section>
</template>
