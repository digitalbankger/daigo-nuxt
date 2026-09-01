<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Product, ProductVariant } from "~/types/product";
import Button from "~/components/ui/Button.vue";
import ProductConsultationCard from "~/components/product/ProductConsultationCard.vue";
import { useCartStore } from "~/stores/cartStore";
import {
  EVOLUTION_PACK_SIZES,
  findEvolutionVariant,
  getEvolutionPackSizeFromSlug,
  getEvolutionProductConfig,
  getEvolutionProductIdForPackSize,
  getEvolutionSlugForPackSize,
  type EvolutionPackSize,
} from "~/constants/evolution";
import {
  EVOLUTION_SINGLE_DELIVERY_MESSAGE,
  canAddEvolutionSingle,
} from "~/utils/evolutionCart";

const props = defineProps<{
  product: Product;
}>();

const route = useRoute();
const cartStore = useCartStore();

/* =========================================================
   EVOLUTION GALLERY
   ========================================================= */

const gallery = [
  "/images/evolution/hero-main.webp",
  "/images/evolution/gallery-floating.webp",
  "/images/evolution/gallery-three.webp",
  "/images/evolution/gallery-hand.webp",
];

const activeImage = ref(gallery[0]);

const currentPackSize = computed<EvolutionPackSize>(() =>
  getEvolutionPackSizeFromSlug(route.params.slug),
);

const siblingPackSize = computed<EvolutionPackSize>(() =>
  currentPackSize.value === 1 ? 12 : 1,
);

const siblingSlug = computed(() =>
  getEvolutionSlugForPackSize(siblingPackSize.value),
);

const { data: siblingProduct } = await useFetch<Product | null>(
  () => `/api/shop/products/${encodeURIComponent(siblingSlug.value)}/card`,
  {
    key: `evolution-sibling-card:${String(route.params.slug || "")}`,
    server: true,
    default: () => null,
  },
);

const EVOLUTION_CAN_IMAGE = "/images/evolution/can-cutout.webp";
const singleVariantPendingMessage =
  "Вариант «1 банка» появится, после добавления в бд. Цена и покупка появятся автоматом.";

function productForPackSize(packSize: EvolutionPackSize): Product | null {
  if (packSize === currentPackSize.value) return props.product;
  return siblingProduct.value || null;
}

function resolveLegacyVariant(
  packSize: EvolutionPackSize,
): ProductVariant | null {
  const currentConfig = getEvolutionProductConfig(currentPackSize.value);
  const isSeparateCurrentProduct =
    String(props.product.product_id || "") === currentConfig.productId;

  if (isSeparateCurrentProduct) return null;
  return findEvolutionVariant(props.product.variants, packSize);
}

function resolveProductOldPrice(
  product: Product | null | undefined,
  price: number,
) {
  const value = Number(product?.originalPrice || product?.oldPrice || 0);
  return value > price ? value : 0;
}

type EvolutionVariantOption = {
  packSize: EvolutionPackSize;
  slug: string;
  label: string;
  productId: string;
  price: number;
  oldPrice: number;
  variantId?: string;
  available: boolean;
};

const variantOptions = computed<EvolutionVariantOption[]>(() =>
  EVOLUTION_PACK_SIZES.map((packSize) => {
    const config = getEvolutionProductConfig(packSize);
    const packProduct = productForPackSize(packSize);
    const legacyVariant = resolveLegacyVariant(packSize);

    const isSeparateProduct = Boolean(
      packProduct && String(packProduct.product_id || "") === config.productId,
    );

    const productId = isSeparateProduct
      ? String(packProduct?.product_id || "")
      : legacyVariant
        ? String(props.product.product_id || "")
        : String(
            packProduct?.product_id ||
              getEvolutionProductIdForPackSize(packSize),
          );

    const productPrice = Number(packProduct?.price || 0);
    const variantPrice = Number(legacyVariant?.price || 0);
    const price =
      isSeparateProduct || !legacyVariant ? productPrice : variantPrice;

    const legacyOldPrice = Number(
      legacyVariant?.originalPrice || legacyVariant?.oldPrice || 0,
    );
    const productOldPrice = resolveProductOldPrice(packProduct, price);
    const oldPrice = legacyOldPrice > price ? legacyOldPrice : productOldPrice;

    return {
      packSize,
      slug: config.slug,
      label: config.label,
      productId,
      price,
      oldPrice,
      variantId: legacyVariant?.variant_id,
      available: Boolean(productId && price > 0),
    };
  }),
);

const currentOption = computed(
  () =>
    variantOptions.value.find(
      (option) => option.packSize === currentPackSize.value,
    ) || null,
);

const productId = computed(() => currentOption.value?.productId || "");
const currentPrice = computed(() => Number(currentOption.value?.price || 0));
const oldPrice = computed(() => Number(currentOption.value?.oldPrice || 0));
const hasDiscount = computed(() => oldPrice.value > currentPrice.value);
const canAddToCart = computed(() => Boolean(currentOption.value?.available));

/* =========================================================
   CART
   ========================================================= */

const adding = ref(false);
const variantAddingKey = ref("");
const deliveryDetailsOpen = ref(false);

