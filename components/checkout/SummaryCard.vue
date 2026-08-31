<script setup lang="ts">
import { computed, ref, reactive, nextTick, onMounted, watch } from "vue";
import { useCartStore } from "~/stores/cartStore";
import { useAuthStore } from "~/stores/authStore";
import { useUserStore } from "~/stores/userStore";
import { useCheckoutStore } from "~/stores/checkoutStore";
import {
  bonusService,
  type BonusCalculateResponse,
} from "@/services/bonusService";
import Button from "../ui/Button.vue";
import UiInput from "../ui/UiInput.vue";
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue";
import UiIcon from "~/components/ui/UiIcon.vue";
import { useAnalytics } from "~/composables/useAnalytics";
import {
  sendGuestPreorderFireAndForget,
  ensureGuestSessionId,
} from "@/services/guestPreorder";
import PaymentWarning from "./PaymentWarning.vue";
import { normalizeMediaUrl } from "~/utils/mediaUrl";
import {
  EVOLUTION_SINGLE_DELIVERY_MESSAGE,
  isEvolutionSingleOnlyCart,
} from "~/utils/evolutionCart";

const analytics = useAnalytics();
const cartStore = useCartStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const checkoutStore = useCheckoutStore();

const props = withDefaults(
  defineProps<{
    mode?: "cart" | "checkout";
    checkoutView?: "all" | "items" | "summary";
    consent?: boolean;
    consentError?: string;
  }>(),
  {
    mode: "cart",
    checkoutView: "all",
    consent: false,
    consentError: "",
  },
);

const emit = defineEmits<{
  (e: "cta"): void;
  (e: "update:consent", value: boolean): void;
}>();

const form = cartStore.userForm;
const detailsOpen = ref(props.checkoutView !== "items");
const runtimeConfig = useRuntimeConfig();
const imageBase = String(runtimeConfig.public.daigoApiBase || "").replace(
  /\/$/,
  "",
);
const checkoutDetailsId = computed(
  () => `checkout-order-details-${props.checkoutView}`,
);
const showCheckoutItems = computed(() => props.checkoutView !== "summary");
const showCheckoutSummary = computed(() => props.checkoutView !== "items");
const showCheckoutConsent = computed(() => props.checkoutView === "all");
const checkoutCalculationsEnabled = computed(
  () => props.mode === "checkout" && showCheckoutSummary.value,
);

const checkoutConsent = computed({
  get: () => props.consent,
  set: (value: boolean) => emit("update:consent", value),
});

