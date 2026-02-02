<template>
  <section class="relative bg-hoverbtn rounded-2xl px-6 py-10 overflow-hidden">
    <img
      src="/images/elements/lb.png"
      alt=""
      class="absolute bottom-0 left-0 w-32 sm:w-40 pointer-events-none"
      loading="lazy"
    />
    <img
      src="/images/elements/rt.png"
      alt=""
      class="absolute top-0 right-0 w-32 sm:w-40 pointer-events-none"
      loading="lazy"
    />

    <div class="flex flex-col lg:flex-row items-center justify-between gap-14 relative z-10">
      <div class="sm:w-7/12">
        <h2 class="font-medium text-[32px] leading-[130%] mb-4">
          Хотите принять участие в программе лояльности и узнавать об акциях и скидках?
        </h2>
        <p class="text-[20px] leading-[120%] font-normal">
          Подпишитесь на email-рассылку и будьте в курсе всех новостей!
        </p>
      </div>

      <form @submit.prevent="submit" class="flex flex-col gap-3 sm:w-[33%] me-auto">
        <BaseInput
          v-model="email"
          placeholder="Email@gmail.com"
          :rules="[
              val => !!val || 'Поле обязательно',
              val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Некорректный email'
          ]"
          inputClass="bg-transparent"
          class="w-4/5"
        />
        <UiButton variant="outline" class="!w-4/5">Подписаться</UiButton>
        
        <BaseCheckbox v-model="agreeRequired">
          <span>
            Я принимаю
            <a href="/privacy" class="underline">политику конфиденциальности</a>
            и
            <a href="/soglasie-na-obrabotku-personalnykh-dannykh" class="underline">согласие на обработку персональных данных</a>
          </span>
        </BaseCheckbox>

        <BaseCheckbox v-model="agreeMarketing">
          <span>
            Я даю согласие на получение информационных и рекламных рассылок
            (<a href="/soglasie-na-poluchenie-informatsionnykh-i-reklamnykh-rassylok" class="underline">условия</a>)
          </span>
        </BaseCheckbox>

      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '~/components/form/BaseInput.vue'
import UiButton from '~/components/ui/Button.vue'
import BaseCheckbox from '~/components/ui/BaseCheckbox.vue'

const email = ref('')
const agreeRequired = ref(false)
const agreeMarketing = ref(false)

function submit() {
  if (!agreeRequired.value) {
    alert('Необходимо согласие с политикой конфиденциальности и обработкой персональных данных')
    return
  }
  console.log('Подписка:', { email: email.value, agreeMarketing: agreeMarketing.value })
}
</script>
