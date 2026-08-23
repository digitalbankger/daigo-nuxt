<script setup lang="ts">
import { computed, ref } from "vue";
import type { ArticleProductMini } from "~/types/articles";
import { useCartStore } from "~/stores/cartStore";

const props = withDefaults(
  defineProps<{
    product: ArticleProductMini;
    variant?: "banner" | "sidebar";
  }>(),
  {
    variant: "banner",
  },
);

const cartStore = useCartStore();
const adding = ref(false);

const discountPercent = computed(() => {
  const price = Number(props.product.price || 0);
  const oldPrice = Number(props.product.oldPrice || 0);
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
});

/** Принудительный перенос после "+" — визуально одинаковая высота карточек, независимо от длины названия партнёра */
const titleLines = computed(() => {
  const idx = props.product.title.lastIndexOf(" + ");
  if (idx === -1) return [props.product.title];
  return [
    props.product.title.slice(0, idx + 2),
    props.product.title.slice(idx + 3),
  ];
});

const cartItem = computed(() =>
  cartStore.items.find(
    (i) => String(i.id) === String(props.product.product_id),
  ),
);
const quantityInCart = computed(() => cartItem.value?.quantity ?? 0);

function extractCatalogSlug(url: string) {
  return url.match(/\/catalog\/([^/?#]+)/)?.[1] || "";
}

async function resolveVariantId(): Promise<string | undefined> {
  const slug = extractCatalogSlug(props.product.url);
  if (!slug) return undefined;

  try {
    const card: any = await $fetch(
      `/api/shop/products/${encodeURIComponent(slug)}/card`,
    );
    const variants = card?.variants || [];
    const variant =
      variants.find((v: any) => v.is_default) || variants[0] || null;
    return variant?.variant_id;
  } catch {
    return undefined;
  }
}

async function addToCartHandler() {
  if (adding.value) return;
  adding.value = true;
  try {
    const variantId = await resolveVariantId();
    await cartStore.addToCart({
      id: String(props.product.product_id),
      variantId,
      title: props.product.title,
      subtitle: "",
      price: props.product.price,
      oldPrice: props.product.oldPrice,
      quantity: 1,
      image: props.product.image,
      tag: props.product.badge,
    } as any);
  } finally {
    adding.value = false;
  }
}

async function incrementHandler() {
  if (adding.value) return;
  const item = cartItem.value;
  if (!item) return addToCartHandler();
  adding.value = true;
  try {
    await cartStore.updateItem(item.id, item.quantity + 1, item.variantId);
  } finally {
    adding.value = false;
  }
}

async function decrementHandler() {
  if (adding.value) return;
  const item = cartItem.value;
  if (!item) return;
  adding.value = true;
  try {
    await cartStore.updateItem(item.id, item.quantity - 1, item.variantId);
  } finally {
    adding.value = false;
  }
}
</script>

<template>
  <NuxtLink
    :to="product.url"
    class="block bg-white rounded-[20px] overflow-hidden"
    :class="[
      variant === 'banner'
        ? 'shadow-[1px_1px_10px_0px_rgba(34,93,197,0.35)]'
        : 'shadow-[0px_1px_6px_0px_rgba(0,0,0,0.07)]',
      variant === 'sidebar' ? 'flex' : '',
    ]"
  >
    <div
      class="relative bg-hoverbtn rounded-[6px] overflow-hidden shrink-0"
      :class="variant === 'banner' ? 'aspect-[4/3]' : 'w-[42%] self-stretch'"
    >
      <img
        :src="product.image"
        :alt="product.title"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />

      <!-- точки-слайдер: переключают фото товара (декоративно, первая точка активна) -->
      <div
        class="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-1"
      >
        <span class="h-[6px] w-4 rounded-full bg-white/90"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
      </div>

      <span
        v-if="product.badge"
        class="absolute left-3 bottom-9 inline-flex items-center gap-1 rounded-md bg-cgreen px-1.5 py-1 text-xs text-white"
      >
        <img src="/icons/fire.svg" alt="" class="w-3.5 h-3.5" />
        {{ product.badge }}
      </span>
    </div>

    <div
      :class="
        variant === 'sidebar'
          ? 'flex-1 min-w-0 p-4 flex flex-col justify-center gap-2'
          : 'p-4'
      "
    >
      <p
        class="text-black"
        :class="
          variant === 'sidebar'
            ? 'text-base md:text-lg line-clamp-3'
            : 'text-base md:text-lg line-clamp-2'
        "
      >
        <template v-if="titleLines.length > 1"
          >{{ titleLines[0] }}<br />{{ titleLines[1] }}</template
        >
        <template v-else>{{ product.title }}</template>
      </p>

      <div
        class="flex items-center gap-2"
        :class="variant === 'sidebar' ? '' : 'mt-2'"
      >
        <span v-if="discountPercent" class="text-black/50 line-through text-sm">
          {{ product.oldPrice!.toLocaleString("ru-RU") }} ₽
        </span>
        <span class="text-cgreen font-medium text-xl">
          {{ product.price.toLocaleString("ru-RU") }} ₽
        </span>
      </div>

      <button
        v-if="quantityInCart === 0"
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition h-[54px] text-base md:text-lg disabled:opacity-60 disabled:cursor-wait"
        :class="variant === 'sidebar' ? '' : 'mt-3'"
        :disabled="adding"
        @click.stop.prevent="addToCartHandler"
      >
        <img src="/icons/add-to-cart.svg" alt="" class="w-5 h-5" />
        {{ adding ? "Добавляем..." : "В корзину" }}
      </button>

      <div
        v-else
        class="flex items-center justify-between gap-2 rounded-lg bg-primary px-3 h-[54px]"
        :class="variant === 'sidebar' ? '' : 'mt-3'"
        @click.stop.prevent
      >
        <button
          type="button"
          class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-60"
          :disabled="adding"
          aria-label="Уменьшить количество"
          @click.stop.prevent="decrementHandler"
        >
          <img src="/icons/decrement.svg" alt="" class="w-5 h-5" />
        </button>
        <span class="text-white text-base md:text-lg">
          {{ quantityInCart }} шт
        </span>
        <button
          type="button"
          class="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/20 text-white disabled:opacity-60"
          :disabled="adding"
          aria-label="Увеличить количество"
          @click.stop.prevent="incrementHandler"
        >
          <img src="/icons/increment.svg" alt="" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </NuxtLink>
</template>