function productImage(src?: string) {
  const normalized = normalizeMediaUrl(src);
  if (!normalized) return "";
  if (/^(https?:)?\/\//.test(normalized) || /^data:|^blob:/.test(normalized))
    return normalized;
  if (
    normalized.startsWith("/media-s3/") ||
    normalized.startsWith("/images/") ||
    normalized.startsWith("/icons/")
  ) {
    return normalized;
  }
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${imageBase}${path}`;
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString("ru-RU");
}

// промокод в поле
const coupon = ref("");

// ошибки
const errors = reactive<{ fullName: string; phone: string }>({
  fullName: "",
  phone: "",
});

// согласие с политикой/обработкой данных
const consent = ref(false);
const consentError = ref("");

type Focusable = { focus: () => void } | null;
const inputRefs = {
  fullName: ref<Focusable>(null),
  phone: ref<Focusable>(null),
};

// суммы и инфо о купоне из стора
const subtotal = computed(() => cartStore.subtotal);
const grandTotal = computed(() => cartStore.total);
const discountAmount = computed(() => cartStore.discountAmount);
const remarketingDiscountAmount = computed(
  () => cartStore.remarketingDiscountAmount,
);
const exhibitionDiscountAmount = computed(
  () => cartStore.exhibitionDiscountAmount,
);
const couponInfo = computed(() => cartStore.couponInfo);
const coupons = computed(() => cartStore.coupons || []);
const hasNonStackableCoupon = computed(() =>
  coupons.value.some((c) => c?.is_stackable === false),
);

// vip скидка
const vipDiscountAmount = computed(() => cartStore.vipDiscountAmount);
const vipDiscountPercent = computed(() => cartStore.vipDiscountPercent);

const itemCount = computed(() =>
  cartStore.items.reduce((s, i) => s + i.quantity, 0),
);
const isAuthorizedEmptyCart = computed(
  () =>
    props.mode === "cart" && authStore.isAuthenticated && itemCount.value <= 0,
);
const cartEmptyMessage = "Сначала добавьте товары в корзину";
const isEvolutionSingleOnly = computed(
  () => props.mode === "cart" && isEvolutionSingleOnlyCart(cartStore.items),
);
const evolutionSingleDeliveryMessage = EVOLUTION_SINGLE_DELIVERY_MESSAGE;
const isCartCheckoutBlocked = computed(
  () => isAuthorizedEmptyCart.value || isEvolutionSingleOnly.value,
);

// === Бонусы ===
// 1) В корзине: начисление 30% от итоговой суммы.
const earnedBonuses = computed(() =>
  Math.floor(Number(grandTotal.value || 0) * 0.5),
);

const earnedTicket = computed(() =>
  Math.floor(Number(grandTotal.value || 0) / 10000),
);

// 2) В оформлении заказа: доступные бонусы определяем через /v1/shop/bonus/calculate
const bonusCalc = ref<BonusCalculateResponse | null>(null);
const bonusCalcLoading = ref(false);
const bonusCalcError = ref<string | null>(null);

// Лимит бонусов, который пользователь может списать прямо сейчас.
// Правило:
// - balance = общий баланс бонусов
// - max_bonuses_available = максимум, который можно списать в рамках текущего заказа
// Используем max_bonuses_available только если balance больше этого значения,
// иначе (balance меньше или равен) — лимит равен balance.
const maxBonusesAvailable = computed(() => {
  const balance = Number(bonusCalc.value?.balance ?? 0);
  const max = Number(bonusCalc.value?.max_bonuses_available ?? 0);
  if (!Number.isFinite(balance) || balance <= 0) return 0;
  if (!Number.isFinite(max) || max <= 0) return 0;
  return balance > max ? max : balance;
});

const bonusToSpend = ref("");

// применённые бонусы (влияют только на UI и payload заказа)
const appliedBonuses = ref(0);

const bonusToSpendNumber = computed(() => {
  const raw = String(bonusToSpend.value || "").replace(/[^0-9]/g, "");
  const n = Number(raw || 0);
  return Math.max(0, Math.min(maxBonusesAvailable.value, n));
});

watch(bonusToSpendNumber, (n) => {
  // нормализуем ввод (без лишних символов, не больше доступных)
  if (bonusToSpend.value === "") return;
  const normalized = String(n);
  if (bonusToSpend.value !== normalized) bonusToSpend.value = normalized;
});

function applyBonuses() {
  if (hasNonStackableCoupon.value) return;

  const n = Number(bonusToSpendNumber.value || 0);
  appliedBonuses.value = n;
  // прокидываем в checkout payload
  if (props.mode === "checkout") {
    (checkoutStore.state as any).bonuses_to_use = n;
  }
}

// если пользователь вручную уменьшил ввод ниже уже применённого —
// не меняем итог до нажатия "Использовать" (предсказуемое поведение)

// итоговая сумма с учётом списанных бонусов (1 бонус = 1 рубль)
const finalTotal = computed(() => {
  if (props.mode !== "checkout") return Number(grandTotal.value || 0);
  return Math.max(
    0,
    Number(grandTotal.value || 0) - Number(appliedBonuses.value || 0),
  );
});

// Сумма корзины для расчёта лимитов по списанию бонусов
const cartTotalForBonusCalc = computed(() => Number(grandTotal.value || 0));

async function refreshBonusCalc() {
  if (!checkoutCalculationsEnabled.value) return;

  const total = Math.max(0, Math.floor(cartTotalForBonusCalc.value || 0));
  bonusCalcLoading.value = true;
  bonusCalcError.value = null;
  try {
    bonusCalc.value = await bonusService.calculate(total);
  } catch (e: any) {
    // не блокируем оформление заказа, просто фиксируем лимит как 0
    bonusCalc.value = {
      balance: 0,
      max_bonuses_available: 0,
      max_total_discount_percent: 0,
      currency: "",
    };
    bonusCalcError.value = e?.message || "Не удалось получить бонусы";
  } finally {
    bonusCalcLoading.value = false;
  }
}

// при заходе на чек-аут и при изменении итоговой суммы — пересчитываем лимит
watch(
  cartTotalForBonusCalc,
  () => {
    // debounce на случай серии быстрых обновлений
    if (!checkoutCalculationsEnabled.value) return;
    refreshBonusCalc();
  },
  { immediate: true },
);

// если уже применённые бонусы оказались выше лимита — автоматически ограничиваем
watch(maxBonusesAvailable, (max) => {
  const lim = Number(max || 0);
  if (appliedBonuses.value > lim) {
    appliedBonuses.value = lim;
    bonusToSpend.value = String(lim);
    if (checkoutCalculationsEnabled.value) {
      (checkoutStore.state as any).bonuses_to_use = lim;
    }
  }
});

watch(
  hasNonStackableCoupon,
  (blocked) => {
    if (!blocked) return;

    appliedBonuses.value = 0;
    bonusToSpend.value = "";
    if (checkoutCalculationsEnabled.value) {
      (checkoutStore.state as any).bonuses_to_use = 0;
    }
  },
  { immediate: true },
);

const phoneDigits = computed(() => String(form.phone || "").replace(/\D/g, ""));

const enableCta = computed(() => {
  if (props.mode === "checkout") return true;
  // CTA должен быть кликабельным даже без галочки — подсветим чекбокс по валидации
  return Boolean(form.fullName.trim() && phoneDigits.value.length === 11);
});

// ограничение: в корзине поле "Имя" — одно слово
watch(
  () => form.fullName,
  (v) => {
    if (props.mode === "checkout") return;
    const cleaned = String(v || "")
      .replace(/\s+/g, " ")
      .trim();
    const first = cleaned.split(" ")[0] || "";
    if (cleaned !== first) form.fullName = first;
  },
);

// === авторизация: новый инлайн-этап кода в корзине ===
const authLoading = ref(false); // оставляем для совместимости, но не используем «пуш-ожидание»
const preOrderLoading = ref(false);
const isCodeStep = ref(false); // показывать ли блок ввода кода в корзине
const ctaError = ref("");

// 4 квадрата кода
const codeDigits = ref<string[]>(["", "", "", ""]);
const codeInputs = ref<HTMLInputElement[]>([]);
function setCodeRef(el: HTMLInputElement | null, i: number) {
  if (el) codeInputs.value[i] = el;
}
function focusCode(i: number) {
  const el = codeInputs.value[i];
  if (el) el.focus();
}
const codeValue = computed(() => codeDigits.value.join(""));
const canSubmitCode = computed(() => codeValue.value.length === 4);
const digits = (s: string) => s.replace(/\D/g, "");

function onCodeInput(e: Event, i: number) {
  const el = e.target as HTMLInputElement;
  const v = digits(el.value);
  if (!v) {
    codeDigits.value[i] = "";
    return;
  }
  // поддержка вставки сразу "1234"
  if (v.length > 1) {
    const arr = v.slice(0, 4).split("");
    for (let k = 0; k < 4; k++) codeDigits.value[k] = arr[k] ?? "";
    focusCode(Math.min(3, arr.length - 1));
    return;
  }
  codeDigits.value[i] = v;
  if (i < 3) focusCode(i + 1);
}
function onCodeKeydown(e: KeyboardEvent, i: number) {
  const el = e.target as HTMLInputElement;
  if (e.key === "Backspace" && !el.value && i > 0) {
    codeDigits.value[i - 1] = "";
    focusCode(i - 1);
    e.preventDefault();
  }
  if (e.key === "ArrowLeft" && i > 0) {
    focusCode(i - 1);
    e.preventDefault();
  }
  if (e.key === "ArrowRight" && i < 3) {
    focusCode(i + 1);
    e.preventDefault();
  }
}

function resetCode() {
  codeDigits.value = ["", "", "", ""];
  authStore.isCodeSent = false;
  isCodeStep.value = false;
  ctaError.value = "";
}

function getCartCtaErrorMessage(error: any) {
  const message = String(error?.message || "");

  if (message === "AUTH_REQUIRED") {
    return "Не удалось подтвердить авторизацию. Обновите страницу и попробуйте ещё раз.";
  }

  return (
    message ||
    "Не удалось перейти к оформлению. Попробуйте ещё раз или свяжитесь с менеджером."
  );
}

// отправка кода и верификация
async function startCodeFlowIfNeeded() {
  // запускаем отправку кода только если ещё не стартовали
  if (!authStore.isCodeSent) {
    await authStore.requestCode({
      phone: form.phone,
      name: form.fullName,
      isRegister: false,
    });
  }
  isCodeStep.value = true;
  setTimeout(() => focusCode(0), 0);
}

async function verifyAndContinue() {
  if (!canSubmitCode.value) return;

  ctaError.value = "";

  try {
    await authStore.confirmCode(codeValue.value);
    // после успешной верификации продолжаем прежний флоу: preOrder -> /order
    await proceedPreOrderAndGo();
  } catch (error: any) {
    ctaError.value = getCartCtaErrorMessage(error);
    if (process.dev) {
      console.warn("[cart] verify/pre-order failed", error);
    }
  }
}

// ===== старый флоу под капотом: preOrder → navigate ====
async function proceedPreOrderAndGo() {
  if (isAuthorizedEmptyCart.value) {
    ctaError.value = cartEmptyMessage;
    return;
  }

  if (isEvolutionSingleOnly.value) {
    ctaError.value = evolutionSingleDeliveryMessage;
    return;
  }

  if (preOrderLoading.value) return;
  try {
    preOrderLoading.value = true;
    await cartStore.preOrder();
    navigateTo("/order");
  } finally {
    preOrderLoading.value = false;
  }
}

async function prefillFromProfile() {
  if (!authStore.isAuthenticated) return;
  try {
    if (!userStore.profile) await userStore.loadProfile();
    const p = userStore.profile;
    if (!p) return;
    const fio =
      [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
      form.fullName;
    const phone = p.phone_number || form.phone;
    if (!form.fullName) form.fullName = fio;
    if (!form.phone) form.phone = phone;
  } catch (e) {
    /* no-op */
  }
}
onMounted(prefillFromProfile);
watch(
  () => authStore.isAuthenticated,
  (v) => v && prefillFromProfile(),
);

// показываем код из ответа бэка в поле
watch(
  couponInfo,
  (ci) => {
    coupon.value = ci?.code || "";
  },
  { immediate: true },
);

function validateFields() {
  errors.fullName = form.fullName.trim() ? "" : "Введите имя";
  errors.phone = phoneDigits.value.length === 11 ? "" : "Введите номер";
  consentError.value = consent.value ? "" : "Нужно согласие с условиями";
  return !(errors.fullName || errors.phone || consentError.value);
}

async function handleCta() {
  if (props.mode === "checkout") {
    emit("cta");
    return;
  }

  ctaError.value = "";

  if (isAuthorizedEmptyCart.value) {
    ctaError.value = cartEmptyMessage;
    return;
  }

  if (isEvolutionSingleOnly.value) {
    ctaError.value = evolutionSingleDeliveryMessage;
    return;
  }

  const ok = validateFields();
  if (!ok) {
    await nextTick();
    if (errors.fullName) return inputRefs.fullName.value?.focus();
    if (errors.phone) return inputRefs.phone.value?.focus();
    return;
  }

  analytics?.reach?.("lead_cart");

  try {
    if (authStore.isAuthenticated) {
      await proceedPreOrderAndGo();
      return;
    }

    // Гостевой лид — как раньше (fire and forget)
    try {
      const sessionId = ensureGuestSessionId();
      sendGuestPreorderFireAndForget({
        sessionId,
        fullName: form.fullName,
        phone: form.phone,
      });
    } catch {
      /* игнорим */
    }

    // Теперь вместо "пуш-ожидания" показываем инлайн код и подтверждаем
    await startCodeFlowIfNeeded();
  } catch (error: any) {
    ctaError.value = getCartCtaErrorMessage(error);
    if (process.dev) {
      console.warn("[cart] pre-order/start auth failed", error);
    }
  }
}

async function applyCoupon() {
  const code = coupon.value.trim();
  if (!code || couponInfo.value?.applied) return;

  // ⛔ В гостевом режиме промокоды недоступны — предлагаем авторизацию
  if (!authStore.isAuthenticated) {
    authStore.openAuth(props.mode === "checkout" ? "/order" : "/cart");
    return;
  }

  try {
    await cartStore.applyCoupon(code);
    // поле само обновится из watch(couponInfo)
  } catch (e: any) {
    alert(e?.message || "Промокод недействителен");
  }
}

// оставляем хэндлер удаления на будущее (кнопку закомментируем в шаблоне)
async function removeCoupon() {
  try {
    await cartStore.removeCoupon();
    coupon.value = "";
  } catch {
    alert("Не удалось удалить промокод");
  }
}
</script>

<template>
  <div
    v-if="props.mode === 'checkout'"
    class="relative isolate flex w-full flex-col before:pointer-events-none before:absolute before:inset-y-0 before:left-1/2 before:-z-10 before:w-dvw before:-translate-x-1/2 before:content-[''] md:before:hidden"
    :class="
      props.checkoutView === 'summary'
        ? 'gap-4 bg-white before:bg-white'
        : 'gap-5 rounded-[10px] bg-[#F7F7F7] before:bg-[#F7F7F7] p-5 px-3 sm:p-[30px] sm:px-[30px]'
    "
  >
    <template v-if="showCheckoutItems">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 text-left"
        :aria-expanded="detailsOpen"
        :aria-controls="checkoutDetailsId"
        @click="detailsOpen = !detailsOpen"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="text-lg font-medium leading-tight sm:text-[32px]">
            Детали заказа
          </span>
          <UiIcon
            name="chevron-down"
            :size="22"
            class="shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': detailsOpen }"
          />
        </span>
        <span class="shrink-0 text-lg font-medium sm:text-xl">
          {{ formatMoney(finalTotal) }} ₽
        </span>
      </button>

      <Transition name="summary-details">
        <div
          v-if="!detailsOpen"
          class="checkout-items-strip flex gap-2 overflow-x-auto pb-1"
          aria-label="Товары в заказе"
        >
          <article
            v-for="item in cartStore.items"
            :key="`collapsed-${item.id}`"
            class="w-[calc((100%_-_24px)/4)] min-w-[79px] shrink-0"
            :title="item.title"
          >
            <div
              class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[8px] sm:rounded-[10px] border-2 border-white bg-[#f7f7f7] shadow-productcard"
            >
              <img
                v-if="item.image"
                :src="productImage(item.image)"
                :alt="item.title"
                width="79"
                height="79"
                class="size-full object-contain p-1.5"
                loading="lazy"
                decoding="async"
              />
              <UiIcon v-else name="box" :size="24" class="text-black/30" />

              <span
                v-if="item.quantity > 1"
                class="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex min-h-[25px] sm:min-h-[35px] min-w-[25px] sm:min-w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/75 px-0.5 text-[12px] sm:text-[16px] leading-none shadow-productcard"
              >
                X{{ item.quantity }}
              </span>
            </div>

            <p class="mt-1.5 truncate text-sm font-medium leading-tight">
              <span v-if="item.price === 0" class="font-normal">Бесплатно</span>
              <span v-else
                >{{ formatMoney(item.price * item.quantity) }} ₽</span
              >
            </p>
          </article>
        </div>
      </Transition>

      <Transition name="summary-details">
        <div v-show="detailsOpen" :id="checkoutDetailsId" class="space-y-3">
          <article
            v-for="item in cartStore.items"
            :key="item.id"
            class="grid grid-cols-[79px_minmax(0,1fr)_auto] items-center gap-3 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:gap-4"
          >
            <div
              class="relative flex size-[79px] items-center justify-center overflow-hidden rounded-[8px] sm:rounded-[10px] border-[3px] border-white bg-[#F7F7F7] shadow-productcard sm:size-[110px]"
            >
              <img
                v-if="item.image"
                :src="productImage(item.image)"
                :alt="item.title"
                width="108"
                height="108"
                class="size-full object-contain p-2"
                loading="lazy"
                decoding="async"
              />
              <UiIcon v-else name="box" :size="32" class="text-black/30" />

              <span
                v-if="item.quantity > 1"
                class="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 flex min-h-[25px] sm:min-h-[35px] min-w-[25px] sm:min-w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/75 px-0.5 text-[12px] sm:text-[16px] leading-none shadow-productcard"
              >
                X{{ item.quantity }}
              </span>
            </div>

            <p class="min-w-0 text-sm leading-snug sm:text-base">
              {{ item.title }}
            </p>

            <p class="shrink-0 text-right text-sm font-medium sm:text-xl">
              <span v-if="item.price === 0" class="font-normal">Бесплатно</span>
              <span v-else
                >{{ formatMoney(item.price * item.quantity) }} ₽</span
              >
            </p>
          </article>
        </div>
      </Transition>
    </template>

    <template v-if="showCheckoutSummary">
      <!-- 
      <div class="flex items-start gap-2.5 md:gap-4">
        <UiInput
          v-model="coupon"
          name="coupon"
          type="text"
          placeholder="Промокод"
          background="bg-white !border-cgreen !text-cgreen focus:outline-none"
        >
          <template #right>
            <button
              type="button"
              class="pl-2 transition"
              :class="couponInfo?.applied ? 'cursor-not-allowed text-gray-300' : 'text-cgreen hover:text-cgreen/80'"
              :disabled="!!couponInfo?.applied"
              aria-label="Применить промокод"
              @click="applyCoupon"
            >
              <UiIcon name="arrow-right" :size="20" />
            </button>
          </template>
        </UiInput>

        <Button
          variant="outline"
          class="h-[52px] shrink-0 !border-cgreen px-3 sm:min-w-[130px] sm:px-4"
          :class="couponInfo?.applied
            ? '!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white'
            : '!text-cgreen hover:!bg-cgreen hover:!text-white'"
          :disabled="!couponInfo?.applied && !coupon.trim()"
          @click="couponInfo?.applied ? removeCoupon() : applyCoupon()"
        >
          {{ couponInfo?.applied ? 'Удалить' : 'Применить' }}
        </Button>
      </div>
      -->

      <div class="space-y-3 text-sm sm:space-y-[15px] sm:text-base">
        <div class="flex justify-between gap-4">
          <span>Товаров в корзине</span>
          <span class="shrink-0">{{ itemCount }} шт</span>
        </div>
        <div class="flex justify-between gap-4">
          <span>Стоимость продуктов</span>
          <span class="shrink-0">{{ formatMoney(subtotal) }} ₽</span>
        </div>
        <div class="flex justify-between gap-4 font-medium text-cgreen">
          <span>Скидка</span>
          <span class="shrink-0">
            {{
              formatMoney(Math.max(0, Number(subtotal) - Number(grandTotal)))
            }}
            ₽
          </span>
        </div>

        <div
          v-if="vipDiscountAmount > 0"
          class="flex justify-between gap-4 font-medium text-cgreen"
        >
          <span>VIP-скидка</span>
          <span class="shrink-0">−{{ formatMoney(vipDiscountAmount) }} ₽</span>
        </div>
        <div
          v-if="remarketingDiscountAmount > 0"
          class="flex justify-between gap-4 font-medium text-cgreen"
        >
          <span>Персональная скидка</span>
          <span class="shrink-0"
            >−{{ formatMoney(remarketingDiscountAmount) }} ₽</span
          >
        </div>
        <div
          v-if="exhibitionDiscountAmount > 0"
          class="flex justify-between gap-4 font-medium text-cgreen"
        >
          <span>Скидка участника выставки</span>
          <span class="shrink-0"
            >−{{ formatMoney(exhibitionDiscountAmount) }} ₽</span
          >
        </div>
      </div>

      <div
        class="flex items-center justify-between gap-4 border-t border-black/10 pt-4 text-xl font-medium"
      >
        <span>Итого</span>
        <span class="flex items-center gap-3 sm:gap-4">
          <span
            v-if="Number(subtotal) > Number(finalTotal)"
            class="text-sm font-normal text-black/40 line-through sm:text-base"
          >
            {{ formatMoney(subtotal) }} ₽
          </span>
          <span>{{ formatMoney(finalTotal) }} ₽</span>
        </span>
      </div>

      <PaymentWarning />
    </template>

    <div
      v-if="showCheckoutConsent"
      class="space-y-1 border-t border-black/10 pt-5"
      data-checkout-consent
    >
      <BaseCheckbox v-model="checkoutConsent" :error="!!props.consentError">
        <span class="text-xs leading-relaxed text-black/55 sm:text-sm">
          Я согласен с
          <NuxtLink
            to="/privacy"
            class="underline hover:text-black"
            target="_blank"
            rel="noopener"
          >
            политикой конфиденциальности
          </NuxtLink>
          и
          <NuxtLink
            to="/soglasie-na-obrabotku-personalnykh-dannykh"
            class="underline hover:text-black"
            target="_blank"
            rel="noopener"
          >
            обработкой персональных данных
          </NuxtLink>
        </span>
      </BaseCheckbox>
      <p v-if="props.consentError" class="text-xs text-red-500">
        {{ props.consentError }}
      </p>
    </div>
  </div>

  <div
    v-else
    class="bg-white rounded-2xl shadow-none md:shadow-productcard p-0 md:p-6 w-full md:w-[416px] flex flex-col gap-4"
  >
    <!-- Блок полей (как было) -->
    <div v-if="props.mode !== 'checkout'" class="space-y-4">
      <div class="flex flex-col md:flex-row gap-4">
        <UiInput
          ref="inputRefs.fullName"
          v-model="form.fullName"
          name="full_name"
          autocomplete="name"
          placeholder="Имя"
          type="text"
          :maxlength="120"
          :error="errors.fullName"
          background="bg-white"
          @blur="errors.fullName = form.fullName.trim() ? '' : 'Введите имя'"
        />
        <UiInput
          ref="inputRefs.phone"
          v-model="form.phone"
          name="phone"
          type="tel"
          inputmode="tel"
          mask="ru-phone"
          autocomplete="tel"
          placeholder="+7 (___) ___-__-__"
          :error="errors.phone"
          background="bg-white"
          @blur="
            errors.phone = phoneDigits.length === 11 ? '' : 'Введите номер'
          "
        />
      </div>

      <!-- Согласие -->
      <div class="space-y-1">
        <BaseCheckbox
          v-model="consent"
          :error="!!consentError"
          @click="consentError = ''"
        >
          <span class="text-black/50 text-xs md:text-sm">
            Я согласен с
            <NuxtLink
              to="/privacy"
              class="underline hover:text-black"
              target="_blank"
              rel="noopener"
            >
              политикой конфиденциальности
            </NuxtLink>
            и
            <NuxtLink
              to="/soglasie-na-obrabotku-personalnykh-dannykh"
              class="underline hover:text-black"
              target="_blank"
              rel="noopener"
            >
              обработкой персональных данных
            </NuxtLink>
          </span>
        </BaseCheckbox>

        <div v-if="consentError" class="text-red-500 text-xs">
          {{ consentError }}
        </div>
      </div>

      <div v-if="isCodeStep && !authStore.isAuthenticated" class="space-y-3">
        <div class="text-sm text-black/60">
          {{ authStore.deliveryHint }}
        </div>
        <div class="flex items-center gap-3">
          <input
            v-for="(_, i) in 4"
            :key="i"
            :ref="(el) => setCodeRef(el, i)"
            :value="codeDigits[i]"
            @input="(e) => onCodeInput(e, i)"
            @keydown="(e) => onCodeKeydown(e as KeyboardEvent, i)"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="w-14 h-14 text-center text-xl rounded-xl border border-gray-300 focus:outline-none focus:ring-0 focus:border-black"
          />
        </div>
        <div class="text-sm text-gray-600 space-y-1">
          <div>
            <button type="button" class="underline" @click="resetCode">
              Изменить номер
            </button>
          </div>
          <div>
            <button
              type="button"
              class="underline disabled:opacity-50"
              :disabled="authStore.resendLeft > 0"
              @click="authStore.resendCode"
            >
              Получить код звонком<span v-if="authStore.resendLeft > 0">
                ({{ authStore.resendLeft }})</span
              >
            </button>
          </div>
        </div>
        <Button
          variant="solid"
          class="w-full hover:bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
          :disabled="!canSubmitCode || preOrderLoading"
          @click="verifyAndContinue"
        >
          <span v-if="preOrderLoading">Готовим заказ…</span>
          <span v-else>Подтвердить</span>
        </Button>
      </div>

      <!-- CTA как раньше -->
      <Button
        v-else
        variant="solid"
        class="w-full hover:!bg-hoverbtn hover:text-black !text-sm md:!text-base text-white py-3 rounded-lg transition"
        :disabled="preOrderLoading || isCartCheckoutBlocked"
        :class="
          isCartCheckoutBlocked
            ? 'opacity-50 cursor-not-allowed hover:!bg-primary hover:!text-white'
            : ''
        "
        @click="handleCta"
      >
        <span v-if="preOrderLoading">Готовим заказ…</span>
        <span v-else>Перейти к оформлению</span>
      </Button>

      <div
        v-if="isEvolutionSingleOnly"
        class="rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-950 md:text-sm"
        role="status"
      >
        <div class="flex items-start gap-2">
          <span
            class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full text-[#222] border border-primary text-[11px] font-medium leading-none"
            aria-hidden="true"
          >
            !
          </span>
          <p>
            {{ evolutionSingleDeliveryMessage }}
            Добавьте упаковку Evolution 12 шт. или любой другой товар, чтобы
            перейти к оформлению.
          </p>
        </div>
      </div>

      <div
        v-if="isAuthorizedEmptyCart || (ctaError && !isEvolutionSingleOnly)"
        class="text-red-500 text-xs md:text-sm"
      >
        {{ isAuthorizedEmptyCart ? cartEmptyMessage : ctaError }}
      </div>
    </div>

    <div class="space-y-3 md:space-y-4 text-sm md:text-base">
      <h3 class="text-2xl md:text-cardhead font-medium mb-6 md:mb-8 mt-4">
        Детали заказа
      </h3>

      <div class="flex justify-between">
        <span>Товаров в корзине</span><span>{{ itemCount }} шт</span>
      </div>
      <div class="flex justify-between">
        <span>Стоимость продуктов</span
        ><span>{{ subtotal.toLocaleString() }} ₽</span>
      </div>

      <div class="flex justify-between font-medium text-cgreen">
        <span>Скидка</span>
        <!-- <span>
          <template v-if="couponInfo?.applied">
            −{{ discountAmount.toLocaleString() }} ₽
            <span v-if="typeof couponInfo?.discount_percent === 'number'">
              ({{ couponInfo!.discount_percent }}%)
            </span>
          </template>
          <template v-else>0 ₽</template>
        </span> -->
        <span>
          {{
            (Number(grandTotal || 0) - Number(subtotal || 0)).toLocaleString()
          }}
          ₽
        </span>
      </div>

      <div
        v-if="vipDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>VIP-скидка</span>
        <span>
          −{{ vipDiscountAmount.toLocaleString() }} ₽
          <template v-if="vipDiscountPercent != null">
            ({{ vipDiscountPercent }}%)
          </template>
        </span>
      </div>

      <div
        v-if="remarketingDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>Персональная скидка</span>
        <span>−{{ remarketingDiscountAmount.toLocaleString() }} ₽</span>
      </div>

      <div
        v-if="exhibitionDiscountAmount > 0"
        class="flex justify-between font-medium text-cgreen"
      >
        <span>Скидка участника выставки</span>
        <span>−{{ exhibitionDiscountAmount.toLocaleString() }} ₽</span>
      </div>
      <!-- конец новых строк -->
      <!-- 
      <div
        class="flex justify-between font-medium text-red-500"
      >
        <span>Начислим бонусов</span>
        <span>+ {{ earnedBonuses }}</span>
      </div> -->

      <!-- <div
        class="flex justify-between font-medium text-red-500"
      >
        <span>Новогодний конкурс</span>
        <span>+ {{ earnedTicket }} билетов</span>
      </div> -->

      <div class="flex justify-between font-medium text-xl">
        <span>Итого</span><span>{{ finalTotal.toLocaleString() }} ₽</span>
      </div>
    </div>

    <!-- <div v-if="props.mode === 'checkout'" class="space-y-3">
      <div class="flex justify-between text-sm md:text-base">
        <span class="text-black/70">Бонусы доступны для списания</span>
        <span class="font-medium">{{ maxBonusesAvailable }}</span>
      </div>

      <UiInput
        v-model="bonusToSpend"
        name="bonuses"
        type="text"
        inputmode="numeric"
        placeholder="Списать бонусы"
        background="bg-white"
        :disabled="hasNonStackableCoupon"
      >
        <template #right>
          <button
            type="button"
            class="ml-2 text-white bg-cgreen p-2.5 rounded-md -me-2.5 hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="hasNonStackableCoupon"
            @click="applyBonuses"
          >
            Использовать
          </button>
        </template>
      </UiInput>

      <div class="text-xs" :class="hasNonStackableCoupon ? 'text-red-500' : 'text-black/50'">
        <template v-if="hasNonStackableCoupon">
          Списание бонусов недоступно, пока применён промокод без суммирования.
        </template>
        <template v-else>
          Можно списать до {{ maxBonusesAvailable }} бонусов.
        </template>
      </div>
    </div> -->

    <!-- 
    <div v-if="props.mode === 'checkout'" class="flex flex-row gap-2 md:gap-3 items-start">
      <UiInput
        v-model="coupon"
        name="coupon"
        type="text"
        placeholder="Промокод"
        background="bg-white !border-cgreen !text-cgreen focus:outline-none"
      >
        <template #right>
          <button
            type="button"
            class="pl-2 transition"
            :class="couponInfo?.applied ? 'text-gray-300 cursor-not-allowed' : 'text-cgreen hover:text-cgreen/80'"
            :disabled="!!couponInfo?.applied"
            @click="applyCoupon"
            aria-label="Применить промокод"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            v-if="couponInfo?.applied"
            type="button"
            @click="removeCoupon"
            class="pl-2 text-red-500 hover:text-red-600 transition"
            aria-label="Удалить промокод"
            title="Удалить промокод"
          >
            ✕
          </button>
        </template>
      </UiInput>

      <Button
        variant="outline"
        class="h-[52px] w-full !border-cgreen"
        :class="couponInfo?.applied ? '!border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white' : '!text-cgreen hover:!bg-cgreen hover:!text-white'"
        :disabled="!couponInfo?.applied && !coupon.trim()"
        @click="couponInfo?.applied ? removeCoupon() : applyCoupon()"
      >
        {{ couponInfo?.applied ? 'Удалить' : 'Применить' }}
      </Button>
    </div>
    -->

    <PaymentWarning v-if="props.mode === 'checkout'" />

    <div v-if="props.mode === 'checkout'" class="pt-2">
      <Button
        variant="solid"
        class="w-full bg-black text-white py-3 rounded-lg transition"
        @click="handleCta"
      >
        Оформить заказ
      </Button>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none !important;
  box-shadow: none !important;
}

.summary-details-enter-active,
.summary-details-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.summary-details-enter-from,
.summary-details-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.checkout-items-strip {
  scrollbar-width: none;
}

.checkout-items-strip::-webkit-scrollbar {
  display: none;
}
</style>
