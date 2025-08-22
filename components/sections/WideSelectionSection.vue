<template>
  <section class="relative w-full py-16 md:py-16">
    <div class="flex lg:flex-row gap-10">
      <div class="md:w-1/2">
        <h2 class="font-medium leading-tight mb-5 text-slider">
          Ключевые свойства Дайго
        </h2>
         <ul class="text-lg leading-relaxed space-y-4 list-disc list-outside pl-4">
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

      <div class="w-1/2 flex">
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
