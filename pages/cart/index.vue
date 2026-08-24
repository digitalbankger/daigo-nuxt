<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useSeoMeta, useHead, navigateTo } from "#imports";
import BaseContainer from "~/components/layout/BaseContainer.vue";
import { useCartStore } from "~/stores/cartStore";
import {
  useCartOrderStore,
  type CartItem as OrderItem,
} from "~/stores/cartOrderStore";
import { onMounted } from "vue";
import { useYtm } from "@/composables/useYtm";
import { useAuthStore } from "@/stores/authStore";
import { useUtmTracker } from "@/composables/useUtmTracker";
import {
  sendRemarketing,
  type RemarketingPercent,
} from "@/services/remarketingService";
import { ensureGuestSessionId } from "@/services/guestPreorder";
import {
  isOmegaProductTitle,
  OMEGA_BUNDLE_SLUGS,
  OMEGA_PRODUCT_SLUG,
} from "~/constants/omegaBundles";
const ytm = useYtm();

definePageMeta({
  layout: "main",
  ssr: false,
});

/* Ленивые компоненты (ускоряет первоначальный рендер) */
const CartItem = defineAsyncComponent(
  () => import("~/components/cart/CartItem.vue"),
);
const CartGift = defineAsyncComponent(
  () => import("~/components/cart/CartGift.vue"),
);
const OrderSummary = defineAsyncComponent(
  () => import("~/components/checkout/SummaryCard.vue"),
);
const OmegaBundleOfferPanel = defineAsyncComponent(
  () => import("~/components/cart/OmegaBundleOfferPanel.vue"),
);
// const CartGiftProgress = defineAsyncComponent(() => import('~/components/cart/CartGiftProgress.vue'))

const cartStore = useCartStore();
const orderStore = useCartOrderStore();
const authStore = useAuthStore();
const bundleProductIds = ref(new Set<string>());
const oneOmegaVariantIds = ref(new Set<string>());
const twoOmegaVariantIds = ref(new Set<string>());
const standaloneOmegaProductIds = ref(new Set<string>());
const bundleOriginalPriceByVariantId = ref(new Map<string, number>());

const normalizeCartTitle = (title?: string) =>
  String(title || "")
    .toLowerCase()
    .replace(/ё/g, "е");

const isStandaloneOmegaItem = (item: {
  id?: string | number;
  title?: string;
}) =>
  standaloneOmegaProductIds.value.has(String(item.id || "")) ||
  isOmegaProductTitle(item.title);

const isStandaloneAminoItem = (item: { title?: string }) => {
  const title = normalizeCartTitle(item.title);
  if (/(движение мысли|обновление кожи|свобода движения|омега)/.test(title))
    return false;
  return /(brainy|dermic|jointic|jontic)/.test(title);
};

const hasTwoOmegaBundle = computed(() =>
  cartStore.items.some(
    (item) =>
      bundleProductIds.value.has(String(item.id)) &&
      twoOmegaVariantIds.value.has(String(item.variantId || "")),
  ),
);

const shouldShowDentChaser = computed(
  () =>
    !hasTwoOmegaBundle.value &&
    cartStore.items.some((item) => {
      if (isStandaloneOmegaItem(item) || isStandaloneAminoItem(item))
        return true;
      return (
        bundleProductIds.value.has(String(item.id)) &&
        oneOmegaVariantIds.value.has(String(item.variantId || ""))
      );
    }),
);

function variantOmegaQuantity(variant: any) {
  const omegaItem = Array.isArray(variant?.items)
    ? variant.items.find((item: any) =>
        /(?:омега|omega)/i.test(String(item?.name || "")),
      )
    : null;
  if (omegaItem) return Math.max(1, Number(omegaItem.quantity || 1));

  const text = `${variant?.title || ""} ${variant?.label || ""}`;
  return /(?:^|\D)2\s*[xх×]|2\s*(?:упаков|омег)/i.test(text) ? 2 : 1;
}

