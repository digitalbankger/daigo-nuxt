<script setup lang="ts">
import { computed, ref } from "vue";
import type { ArticleProductMini } from "~/types/articles";
import { useCartStore } from "~/stores/cartStore";

const props = defineProps<{
  product: ArticleProductMini;
  subtitle?: string;
}>();

const cartStore = useCartStore();
const adding = ref(false);

const cartItem = computed(() =>
  cartStore.items.find((i) => String(i.id) === String(props.product.product_id)),
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
    class="block bg-white rounded-2xl overflow-hidden shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]"
  >
    <div class="relative aspect-[4/3] bg-hoverbtn overflow-hidden">
      <img
        :src="product.image"
        :alt="product.title"
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <span
        v-if="product.badge"
        class="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-md bg-cgreen px-1.5 py-1 text-xs text-white"
      >
        <img src="/icons/fire.svg" alt="" class="w-3.5 h-3.5" />
        {{ product.badge }}
      </span>
      <div
        class="absolute left-1/2 -translate-x-1/2 bottom-2 flex items-center gap-1"
      >
        <span class="h-[6px] w-4 rounded-full bg-white/90"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
        <span class="h-[6px] w-4 rounded-full bg-white/40"></span>
      </div>
    </div>

    <div class="p-4 flex flex-col gap-3">
      <div>
        <p class="text-base md:text-lg text-black line-clamp-2">
          {{ product.title }}
        </p>
        <p v-if="subtitle" class="text-sm md:text-base text-black/70">
          {{ subtitle }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="product.oldPrice" class="text-black/50 line-through text-sm">
          {{ product.oldPrice.toLocaleString("ru-RU") }} ₽
        </span>
        <span class="text-cgreen font-medium text-xl">
          {{ product.price.toLocaleString("ru-RU") }} ₽
        </span>
      </div>

      <button
        v-if="quantityInCart === 0"
        type="button"
        class="w-full flex items-center justify-center gap-2 rounded-lg text-white h-[54px] text-base md:text-lg disabled:opacity-60 disabled:cursor-wait longevity-gold-btn"
        :disabled="adding"
        @click.stop.prevent="addToCartHandler"
      >
        <img src="/icons/add-to-cart.svg" alt="" class="w-5 h-5" />
        {{ adding ? "Добавляем..." : "В корзину" }}
      </button>

      <div
        v-else
        class="flex items-center justify-between gap-2 rounded-lg px-3 h-[54px] longevity-gold-btn"
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

<style scoped>
.longevity-gold-btn {
  background: linear-gradient(135deg, #d9c2a0 0%, #c7a878 50%, #b08e5c 100%);
  color: #fff;
}
.longevity-gold-btn img {
  filter: brightness(0) invert(1);
}
</style>
