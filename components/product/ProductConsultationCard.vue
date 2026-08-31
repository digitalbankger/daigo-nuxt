<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import UiInput from "~/components/ui/UiInput.vue";
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue";
import expertImage from "~/assets/images/consultation/expert-reference.png";
import { useBodyScrollLock } from "~/composables/useBodyScrollLock";
import { useAnalytics } from "~/composables/useAnalytics";

const props = defineProps<{
  productId: string | number;
  productTitle?: string;
}>();

const analytics = useAnalytics();
const isOpen = ref(false);
const isSubmitting = ref(false);
const isSuccess = ref(false);
const submitError = ref("");
const consentError = ref("");

const form = reactive({
  name: "",
  phone: "",
  trap: "",
});

const fieldErrors = reactive({
  name: "",
  phone: "",
});

const agreed = ref(false);
const isScrollLocked = computed(() => isOpen.value);
useBodyScrollLock(isScrollLocked);

const normalizedProductId = computed(() => String(props.productId || "").trim());

function normalizePhone(value: string) {
  let digits = String(value || "").replace(/\D/g, "");

  // Российский номер, введённый через 8, приводим к формату 7XXXXXXXXXX.
  if (digits.length === 11 && digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  // 10 цифр без кода страны считаем российским мобильным номером.
  if (digits.length === 10) {
    digits = `7${digits}`;
  }

  return digits;
}

function validateName() {
  fieldErrors.name =
    form.name.trim().length >= 2 ? "" : "Введите имя";
  return !fieldErrors.name;
}

function validatePhone() {
  const digits = normalizePhone(form.phone);
  fieldErrors.phone =
    digits.length >= 10 && digits.length <= 15
      ? ""
      : "Введите корректный номер телефона";
  return !fieldErrors.phone;
}

function resetState() {
  submitError.value = "";
  consentError.value = "";
  fieldErrors.name = "";
  fieldErrors.phone = "";
  isSuccess.value = false;
}

function openModal() {
  if (!normalizedProductId.value) return;
  resetState();
  isOpen.value = true;

  if (import.meta.client) {
    window.addEventListener("keydown", onKeydown);
  }
}

function closeModal() {
  if (isSubmitting.value) return;
  isOpen.value = false;

  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeModal();
}

async function submit() {
  submitError.value = "";
  consentError.value = "";

  const nameValid = validateName();
  const phoneValid = validatePhone();

  if (!agreed.value) {
    consentError.value = "Подтвердите согласие на обработку персональных данных";
  }

  if (!nameValid || !phoneValid || !agreed.value || form.trap) return;
  if (!normalizedProductId.value) {
    submitError.value = "Не удалось определить товар. Обновите страницу.";
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/feedback/consultation", {
      method: "POST",
      body: {
        type: "product",
        product_id: normalizedProductId.value,
        phone_number: normalizePhone(form.phone),
        name: form.name.trim(),
      },
    });

    analytics.reach("product_consultation_submit", {
      form: "product_consultation",
      product_id: normalizedProductId.value,
      ...(props.productTitle ? { product_title: props.productTitle } : {}),
    });

    isSuccess.value = true;
    form.name = "";
    form.phone = "";
    agreed.value = false;
  } catch (error: any) {
    submitError.value =
      error?.data?.message ||
      error?.statusMessage ||
      "Не удалось отправить заявку. Попробуйте ещё раз.";
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener("keydown", onKeydown);
  }
});
</script>

