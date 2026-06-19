<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRuntimeConfig } from '#imports'
import { normalizeMediaUrl } from '~/utils/mediaUrl'
import CartGiftProgress from '~/components/cart/CartGiftProgress.vue'

const props = withDefaults(defineProps<{
  threshold: number
  currentAmount: number
  giftImage?: string
  giftName?: string
}>(), {
  giftImage: '/media-s3/products/dent/product-1.png',
  giftName: 'Зубная паста Daigo',
})

const isOpen = ref(false)
const { public: { daigoApiBase } } = useRuntimeConfig()

const safeCurrentAmount = computed(() => Math.max(0, Number(props.currentAmount || 0)))
const remainingAmount = computed(() => Math.max(0, props.threshold - safeCurrentAmount.value))
const isReached = computed(() => remainingAmount.value <= 0)
const formattedRemainingAmount = computed(() => remainingAmount.value.toLocaleString('ru-RU'))

const giftImageSrc = computed(() => {
  const url = normalizeMediaUrl(props.giftImage)

  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  if (url.startsWith('/media-s3/') || url.startsWith('/images/') || url.startsWith('/icons/')) return url

  return `${daigoApiBase}${url.startsWith('/') ? url : `/${url}`}`
})

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}
</script>

<template>
  <div class="gift-sticky" :class="{ 'gift-sticky_open': isOpen }">
    <button
      type="button"
      class="gift-sticky__tab"
      :aria-expanded="isOpen"
      aria-controls="cart-gift-sticky-panel"
      @click="toggle"
    >
      <span class="gift-sticky__badge">Подарок</span>
      <img :src="giftImageSrc" :alt="giftName" class="gift-sticky__tab-img">
      <span v-if="!isReached" class="gift-sticky__tab-text">
        осталось {{ formattedRemainingAmount }} ₽
      </span>
      <span v-else class="gift-sticky__tab-text">
        подарок ваш
      </span>
    </button>

    <Transition name="gift-panel">
      <aside
        v-if="isOpen"
        id="cart-gift-sticky-panel"
        class="gift-sticky__panel"
        aria-label="Информация о подарке"
      >
        <button
          type="button"
          class="gift-sticky__close"
          aria-label="Закрыть информацию о подарке"
          @click="close"
        >
          ×
        </button>

        <div class="flex items-start gap-3 pr-8">
          <div class="gift-sticky__panel-img-wrap">
            <img :src="giftImageSrc" :alt="giftName" class="gift-sticky__panel-img">
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
              Подарок за заказ
            </p>
            <h3 class="text-lg md:text-xl font-medium leading-tight mt-1">
              {{ giftName }}
            </h3>
            <p class="text-sm text-black/60 leading-snug mt-2">
              Добавьте товары до 100 000 ₽, и паста добавится к заказу как подарок.
            </p>
          </div>
        </div>

        <CartGiftProgress
          class="mt-4"
          :threshold="threshold"
          :current-amount="safeCurrentAmount"
          :gift-image="giftImageSrc"
          :gift-name="giftName"
        />
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.gift-sticky {
  position: fixed;
  right: 0;
  top: 50%;
  z-index: 65;
  transform: translateY(-50%);
  pointer-events: none;
}

.gift-sticky__tab,
.gift-sticky__panel {
  pointer-events: auto;
}

.gift-sticky__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 74px;
  min-height: 172px;
  padding: 12px 8px;
  border: 0;
  border-radius: 18px 0 0 18px;
  background: linear-gradient(180deg, #1f9ac8 0%, #1687b5 100%);
  color: #fff;
  box-shadow: 0 14px 36px rgba(18, 121, 167, .28);
  cursor: pointer;
  overflow: hidden;
}

.gift-sticky__tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(255,255,255,.28), transparent 34%),
    linear-gradient(120deg, transparent 15%, rgba(255,255,255,.16) 34%, transparent 48%);
  opacity: .9;
  pointer-events: none;
}

.gift-sticky__badge,
.gift-sticky__tab-img,
.gift-sticky__tab-text {
  position: relative;
  z-index: 1;
}

.gift-sticky__badge {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  text-transform: uppercase;
  letter-spacing: .16em;
  font-size: 10px;
  font-weight: 600;
  opacity: .95;
}

.gift-sticky__tab-img {
  width: 54px;
  height: 54px;
  margin: 10px 0 8px;
  object-fit: contain;
  filter: drop-shadow(0 7px 12px rgba(0,0,0,.18));
  animation: gift-tab-float 2.8s ease-in-out infinite;
}

.gift-sticky__tab-text {
  max-width: 58px;
  font-size: 10px;
  line-height: 1.15;
  text-align: center;
  text-transform: lowercase;
}

.gift-sticky__panel {
  position: absolute;
  right: 88px;
  top: 50%;
  width: min(420px, calc(100vw - 120px));
  padding: 18px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 24px 70px rgba(20, 50, 72, .18);
  transform: translateY(-50%);
}

.gift-sticky__panel::before {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  width: 18px;
  height: 18px;
  background: #fff;
  transform: translateY(-50%) rotate(45deg);
}

.gift-sticky__close {
  position: absolute;
  top: 12px;
  right: 14px;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 999px;
  background: rgba(0,0,0,.05);
  color: rgba(0,0,0,.65);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.gift-sticky__panel-img-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(22,166,211,.1), rgba(22,166,211,.03));
  flex-shrink: 0;
}

.gift-sticky__panel-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.gift-panel-enter-active,
.gift-panel-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.gift-panel-enter-from,
.gift-panel-leave-to {
  opacity: 0;
  transform: translate(10px, -50%);
}

@keyframes gift-tab-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@media (max-width: 767px) {
  .gift-sticky {
    right: 0;
    top: 50%;
    bottom: auto;
    transform: translateY(-50%);
  }

  .gift-sticky__tab {
    width: 68px;
    min-height: 158px;
    padding: 10px 7px;
    border-radius: 16px 0 0 16px;
  }

  .gift-sticky__badge {
    display: block;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    letter-spacing: .14em;
    font-size: 9px;
  }

  .gift-sticky__tab-img {
    width: 48px;
    height: 48px;
    margin: 9px 0 7px;
  }

  .gift-sticky__tab-text {
    display: block;
    max-width: 54px;
    font-size: 9px;
    line-height: 1.12;
    text-align: center;
  }

  .gift-sticky__panel {
    position: absolute;
    right: 80px;
    left: auto;
    top: 50%;
    bottom: auto;
    width: min(360px, calc(100vw - 96px));
    padding: 14px;
    border-radius: 20px;
    transform: translateY(-50%);
  }

  .gift-sticky__panel::before {
    display: block;
    right: -8px;
    top: 50%;
    transform: translateY(-50%) rotate(45deg);
  }

  .gift-sticky__panel-img-wrap {
    width: 58px;
    height: 58px;
    border-radius: 16px;
  }

  .gift-sticky__panel-img {
    width: 48px;
    height: 48px;
  }

  .gift-panel-enter-from,
  .gift-panel-leave-to {
    opacity: 0;
    transform: translate(10px, -50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .gift-sticky__tab-img {
    animation: none;
  }

  .gift-panel-enter-active,
  .gift-panel-leave-active {
    transition: none;
  }
}
</style>