function cartQuantity(productIdValue: string, variantId?: string) {
  if (!productIdValue) return 0;

  return cartStore.items
    .filter(
      (item) =>
        String(item.id) === productIdValue &&
        String(item.variantId || "") === String(variantId || ""),
    )
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

const quantityInCart = computed(() =>
  currentOption.value
    ? cartQuantity(currentOption.value.productId, currentOption.value.variantId)
    : 0,
);

async function ensureCartLoaded() {
  if (cartStore.items.length) return;

  try {
    await cartStore.loadCart();
  } catch (error) {
    console.warn("Evolution: loadCart failed", error);
  }
}

function variantOptionKey(option: EvolutionVariantOption) {
  return `${option.productId}:${option.variantId || "default"}`;
}

function variantQuantityInCart(option: EvolutionVariantOption) {
  if (!option.available) return 0;
  return cartQuantity(option.productId, option.variantId);
}

function isVariantOptionBlocked(option: EvolutionVariantOption) {
  return option.packSize === 1 && !canAddEvolutionSingle(cartStore.items);
}

const evolutionSingleDeliveryMessage = EVOLUTION_SINGLE_DELIVERY_MESSAGE;

async function addVariantOption(option: EvolutionVariantOption) {
  if (
    adding.value ||
    variantAddingKey.value ||
    !option.productId ||
    !option.available ||
    option.price <= 0 ||
    isVariantOptionBlocked(option)
  ) {
    return;
  }

  variantAddingKey.value = variantOptionKey(option);

  try {
    await ensureCartLoaded();
    await cartStore.addToCart({
      id: option.productId as unknown as any,
      variantId: option.variantId,
      title: `Daigo Evolution — ${option.label}`,
      subtitle: props.product.subtitle,
      price: option.price,
      originalPrice: option.oldPrice || undefined,
      quantity: 1,
      image: EVOLUTION_CAN_IMAGE,
    });
  } catch (error) {
    console.warn("Evolution: pack add failed, syncing cart", error);
    try {
      await cartStore.loadCart();
    } catch {}
  } finally {
    variantAddingKey.value = "";
  }
}

async function incrementVariantOption(option: EvolutionVariantOption) {
  if (
    adding.value ||
    variantAddingKey.value ||
    !option.available ||
    isVariantOptionBlocked(option)
  )
    return;

  variantAddingKey.value = variantOptionKey(option);
  try {
    await cartStore.updateItem(
      option.productId as unknown as any,
      variantQuantityInCart(option) + 1,
      option.variantId,
    );
  } finally {
    variantAddingKey.value = "";
  }
}

async function decrementVariantOption(option: EvolutionVariantOption) {
  if (adding.value || variantAddingKey.value || !option.available) return;

  variantAddingKey.value = variantOptionKey(option);
  try {
    await cartStore.updateItem(
      option.productId as unknown as any,
      Math.max(0, variantQuantityInCart(option) - 1),
      option.variantId,
    );
  } finally {
    variantAddingKey.value = "";
  }
}

async function addToCart() {
  const option = currentOption.value;
  if (!option?.available || adding.value) return;

  adding.value = true;

  try {
    await ensureCartLoaded();

    await cartStore.addToCart({
      id: option.productId as unknown as any,
      variantId: option.variantId,
      title: props.product.title,
      subtitle: props.product.subtitle,
      price: option.price,
      originalPrice: option.oldPrice || undefined,
      quantity: 1,
      image: gallery[0],
    });
  } catch (error) {
    console.warn("Evolution: addToCart failed, syncing cart", error);

    try {
      await cartStore.loadCart();
    } catch {}
  } finally {
    adding.value = false;
  }
}

async function incrementHandler() {
  const option = currentOption.value;
  if (!option?.available || adding.value) return;

  adding.value = true;

  try {
    await cartStore.updateItem(
      option.productId as unknown as any,
      quantityInCart.value + 1,
      option.variantId,
    );
  } catch (error) {
    console.warn("Evolution: increment failed, syncing cart", error);

    try {
      await cartStore.loadCart();
    } catch {}
  } finally {
    adding.value = false;
  }
}

async function decrementHandler() {
  const option = currentOption.value;
  if (!option?.available || adding.value) return;

  adding.value = true;

  try {
    await cartStore.updateItem(
      option.productId as unknown as any,
      Math.max(0, quantityInCart.value - 1),
      option.variantId,
    );
  } catch (error) {
    console.warn("Evolution: decrement failed, syncing cart", error);

    try {
      await cartStore.loadCart();
    } catch {}
  } finally {
    adding.value = false;
  }
}

/* =========================================================
   PRODUCT OVERVIEW
   ========================================================= */

type EvolutionOverviewCard = {
  title: string;
  text: string;
  image: string;
};

type EvolutionMetaStep = {
  title: string;
  text: string;
  image: string;
};

type EvolutionNutrient = {
  name: string;
  value: string;
  daily?: string;
};

const overviewCards: EvolutionOverviewCard[] = [
  {
    title: "После периода накопленной нагрузки",
    text: "Evolution Mg10 создан для периода после продолжительной физической или интеллектуальной нагрузки, когда организму требуется функциональное восстановление и возвращение к ресурсу.",
    image: "/images/evolution/feature-daily.jpg",
  },
  {
    title: "Метабиотическая основа Daigo",
    text: "Фирменная метабиотическая платформа DAIGO®. Ферментированный комплекс 16 штаммов Lactobacillus — основа линейки, на которой для каждого функционального состояния создаётся собственная конфигурация функциональных компонентов.",
    image: "/images/evolution/feature-magnesium.png",
  },
  {
    title: "Функциональный контур",
    text: "Для Evolution Mg10 сформирована собственная конфигурация функциональных компонентов для периода после накопленной нагрузки: магний, L-теанин, витамины B6, B9, B12 и K2. Магний и витамины группы B поддерживают энергетический обмен и работу нервной системы, а L-теанин дополняет нейрофункциональную часть формулы.",
    image: "/images/evolution/meta-state.jpg",
  },
  {
    title: "Единая METAформула",
    text: "Evolution строится вокруг функционального состояния целиком — с учётом его физиологических задач и микробиотического контекста.",
    image: "/images/evolution/feature-keys.jpg",
  },
];

const metaSteps: EvolutionMetaStep[] = [
  {
    title: "Состояние",
    text: "После накопленной нагрузки",
    image: "/images/evolution/meta-state.webp",
  },
  {
    title: "Процессы",
    text: "Функциональные процессы\nЭнергетический обмен\nНервная система",
    image: "/images/evolution/feature-daily.webp",
  },
  {
    title: "Два контура поддержки",
    text: "Функциональный и метабиотический",
    image: "/images/evolution/meta-series.webp",
  },
  {
    title: "Готовая формула",
    text: "МЕТАНАПИТОК\nEvolution 10+Mg",
    image: "/images/evolution/feature-magnesium.webp",
  },
];

const evolutionNutrients: EvolutionNutrient[] = [
  {
    name: "Mg",
    value: "132 мг",
    daily: "33% РУСП",
  },
  {
    name: "B6",
    value: "1 мг",
    daily: "50% РУСП",
  },
  {
    name: "B9",
    value: "100 мкг",
    daily: "50% РУСП",
  },
  {
    name: "B12",
    value: "0,5 мкг",
    daily: "50% РУСП",
  },
  {
    name: "K2",
    value: "120 мкг",
    daily: "100% РУСП",
  },
  {
    name: "L-теанин",
    value: "30 мг",
  },
];

onMounted(() => {
  void ensureCartLoaded();
});
</script>

<template>
  <!-- EvolutionProductHero checked build: 2026-08-26-v3-currentcolor-icons -->
  <section class="evolution-hero mb-2 py-5 sm:mb-6 sm:py-6 xl:mb-10 xl:py-10">
    <div
      class="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 sm:gap-6 xl:gap-8"
    >
      <!-- ===================================================
           GALLERY — 50%
           =================================================== -->

      <div class="relative min-w-0 w-full">
        <div class="overflow-hidden rounded-2xl bg-primary/5 sm:rounded-[28px]">
          <img
            :src="activeImage"
            alt="Daigo Evolution 10 + Mg"
            class="aspect-square w-full object-cover"
            loading="eager"
            fetchpriority="high"
            decoding="async"
          />
        </div>

        <div class="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          <button
            v-for="image in gallery"
            :key="image"
            type="button"
            class="overflow-hidden rounded-xl border-2 bg-primary/5 transition sm:rounded-2xl"
            :class="
              activeImage === image
                ? 'border-primary'
                : 'border-transparent hover:border-primary/35'
            "
            @click="activeImage = image"
          >
            <img
              :src="image"
              alt=""
              class="aspect-[1.12/1] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        </div>
      </div>

      <!-- ===================================================
           PRODUCT INFO — 50%
           =================================================== -->

      <div class="flex min-w-0 w-full flex-col">
        <p
          class="mb-1 text-sm font-medium uppercase tracking-[0.02em] text-primary sm:text-base xl:text-lg"
        >
          Метанапиток
        </p>

        <h1
          class="m-0 font-medium !leading-[0.98] tracking-[-0.035em] text-black"
        >
          <span
            class="block text-[32px] sm:text-[34px] lg:text-[38px] xl:text-[46px] 2xl:text-[52px]"
          >
            DAIGO EVOLUTION
          </span>
          <span
            class="mt-1 block text-[30px] font-normal tracking-[-0.045em] sm:text-[32px] lg:text-[36px] xl:text-[42px] 2xl:text-[48px]"
          >
            10 + Mg
          </span>
        </h1>

        <h2
          class="mt-5 text-sm font-medium leading-snug sm:mt-4 sm:text-base xl:mt-5 xl:text-lg"
        >
          Функциональное восстановление после накопленной нагрузки
        </h2>

        <p
          class="mt-2 text-xs font-normal leading-[1.35] text-black/90 sm:text-sm lg:text-[15px] xl:text-base"
        >
          Комплексная формула на метабиотической основе Daigo для периода после
          продолжительной физической и интеллектуальной нагрузки. Поддерживает
          энергетический обмен, нервную систему и внутреннюю среду организма.
        </p>
        <!-- FORMULA -->
        <div
          class="mt-4 grid grid-cols-2 gap-y-5 sm:mt-5 sm:grid-cols-4 sm:gap-y-0 xl:mt-6"
        >
          <div
            class="relative flex min-w-0 flex-col items-center px-1 text-center sm:px-2"
          >
            <div
              class="flex size-[64px] items-center justify-center text-primary sm:size-[70px] xl:size-[78px]"
            >
              <svg
                class="size-full"
                aria-hidden="true"
                viewBox="0 0 105 105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="52.5"
                  cy="52.5"
                  r="51.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M28.8783 61.013C26.9711 58.7763 25.9628 55.6984 25.9628 52.1111C25.9628 48.5237 27.0134 45.4105 29.0007 43.1727C29.5325 42.5738 30.1255 42.0491 30.7702 41.602V35.2038C30.7702 32.9754 29.809 32.0141 27.5805 32.0141L23.2461 32L23.2366 41.8008H23.1672C23.1672 41.8008 21.813 40.2277 17.2679 40.2277C11.2815 40.2277 7 44.8599 7 51.9817C7 59.1034 11.0203 63.7791 17.1373 63.7791C21.7695 63.7791 23.1402 60.7647 23.1402 60.7647H23.2366C23.2366 61.8248 23.2272 63.7932 26.6499 63.7932H30.7608V62.7261C30.0749 62.2472 29.4442 61.6754 28.8771 61.0118L28.8783 61.013ZM19.0163 57.5315C16.3949 57.5315 14.603 55.3466 14.603 51.9828C14.603 48.619 16.6561 46.6083 19.0163 46.6083C21.9871 46.6083 23.4296 49.2732 23.4296 51.9828C23.4296 55.8714 21.2882 57.5315 19.0163 57.5315Z"
                  fill="#E01081"
                />
                <path
                  d="M47.8003 60.5967V40.295C47.6262 40.2809 47.4427 40.2727 47.2485 40.2727H42.9141L42.9105 41.841L42.8293 41.8446C42.8293 41.8446 41.4751 40.2715 36.93 40.2715C30.9436 40.2715 26.6621 44.9036 26.6621 52.0254C26.6621 59.1472 30.6824 63.8229 36.7994 63.8229C41.4316 63.8229 42.8023 60.8085 42.8023 60.8085H42.9105C42.9105 61.0426 42.6999 63.8334 46.339 63.8476H49.2663C48.2745 63.2758 47.8003 62.2074 47.8003 60.5955V60.5967ZM38.6784 57.5753C36.057 57.5753 34.2651 55.3904 34.2651 52.0266C34.2651 48.6628 36.3182 46.652 38.6784 46.652C41.6492 46.652 43.0917 49.3169 43.0917 52.0266C43.0917 55.9151 40.9504 57.5753 38.6784 57.5753Z"
                  fill="#0097D3"
                />
                <path
                  d="M54.855 35.5206V32.0332H48.5156V38.1537H52.2218C53.6761 38.1537 54.855 36.9748 54.855 35.5206Z"
                  fill="#584B99"
                />
                <path
                  d="M56.0763 62.5241C55.3974 62.0488 54.7738 61.4817 54.2126 60.824C52.3054 58.5873 51.297 55.5094 51.297 51.922C51.297 48.3347 52.3477 45.2215 54.3349 42.9837C54.7632 42.5024 55.2303 42.0683 55.7327 41.6835C55.2703 40.7246 54.3302 40.2764 52.8442 40.2764H48.5156C48.5156 40.2764 48.5156 47.0016 48.5156 47.6134V60.6757C48.5156 62.9053 49.4616 63.8395 51.6912 63.8395L56.0763 63.8442V62.5241Z"
                  fill="#584B99"
                />
                <path
                  d="M74.7694 60.9719C72.2551 58.727 70.8703 55.555 70.8703 52.0394C70.8703 48.5238 72.2515 45.3035 74.7612 43.0281C75.0506 42.7657 75.3518 42.5186 75.6659 42.2845C75.38 40.8067 74.4047 40.1572 72.5669 40.1572H68.2465V41.7327L68.1536 41.7303C68.1536 41.7303 66.7993 40.1572 62.2542 40.1572C56.2679 40.1572 51.9863 44.7894 51.9863 51.9111C51.9863 59.0329 56.0067 63.7086 62.1236 63.7086C66.7558 63.7086 68.1265 60.6942 68.1265 60.6942H68.2371C68.2383 60.7283 68.2347 62.0602 68.2347 62.0602C68.2347 65.3805 65.7439 66.3865 63.0355 66.3865C59.4964 66.3865 56.7432 64.9452 56.7432 64.9452L54.5583 70.8433C56.7432 71.9799 60.0647 72.7682 63.079 72.8529C71.9656 73.1035 75.4953 69.8126 75.7401 61.7508C75.4024 61.5072 75.0788 61.2472 74.7694 60.9707V60.9719ZM64.0015 57.461C61.3801 57.461 59.5881 55.2761 59.5881 51.9123C59.5881 48.5485 61.6413 46.5378 64.0015 46.5378C66.9723 46.5378 68.4148 49.2027 68.4148 51.9123C68.4148 55.8009 66.2734 57.461 64.0015 57.461Z"
                  fill="#F6B104"
                />
                <path
                  d="M84.242 40.1973C91.3637 40.1973 97.0007 44.96 97.0007 52.0383C97.0007 59.1165 91.3637 63.7486 84.2855 63.7486C77.2073 63.7486 71.5703 59.073 71.5703 52.0383C71.5703 45.0035 77.2073 40.1973 84.242 40.1973ZM84.2855 57.4564C87.0387 57.4564 89.3977 55.4032 89.3977 52.0383C89.3977 48.6733 87.0387 46.4896 84.2855 46.4896C81.5323 46.4896 79.1733 48.6309 79.1733 52.0383C79.1733 55.4456 81.5323 57.4564 84.2855 57.4564Z"
                  fill="#0EA141"
                />
              </svg>
            </div>
            <span
              class="mt-2 text-[10px] font-medium leading-tight sm:text-[11px] xl:text-xs"
            >
              Метабиотическое<br class="hidden xl:block" />
              ядро Daigo
            </span>
            <span
              class="absolute right-0 top-[22px] hidden h-8 w-px bg-black/10 sm:top-[24px] sm:block"
            />
          </div>

          <div
            class="relative flex min-w-0 flex-col items-center px-1 text-center sm:px-2"
          >
            <div
              class="flex size-[64px] items-center justify-center text-primary sm:size-[70px] xl:size-[78px]"
            >
              <svg
                class="size-full"
                aria-hidden="true"
                viewBox="0 0 105 105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M53.604 29.96V64H46.612V39.39L39.298 52.454H35.434L28.028 39.344V64H21.036V29.96H29.362L37.32 44.588L45.278 29.96H53.604ZM82.304 39.022C81.3534 41.138 79.2067 41.8893 75.864 41.276L75.726 41.598C77.014 42.058 78.118 42.978 79.038 44.358C79.958 45.7073 80.418 47.4093 80.418 49.464C80.418 52.3773 79.452 54.7233 77.52 56.502C75.6187 58.2807 73.0887 59.1853 69.93 59.216C68.366 59.216 67.2314 59.3387 66.526 59.584C65.8207 59.8293 65.468 60.2587 65.468 60.872C65.468 61.9453 66.3727 62.482 68.182 62.482H74.484C76.968 62.482 78.8847 63.08 80.234 64.276C81.614 65.472 82.304 67.1893 82.304 69.428C82.304 71.5747 81.6447 73.2307 80.326 74.396C79.038 75.5613 77.1674 76.144 74.714 76.144H64.088C61.972 76.144 60.316 75.6533 59.12 74.672C57.924 73.7213 57.326 72.3873 57.326 70.67C57.326 69.1673 57.878 67.956 58.982 67.036C60.086 66.1467 61.6194 65.702 63.582 65.702V65.288C62.5394 65.196 61.696 64.874 61.052 64.322C60.408 63.77 60.086 63.0493 60.086 62.16C60.086 61.1173 60.5154 60.2893 61.374 59.676C62.2634 59.032 63.4134 58.71 64.824 58.71H65.422V58.48C63.4594 57.7747 61.926 56.64 60.822 55.076C59.7487 53.512 59.212 51.6413 59.212 49.464C59.212 46.5507 60.178 44.2047 62.11 42.426C64.0727 40.6167 66.6487 39.712 69.838 39.712H73.564C74.6987 39.712 75.6187 39.4667 76.324 38.976C77.06 38.4547 77.428 37.78 77.428 36.952C77.428 36.0933 77.198 35.3573 76.738 34.744H82.166C82.902 36.3693 82.948 37.7953 82.304 39.022ZM66.48 53.328C67.308 54.2787 68.4274 54.754 69.838 54.754C71.2487 54.754 72.3527 54.2787 73.15 53.328C73.978 52.3773 74.392 51.0893 74.392 49.464C74.392 47.808 73.978 46.52 73.15 45.6C72.3527 44.6493 71.2487 44.174 69.838 44.174C68.4274 44.174 67.308 44.6493 66.48 45.6C65.6827 46.52 65.284 47.808 65.284 49.464C65.284 51.0893 65.6827 52.3773 66.48 53.328ZM73.564 67.22H66.342C65.4834 67.22 64.778 67.4193 64.226 67.818C63.674 68.2473 63.398 68.7993 63.398 69.474C63.398 70.118 63.628 70.6393 64.088 71.038C64.548 71.4367 65.1767 71.636 65.974 71.636H73.564C75.3734 71.636 76.278 70.9153 76.278 69.474C76.278 68.7687 76.0327 68.2167 75.542 67.818C75.082 67.4193 74.4227 67.22 73.564 67.22Z"
                  fill="currentColor"
                />
                <circle
                  cx="52.5"
                  cy="52.5"
                  r="51.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
            <span
              class="mt-2 text-[10px] font-medium leading-tight sm:text-[11px] xl:text-xs"
              >Магний</span
            >
            <span
              class="absolute right-0 top-[22px] hidden h-8 w-px bg-black/10 sm:top-[24px] sm:block"
            />
          </div>

          <div
            class="relative flex min-w-0 flex-col items-center px-1 text-center sm:px-2"
          >
            <div
              class="flex size-[64px] items-center justify-center text-primary sm:size-[70px] xl:size-[78px]"
            >
              <svg
                class="size-full"
                aria-hidden="true"
                viewBox="0 0 105 105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="52.5"
                  cy="52.5"
                  r="51.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
                <path
                  d="M36.084 75.2494C36.084 75.2494 37.3757 63.6243 46.4173 53.291"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M68.9544 47.9103L67.4199 31.9582C67.4005 31.7555 67.3413 31.5611 67.2457 31.3813C67.1502 31.2014 67.0201 31.0422 66.863 30.9126C66.7058 30.7831 66.5247 30.6858 66.3299 30.6262C66.1351 30.5667 65.9305 30.5462 65.7278 30.5658L48.7527 32.1985C44.0225 32.6541 39.6671 34.9701 36.6445 38.6371C33.6219 42.304 32.1797 47.0215 32.6353 51.7517C33.5834 61.602 42.5062 68.8017 52.3565 67.8536C62.3927 66.8875 69.9206 57.9491 68.9544 47.9103Z"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span
              class="mt-2 text-[10px] font-medium leading-tight sm:text-[11px] xl:text-xs"
              >L-теанин</span
            >
            <span
              class="absolute right-0 top-[22px] hidden h-8 w-px bg-black/10 sm:top-[24px] sm:block"
            />
          </div>

          <div
            class="flex min-w-0 flex-col items-center px-1 text-center sm:px-2"
          >
            <div
              class="flex size-[64px] items-center justify-center text-primary sm:size-[70px] xl:size-[78px]"
            >
              <svg
                class="size-full"
                aria-hidden="true"
                viewBox="0 0 105 105"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M61.53 52.876V53.06C63.6767 53.4587 65.4093 54.4553 66.728 56.05C68.0773 57.6447 68.752 59.5153 68.752 61.662C68.752 64.3913 67.74 66.63 65.716 68.378C63.692 70.126 60.978 71 57.574 71H39.358V36.96H57.85C60.6407 36.96 62.8793 37.742 64.566 39.306C66.2527 40.8393 67.096 42.8173 67.096 45.24C67.096 47.08 66.59 48.69 65.578 50.07C64.566 51.45 63.2167 52.3853 61.53 52.876ZM60.104 46.482C60.104 45.1633 59.6747 44.1513 58.816 43.446C57.988 42.71 56.792 42.342 55.228 42.342H46.35V50.622H55.228C56.792 50.622 57.988 50.254 58.816 49.518C59.6747 48.782 60.104 47.77 60.104 46.482ZM46.35 65.618H55.826C59.782 65.618 61.76 63.9467 61.76 60.604C61.76 59.0093 61.254 57.798 60.242 56.97C59.23 56.1113 57.85 55.682 56.102 55.682H46.35V65.618Z"
                  fill="currentColor"
                />
                <circle
                  cx="52.5"
                  cy="52.5"
                  r="51.75"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
            <span
              class="mt-2 text-[10px] font-medium leading-tight sm:text-[11px] xl:text-xs"
              >B6 · B9 · B12</span
            >
          </div>
        </div>

        <!-- INFO STRIP -->
        <div
          class="mt-4 grid grid-cols-2 items-center gap-x-3 gap-y-3 sm:grid-cols-4 sm:gap-x-1 sm:gap-y-0 rounded-xl bg-primary/10 px-3 py-3 text-primary sm:mt-5 sm:px-3"
        >
          <div class="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <svg
              class="h-7 w-7 shrink-0"
              aria-hidden="true"
              viewBox="0 0 41 46"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_549_4121)">
                <path
                  d="M1.0957 17.6348C1.51247 17.3441 1.91666 17.2736 2.31641 17.3281C2.72467 17.3838 3.13712 17.5712 3.55957 17.8125C4.92294 18.5896 5.62465 19.8603 6.23828 21.2637L6.49805 21.8721C6.56526 22.0318 6.6152 22.2089 6.67188 22.4023C6.72702 22.5905 6.78808 22.7938 6.87598 22.9814C6.96474 23.1709 7.08466 23.3536 7.2627 23.499C7.44226 23.6457 7.67044 23.7448 7.95996 23.7852V23.7861C13.3172 24.5265 16.4044 28.4155 19.5947 32.3193C19.8256 32.602 20.0094 32.9041 20.3789 33.4287L20.5723 33.7031L20.7217 33.4033C22.8122 29.2164 26.0498 26.267 30.0391 24.6475C32.7456 23.548 34.8072 22.3601 35.8242 19.4844C36.1386 18.5945 37.0352 18.0084 37.998 17.5977C38.8136 17.2492 39.4848 17.2905 39.9541 17.5977C40.3661 17.8675 40.664 18.3694 40.7588 19.0977L40.7861 19.4238C40.8001 19.7536 40.8169 20.052 40.7344 20.3018C40.241 21.7854 39.8206 23.3037 39.3906 24.8086C38.9601 26.3155 38.5199 27.8112 37.9854 29.2607C36.9836 31.9773 35.654 34.5228 33.4521 36.6543L33 37.0752C30.8614 38.9892 29.4457 41.2504 29.9365 44.3574V44.3584C29.9936 44.7181 29.9817 45.0428 29.8652 45.2656C29.8096 45.3719 29.7291 45.4572 29.6133 45.5166C29.495 45.5772 29.3281 45.6165 29.0947 45.6104C28.8398 45.6035 28.6954 45.5483 28.6104 45.4844C28.5284 45.4227 28.478 45.3352 28.4482 45.2109C28.4173 45.0815 28.4115 44.9284 28.4102 44.749C28.4089 44.5782 28.4118 44.3802 28.3867 44.1963C28.2 42.7876 28.2596 41.5052 28.6465 40.3408C29.0328 39.1785 29.7487 38.1205 30.8955 37.166L30.8965 37.167C33.5106 34.9926 35.0902 32.2838 36.2656 29.3867C37.4357 26.5029 38.2191 23.3902 39.2119 20.4541C39.2826 20.2456 39.284 20.0241 39.2734 19.8047C39.2623 19.5748 39.2383 19.3511 39.2383 19.0791H39.0957L38.9746 18.8877C36.4459 19.7861 36.0896 22.0358 35.4893 23.7852C34.5208 26.6177 33.338 29.2201 30.9951 31.1055C30.8583 31.2157 30.7303 31.3652 30.6172 31.4912C30.4971 31.625 30.3892 31.7386 30.2783 31.8154C30.1721 31.889 30.078 31.918 29.9795 31.9043C29.8756 31.8898 29.7305 31.8225 29.5361 31.627H29.5352C29.3448 31.4359 29.2526 31.2745 29.2158 31.1396C29.1801 31.0086 29.193 30.8861 29.2422 30.7607C29.2931 30.631 29.3829 30.4975 29.5039 30.3545C29.5646 30.2827 29.6304 30.212 29.6992 30.1396L29.915 29.916C30.9958 28.7892 32.6387 27.8617 32.9844 25.46L33.0283 25.1543L32.7314 25.2393C29.6269 26.124 27.2475 27.7639 25.2373 29.8389L24.8398 30.2598C22.4493 32.8571 20.7823 35.8552 21.1807 39.6875C21.3514 41.3309 21.2066 42.9925 21.2012 44.6914V44.6924C21.2012 45.036 21.1825 45.3059 21.0811 45.4941C21.034 45.5813 20.9687 45.6512 20.8721 45.7021C20.7727 45.7545 20.6294 45.792 20.4219 45.7969C20.1953 45.8024 20.0531 45.7662 19.9629 45.7168C19.8774 45.67 19.8243 45.6033 19.7881 45.5146C19.7497 45.4207 19.7308 45.3021 19.7236 45.1572C19.7164 45.0096 19.7214 44.8614 19.7207 44.6943C19.7153 43.0846 19.6213 41.4974 19.7627 39.9258V39.9248C20.1381 35.7362 18.3558 32.4917 15.4561 29.8223C13.5136 28.0344 11.5423 26.0807 8.39844 25.3027L8.10742 25.2305L8.15234 25.5264C8.47115 27.6233 9.90677 28.5489 10.8857 29.6045C11.0451 29.7767 11.2593 29.9379 11.4541 30.0879C11.6564 30.2435 11.8421 30.3906 11.9805 30.5459C12.1178 30.7001 12.1891 30.8423 12.1924 30.9863C12.1956 31.1286 12.1338 31.3174 11.9092 31.5664C11.6471 31.8568 11.4417 31.9517 11.2861 31.9648C11.132 31.9777 10.9782 31.914 10.8076 31.7773C10.6352 31.6391 10.4703 31.4464 10.2949 31.2383C10.1686 31.0883 10.0346 30.9276 9.89453 30.792L9.75293 30.666C7.31766 28.7263 6.40011 25.8887 5.36133 23.0107C5.08325 22.2424 4.83277 21.3495 4.32812 20.5889C3.81303 19.8125 3.03453 19.1698 1.70801 18.8574L1.36035 18.7754L1.47266 19.1152C1.89237 20.384 2.26295 21.6493 2.63086 22.9023C2.99844 24.1543 3.3637 25.3949 3.77148 26.6084C4.58728 29.036 5.57706 31.3664 7.1123 33.4961C8.03721 34.7805 9.00256 36.1335 10.207 37.1777H10.208C12.5642 39.2197 12.5228 41.8453 12.4121 44.668C12.3997 44.9929 12.3703 45.2216 12.2812 45.3633C12.242 45.4256 12.191 45.4712 12.1152 45.5C12.0353 45.5304 11.9168 45.5462 11.7402 45.5273H11.7393C11.4443 45.4962 11.2277 45.4037 11.0996 45.2695C10.9793 45.1435 10.912 44.9538 10.9658 44.6631C11.7105 40.6029 9.09417 38.085 6.83887 35.5762C4.85307 33.3728 3.65615 30.8324 2.73828 28.1582C2.27921 26.8207 1.89097 25.4522 1.50781 24.0762C1.12512 22.7018 0.747479 21.3185 0.311523 19.96C0.0500533 19.1446 0.24406 18.3176 0.948242 17.7461L1.0957 17.6348Z"
                  fill="currentColor"
                  stroke="#DFEBFF"
                  stroke-width="0.4"
                />
                <path
                  d="M20.7012 0.214844C20.8887 0.256351 21.0752 0.375273 21.3398 0.542969C26.3188 3.71421 29.829 9.94948 29.7812 15.6006V15.6016C29.7733 18.1837 29.2695 20.5953 27.7217 22.6885C25.6342 25.5078 23.0622 27.5724 19.5059 26.9326C15.522 26.2161 12.7462 23.4822 11.6943 19.6602C9.59131 12.0341 13.8289 4.71172 20.0947 0.378906L20.0957 0.37793C20.3529 0.199532 20.5362 0.17841 20.7012 0.214844ZM20.3438 2.23828C20.0007 2.30036 19.7056 2.51354 19.4082 2.7666C15.2285 6.32331 12.7573 10.7684 12.7246 16.3789C12.7001 20.4859 15.5872 24.2237 19.3516 25.1758L19.5586 25.2285L19.5967 25.0186C19.823 23.7921 19.9244 22.5968 19.6816 21.4795C19.4373 20.3551 18.8469 19.3218 17.7139 18.4189C17.3629 18.1392 17.0838 17.7452 16.8262 17.2969C16.6978 17.0734 16.5771 16.8398 16.4551 16.6035L16.082 15.9023L15.9727 15.6943C15.8698 15.4825 15.7901 15.2606 15.7686 15.0557C15.7445 14.8266 15.7929 14.6332 15.957 14.4854L16.0342 14.4248C16.1826 14.3237 16.2925 14.3024 16.375 14.3105C16.4602 14.319 16.5475 14.362 16.6445 14.4443C16.7428 14.5278 16.8383 14.6412 16.9395 14.7715C17.0357 14.8955 17.142 15.0421 17.248 15.1631H17.249C17.3862 15.3188 17.5072 15.4959 17.6338 15.6895C17.7582 15.8798 17.8901 16.0891 18.04 16.293C18.3449 16.7073 18.7368 17.1149 19.375 17.4014L19.6572 17.5283V17.2188C19.6572 14.9183 19.6435 12.8819 19.665 10.8418V10.8408C19.6666 10.6464 19.6576 10.4968 19.6621 10.3164C19.6664 10.1486 19.6833 10.0052 19.7246 9.88867C19.7641 9.77751 19.8247 9.69395 19.9219 9.63477C20.0236 9.57301 20.1848 9.52583 20.4424 9.52832C20.6778 9.53084 20.8387 9.57311 20.9502 9.63281C21.0587 9.69103 21.1327 9.77191 21.1846 9.875C21.2685 10.0418 21.2956 10.2616 21.3037 10.5264L21.3066 10.8066C21.2986 12.8649 21.3066 14.9241 21.3066 17.2949H21.498L21.5879 17.4775L21.5898 17.4756L21.5908 17.4766L21.5967 17.4736L21.707 17.418V17.4141C22.3767 17.0619 22.7878 16.5929 23.1143 16.124C23.2815 15.8838 23.4385 15.6262 23.584 15.4072C23.7346 15.1805 23.8852 14.975 24.0615 14.7988C24.2046 14.6561 24.3458 14.5509 24.4834 14.499C24.6133 14.45 24.7426 14.447 24.8848 14.5156H24.8857C25.0357 14.587 25.0897 14.6905 25.1045 14.8223C25.1212 14.9716 25.0854 15.1484 25.0391 15.335L25.0381 15.3359C24.6934 16.7392 24.0751 18.0501 22.9893 18.877C21.3599 20.1176 21.2827 21.743 21.2051 23.4355C21.1832 23.9172 21.2146 24.294 21.3057 24.5732C21.3986 24.858 21.5617 25.0616 21.8057 25.1484C22.0374 25.2308 22.2991 25.1917 22.5586 25.1006C22.8218 25.0082 23.113 24.8516 23.4209 24.6592C25.6284 23.2754 27.1501 21.355 27.8232 18.7803C28.5349 16.0541 28.1217 12.768 26.9541 9.78809C25.7864 6.80799 23.8531 4.10448 21.4902 2.55664C21.0638 2.27675 20.6986 2.1741 20.3438 2.23828Z"
                  fill="currentColor"
                  stroke="#DFEBFF"
                  stroke-width="0.4"
                />
              </g>
              <defs>
                <clipPath id="clip0_549_4121">
                  <rect width="41" height="46" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span
              class="text-[8px] font-normal leading-tight sm:text-[9px] lg:text-[10px]"
            >
              Без искусственных красителей и консервантов
            </span>
          </div>

          <div class="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <svg
              class="h-7 w-7 shrink-0"
              aria-hidden="true"
              viewBox="0 0 21 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_548_4000)">
                <path
                  d="M16.1892 5.76953C18.2592 5.76953 19.9292 7.44953 19.9292 9.50953C19.9292 11.5695 18.2492 13.2495 16.1892 13.2495C14.1292 13.2495 12.4492 11.5695 12.4492 9.50953C12.4492 7.44953 14.1292 5.76953 16.1892 5.76953Z"
                  fill="white"
                />
                <path
                  d="M5.05992 34.0898C6.77992 34.0898 8.19992 35.5098 8.19992 37.2298C8.19992 38.9498 6.77992 40.3698 5.05992 40.3698C3.33992 40.3698 1.91992 38.9498 1.91992 37.2298C1.91992 35.5098 3.33992 34.0898 5.05992 34.0898Z"
                  fill="white"
                />
                <path
                  d="M17.8104 20.2305C18.3104 20.2305 18.7204 20.6405 18.7204 21.1405C18.7204 21.6405 18.3104 22.0505 17.8104 22.0505C17.3104 22.0505 16.9004 21.6405 16.9004 21.1405C16.9004 20.6405 17.3104 20.2305 17.8104 20.2305Z"
                  fill="currentColor"
                />
                <path
                  d="M12.1405 0.299805C12.6405 0.299805 13.0505 0.709805 13.0505 1.2098C13.0505 1.7098 12.6405 2.1198 12.1405 2.1198C11.6405 2.1198 11.2305 1.7098 11.2305 1.2098C11.2305 0.709805 11.6405 0.299805 12.1405 0.299805Z"
                  fill="currentColor"
                />
                <path
                  d="M11.4295 32.2695C11.9295 32.2695 12.3395 32.6795 12.3395 33.1795C12.3395 33.6795 11.9295 34.0895 11.4295 34.0895C10.9295 34.0895 10.5195 33.6795 10.5195 33.1795C10.5195 32.6795 10.9295 32.2695 11.4295 32.2695Z"
                  fill="currentColor"
                />
                <path
                  d="M10.8299 49.9697C11.3299 49.9697 11.7399 50.3797 11.7399 50.8797C11.7399 51.3797 11.3299 51.7897 10.8299 51.7897C10.3299 51.7897 9.91992 51.3797 9.91992 50.8797C9.91992 50.3797 10.3299 49.9697 10.8299 49.9697Z"
                  fill="currentColor"
                />
                <path
                  d="M6.67953 17.7002C7.17953 17.7002 7.58953 18.1102 7.58953 18.6102C7.58953 19.1102 7.17953 19.5202 6.67953 19.5202C6.17953 19.5202 5.76953 19.1102 5.76953 18.6102C5.76953 18.1102 6.17953 17.7002 6.67953 17.7002Z"
                  fill="currentColor"
                />
                <path
                  d="M3.4393 48.0498C3.9393 48.0498 4.3493 48.4598 4.3493 48.9598C4.3493 49.4598 3.9393 49.8698 3.4393 49.8698C2.9393 49.8698 2.5293 49.4598 2.5293 48.9598C2.5293 48.4598 2.9393 48.0498 3.4393 48.0498Z"
                  fill="currentColor"
                />
                <path
                  d="M0.91 0C1.41 0 1.82 0.41 1.82 0.91C1.82 1.41 1.41 1.82 0.91 1.82C0.41 1.82 0 1.41 0 0.91C0 0.41 0.41 0 0.91 0Z"
                  fill="currentColor"
                />
                <path
                  d="M16.1902 13.86C13.7602 13.86 11.7402 11.84 11.7402 9.40996C11.7402 6.97996 13.7602 4.95996 16.1902 4.95996C18.6202 4.95996 20.6402 6.97996 20.6402 9.40996C20.6402 11.84 18.6202 13.86 16.1902 13.86ZM16.1902 6.26996C14.4702 6.26996 13.0502 7.68996 13.0502 9.40996C13.0502 11.13 14.4702 12.55 16.1902 12.55C17.9102 12.55 19.3302 11.13 19.3302 9.40996C19.4302 7.68996 17.9102 6.26996 16.1902 6.26996Z"
                  fill="currentColor"
                />
                <path
                  d="M5.0607 41.0702C2.9407 41.0702 1.2207 39.3502 1.2207 37.2302C1.2207 35.1102 2.9407 33.4902 5.0607 33.4902C7.1807 33.4902 8.9007 35.2102 8.9007 37.3302C8.9007 39.4502 7.1807 41.0702 5.0607 41.0702ZM5.0607 34.8002C3.6407 34.8002 2.5307 35.9102 2.5307 37.3302C2.5307 38.7502 3.6407 39.8602 5.0607 39.8602C6.4807 39.8602 7.5907 38.7502 7.5907 37.3302C7.5907 35.9102 6.4807 34.8002 5.0607 34.8002Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_548_4000">
                  <rect width="20.64" height="51.79" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span
              class="text-[8px] font-normal leading-tight sm:text-[9px] lg:text-[10px]"
              >Средняя газация</span
            >
          </div>

          <div class="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <svg
              class="h-7 w-7 shrink-0"
              aria-hidden="true"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_548_4048)">
                <path
                  d="M26.8468 1.33582C28.0612 2.51948 28.0612 4.35943 26.8468 5.54309C26.6665 5.71888 26.5402 5.83607 26.3599 5.95912C28.0011 9.69175 27.1474 14.5553 24.1716 18.7626C22.0435 18.5282 19.6088 18.5282 17.4806 18.8212C14.6251 19.2372 12.6172 20.1865 12.5571 21.1943C12.5571 22.8526 12.7975 24.5754 13.4107 26.1165C10.7956 26.7083 8.24067 26.5911 6.05242 25.7005C5.01841 27.3002 2.70993 27.5404 1.30921 26.1751C0.0948477 24.9914 0.0948477 23.1515 1.30921 21.9678C1.42944 21.8506 1.48956 21.792 1.6158 21.7334C-0.824939 17.1629 0.696016 10.5238 5.74583 5.60168C10.7956 0.679533 17.6069 -0.797112 22.284 1.57021C22.3441 1.45301 22.4643 1.39442 22.5244 1.27136C23.6787 0.204897 25.6265 0.204897 26.8408 1.32996L26.8468 1.33582Z"
                  fill="white"
                />
                <path
                  d="M32.6856 6.72656C33.7196 6.72656 34.5732 7.55864 34.5732 8.56651C34.5732 9.57438 33.7196 10.4065 32.6856 10.4065C31.6516 10.4065 30.7979 9.57438 30.7979 8.56651C30.7378 7.55864 31.5915 6.72656 32.6856 6.72656Z"
                  fill="white"
                />
                <path
                  d="M8.36165 29.7256C9.60607 29.7256 10.61 30.71 10.61 31.9171C10.61 33.1242 9.60006 34.1086 8.36165 34.1086C7.12324 34.1086 6.11328 33.1242 6.11328 31.9171C6.11328 30.71 7.12324 29.7256 8.36165 29.7256Z"
                  fill="white"
                />
                <path
                  d="M18.5765 4.89258C19.1837 4.89258 19.7308 5.36721 19.7308 6.01764C19.7308 6.60947 19.2438 7.1427 18.5765 7.1427C17.9093 7.1427 17.4824 6.60947 17.4824 6.01764C17.4824 5.36721 17.9694 4.89258 18.5765 4.89258Z"
                  fill="white"
                />
                <path
                  d="M11.764 5.30273C13.0084 5.30273 14.0124 6.28716 14.0124 7.49426C14.0124 8.70136 13.0024 9.68579 11.764 9.68579C10.5256 9.68579 9.51562 8.70136 9.51562 7.49426C9.51562 6.28716 10.5256 5.30273 11.764 5.30273Z"
                  fill="white"
                />
                <path
                  d="M32.8713 25.6357C33.1719 25.6357 33.4183 25.876 33.4183 26.169C33.4183 26.462 33.1719 26.7022 32.8713 26.7022C32.5707 26.7022 32.3242 26.462 32.3242 26.169C32.3242 25.876 32.5707 25.6357 32.8713 25.6357Z"
                  fill="currentColor"
                />
                <path
                  d="M31.7111 1.39453C32.0117 1.39453 32.2582 1.63478 32.2582 1.92776C32.2582 2.22075 32.0117 2.461 31.7111 2.461C31.4105 2.461 31.1641 2.22075 31.1641 1.92776C31.1641 1.63478 31.4105 1.39453 31.7111 1.39453Z"
                  fill="currentColor"
                />
                <path
                  d="M29.8303 13.0723C30.1308 13.0723 30.3773 13.3125 30.3773 13.6055C30.3773 13.8985 30.1308 14.1387 29.8303 14.1387C29.5297 14.1387 29.2832 13.8985 29.2832 13.6055C29.2832 13.3125 29.5297 13.0723 29.8303 13.0723Z"
                  fill="currentColor"
                />
                <path
                  d="M29.6501 21.2529C29.6501 22.378 27.5219 23.3273 24.4199 23.7433V23.6847L20.9512 21.2529L21.0113 21.1943L29.6441 21.2529H29.6501Z"
                  fill="white"
                />
                <path
                  d="M29.6501 21.2531H20.9512L24.3538 18.8799V18.8213C27.4558 19.2373 29.5839 20.128 29.6441 21.2531H29.6501Z"
                  fill="white"
                />
                <path
                  d="M29.6494 21.3115C29.6494 26.2923 27.0944 30.5581 23.5655 31.9234C23.6257 32.0992 23.6257 32.2223 23.6257 32.3981C23.6257 33.6403 22.5917 34.6482 21.3172 34.6482C20.0427 34.6482 19.0087 33.6403 19.0087 32.3981V32.0992C16.4537 31.3316 14.4458 29.1342 13.3517 26.1692C12.8046 24.6867 12.498 23.0284 12.498 21.3115C12.498 22.378 14.5059 23.3273 17.4216 23.7433C18.5157 23.9191 19.7301 23.9777 21.0707 23.9777C22.2851 23.9777 23.3792 23.9191 24.4132 23.7433C27.4551 23.3273 29.5832 22.378 29.6434 21.3115H29.6494Z"
                  fill="white"
                />
                <path
                  d="M24.4199 18.8213V18.8799L21.0113 21.2531H20.891L17.4824 18.8799C18.5765 18.7041 19.7909 18.6396 21.1315 18.6396C22.2256 18.6396 23.2596 18.6982 24.1734 18.8154C24.2335 18.7568 24.2937 18.8154 24.4139 18.8154L24.4199 18.8213Z"
                  fill="white"
                />
                <path
                  d="M24.4193 23.6788V23.7374C23.3853 23.8546 22.2912 23.9718 21.0768 23.9718C19.8023 23.9718 18.5219 23.8546 17.4277 23.7374V23.6788L20.8965 21.2471L24.4253 23.6788H24.4193Z"
                  fill="white"
                />
                <path
                  d="M20.9509 21.2529L17.4822 23.6847V23.7433C14.5605 23.3273 12.5586 22.378 12.5586 21.3115V21.2529H20.9509Z"
                  fill="white"
                />
                <path
                  d="M17.4218 18.8799L20.8244 21.2531H12.4922C12.5523 20.1866 14.5602 19.2959 17.4158 18.8799H17.4218Z"
                  fill="white"
                />
                <path
                  d="M13.8322 31.9814C14.1328 31.9814 14.3793 32.2217 14.3793 32.5147C14.3793 32.8077 14.1328 33.0479 13.8322 33.0479C13.5316 33.0479 13.2852 32.8077 13.2852 32.5147C13.2852 32.2217 13.5316 31.9814 13.8322 31.9814Z"
                  fill="currentColor"
                />
                <path
                  d="M3.98456 1.92773C4.28515 1.92773 4.53163 2.16798 4.53163 2.46097C4.53163 2.75395 4.28515 2.9942 3.98456 2.9942C3.68398 2.9942 3.4375 2.75395 3.4375 2.46097C3.4375 2.16798 3.68398 1.92773 3.98456 1.92773Z"
                  fill="currentColor"
                />
                <path
                  d="M2.0373 29.0166C2.33788 29.0166 2.58436 29.2568 2.58436 29.5498C2.58436 29.8428 2.33788 30.0831 2.0373 30.0831C1.73671 30.0831 1.49023 29.8428 1.49023 29.5498C1.49023 29.2568 1.73671 29.0166 2.0373 29.0166Z"
                  fill="currentColor"
                />
                <path
                  d="M3.43823 27.4757C2.52446 27.4757 1.67681 27.1182 1.0035 26.5264C-0.337104 25.2197 -0.337104 23.0867 1.0035 21.7859C1.04358 21.7468 1.08366 21.7078 1.12373 21.6687C0.0296082 19.4127 -0.210859 16.6293 0.516554 13.7229C1.3101 10.6993 3.0114 7.79292 5.50625 5.367C7.99508 2.93522 10.9769 1.27693 14.0789 0.503446C16.9946 -0.205578 19.9162 0.0288103 22.2247 1.09528C22.2648 1.05621 22.3049 1.01715 22.345 0.978082C23.6856 -0.328631 25.8738 -0.328631 27.2084 0.978082C27.8757 1.62851 28.1823 2.46059 28.1823 3.35126C28.1823 4.24194 27.8156 5.06815 27.2084 5.72444C27.0882 5.84163 27.0281 5.90023 26.9018 6.02328C28.4228 9.81451 27.509 14.7367 24.5272 18.8853C24.407 19.0611 24.1605 19.1197 23.9801 19.0025C23.7998 18.8853 23.7397 18.6451 23.8599 18.4693C26.7816 14.3792 27.5691 9.63872 26.0482 6.02328C25.988 5.84749 26.0482 5.66584 26.1684 5.54865C26.3487 5.43146 26.475 5.3084 26.5952 5.19121C27.0822 4.71657 27.3827 4.06614 27.3827 3.35126C27.3827 2.63638 27.0762 1.98595 26.5952 1.51131C25.5612 0.503446 23.8599 0.503446 22.8259 1.51131C22.7658 1.56991 22.6455 1.68711 22.5854 1.7457C22.4652 1.8629 22.2788 1.92149 22.0985 1.8629C17.4815 -0.504422 10.8566 1.09528 5.98718 5.83577C1.18385 10.5235 -0.517455 16.9809 1.91728 21.5456C1.97739 21.7214 1.97739 21.9031 1.79704 22.0203C1.67681 22.0789 1.61669 22.1961 1.55657 22.2547C0.522566 23.2625 0.522566 24.9208 1.55657 25.9287C2.04352 26.4033 2.71082 26.7022 3.44424 26.7022C4.17767 26.7022 4.84496 26.4033 5.33191 25.9287C5.45214 25.8115 5.57238 25.6298 5.69862 25.5127C5.81886 25.3369 6.00522 25.2783 6.18557 25.3955C8.25359 26.2275 10.6883 26.4033 13.3034 25.8115C13.4837 25.7529 13.7302 25.8701 13.7903 26.1103C13.8505 26.2861 13.7302 26.5264 13.4837 26.585C10.8687 27.1768 8.37382 27.0596 6.18557 26.2275C6.12545 26.3447 6.00522 26.4678 5.87897 26.5264C5.21168 27.1182 4.35802 27.4757 3.44424 27.4757H3.43823Z"
                  fill="currentColor"
                />
                <path
                  d="M29.6489 21.6045H12.4976C12.3172 21.6045 12.1309 21.4287 12.1309 21.2471C12.1309 21.0654 12.3112 20.8896 12.4976 20.8896H29.5888C29.7691 20.8896 29.9555 21.0654 29.9555 21.2471C29.9555 21.4287 29.8353 21.6045 29.6489 21.6045Z"
                  fill="currentColor"
                />
                <path
                  d="M17.421 24.0359C17.3007 24.0359 17.1805 23.9773 17.1144 23.8601C16.9941 23.6843 17.0542 23.444 17.1745 23.3268L24.1059 18.5277C24.2863 18.4106 24.5328 18.4692 24.653 18.5863C24.7732 18.7621 24.7131 19.0024 24.5929 19.1196L17.6614 23.9187C17.6013 24.0359 17.5412 24.0359 17.421 24.0359Z"
                  fill="currentColor"
                />
                <path
                  d="M24.4194 24.0361C24.3592 24.0361 24.239 24.0361 24.1789 23.9775L17.2474 19.1784C17.0671 19.0612 17.0671 18.8209 17.1873 18.6452C17.3075 18.4694 17.554 18.4694 17.7344 18.5866L24.6658 23.3857C24.8462 23.5029 24.8462 23.7431 24.726 23.9189C24.6658 23.9775 24.5456 24.0361 24.4194 24.0361Z"
                  fill="currentColor"
                />
                <path
                  d="M23.7457 14.4902H23.6255C23.4451 14.4316 23.3189 14.1913 23.385 14.0156C24.3589 11.4666 24.4791 9.0348 23.6255 7.08352C23.5654 6.90773 23.6255 6.66748 23.8058 6.60889C23.9862 6.55029 24.2327 6.60889 24.2928 6.78468C25.2066 8.91761 25.1464 11.5838 24.1124 14.2558C23.9922 14.4316 23.872 14.4902 23.7457 14.4902Z"
                  fill="currentColor"
                />
                <path
                  d="M18.5756 7.50017C17.722 7.50017 17.0547 6.84974 17.0547 6.01766C17.0547 5.18558 17.722 4.53516 18.5756 4.53516C19.4293 4.53516 20.0966 5.18558 20.0966 6.01766C20.0966 6.79114 19.4293 7.50017 18.5756 7.50017ZM18.5756 5.25004C18.1488 5.25004 17.7881 5.60748 17.7881 6.01766C17.7881 6.42784 18.1548 6.79114 18.5756 6.79114C18.9965 6.79114 19.3632 6.4337 19.3632 6.01766C19.3632 5.60162 18.9965 5.25004 18.5756 5.25004Z"
                  fill="currentColor"
                />
                <path
                  d="M11.765 10.0491C10.3042 10.0491 9.08984 8.86546 9.08984 7.44155C9.08984 6.01764 10.3042 4.83398 11.765 4.83398C13.2259 4.83398 14.4402 6.01764 14.4402 7.44155C14.4402 8.86546 13.2259 10.0491 11.765 10.0491ZM11.765 5.60161C10.731 5.60161 9.87737 6.43368 9.87737 7.44155C9.87737 8.44942 10.731 9.2815 11.765 9.2815C12.7991 9.2815 13.6527 8.44942 13.6527 7.44155C13.6527 6.43368 12.7991 5.60161 11.765 5.60161Z"
                  fill="currentColor"
                />
                <path
                  d="M29.6499 21.6631C29.4696 21.6631 29.2832 21.4873 29.2832 21.3057V21.2471C29.2832 21.0713 29.4636 20.8896 29.6499 20.8896C29.8363 20.8896 30.0166 21.0654 30.0166 21.2471V21.3057C30.0166 21.4815 29.8363 21.6631 29.6499 21.6631Z"
                  fill="currentColor"
                />
                <path
                  d="M21.2566 34.9998C19.7958 34.9998 18.5814 33.8161 18.5814 32.3922V32.3336C16.0865 31.443 14.0786 29.2514 12.9845 26.2864C12.4375 24.7453 12.1309 23.0284 12.1309 21.3057C12.1309 21.1299 12.3112 20.9482 12.4976 20.9482C12.6779 20.9482 12.8643 21.124 12.8643 21.3057C12.8643 22.964 13.1709 24.5637 13.6578 26.0462C14.6918 28.9526 16.6997 31.0269 19.0683 31.736C19.2487 31.7945 19.3749 31.9703 19.3088 32.152V32.3864C19.3088 33.4528 20.1625 34.2849 21.2566 34.2849C22.3507 34.2849 23.2044 33.4528 23.2044 32.3864C23.2044 32.2692 23.2044 32.0875 23.1443 31.9703C23.0841 31.7945 23.2044 31.6129 23.3847 31.5543C26.8535 30.189 29.2221 26.0403 29.2221 21.2998C29.2221 21.124 29.4024 20.9424 29.5888 20.9424C29.7691 20.9424 29.9555 21.1182 29.9555 21.2998C29.9555 26.2806 27.5208 30.5464 23.9318 32.1461V32.3805C23.9919 33.863 22.7775 34.9881 21.2566 34.9881V34.9998Z"
                  fill="currentColor"
                />
                <path
                  d="M12.4976 21.6631C12.3172 21.6631 12.1309 21.4873 12.1309 21.3057V21.2471C12.1309 21.0713 12.3112 20.8896 12.4976 20.8896C12.6839 20.8896 12.8643 21.0654 12.8643 21.2471V21.3057C12.9244 21.4815 12.7441 21.6631 12.4976 21.6631Z"
                  fill="currentColor"
                />
                <path
                  d="M21.0702 24.3353C19.7958 24.3353 18.5754 24.2767 17.361 24.0951C14.0786 23.6204 12.1309 22.554 12.1309 21.3117V21.1945C12.191 19.9522 14.1388 18.9444 17.361 18.4697C18.5153 18.2939 19.7958 18.2354 21.0702 18.2354C22.1644 18.2354 23.1984 18.2939 24.1723 18.4111C24.2925 18.4111 24.3526 18.4111 24.4789 18.4697C27.8875 18.9444 29.9495 19.9522 30.0156 21.2531V21.3117C30.0156 22.6184 27.9476 23.6849 24.4789 24.1595C23.3847 24.2767 22.2305 24.3353 21.0702 24.3353ZM12.9184 21.2531C12.9184 21.9035 14.3792 22.8528 17.5414 23.3274C18.6355 23.5032 19.8499 23.5677 21.1303 23.5677C22.2846 23.5677 23.3787 23.5091 24.4127 23.3274C27.635 22.9114 29.2762 21.9621 29.2762 21.2531V21.1945C29.2161 20.4855 27.5749 19.5362 24.4127 19.1202C24.2925 19.1202 24.2324 19.1202 24.1061 19.0616C23.1322 18.9444 22.1583 18.8858 21.1243 18.8858C19.91 18.8858 18.6896 18.9444 17.5354 19.1202C14.3732 19.6534 12.9124 20.6027 12.9124 21.2531H12.9184Z"
                  fill="currentColor"
                />
                <path
                  d="M32.6854 10.8167C31.411 10.8167 30.377 9.80879 30.377 8.56653C30.377 7.32428 31.411 6.31641 32.6854 6.31641C33.9599 6.31641 34.9939 7.32428 34.9939 8.56653C34.9338 9.80879 33.8998 10.8167 32.6854 10.8167ZM32.6854 7.08403C31.8318 7.08403 31.1645 7.73445 31.1645 8.56653C31.1645 9.39861 31.8318 10.049 32.6854 10.049C33.5391 10.049 34.2064 9.39861 34.2064 8.56653C34.2064 7.79305 33.479 7.08403 32.6854 7.08403Z"
                  fill="currentColor"
                />
                <path
                  d="M8.3627 34.5306C6.90186 34.5306 5.6875 33.3469 5.6875 31.923C5.6875 30.4991 6.90186 29.3154 8.3627 29.3154C9.82354 29.3154 11.0379 30.4991 11.0379 31.923C11.0379 33.3469 9.82354 34.5306 8.3627 34.5306ZM8.3627 30.0831C7.32869 30.0831 6.47503 30.9151 6.47503 31.923C6.47503 32.9309 7.32869 33.7629 8.3627 33.7629C9.39671 33.7629 10.2504 32.9309 10.2504 31.923C10.2504 30.9151 9.39671 30.0831 8.3627 30.0831Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_548_4048">
                  <rect width="35" height="35" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span
              class="text-[8px] font-normal leading-tight sm:text-[9px] lg:text-[10px]"
            >
              Освежающий лимонный вкус без сахара
            </span>
          </div>

          <div class="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <svg
              class="h-7 w-7 shrink-0"
              aria-hidden="true"
              viewBox="0 0 23 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_548_3987)">
                <path
                  d="M21.5959 43.0938L19.309 47.4132H3.68139L1.32422 43.0938H5.01545H10.1009H21.5959Z"
                  fill="white"
                />
                <path
                  d="M19.309 0.789062L21.5959 5.00763H19.7503H14.7451H4.57411H1.32422L3.68139 0.789062H19.309Z"
                  fill="white"
                />
                <path
                  d="M1.32422 5.00684V43.0932H21.5959V5.00684H1.32422Z"
                  fill="white"
                />
                <path
                  d="M21.5956 43.6893C21.375 43.6893 21.1543 43.3959 21.1543 43.1024V5.00685C21.1543 4.71339 21.375 4.41992 21.5956 4.41992C21.8163 4.41992 22.037 4.71339 22.037 5.00685V43.0932C22.1072 43.3867 21.8865 43.6801 21.5956 43.6801V43.6893Z"
                  fill="currentColor"
                />
                <path
                  d="M1.32416 43.6893C1.10348 43.6893 0.882812 43.3959 0.882812 43.1024V5.00685C0.882812 4.71339 1.10348 4.41992 1.32416 4.41992C1.54483 4.41992 1.7655 4.71339 1.7655 5.00685V43.0932C1.83571 43.3867 1.61504 43.6801 1.32416 43.6801V43.6893Z"
                  fill="currentColor"
                />
                <path
                  d="M21.5956 5.69507C21.4452 5.69507 21.3047 5.59419 21.2245 5.4016L19.088 1.37562H3.90178L1.76528 5.4016C1.61482 5.69507 1.32394 5.69507 1.10327 5.50248C0.882596 5.3099 0.882596 4.91555 1.03305 4.62209L3.32001 0.293466C3.39023 0.100879 3.54069 0 3.69114 0H19.3889C19.5394 0 19.6798 0.100879 19.76 0.293466L22.047 4.61292C22.1975 4.90638 22.1172 5.30073 21.9768 5.49331C21.8263 5.59419 21.7561 5.6859 21.6057 5.6859L21.5956 5.69507Z"
                  fill="currentColor"
                />
                <path
                  d="M22.5587 5.69535H0.441343C0.220672 5.69535 0 5.40188 0 5.10842C0 4.81495 0.220672 4.52148 0.441343 4.52148H22.5587C22.7793 4.52148 23 4.81495 23 5.10842C23 5.40188 22.7793 5.69535 22.5587 5.69535Z"
                  fill="currentColor"
                />
                <path
                  d="M19.308 48.0002H3.68043C3.52998 48.0002 3.38955 47.8993 3.30931 47.7067L1.02235 43.3873C0.871887 43.0938 0.952131 42.6994 1.09256 42.5069C1.31323 42.3143 1.60412 42.406 1.75457 42.6077L3.89108 46.6337H19.0773L21.2138 42.6077C21.3643 42.3143 21.6551 42.3143 21.8758 42.5069C22.0965 42.6994 22.0965 43.0938 21.946 43.3873L19.6591 47.7067C19.5889 47.8993 19.4384 48.0002 19.2879 48.0002H19.308Z"
                  fill="currentColor"
                />
                <path
                  d="M22.5587 43.6895H0.441343C0.220672 43.6895 0 43.396 0 43.1026C0 42.8091 0.220672 42.5156 0.441343 42.5156H22.5587C22.7793 42.5156 23 42.8091 23 43.1026C23 43.396 22.7793 43.6895 22.5587 43.6895Z"
                  fill="currentColor"
                />
                <path
                  d="M4.57416 26.5032C4.35348 26.5032 4.13281 26.2098 4.13281 25.9163V5.00685C4.13281 4.71339 4.35348 4.41992 4.57416 4.41992C4.79483 4.41992 5.0155 4.71339 5.0155 5.00685V25.9163C5.0155 26.2098 4.79483 26.5032 4.57416 26.5032Z"
                  fill="currentColor"
                />
                <path
                  d="M4.57416 32.0057C4.35348 32.0057 4.13281 31.7122 4.13281 31.4187V28.961C4.13281 28.6675 4.35348 28.374 4.57416 28.374C4.79483 28.374 5.0155 28.6675 5.0155 28.961V31.4187C5.0155 31.7122 4.79483 32.0057 4.57416 32.0057Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0_548_3987">
                  <rect width="23" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <span
              class="text-[8px] font-normal leading-tight sm:text-[9px] lg:text-[10px]"
            >
              Готовый формат 330 мл
            </span>
          </div>
        </div>

        <fieldset class="mt-4">
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <article
              v-for="option in variantOptions"
              :key="option.packSize"
              class="group relative min-h-[138px] rounded-2xl border-2 bg-primary/5 p-3 transition sm:min-h-[160px] sm:p-4"
              :class="
                currentPackSize === option.packSize
                  ? 'ring-2 ring-primary border-transparent'
                  : 'hover:bg-white'
              "
            >
              <NuxtLink
                :to="`/catalog/${option.slug}`"
                class="block min-h-[80px] pr-[38px] sm:min-h-[80px] sm:pr-[76px]"
              >
                <span
                  class="block text-base font-medium leading-tight sm:text-lg"
                >
                  {{ option.label }}
                </span>

                <span
                  v-if="option.price > 0"
                  class="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5"
                >
                  <span
                    v-if="option.oldPrice > option.price"
                    class="text-[10px] text-black/40 line-through sm:text-xs"
                  >
                    {{ option.oldPrice.toLocaleString("ru-RU") }} ₽
                  </span>
                  <span class="text-sm font-medium text-cgreen sm:text-base">
                    {{ option.price.toLocaleString("ru-RU") }} ₽
                  </span>
                </span>

                <span
                  v-else
                  class="mt-2 block max-w-[105px] text-[10px] leading-snug text-black/45 sm:max-w-[135px] sm:text-xs"
                >
                  Пока недоступно
                </span>

                <span
                  class="pointer-events-none absolute -right-3 -top-5 flex h-[98px] w-[78px] items-end justify-center sm:right-3 sm:-top-8 sm:h-[130px] sm:w-[106px]"
                  aria-hidden="true"
                >
                  <template v-if="option.packSize === 1">
                    <img
                      :src="EVOLUTION_CAN_IMAGE"
                      alt=""
                      class="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </template>
                  <template v-else>
                    <img
                      :src="EVOLUTION_CAN_IMAGE"
                      alt=""
                      class="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </template>
                </span>

                <span
                  v-if="option.packSize === 1 && !option.available"
                  class="pointer-events-none absolute left-2 top-[78px] z-30 w-[min(245px,calc(100vw-48px))] rounded-lg bg-black/90 px-2.5 py-2 text-[10px] leading-snug text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 sm:left-3 sm:top-[88px] sm:text-[11px]"
                  role="tooltip"
                >
                  {{ singleVariantPendingMessage }}
                </span>
              </NuxtLink>

              <div
                class="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4"
              >
                <div
                  v-if="variantQuantityInCart(option) === 0"
                  class="group/evolution-variant-add relative"
                >
                  <button
                    type="button"
                    class="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-2.5 text-xs text-white transition hover:bg-hoverbtn hover:text-[#222] disabled:cursor-not-allowed disabled:opacity-45 sm:h-9 sm:text-sm"
                    :class="
                      isVariantOptionBlocked(option)
                        ? 'hover:bg-primary hover:text-white'
                        : ''
                    "
                    :disabled="
                      adding ||
                      Boolean(variantAddingKey) ||
                      !option.available ||
                      option.price <= 0 ||
                      isVariantOptionBlocked(option)
                    "
                    :aria-describedby="
                      isVariantOptionBlocked(option)
                        ? `evolution-variant-delivery-${option.packSize}`
                        : undefined
                    "
                    @click.stop="addVariantOption(option)"
                  >
                    {{
                      variantAddingKey === variantOptionKey(option)
                        ? "Добавляем…"
                        : "Добавить"
                    }}
                  </button>

                  <div
                    v-if="isVariantOptionBlocked(option)"
                    :id="`evolution-variant-delivery-${option.packSize}`"
                    role="tooltip"
                    class="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-[min(280px,calc(100vw-40px))] -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-center text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/evolution-variant-add:opacity-100 group-focus-within/evolution-variant-add:opacity-100"
                  >
                    {{ evolutionSingleDeliveryMessage }}
                    <span
                      class="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-black"
                    />
                  </div>
                </div>

                <div
                  v-else
                  class="flex h-8 w-full items-center justify-between gap-1.5 rounded-md bg-primary px-1.5 sm:h-9"
                >
                  <button
                    type="button"
                    :disabled="Boolean(variantAddingKey)"
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-50"
                    aria-label="Уменьшить количество"
                    @click.stop="decrementVariantOption(option)"
                  >
                    <img src="/icons/decrement.svg" alt="" class="size-4" />
                  </button>
                  <span
                    class="min-w-[1.5rem] text-center text-xs text-white sm:text-sm"
                  >
                    {{ variantQuantityInCart(option) }}
                  </span>
                  <div class="group/evolution-variant-plus relative">
                    <button
                      type="button"
                      :disabled="
                        Boolean(variantAddingKey) ||
                        isVariantOptionBlocked(option)
                      "
                      :aria-describedby="
                        isVariantOptionBlocked(option)
                          ? `evolution-variant-plus-delivery-${option.packSize}`
                          : undefined
                      "
                      class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Увеличить количество"
                      @click.stop="incrementVariantOption(option)"
                    >
                      <img src="/icons/increment.svg" alt="" class="size-4" />
                    </button>

                    <div
                      v-if="isVariantOptionBlocked(option)"
                      :id="`evolution-variant-plus-delivery-${option.packSize}`"
                      role="tooltip"
                      class="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-50 w-[min(280px,calc(100vw-40px))] rounded-lg bg-black px-3 py-2 text-center text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/evolution-variant-plus:opacity-100 group-focus-within/evolution-variant-plus:opacity-100"
                    >
                      {{ evolutionSingleDeliveryMessage }}
                      <span
                        class="absolute right-2 top-full h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-black"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </fieldset>

        <!-- =================================================
             PRICE
             ================================================= -->

        <div
          v-if="currentPrice > 0"
          class="mt-4 flex items-center gap-4 text-2xl font-medium"
        >
          <span
            v-if="hasDiscount"
            class="text-base font-normal text-primary line-through sm:text-2xl xl:text-cardhead"
          >
            {{ oldPrice.toLocaleString("ru-RU") }} ₽
          </span>

          <span
            class="text-2xl font-medium text-black sm:text-4xl xl:text-product"
          >
            {{ currentPrice.toLocaleString("ru-RU") }} ₽
          </span>
        </div>

        <p
          v-else
          class="mt-4 rounded-xl bg-[#FFF6E8] px-4 py-3 text-sm leading-relaxed text-[#7A4B00]"
        >
          {{ singleVariantPendingMessage }}
        </p>

        <!-- =================================================
             CTA
             ================================================= -->

        <div
          id="product-cta"
          class="mt-3 flex flex-col justify-between gap-4 sm:mt-6 sm:flex-row sm:gap-6"
        >
          <!-- ADD TO CART -->

          <Button
            v-if="quantityInCart === 0"
            :disabled="adding || !canAddToCart"
            variant="solid"
            class="w-full disabled:opacity-60 sm:w-[50%]"
            aria-label="В корзину"
            @click="addToCart"
          >
            <template #icon>
              <svg
                class="h-5 w-5 fill-current transition-colors"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H4C4.22306 4.00006 4.4397 4.0747 4.61546 4.21205C4.79122 4.3494 4.91602 4.54157 4.97 4.758L5.78 8H29C29.1519 8.00004 29.3018 8.03469 29.4383 8.10131C29.5748 8.16792 29.6943 8.26477 29.7878 8.38448C29.8813 8.50419 29.9463 8.64363 29.9779 8.79222C30.0095 8.9408 30.0068 9.09462 29.97 9.242L26.97 21.242C26.916 21.4584 26.7912 21.6506 26.6155 21.788C26.4397 21.9253 26.2231 21.9999 26 22H8C7.77694 21.9999 7.5603 21.9253 7.38454 21.788C7.20878 21.6506 7.08398 21.4584 7.03 21.242L3.22 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5ZM6.28 10L8.78 20H25.22L27.72 10H6.28ZM10 26C9.46957 26 8.96086 26.2107 8.58579 26.5858C8.21071 26.9609 8 27.4696 8 28C8 28.5304 8.21071 29.0391 8.58579 29.4142C8.96086 29.7893 9.46957 30 10 30C10.5304 30 11.0391 29.7893 11.4142 29.4142C11.7893 29.0391 12 28.5304 12 28C12 27.4696 11.7893 26.9609 11.4142 26.5858C11.0391 26.2107 10.5304 26 10 26ZM6 28C6 26.9391 6.42143 25.9217 7.17157 25.1716C7.92172 24.4214 8.93913 24 10 24C11.0609 24 12.0783 24.4214 12.8284 25.1716C13.5786 25.9217 14 26.9391 14 28C14 29.0609 13.5786 30.0783 12.8284 30.8284C12.0783 31.5786 11.0609 32 10 32C8.93913 32 7.92172 31.5786 7.17157 30.8284C6.42143 30.0783 6 29.0609 6 28ZM24 26C23.4696 26 22.9609 26.2107 22.5858 26.5858C22.2107 26.9609 22 27.4696 22 28C22 28.5304 22.2107 29.0391 22.5858 29.4142C22.9609 29.7893 23.4696 30 24 30C24.5304 30 25.0391 29.7893 25.4142 29.4142C25.7893 29.0391 26 28.5304 26 28C26 27.4696 25.7893 26.9609 25.4142 26.5858C25.0391 26.2107 24.5304 26 24 26ZM20 28C20 26.9391 20.4214 25.9217 21.1716 25.1716C21.9217 24.4214 22.9391 24 24 24C25.0609 24 26.0783 24.4214 26.8284 25.1716C27.5786 25.9217 28 26.9391 28 28C28 29.0609 27.5786 30.0783 26.8284 30.8284C26.0783 31.5786 25.0609 32 24 32C22.9391 32 21.9217 31.5786 21.1716 30.8284C20.4214 30.0783 20 29.0609 20 28Z"
                />
              </svg>
            </template>

            {{ adding ? "Добавляем…" : "В корзину" }}
          </Button>

          <!-- QUANTITY -->

          <div
            v-else
            class="flex h-11 w-full items-center justify-between gap-2 rounded-lg bg-primary px-2 text-white sm:w-[50%] md:h-12"
          >
            <button
              type="button"
              :disabled="adding"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 disabled:opacity-60"
              aria-label="Уменьшить количество"
              @click="decrementHandler"
            >
              −
            </button>

            <span class="min-w-[2rem] text-center">
              {{ quantityInCart }} шт
            </span>

            <button
              type="button"
              :disabled="adding"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 disabled:opacity-60"
              aria-label="Увеличить количество"
              @click="incrementHandler"
            >
              ＋
            </button>
          </div>
        </div>

        <button
          v-if="currentPackSize === 1"
          type="button"
          class="delivery-disclaimer mt-3 w-full rounded-xl bg-[#FFF6E8] px-4 py-3 text-left text-sm leading-relaxed text-[#7A4B00] transition hover:bg-[#FFF2DD]"
          :class="{ 'is-open': deliveryDetailsOpen }"
          :aria-expanded="deliveryDetailsOpen"
          @click="deliveryDetailsOpen = !deliveryDetailsOpen"
        >
          <span class="flex items-center justify-between gap-3">
            <span
              >Доставка 1 банки Daigo Evolution доступна только при заказе от
              10000р.</span
            >
            <span
              class="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-medium leading-none opacity-75"
              aria-hidden="true"
            >
              ?
            </span>
          </span>
          <span
            class="delivery-details block overflow-hidden text-xs leading-relaxed text-[#7A4B00]/80"
          >
            Подробная информация
          </span>
        </button>

        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <ProductConsultationCard
            :product-id="productId"
            :product-title="props.product.title"
          />
          <!-- Второй слот оставлен под будущий баннер с тестом. -->
        </div>
      </div>
    </div>
  </section>

  <section id="description" class="evolution-overview mt-4 sm:mt-6 xl:mt-8">
    <!-- 4 overview cards -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      <article
        v-for="card in overviewCards"
        :key="card.title"
        class="flex min-h-0 flex-col rounded-2xl border border-primary bg-white p-4 sm:p-5"
      >
        <h3 class="text-base font-medium leading-[1.18] text-black sm:text-xl">
          {{ card.title }}
        </h3>

        <span class="mt-3 block h-px w-[82%] bg-primary" aria-hidden="true" />

        <p
          class="mt-3 text-xs font-normal leading-[1.35] text-black/90 sm:text-sm"
        >
          {{ card.text }}
        </p>

        <div class="mt-auto pt-5">
          <img
            v-if="card.image"
            :src="card.image"
            :alt="card.title"
            class="w-full rounded-xl object-contain"
            loading="lazy"
            decoding="async"
          />

          <div
            v-else
            class="w-full rounded-xl bg-primary/5"
            aria-hidden="true"
          />
        </div>
      </article>
    </div>

    <!-- Why meta-drink -->
    <div
      class="mt-4 grid grid-cols-1 gap-6 rounded-2xl border border-primary bg-primary/10 p-4 sm:p-5 lg:grid-cols-[1.35fr_2.65fr] lg:items-center lg:gap-8 xl:p-6"
    >
      <div class="min-w-0">
        <h3 class="text-lg font-medium leading-tight text-black sm:text-xl">
          Почему это<br class="hidden sm:block" />
          метанапиток?
        </h3>

        <span
          class="mt-3 block h-px w-44 max-w-full bg-primary"
          aria-hidden="true"
        />

        <p
          class="mt-4 max-w-[560px] text-xs font-normal leading-[1.35] text-black/90 sm:text-sm"
        >
          Evolution 10 + Mg создаётся не вокруг одного ингредиента, а вокруг
          функционального состояния. Сначала определяется состояние, в котором
          организму требуется поддержка. Затем — функциональные и
          микробиотические процессы, значимые для этого состояния. Под них
          формируются два контура поддержки: функциональный комплекс и
          метабиотическая основа DAIGO®.
        </p>
      </div>

      <div
        class="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 lg:gap-x-5"
      >
        <div
          v-for="step in metaSteps"
          :key="step.title"
          class="flex min-w-0 flex-col items-center text-center"
        >
          <img
            v-if="step.image"
            :src="step.image"
            :alt="step.title"
            class="size-[72px] rounded-full border border-primary object-cover sm:size-[82px] xl:size-[92px]"
            loading="lazy"
            decoding="async"
          />

          <div
            v-else
            class="size-[72px] rounded-full border border-primary bg-white/70 sm:size-[82px] xl:size-[92px]"
            aria-hidden="true"
          />

          <h4
            class="mt-3 text-sm font-medium leading-tight text-black sm:text-base"
          >
            {{ step.title }}
          </h4>

          <p
            class="mt-2 whitespace-pre-line text-[10px] font-normal leading-[1.2] text-black/80 sm:text-xs"
          >
            {{ step.text }}
          </p>
        </div>
      </div>
    </div>

    <!-- Nutrients -->
    <div
      class="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-primary bg-white p-4 sm:p-5 lg:grid-cols-[1.45fr_4.55fr] lg:items-center lg:gap-6"
    >
      <div class="min-w-0">
        <h3 class="text-base font-medium leading-tight text-black sm:text-lg">
          Что получает организм<br class="hidden sm:block" />
          из одной банки (330 мл)
        </h3>

        <p
          class="mt-2 text-[10px] font-normal leading-[1.25] text-black/70 sm:text-xs"
        >
          РУСП — рекомендуемый уровень суточного потребления
        </p>
      </div>

      <div
        class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3"
      >
        <div
          v-for="nutrient in evolutionNutrients"
          :key="nutrient.name"
          class="flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-primary bg-primary/10 px-2 py-2 text-center"
        >
          <span
            class="text-sm font-medium leading-none text-black sm:text-base"
          >
            {{ nutrient.name }}
          </span>

          <span
            class="mt-1.5 text-[10px] font-normal leading-tight text-black/90 sm:text-xs"
          >
            {{ nutrient.value }}
          </span>

          <span
            v-if="nutrient.daily"
            class="mt-0.5 text-[9px] font-normal leading-tight text-black/70 sm:text-[10px]"
          >
            ({{ nutrient.daily }})
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.delivery-details {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  transform: translateY(-3px);
  transition:
    max-height 220ms ease,
    margin-top 220ms ease,
    opacity 180ms ease,
    transform 220ms ease;
}

.delivery-disclaimer:hover .delivery-details,
.delivery-disclaimer:focus-visible .delivery-details,
.delivery-disclaimer.is-open .delivery-details {
  max-height: 72px;
  margin-top: 6px;
  opacity: 1;
  transform: translateY(0);
}
</style>
