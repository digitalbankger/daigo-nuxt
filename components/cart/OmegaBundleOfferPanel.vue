<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import { useCartStore } from "~/stores/cartStore";
import {
  OMEGA_BUNDLE_SLUGS,
  OMEGA_BUNDLE_UI,
  type OmegaBundleSlug,
} from "~/constants/omegaBundles";
import type { ProductVariant } from "~/types/product";

type BundleCard = {
  product_id: string | number;
  slug: OmegaBundleSlug;
  category?: string;
  variants: ProductVariant[];
};
type Direction = { slug: OmegaBundleSlug; label: string };

const props = withDefaults(
  defineProps<{
    mode?: "all" | "upgrade";
    compact?: boolean;
    bundleSlug?: OmegaBundleSlug;
    excludeVariantId?: string;
    heading?: string;
  }>(),
  { mode: "all", compact: false },
);
const cartStore = useCartStore();
const products = ref<BundleCard[]>([]);
const pending = ref(true);
const addingKey = ref("");
const swiper = ref<SwiperInstance | null>(null);
const activeDirection = ref<OmegaBundleSlug>(
  OMEGA_BUNDLE_SLUGS[0] ?? "obnovlenie-kozhi",
);

const directions = computed<Direction[]>(() =>
  OMEGA_BUNDLE_SLUGS.map((slug) => ({
    slug,
    label: OMEGA_BUNDLE_UI[slug].tabLabel,
  })),
);
const formatMoney = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
const omegaQuantity = (variant: ProductVariant) => {
  const item = (variant.items || []).find(({ name }) =>
    /(?:омега|omega)/i.test(String(name || "")),
  );
  if (item) return Math.max(1, Number(item.quantity || 1));
  return /(?:^|\D)2\s*[xх×]|2\s*(?:упаков|омег)/i.test(
    `${variant.title || ""} ${variant.label || ""}`,
  )
    ? 2
    : 1;
};

const offers = computed(() =>
  products.value
    .filter((product) => !props.bundleSlug || product.slug === props.bundleSlug)
    .flatMap((product) => {
      const ui = OMEGA_BUNDLE_UI[product.slug];
      return [...(product.variants || [])]
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .filter(
          (variant) => props.mode === "all" || omegaQuantity(variant) >= 2,
        )
        .filter(
          (variant) =>
            !props.excludeVariantId ||
            variant.variant_id !== props.excludeVariantId,
        )
        .map((variant) => ({
          product,
          variant,
          ui,
          omegaCount: omegaQuantity(variant),
          image: omegaQuantity(variant) >= 2 ? ui.twoImage : ui.oneImage,
        }));
    }),
);

const offerLink = (offer: (typeof offers.value)[number]) => ({
  path: `/catalog/${offer.product.slug}`,
  query: offer.omegaCount >= 2 ? { variant: "x2" } : undefined,
});

const setSwiper = (instance: SwiperInstance) => {
  swiper.value = instance;
};
const syncDirection = (instance: SwiperInstance) => {
  const offer = offers.value[instance.realIndex];
  if (offer) activeDirection.value = offer.product.slug;
};
const selectDirection = async (slug: OmegaBundleSlug) => {
  activeDirection.value = slug;
  await nextTick();
  const index = offers.value.findIndex(({ product }) => product.slug === slug);
  if (index >= 0) swiper.value?.slideTo(index);
};

async function loadOffers() {
  pending.value = true;
  try {
    const slugs = props.bundleSlug
      ? OMEGA_BUNDLE_SLUGS.includes(props.bundleSlug)
        ? [props.bundleSlug]
        : []
      : OMEGA_BUNDLE_SLUGS;
    const result = await Promise.all(
      slugs.map(async (slug) => {
        try {
          return {
            ...(await $fetch<BundleCard>(`/api/shop/products/${slug}/card`)),
            slug,
          };
        } catch {
          return null;
        }
      }),
    );
    products.value = result.filter((item): item is BundleCard =>
      Boolean(item?.product_id),
    );
  } finally {
    pending.value = false;
  }
}

const quantityInCart = (offer: (typeof offers.value)[number]) => {
  const item = cartStore.items.find(
    (i) =>
      String(i.id) === String(offer.product.product_id) &&
      String(i.variantId || "") === String(offer.variant.variant_id || ""),
  );
  return item?.quantity ?? 0;
};