async function loadOmegaBundleCartMeta() {
  try {
    const [omegaCard, ...cards] = await Promise.all(
      [OMEGA_PRODUCT_SLUG, ...OMEGA_BUNDLE_SLUGS].map((slug) =>
        $fetch<any>(`/api/shop/products/${slug}/card`).catch(() => null),
      ),
    );

    if (omegaCard?.product_id) {
      standaloneOmegaProductIds.value = new Set([String(omegaCard.product_id)]);
    }

    const productIds = new Set<string>();
    const oneOmegaIds = new Set<string>();
    const twoOmegaIds = new Set<string>();
    const originalPriceByVariantId = new Map<string, number>();
    for (const card of cards) {
      if (!card?.product_id) continue;
      productIds.add(String(card.product_id));
      for (const variant of card.variants || []) {
        if (!variant?.variant_id) continue;
        const variantId = String(variant.variant_id);
        const price = Number(variant.price || 0);
        const originalPrice = Number(
          variant.originalPrice ??
            variant.original_price ??
            variant.oldPrice ??
            variant.old_price ??
            0,
        );

        if (originalPrice > price) {
          originalPriceByVariantId.set(variantId, originalPrice);
        }

        if (variantOmegaQuantity(variant) >= 2) twoOmegaIds.add(variantId);
        else oneOmegaIds.add(variantId);
      }
    }
    bundleProductIds.value = productIds;
    oneOmegaVariantIds.value = oneOmegaIds;
    twoOmegaVariantIds.value = twoOmegaIds;
    bundleOriginalPriceByVariantId.value = originalPriceByVariantId;
    applyBundleVariantOriginalPrices();
  } catch {
    // Корзина продолжает работать, даже если промоданные временно недоступны.
  }
}

function applyBundleVariantOriginalPrices() {
  if (!bundleOriginalPriceByVariantId.value.size) return;

  let changed = false;
  const nextItems = cartStore.items.map((item) => {
    if (!item.variantId) return item;

    const originalPrice = bundleOriginalPriceByVariantId.value.get(
      String(item.variantId),
    );

    if (
      !originalPrice ||
      originalPrice <= item.price ||
      originalPrice === item.originalPrice
    ) {
      return item;
    }

    changed = true;
    return { ...item, originalPrice, oldPrice: originalPrice };
  });

  if (changed) cartStore.items = nextItems;
}

watch(() => cartStore.items, applyBundleVariantOriginalPrices);

// const CART_GIFT_THRESHOLD = 100000
// const DEFAULT_GIFT_IMAGE = '/media-s3/products/dent/product-1.png'

// const cartAmountForGift = computed(() => Number(cartStore.subtotal || cartStore.total || 0))
// const giftProgressImage = computed(() => String(cartStore.gifts?.[0]?.image || DEFAULT_GIFT_IMAGE))
// const shouldShowGiftProgress = computed(() => cartStore.items.length > 0)

/* Мгновенно триггерим запрос корзины на клиенте, без ожидания mounted */
if (import.meta.client) {
  void cartStore.loadCart();

  onMounted(async () => {
    await cartStore.ensureLoaded?.();
    await loadOmegaBundleCartMeta();

    // сначала ремаркетинг (если заход с utm remarketing3/5)
    await handleRemarketingOnCartVisit();
    await enrichCartWithOriginalPrices();

    async function enrichCartWithOriginalPrices() {
      if (!cartStore.items.length) return;

      try {
        const ids = cartStore.items.map((i) => i.id).join(",");

        const res: any = await $fetch("/api/shop/products", {
          query: { product_ids: ids },
        });

        if (!res?.items?.length) return;

        const map = new Map(
          res.items.map((p: any) => [
            String(p.product_id),
            Number(p.originalPrice) || 0,
          ]),
        );

        cartStore.items = cartStore.items.map((item) => {
          const variantOriginal = item.variantId
            ? bundleOriginalPriceByVariantId.value.get(String(item.variantId))
            : undefined;
          const productOriginal = map.get(String(item.id));
          const currentOriginal = Number(
            item.originalPrice || item.oldPrice || 0,
          );
          const original =
            variantOriginal || productOriginal || currentOriginal;

          return {
            ...item,
            originalPrice:
              original && original > item.price ? original : undefined,
            oldPrice: original && original > item.price ? original : undefined,
          };
        });
      } catch (e) {
        if (process.dev) {
          console.warn("[cart] enrich originalPrice failed", e);
        }
      }
    }

    // потом — отправка события просмотра корзины в YTM
    ytm.viewCart({
      currency: "RUB",
      total: cartStore.total ?? cartStore.subtotal ?? 0,
      count: cartStore.items.length,
      items: cartStore.items.length
        ? cartStore.items.map((i) => ({
            id: i.id,
            name: i.title,
            price: i.price,
            originalPrice: i.originalPrice,
            quantity: i.quantity,
            category: i.tag ? [i.tag] : undefined,
          }))
        : null,
    });
  });
}