<template>
  <div>
    <!-- Баннер под CTA. Второй баннер с тестом пока намеренно не добавляем. -->
    <button
      type="button"
      class="group relative flex min-h-[132px] w-full overflow-hidden rounded-2xl bg-[#F5F0E8] text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(58,45,29,0.10)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[142px]"
      :disabled="!normalizedProductId"
      aria-label="Записаться на бесплатную консультацию специалиста"
      @click="openModal"
    >
      <span class="relative z-10 flex w-[62%] flex-col p-4 sm:p-5">
        <span class="text-[15px] font-medium leading-[1.2] sm:text-base">
          Бесплатная консультация<br />специалиста
        </span>

        <span class="mt-auto flex items-center gap-2 pt-4 text-[11px] text-black/65 sm:text-xs">
          <span
            class="flex size-7 shrink-0 items-center justify-center rounded-full border border-black/20 transition duration-300 group-hover:border-primary group-hover:text-primary"
            aria-hidden="true"
          >
            ↗
          </span>
          <span>Закажите звонок специалиста</span>
        </span>
      </span>

      <span class="absolute inset-y-0 right-0 w-[43%] overflow-hidden">
        <img
          :src="expertImage"
          alt=""
          class="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.025]"
          loading="lazy"
          decoding="async"
        />
        <span
          class="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#F5F0E8] to-transparent"
          aria-hidden="true"
        />
      </span>
    </button>

    <Teleport to="body">
      <Transition name="consultation-fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-[100000] flex items-start justify-center overflow-y-auto bg-black/15 px-3 py-5 backdrop-blur-[1px] sm:items-center sm:px-5 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-consultation-title"
          @click.self="closeModal"
        >
          <div
            class="relative grid w-full max-w-[760px] overflow-hidden rounded-[22px] border border-black/20 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.22)] sm:grid-cols-[1.12fr_.88fr]"
          >
            <button
              type="button"
              class="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-black/45 shadow-sm transition hover:text-black"
              aria-label="Закрыть форму консультации"
              @click="closeModal"
            >
              ×
            </button>

            <div class="p-5 sm:p-7 lg:p-8">
              <template v-if="!isSuccess">
                <h2
                  id="product-consultation-title"
                  class="max-w-[360px] text-2xl font-medium leading-tight sm:text-[28px]"
                >
                  Бесплатная консультация специалиста
                </h2>

                <p class="mt-2 max-w-[390px] text-sm leading-relaxed text-black/60">
                  Заполните форму, и специалист свяжется с вами и ответит на вопросы по продукту
                  <span v-if="productTitle" class="font-medium text-black/75">
                    {{ productTitle }}
                  </span>.
                </p>

                <div class="mt-5 space-y-2 text-xs text-black/60 sm:text-[13px]">
                  <div class="flex items-center gap-2">
                    <span class="flex size-5 items-center justify-center rounded-full bg-[#EEF4FF] text-[11px]">◷</span>
                    <span>Консультирование: по будням с 9:00 до 18:00</span>
                  </div>
                  <!-- <div class="flex items-center gap-2">
                    <span class="flex size-5 items-center justify-center rounded-full bg-[#EEF4FF] text-[11px]">▢</span>
                    <span>Продолжительность: около 15 минут</span>
                  </div> -->
                </div>

                <form class="mt-5 space-y-3" @submit.prevent="submit">
                  <UiInput
                    v-model="form.name"
                    name="consultation_name"
                    type="text"
                    autocomplete="name"
                    placeholder="Ваше имя"
                    background="bg-white"
                    :maxlength="100"
                    :error="fieldErrors.name"
                    @blur="validateName"
                  />

                  <UiInput
                    v-model="form.phone"
                    name="consultation_phone"
                    type="tel"
                    inputmode="tel"
                    mask="ru-phone"
                    autocomplete="tel"
                    placeholder="+7 ___ ___-__-__"
                    background="bg-white"
                    :maxlength="22"
                    :error="fieldErrors.phone"
                    @blur="validatePhone"
                  />

                  <!-- Honeypot: реальный пользователь поле не видит. -->
                  <input
                    v-model="form.trap"
                    type="text"
                    class="hidden"
                    tabindex="-1"
                    autocomplete="off"
                    aria-hidden="true"
                  />

                  <div>
                    <BaseCheckbox v-model="agreed" :error="Boolean(consentError)">
                      <span class="text-[11px] leading-[1.35] text-black/55">
                        Согласен с условиями
                        <NuxtLink
                          to="/soglasie-na-obrabotku-personalnykh-dannykh"
                          class="underline underline-offset-2 hover:text-black"
                          target="_blank"
                        >
                          обработки персональных данных
                        </NuxtLink>
                        и
                        <NuxtLink
                          to="/privacy"
                          class="underline underline-offset-2 hover:text-black"
                          target="_blank"
                        >
                          политикой конфиденциальности
                        </NuxtLink>.
                      </span>
                    </BaseCheckbox>
                    <p v-if="consentError" class="mt-1 text-xs text-red-600">
                      {{ consentError }}
                    </p>
                  </div>

                  <button
                    type="submit"
                    class="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 text-sm font-medium text-white transition disabled:cursor-wait disabled:opacity-60"
                    :disabled="isSubmitting"
                  >
                    <span>{{ isSubmitting ? "Отправляем…" : "Записаться на консультацию" }}</span>
                    <span
                      v-if="!isSubmitting"
                      class="transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>

                  <p v-if="submitError" class="text-sm text-red-600">
                    {{ submitError }}
                  </p>
                </form>
              </template>

              <div v-else class="flex min-h-[360px] flex-col justify-center">
                <span
                  class="flex size-12 items-center justify-center rounded-full bg-[#EEF8F0] text-2xl text-[#2B9C47]"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <h2 class="mt-5 text-2xl font-medium">Заявка отправлена</h2>
                <p class="mt-2 max-w-[360px] text-sm leading-relaxed text-black/60">
                  Спасибо. Специалист Daigo свяжется с вами в рабочее время.
                </p>
                <button
                  type="button"
                  class="mt-6 h-11 w-full rounded-xl border border-primary px-5 text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
                  @click="closeModal"
                >
                  Закрыть
                </button>
              </div>
            </div>

            <div class="relative hidden min-h-[430px] bg-[#F4EFE7] sm:block">
              <img
                :src="expertImage"
                alt="Эксперт Daigo"
                class="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
                decoding="async"
              />
              <div
                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-6 pt-24 text-white"
              >
                <p class="text-sm font-medium">Персональная консультация по продукту</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.consultation-fade-enter-active,
.consultation-fade-leave-active {
  transition: opacity 180ms ease;
}

.consultation-fade-enter-from,
.consultation-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .consultation-fade-enter-active,
  .consultation-fade-leave-active {
    transition: none;
  }
}
</style>
