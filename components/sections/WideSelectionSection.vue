<template>
  <section class="relative w-full pt-6 pb-2 md:py-16">
    <div class="flex flex-col lg:flex-row gap-10">
      <div class="w-full md:w-1/2 order-2 md:order-1">
        <h2 class="font-medium leading-tight mb-5 text-slider w-10/12 md:w-full">
          Ключевые свойства Дайго
        </h2>
         <ul class="text-sm md:text-lg leading-relaxed space-y-4 list-disc list-outside pl-4">
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

      <div class="w-full md:w-1/2 flex order-1 md:order-2">
        <NuxtImg
          src="http://localhost:3000/images/wide-selection.webp"
          alt="Продукты Daigo"
          format="webp"
          loading="lazy"
          width="528"
          height="524"
          placeholder
          class="max-w-full h-auto w-full mx-auto"
        />
      </div>
    </div>
  </section>
</template>