function getRemarketingPercentFromContent(
  content?: string,
): RemarketingPercent | null {
  if (!content) return null;
  // ждём формат: remarketing3|... или remarketing5|...
  const match = content.match(/^remarketing(3|5)\b/i);
  if (!match) return null;
  const num = Number(match[1]);
  return num === 3 || num === 5 ? num : null;
}

async function handleRemarketingOnCartVisit() {
  if (!process.client) return;

  const { last } = useUtmTracker();
  const current = last.value;

  // если utm не было — выходим
  if (!current) return;

  // интересует только Яндекс CPC
  if (current.source !== "yandex" || current.medium !== "cpc") return;

  const percent = getRemarketingPercentFromContent(current.content);
  if (!percent) return;

  const daigoId = authStore.userId;
  const sessionId = daigoId ? null : ensureGuestSessionId();

  const idKey = daigoId ? `user_${daigoId}` : `guest_${sessionId || "unknown"}`;
  const storageKey = `remarketing_sent_${percent}_${idKey}`;

  // уже отправляли для этого пользователя/сессии и процента — выходим
  if (localStorage.getItem(storageKey) === "1") {
    return;
  }

  try {
    // 1) отправляем ремаркетинг на бэкенд
    await sendRemarketing({
      percent,
      daigoId: daigoId ?? undefined,
      sessionId: sessionId || undefined,
    });

    // 2) после того, как бэкендер привяжет промокод к корзине — обновляем корзину
    await cartStore.loadCart();
  } catch (e) {
    if (process.dev) {
      console.warn("[remarketing] error", e);
    }
  } finally {
    // помечаем, что для этого пользователя/сессии и процента уже отправили
    localStorage.setItem(storageKey, "1");
  }
}

/* Синхронизация с cartOrderStore */
function syncOrderStore() {
  const items: OrderItem[] = cartStore.items.map((i) => ({
    id: String(i.id),
    title: i.title,
    price: i.price,

    // 👇 ВАЖНО: подставляем originalPrice
    originalPrice:
      i.originalPrice && i.originalPrice > i.price
        ? i.originalPrice
        : undefined,

    qty: i.quantity,
    img: i.image || "",
    tag: i.tag,
  }));

  orderStore.state.items = items;
}

syncOrderStore();
watch(() => cartStore.items, syncOrderStore, { deep: true });

useSeoMeta({
  title: "Корзина | Daigo",
  ogTitle: "Корзина товаров – Оформите заказ в Daigo",
  description: "Оформите заказ на Daigo – только лучшие товары для здоровья.",
  ogDescription: "Оформите заказ на Daigo – только лучшие товары для здоровья.",
  ogType: "website",
  ogUrl: "https://daigo.ru/cart",
  ogImage: "https://daigo.ru/og/cart-preview.jpg",
});

useHead({
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ShoppingCart",
        name: "Корзина | Daigo",
        potentialAction: {
          "@type": "CheckoutAction",
          target: "https://daigo.ru/order",
        },
        itemListElement: cartStore.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: item.title,
            image: item.image,
            offers: {
              "@type": "Offer",
              priceCurrency: "RUB",
              price: item.price,
              availability: "https://schema.org/InStock",
            },
          },
        })),
        totalPrice: cartStore.total ?? 0,
      }),
    },
  ],
});

