<script setup lang="ts">
import { computed, ref } from "vue";
import { useRuntimeConfig } from "#imports";
import OmegaBundleOfferPanel from "~/components/cart/OmegaBundleOfferPanel.vue";
import type { OmegaBundleSlug } from "~/constants/omegaBundles";
import { normalizeMediaUrl } from "~/utils/mediaUrl";

// Определяем пропсы
const props = defineProps<{
  item: {
    id: number | string;
    variantId?: string;
    title: string;
    subtitle?: string;
    price: number;
    originalPrice?: number;
    oldPrice?: number;
    quantity: number;
    image: string;
  };
  showBundleOffer?: boolean;
}>();

const emit = defineEmits(["update", "remove"]);
const isBundleOfferOpen = ref(false);

const displayOriginalPrice = computed(() => {
  if (!props.item.originalPrice) return null;
  if (props.item.originalPrice <= props.item.price) return null;
  return props.item.originalPrice;
});

const relatedBundleSlug = computed<OmegaBundleSlug | null>(() => {
  const title = props.item.title.toLowerCase().replace(/ё/g, "е");

  // Предложение показываем только у одиночных аминобиотиков, но не у наборов.
  if (
    title.includes("омега") ||
    title.includes("движение мысли") ||
    title.includes("обновление кожи") ||
    title.includes("свобода движения")
  ) {
    return null;
  }

  if (title.includes("brainy")) return "dvizhenie-mysli";
  if (title.includes("dermic")) return "obnovlenie-kozhi";
  if (title.includes("jointic") || title.includes("jontic"))
    return "svoboda-dvizheniya";

  return null;
});

const hasBundleOffer = computed(
  () => Boolean(props.showBundleOffer) || Boolean(relatedBundleSlug.value),
);

const {
  public: { daigoApiBase },
} = useRuntimeConfig();

const fullImage = computed(() => {
  const url = normalizeMediaUrl(props.item.image);

  if (
    /^(https?:)?\/\//.test(url) ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  )
    return url;
  if (
    url.startsWith("/media-s3/") ||
    url.startsWith("/images/") ||
    url.startsWith("/icons/")
  )
    return url;

  return `${daigoApiBase}${url.startsWith("/") ? url : `/${url}`}`;
});
</script>

<template>
  <div class="w-full">
    <div class="flex gap-4 md:gap-8 border-b pb-4 w-full lg:w-4/5">
      <img
        :src="fullImage"
        alt=""
        class="w-4/12 md:w-[304px] h-[125px] md:h-[217px] object-contain bg-hoverbtn rounded-lg md:rounded-2xl"
      />
      <div class="flex-1 min-h-[120px] md:min-h-[210px] flex flex-col justify-between">
        <h3 class="text-sm md:text-2xl leading-tight">
          {{ props.item.title }}
        </h3>
        <button
          v-if="hasBundleOffer"
          type="button"
          class="mt-2 inline-flex w-fit items-center gap-1 sm:gap-1.5 rounded-full bg-[#16B819] px-2 sm:px-3 py-1.5 text-[10px] font-normal sm:font-medium text-white transition hover:bg-[#16B819]/80 sm:text-base"
          :aria-expanded="isBundleOfferOpen"
          @click="isBundleOfferOpen = !isBundleOfferOpen"
        >
          <img src="/icons/fire.svg" class="h-4 w-4" alt="" aria-hidden="true" />
          В наборе выгоднее
          <svg class="h-2 sm:h-3 w-2 sm:w-3 transition" :class="{ 'rotate-180': isBundleOfferOpen }" viewBox="0 0 12 8" fill="none" aria-hidden="true">
            <path d="m1 1 5 5 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="flex flex-col gap-4 mt-auto">
          <p class="mt-4 flex items-center gap-2">
            <span
              v-if="displayOriginalPrice"
              class="line-through text-sm md:text-2xl text-[#FB0C2A] font-normal mr-2"
            >
              {{ displayOriginalPrice.toLocaleString() }} ₽
            </span>

            <span
              :class="
                displayOriginalPrice
                  ? 'text-base md:text-cardhead text-black font-medium'
                  : 'text-base md:text-cardhead font-medium text-black'
              "
            >
              {{ props.item.price.toLocaleString() }} ₽
            </span>
          </p>
          <div
            class="mt-2 flex items-center justify-between gap-3 md:gap-4 border border-primary rounded-md md:rounded-lg py-1.5 md:py-2 px-3 md:px-4 w-28 md:w-40"
          >
            <button
              @click="
                emit(
                  'update',
                  props.item.id,
                  props.item.quantity - 1,
                  props.item.variantId,
                )
              "
            >
              <img src="/icons/cart-dec.svg" />
            </button>
            <span class="text-base md:text-xl text-primary">{{
              props.item.quantity
            }}</span>
            <button
              @click="
                emit(
                  'update',
                  props.item.id,
                  props.item.quantity + 1,
                  props.item.variantId,
                )
              "
            >
              <img src="/icons/cart-inc.svg" />
            </button>
          </div>
        </div>
      </div>
      <button
        @click="emit('remove', props.item.id, props.item.variantId)"
        class="w-6 md:w-8 mt-auto mb-2 md:mt-0 md:mb-auto"
      >
        <img src="/icons/trash.svg" alt="Удалить" />
      </button>
    </div>

    <Transition name="bundle-offer">
      <div
        v-if="hasBundleOffer && isBundleOfferOpen"
        class="mt-7 sm:mt-4 w-full"
      >
        <OmegaBundleOfferPanel
          :bundle-slug="relatedBundleSlug || undefined"
          mode="all"
          compact
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bundle-offer-enter-active,
.bundle-offer-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.bundle-offer-enter-from,
.bundle-offer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