async function addOffer(offer: (typeof offers.value)[number]) {
  const key = `${offer.product.product_id}:${offer.variant.variant_id}`;
  if (addingKey.value) return;
  addingKey.value = key;
  try {
    const replacedItem = props.excludeVariantId
      ? cartStore.items.find(
          (i) =>
            String(i.id) === String(offer.product.product_id) &&
            String(i.variantId || "") === String(props.excludeVariantId),
        )
      : null;

    const price = Number(offer.variant.price || 0);
    const originalPrice = Number(
      offer.variant.originalPrice || offer.variant.oldPrice || 0,
    );
    await cartStore.addToCart({
      id: offer.product.product_id,
      variantId: offer.variant.variant_id,
      title: `${offer.ui.title} — ${offer.variant.title || offer.variant.label}`,
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      quantity: replacedItem?.quantity || 1,
      image: offer.image,
      tag: offer.product.category || "bundle",
    });

    if (replacedItem) {
      await cartStore.removeItem(
        offer.product.product_id,
        props.excludeVariantId,
      );
    }
  } finally {
    addingKey.value = "";
  }
}

function incrementOffer(offer: (typeof offers.value)[number]) {
  cartStore.updateItem(
    offer.product.product_id,
    quantityInCart(offer) + 1,
    offer.variant.variant_id,
  );
}

function decrementOffer(offer: (typeof offers.value)[number]) {
  cartStore.updateItem(
    offer.product.product_id,
    quantityInCart(offer) - 1,
    offer.variant.variant_id,
  );
}

onMounted(loadOffers);
</script>