function onCartCta() {
  navigateTo("/order");
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <NuxtLink
        to="/"
        class="inline-flex gap-2 mb-2 md:mb-4 text-sm md:text-lg"
      >
        <img src="/icons/back.svg" class="w-5 md:w-6" alt="" /> Вернуться назад
      </NuxtLink>

      <h1
        class="text-[clamp(2rem,6vw,4rem)] font-medium mb-8 flex items-end gap-4 md:gap-8"
      >
        <span>Корзина</span>
        <span
          v-if="cartStore.items.length"
          class="text-sm md:text-xl font-light mb-2 md:mb-4"
        >
          {{ cartStore.items.length }}
          {{ cartStore.items.length === 1 ? "товар" : "товара" }}
        </span>
      </h1>

      <div class="flex flex-col lg:flex-row gap-10 relative z-30">
        <div class="flex-1 flex flex-col gap-6 lg:w-8/12">
          <div
            v-if="cartStore.promoNotice"
            class="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 text-sm mb-6"
          >
            <div
              class="flex items-center gap-1 text-white bg-green-500 rounded px-2 py-1 text-xs"
            >
              <span
                v-if="
                  cartStore.promoNotice &&
                  ['discount', 'code'].includes(
                    cartStore.promoNotice.type || '',
                  )
                "
              >
                -{{ cartStore.promoNotice.discount }}%
              </span>
              <span v-else-if="cartStore.promoNotice?.type === '2+1'">2+1</span>
              <span>На {{ cartStore.promoNotice.productName }}</span>
            </div>
            <span class="text-gray-800"
              >Акция скоро закончится, успейте оформить заказ!</span
            >
            <div
              v-if="cartStore.daysLeft"
              class="flex items-center gap-1 bg-green-500 text-white text-xs rounded px-2 py-1"
            >
              <img src="/icons/fire.svg" class="w-4 h-4" alt="🔥" />
              {{ cartStore.daysLeft }} дня
            </div>
          </div>

          <section v-if="shouldShowDentChaser" class="overflow-hidden mb-4">
            <!-- <div class="mb-3 flex items-center gap-3">
              <div
                class="flex h-14 sm:h-20 w-14 sm:w-20 shrink-0 items-center justify-center text-base bg-hoverbtn rounded-lg"
                aria-hidden="true"
              >
                <img
                  src="/images/articles/summer/gift-pasta.png"
                  alt="дент"
                  class="h-14 sm:h-20"
                />
              </div>
              <div>
                <p class="text-[10px] sm:text-xs font-medium uppercase tracking-[0.12em] text-cgreen">Специальное предложение</p>
                <h2 class="hidden md:block mt-1 text-base font-medium leading-tight sm:text-xl">
                  Daigo Dent в подарок в расширенном наборе
                </h2>
                <h2 class="block md:hidden mt-1 text-[15px] font-medium leading-tight sm:text-xl">
                  Daigo Dent в подарок
                </h2>
              </div>
            </div> -->
            <OmegaBundleOfferPanel mode="upgrade" class="pt-10" />
          </section>

          <CartItem
            v-for="item in cartStore.items"
            :key="`${String(item.id)}:${item.variantId || ''}`"
            :item="item"
            :show-bundle-offer="isStandaloneOmegaItem(item)"
            @update="cartStore.updateItem"
            @remove="cartStore.removeItem"
          />

          <CartGift
            v-for="gift in cartStore.gifts"
            :key="String(gift.id)"
            :gift="gift"
          />
        </div>

        <div class="lg:sticky top-8 w-full lg:w-auto">
          <OrderSummary :mode="'cart'" @cta="onCartCta" />
        </div>
      </div>
    </section>
  </BaseContainer>
</template>

<!-- <script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import { useSeoMeta, useHead, navigateTo } from '#imports'
import BaseContainer from '~/components/layout/BaseContainer.vue'

import { useCartStore } from '~/stores/cartStore'
import { useCartOrderStore, type CartItem as OrderItem } from '~/stores/cartOrderStore'
import { onMounted } from 'vue'
import { useYtm } from '@/composables/useYtm'
const ytm = useYtm()


definePageMeta({
  layout: 'main',
  ssr: false
})

/* Ленивые компоненты (ускоряет первоначальный рендер) */
const CartItem = defineAsyncComponent(() => import('~/components/cart/CartItem.vue'))
const CartGift = defineAsyncComponent(() => import('~/components/cart/CartGift.vue'))
const OrderSummary = defineAsyncComponent(() => import('~/components/checkout/SummaryCard.vue'))
const CartGiftProgress = defineAsyncComponent(() => import('~/components/cart/CartGiftProgress.vue'))
const CartGiftSticky = defineAsyncComponent(() => import('~/components/cart/CartGiftSticky.vue'))

const cartStore = useCartStore()
const orderStore = useCartOrderStore()

/* Мгновенно триггерим запрос корзины на клиенте, без ожидания mounted */
if (import.meta.client) {
  void cartStore.loadCart()

  onMounted(async () => {
  await cartStore.ensureLoaded?.()
    ytm.viewCart({
      products: cartStore.items.map(i => ({
        id: i.id, name: i.title, price: i.price, quantity: i.quantity, category: i.tag
      })),
      value: cartStore.total ?? cartStore.subtotal ?? 0,
      currency: 'RUB'
    })
  })

}

/* Синхронизация с cartOrderStore */
function syncOrderStore() {
  const items: OrderItem[] = cartStore.items.map(i => ({
    id: String(i.id),
    title: i.title,
    price: i.price,
    qty: i.quantity,
    img: i.image || '',
    tag: i.tag
  }))
  orderStore.state.items = items
}
syncOrderStore()
watch(() => cartStore.items, syncOrderStore, { deep: true })

useSeoMeta({
  title: 'Корзина | Daigo',
  ogTitle: 'Корзина товаров – Оформите заказ в Daigo',
  description: 'Оформите заказ на Daigo – только лучшие товары для здоровья.',
  ogDescription: 'Оформите заказ на Daigo – только лучшие товары для здоровья.',
  ogType: 'website',
  ogUrl: 'https://daigo.ru/cart',
  ogImage: 'https://daigo.ru/og/cart-preview.jpg'
})

useHead({
  script: [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ShoppingCart',
      name: 'Корзина | Daigo',
      potentialAction: { '@type': 'CheckoutAction', target: 'https://daigo.ru/order' },
      itemListElement: cartStore.items.map((item: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: item.title,
          image: item.image,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'RUB',
            price: item.price,
            availability: 'https://schema.org/InStock'
          }
        }
      })),
      totalPrice: cartStore.total ?? 0
    })
  }]
})

