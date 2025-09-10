<template>
  <section
    v-if="faq?.items?.length"
    class="mt-10 sm:mt-16"
    itemscope
    itemtype="https://schema.org/FAQPage"
  >
    <h2 class="text-slider sm:text-product lg:text-slider leading-tight font-medium mb-6 sm:mb-10">
      Часто задаваемые вопросы
    </h2>

    <div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
      <!-- Картинка -->
      <div v-if="faq.image" class="w-full lg:w-[42%]">
        <img
          :src="faq.image"
          alt="FAQ"
          class="w-full h-auto sm:h-[350px] lg:h-auto rounded-2xl sm:rounded-3xl object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <!-- Аккордеоны -->
      <div class="w-full" :class="{ 'lg:w-[58%]': faq.image }">
        <div v-for="(f, i) in faq.items" :key="i" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <AccordionItem :title="f.q">
            <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
              <p itemprop="text">{{ f.a }}</p>
            </div>
          </AccordionItem>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AccordionItem from '../ui/AccordionItem.vue';

export interface FaqItem { q: string; a: string }
export interface ProductFaq { image?: string; items: FaqItem[] }

defineProps<{ faq?: ProductFaq }>()
</script>