<template>
  <div class="min-w-0">
    <div
      v-if="mode === 'all' && !bundleSlug && !pending"
      class="mb-4 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Направление набора"
    >
      <button
        v-for="direction in directions"
        :key="direction.slug"
        type="button"
        role="tab"
        :aria-selected="activeDirection === direction.slug"
        class="rounded-md sm:rounded-lg border px-2 py-1 sm:py-2 text-xs transition sm:px-4 sm:text-base"
        :class="
          activeDirection === direction.slug
            ? 'border-primary bg-primary text-white'
            : 'border-[#D8E3F0] bg-white text-black/65 hover:border-primary hover:text-primary'
        "
        @click="selectDirection(direction.slug)"
      >
        {{ direction.label }}
      </button>
    </div>

    <div
      v-if="pending"
      class="flex gap-3 overflow-hidden"
      aria-label="Загружаем варианты наборов"
    >
      <div
        v-for="index in mode === 'upgrade' ? 2 : 2"
        :key="index"
        class="h-44 min-w-[82%] animate-pulse rounded-2xl bg-[#F3F6FA] sm:min-w-[48%]"
      />
    </div>

    <div v-else-if="offers.length" class="relative min-w-0">
      <p v-if="heading" class="mb-2 text-sm text-black/70 md:text-base">
        {{ heading }}
      </p>
      <Swiper
        :slides-per-view="1.08"
        :space-between="12"
        :slides-per-group="1"
        :breakpoints="{
          640: {
            slidesPerView: 2,
            slidesPerGroup: mode === 'all' ? 2 : 1,
            spaceBetween: 12,
          },
        }"
        @swiper="setSwiper"
        @slide-change="syncDirection"
      >
        <SwiperSlide
          v-for="offer in offers"
          :key="`${offer.product.product_id}:${offer.variant.variant_id}`"
          class="h-auto"
        >
          <article
            class="group flex h-full flex-col overflow-hidden rounded-2xl bg-hoverbtn transition hover:border-primary/50 hover:shadow-[0_12px_28px_rgba(56,107,170,0.10)]"
            :class="compact ? 'p-2.5 gap-2' : 'p-3 sm:p-4'"
          >
            <NuxtLink
              :to="offerLink(offer)"
              class="flex gap-2 sm:gap-3"
              :class="
                compact ? 'min-h-[64px]' : 'min-h-[84px] sm:min-h-[104px]'
              "
            >
              <div class="min-w-0 flex-1">
                <p
                  class="font-medium leading-tight"
                  :class="
                    compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  "
                >
                  {{ offer.ui.title }}
                </p>
                <p
                  class="mt-1 leading-snug text-black/65"
                  :class="
                    compact
                      ? 'text-[11px] sm:text-xs'
                      : 'mt-2 text-xs sm:text-sm'
                  "
                >
                  {{ offer.omegaCount }} × Омега-3 + 1 × Daigo
                  {{ offer.ui.partnerName }}
                </p>
                <p
                  v-if="offer.omegaCount >= 2"
                  class="mt-1 font-medium text-[#F0182D]"
                  :class="
                    compact
                      ? 'text-[10px] sm:text-[11px]'
                      : 'mt-2 text-[11px] sm:text-xs'
                  "
                >
                  
                </p>
              </div>
              <img
                :src="offer.image"
                :alt="`${offer.ui.title}: ${offer.omegaCount} упаковки Омега-3 и ${offer.ui.partnerName}`"
                class="shrink-0 object-contain"
                :class="
                  compact
                    ? 'h-14 w-14 sm:h-16 sm:w-16'
                    : 'h-20 w-20 sm:h-28 sm:w-28'
                "
                loading="lazy"
                decoding="async"
              />
            </NuxtLink>

            <!-- <div -->
            <!--   v-if="!compact" -->
            <!--   class="mt-2 flex flex-row items-center justify-center text-sm sm:text-base text-white gap-1.5 bg-[#16B819] rounded-md px-3 py-0.5 w-[fit-content]" -->
            <!-- > -->
            <!--   <img src="/public/icons/fire.svg" /> -->
            <!--   <span>Выгода 15%</span> -->
            <!-- </div> -->

            <div
              class="flex items-end justify-between gap-2"
              :class="compact ? 'mt-0.5' : 'mt-1'"
            >
              <NuxtLink
                :to="offerLink(offer)"
                class="flex flex-row items-center gap-1.5"
                :class="
                  compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                "
              >
                <span
                  v-if="
                    Number(
                      offer.variant.originalPrice ||
                        offer.variant.oldPrice ||
                        0,
                    ) > Number(offer.variant.price || 0)
                  "
                  class="text-xs text-black/40 line-through"
                  >{{
                    formatMoney(
                      Number(
                        offer.variant.originalPrice || offer.variant.oldPrice,
                      ),
                    )
                  }}
                  ₽</span
                >
                <span
                  class="font-medium text-cgreen"
                  :class="
                    compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                  "
                  >{{ formatMoney(Number(offer.variant.price || 0)) }} ₽</span
                >
              </NuxtLink>
              <button
                v-if="quantityInCart(offer) === 0"
                type="button"
                class="inline-flex shrink-0 items-center justify-center rounded-md bg-primary text-xs text-white transition hover:bg-hoverbtn hover:text-[#222] disabled:cursor-wait disabled:opacity-60"
                :class="compact ? 'h-8 px-2.5' : 'h-9 px-3 sm:text-sm'"
                :disabled="Boolean(addingKey)"
                @click="addOffer(offer)"
              >
                {{
                  addingKey ===
                  `${offer.product.product_id}:${offer.variant.variant_id}`
                    ? "Добавляем…"
                    : "Добавить"
                }}
              </button>
              <div
                v-else
                class="flex shrink-0 items-center justify-between gap-1.5 rounded-md bg-primary px-1.5"
                :class="compact ? 'h-8' : 'h-9'"
              >
                <button
                  type="button"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"
                  aria-label="Уменьшить количество"
                  @click="decrementOffer(offer)"
                >
                  <img
                    src="/icons/decrement.svg"
                    alt="Уменьшить количество"
                    class="size-4"
                  />
                </button>
                <span
                  class="min-w-[1.5rem] text-center text-xs text-white sm:text-sm"
                  >{{ quantityInCart(offer) }}</span
                >
                <button
                  type="button"
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white"
                  aria-label="Увеличить количество"
                  @click="incrementOffer(offer)"
                >
                  <img
                    src="/icons/increment.svg"
                    alt="Увеличить количество"
                    class="size-4"
                  />
                </button>
              </div>
            </div>
          </article>
        </SwiperSlide>
      </Swiper>

      <div
        v-if="offers.length > 1"
        :class="offers.length < 3 ? '-mt-6' : '-mt-10 sm:-mt-10'"
        class="flex items-center justify-end gap-2 absolute right-0 top-0"
      >
        <button
          type="button"
          class="flex h-5 sm:h-7 w-5 sm:w-7 items-center justify-center rounded-full transition hover:opacity-70"
          aria-label="Предыдущие наборы"
          @click="swiper?.slidePrev()"
        >
          <img
            src="/icons/arrow-left.svg"
            alt=""
            class="h-4 sm:h-6 w-4 sm:w-6"
          />
        </button>
        <button
          type="button"
          class="flex h-5 sm:h-7 w-5 sm:w-7 items-center justify-center rounded-full transition hover:opacity-70"
          aria-label="Следующие наборы"
          @click="swiper?.slideNext()"
        >
          <img
            src="/icons/arrow-right.svg"
            alt=""
            class="h-4 sm:h-6 w-4 sm:w-6"
          />
        </button>
      </div>
    </div>
  </div>
</template>
