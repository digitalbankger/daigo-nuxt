<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { normalizeMediaUrl } from '~/utils/mediaUrl'

const props = withDefaults(defineProps<{
  threshold?: number
  currentAmount?: number
  giftImage?: string
  giftName?: string
}>(), {
  giftImage: '/media-s3/products/dent/product-1.png',
  giftName: 'Зубная паста Daigo',
})

const { public: { daigoApiBase } } = useRuntimeConfig()

const giftImageSrc = computed(() => {
  const url = normalizeMediaUrl(props.giftImage)

  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/media-s3/') || url.startsWith('/images/') || url.startsWith('/icons/')) return url

  return `${daigoApiBase}${url.startsWith('/') ? url : `/${url}`}`
})

</script>

<template>
  <div class="gift-progress rounded-2xl border border-primary/15 bg-white px-4 py-4 md:px-5 md:py-5 shadow-[0_12px_40px_rgba(21,152,194,0.08)]">
    <div class="flex items-center gap-3 md:gap-4">
      <div class="gift-progress__image-wrap shrink-0">
        <img src="/images/articles/summer/gift-pasta.png" :alt="giftName" class="gift-progress__image">
      <!-- </div> -->
      <!---->
      <!-- <div class="min-w-0 flex-1"> -->
      <!--   <div class="flex flex-wrap items-center gap-2 mb-1.5"> -->
      <!--     <span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"> -->
      <!--       Daigo Dent в подарок -->
      <!--     </span> -->
      <!--     <span class="text-xs text-black/45">{{ giftName }}</span> -->
      <!--   </div> -->
      <!---->
      <!--   <p class="text-sm md:text-base font-medium text-black leading-snug"> -->
      <!--     Выберите набор с <span class="text-primary">2 × Омега-3</span> -->
      <!--     и получите {{ giftName }} в подарок -->
      <!--   </p> -->
      <!-- </div> -->
    </div>
  </div>
</template>

<style scoped>
.gift-progress {
  position: relative;
  overflow: hidden;
}

.gift-progress::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(22,166,211,0.06), transparent 36%, rgba(154,255,159,0.10) 100%);
}

.gift-progress__image-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 110px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(22,166,211,0.10), rgba(22,166,211,0.03));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
}

.gift-progress__image {
  width: 110px;
  height: 110px;
  object-fit: contain;
}

</style>
