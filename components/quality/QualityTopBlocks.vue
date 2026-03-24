<script setup lang="ts">

const blocks = [
  {
    title: 'Государственная регистрация (СГР)',
    text:
      'Регистрационное досье регулярно обновляется на основании новых научных данных. Срок годности зависит от партии и указан на упаковке. Обновление регистрационного досье применяется к новым партиям.',
  },
  {
    title: 'Производство',
    text:
      'На собственной фабрике у подножья горы Фудзи производится продукт Daigo. Компания-производитель B&S Corporation. Фабрика расположена в заповедном и экологичном районе, в который не доходят токсичные испарения города Токио. Помимо собственной фабрики у компании есть собственные поля, на которых выращиваются соевые бобы для производства Daigo.',
    link: '/researches/item/proizvodstvo-daigo/',
    linkText: 'Подробнее о производстве',
    },
  {
    title: 'Исследования',
    text:
      'Механизм действия и научные материалы. Можно перейти в раздел исследований.',
    link: '/researches',
    linkText: 'Перейти к исследованиям',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div
      v-for="b in blocks"
      :key="b.title"
      class="rounded-2xl bg-hoverbtn p-5 sm:p-6"
    >
      <div class="font-medium text-lg mb-2">{{ b.title }}</div>
      <div class="text-sm sm:text-base text-black/70 whitespace-pre-line">{{ b.text }}</div>

      <NuxtLink
        v-if="b.link"
        :to="b.link"
        class="inline-flex mt-4 text-sm underline text-black/80 hover:text-black transition"
      >
        {{ b.linkText || 'Подробнее' }}
      </NuxtLink>
    </div>
  </div>
</template>