function onCartCta() {
  navigateTo('/order')
}
</script>

<template>
  <BaseContainer>
    <section class="relative w-full">
      <NuxtLink to="/" class="inline-flex gap-2 mb-2 md:mb-4 text-sm md:text-lg">
        <img src="/icons/back.svg" class="w-5 md:w-6" alt="" /> Вернуться назад
      </NuxtLink>

      <h1 class="text-[clamp(2rem,6vw,4rem)] font-medium mb-8 flex items-end gap-4 md:gap-8">
        <span>Корзина</span>
        <span
          v-if="cartStore.items.length"
          class="text-sm md:text-xl font-light mb-2 md:mb-4"
        >
          {{ cartStore.items.length }} {{ cartStore.items.length === 1 ? 'товар' : 'товара' }}
        </span>
      </h1>

      <div class="flex flex-col lg:flex-row gap-10">
        <div class="flex-1 flex flex-col gap-6 lg:w-8/12">
          <div
            v-if="cartStore.promoNotice"
            class="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3 text-sm mb-6"
          >
            <div class="flex items-center gap-1 text-white bg-green-500 rounded px-2 py-1 text-xs">
              <span v-if="cartStore.promoNotice && ['discount','code'].includes(cartStore.promoNotice.type || '')">
                -{{ cartStore.promoNotice.discount }}%
              </span>
              <span v-else-if="cartStore.promoNotice?.type === '2+1'">2+1</span>
              <span>На {{ cartStore.promoNotice.productName }}</span>
            </div>
            <span class="text-gray-800">Акция скоро закончится, успейте оформить заказ!</span>
            <div v-if="cartStore.daysLeft" class="flex items-center gap-1 bg-green-500 text-white text-xs rounded px-2 py-1">
              <img src="/icons/fire.svg" class="w-4 h-4" alt="🔥" /> {{ cartStore.daysLeft }} дня
            </div>
          </div>

          <CartGiftProgress
            v-if="shouldShowGiftProgress"
            :threshold="CART_GIFT_THRESHOLD"
            :current-amount="cartAmountForGift"
            :gift-image="giftProgressImage"
            gift-name="Зубная паста Daigo"
          />

          <CartItem
            v-for="item in cartStore.items"
            :key="`${String(item.id)}:${item.variantId || ''}`"
            :item="item"
            @update="cartStore.updateItem"
            @remove="cartStore.removeItem"
          />

          <CartGift
            v-for="gift in cartStore.gifts"
            :key="String(gift.id)"
            :gift="gift"
          />
        </div>

        <div class="lg:sticky top-8 w-full lg:w-auto">
          <OrderSummary :mode="'cart'" @cta="onCartCta" />
        </div>
      </div>
    </section>
  </BaseContainer>
</template> -->
