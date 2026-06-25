<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import UiModal from '~/components/ui/UiModal.vue'
import { useAuthStore } from '~/stores/authStore'
import { useUserStore } from '~/stores/userStore'

type ProductOption = {
  product_id?: number | string
  slug: string
  name: string
  image?: string
}

type ReviewRewardResponse = {
  code: string
  promotion_id: number
  already_issued: boolean
}

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const authStore = useAuthStore()
const userStore = useUserStore()
const route = useRoute()

const fallbackProducts: ProductOption[] = [
  { slug: 'lux-daigo-metabiotik', name: 'Метабиотик для кишечника Daigo Lux' },
  { slug: 'tamotsu', name: 'Tamotsu' },
  { slug: 'daigo-dent', name: 'Daigo Dent' },
]

const isLoadingProducts = ref(false)
const productsLoaded = ref(false)
const products = ref<ProductOption[]>(fallbackProducts)

const productSlug = ref(fallbackProducts[0]?.slug || '')
const author = ref('')
const rating = ref(5)
const title = ref('')
const text = ref('')
const photos = ref<File[]>([])
const videos = ref<File[]>([])
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const reward = ref<ReviewRewardResponse | null>(null)
const copied = ref(false)
const isProductDropdownOpen = ref(false)
const productDropdownRef = ref<HTMLElement | null>(null)

const selectedProduct = computed(() => products.value.find((item) => item.slug === productSlug.value) || products.value[0])
const selectedProductName = computed(() => selectedProduct.value?.name || 'Выберите товар')
const hasVideo = computed(() => videos.value.length > 0)
const hasPhoto = computed(() => photos.value.length > 0)
const rewardText = computed(() => {
  if (hasVideo.value) return 'Видеоотзыв выбран: после отправки откроем Dent-бонус.'
  if (hasPhoto.value) return 'Фотоотзыв выбран: после отправки откроем Daigo-бонус.'
  return 'Добавьте фото или видео — после отправки откроем подарок участника акции.'
})

function authHeaders() {
  const headers: Record<string, string> = {}
  if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`
  return headers
}

function getDaigoId() {
  return authStore.userId ? Number(authStore.userId) : null
}

async function ensureAuthenticated() {
  if (authStore.isAuthenticated && getDaigoId()) return true

  errorMessage.value = 'Чтобы отправить отзыв и получить промокод, сначала авторизуйтесь.'
  authStore.openAuth(route.fullPath)
  return false
}

async function prefillAuthorFromProfile() {
  if (!authStore.isAuthenticated || author.value.trim()) return

  try {
    await userStore.loadProfile()
    const profile = userStore.profile
    const fullName = [profile?.first_name, profile?.last_name]
      .map((part) => String(part || '').trim())
      .filter(Boolean)
      .join(' ')

    if (fullName) author.value = fullName
  } catch (error) {
    console.warn('[microbiome-review] profile prefill failed', error)
  }
}


function closeProductDropdown() {
  isProductDropdownOpen.value = false
}

function toggleProductDropdown() {
  if (isLoadingProducts.value) return
  isProductDropdownOpen.value = !isProductDropdownOpen.value
}

function selectProduct(slug: string) {
  productSlug.value = slug
  closeProductDropdown()
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isProductDropdownOpen.value) return

  const target = event.target as Node | null
  if (target && productDropdownRef.value?.contains(target)) return

  closeProductDropdown()
}

function setRating(value: number) {
  rating.value = Math.min(5, Math.max(1, value))
}

function close() {
  closeProductDropdown()
  emit('update:show', false)
  setTimeout(resetForm, 220)
}

function resetFields() {
  author.value = ''
  rating.value = 5
  title.value = ''
  text.value = ''
  photos.value = []
  videos.value = []
}

function resetForm() {
  closeProductDropdown()
  resetFields()
  errorMessage.value = ''
  successMessage.value = ''
  reward.value = null
  copied.value = false
}

async function loadProducts() {
  if (productsLoaded.value || isLoadingProducts.value) return

  isLoadingProducts.value = true

  try {
    const response = await $fetch<{ items?: any[] }>('/api/shop/products', {
      query: {
        page: 1,
        page_size: 100,
        no_total: '1',
      },
    })

    const items = Array.isArray(response?.items)
      ? response.items
          .map((item: any) => ({
            product_id: item.product_id ?? item.id,
            slug: String(item.slug || '').trim(),
            name: String(item.name || item.title || item.slug || '').trim(),
            image: item.image,
          }))
          .filter((item: ProductOption) => item.slug && item.name)
      : []

    if (items.length) {
      products.value = items
      if (!items.some((item) => item.slug === productSlug.value)) {
        productSlug.value = items[0].slug
      }
    }
  } catch (error) {
    console.warn('[microbiome-review] products load failed', error)
    products.value = fallbackProducts
    productSlug.value = fallbackProducts[0]?.slug || ''
  } finally {
    productsLoaded.value = true
    isLoadingProducts.value = false
  }
}

function onPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  photos.value = Array.from(input.files || [])
  reward.value = null
  successMessage.value = ''
}

function onVideoChange(event: Event) {
  const input = event.target as HTMLInputElement
  videos.value = Array.from(input.files || [])
  reward.value = null
  successMessage.value = ''
}

function appendFiles(formData: FormData, fieldName: string, files: File[]) {
  files.forEach((file) => {
    formData.append(fieldName, file, file.name)
  })
}

async function issueReward(daigoId: number) {
  return await $fetch<ReviewRewardResponse>('/api/shop/reviews/reward', {
    method: 'POST',
    headers: authHeaders(),
    body: {
      daigo_id: daigoId,
      has_video: hasVideo.value,
    },
  })
}

async function submitReview() {
  if (isSubmitting.value) return

  errorMessage.value = ''
  successMessage.value = ''
  reward.value = null
  copied.value = false

  const daigoId = getDaigoId()

  if (!await ensureAuthenticated()) return

  if (!daigoId) {
    errorMessage.value = 'Не удалось определить пользователя. Обновите страницу и авторизуйтесь ещё раз.'
    return
  }

  if (!productSlug.value) {
    errorMessage.value = 'Выберите товар, о котором оставляете отзыв.'
    return
  }

  if (!author.value.trim()) {
    errorMessage.value = 'Укажите имя автора отзыва.'
    return
  }

  if (text.value.trim().length < 10) {
    errorMessage.value = 'Напишите отзыв подробнее: минимум 10 символов.'
    return
  }

  if (!photos.value.length && !videos.value.length) {
    errorMessage.value = 'Для участия в акции прикрепите фото или видео.'
    return
  }

  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append('author', author.value.trim())
    formData.append('rating', String(rating.value))
    formData.append('title', title.value.trim() || `Отзыв о ${selectedProduct.value?.name || 'Daigo'}`)
    formData.append('text', text.value.trim())
    formData.append('daigo_id', String(daigoId))
    appendFiles(formData, 'photos', photos.value)
    appendFiles(formData, 'videos', videos.value)

    await $fetch(`/api/shop/reviews/${encodeURIComponent(productSlug.value)}`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    })

    const rewardResponse = await issueReward(daigoId)
    reward.value = rewardResponse
    resetFields()
    successMessage.value = rewardResponse.already_issued
      ? 'Отзыв отправлен. Промокод по этой акции уже был выдан ранее.'
      : 'Спасибо! Отзыв отправлен, промокод открыт.'
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      'Не удалось отправить отзыв. Попробуйте еще раз.'
  } finally {
    isSubmitting.value = false
  }
}

async function copyRewardCode() {
  if (!reward.value?.code) return

  try {
    await navigator.clipboard?.writeText(reward.value.code)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {}
}

watch(
  () => props.show,
  async (value) => {
    if (!value) return
    await loadProducts()
    await prefillAuthorFromProfile()
  },
  { immediate: true }
)

watch(
  () => authStore.isAuthenticated,
  async (value) => {
    if (value && props.show) {
      errorMessage.value = ''
      await prefillAuthorFromProfile()
    }
  }
)

watch(isProductDropdownOpen, (value) => {
  if (!import.meta.client) return

  if (value) {
    document.addEventListener('pointerdown', onDocumentPointerDown)
  } else {
    document.removeEventListener('pointerdown', onDocumentPointerDown)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <UiModal
    :show="show"
    :closable="false"
    panel-class="micro-review-modal-panel"
    @close="close"
  >
    <section class="micro-review" aria-label="Форма отзыва ко Дню микробиома">
      <button
        type="button"
        class="micro-review__close"
        aria-label="Закрыть форму отзыва"
        @click="close"
      >
        ×
      </button>

      <div class="micro-review__head">
        <p class="micro-review__eyebrow">День микробиома Daigo</p>
        <h2>Ваш отзыв — это подарок для нас обоих</h2>
        <p>
          Выберите продукт, приложите фото или видео и расскажите о своём опыте.
          На смартфоне можно выбрать файл из галереи или снять его сразу.
        </p>
      </div>

      <form class="micro-review__form" @submit.prevent="submitReview">
        <div ref="productDropdownRef" class="micro-review__field micro-review__field_full">
          <span>Товар для отзыва</span>

          <div
            class="micro-review__select"
            :class="{
              'micro-review__select_open': isProductDropdownOpen,
              'micro-review__select_disabled': isLoadingProducts,
            }"
          >
            <button
              type="button"
              class="micro-review__select-button"
              :disabled="isLoadingProducts"
              :aria-expanded="isProductDropdownOpen"
              aria-haspopup="listbox"
              @click.stop="toggleProductDropdown"
            >
              <span class="micro-review__select-value">
                <span class="micro-review__select-thumb" aria-hidden="true">
                  <img
                    v-if="selectedProduct?.image"
                    :src="selectedProduct.image"
                    :alt="selectedProductName"
                    loading="lazy"
                  >
                  <span v-else>{{ selectedProductName.charAt(0) }}</span>
                </span>

                <span class="micro-review__select-copy">
                  <strong>{{ isLoadingProducts ? 'Загружаем товары...' : selectedProductName }}</strong>
                  <small>Выберите продукт из каталога</small>
                </span>
              </span>

              <svg class="micro-review__select-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <Transition name="micro-review-select">
              <div v-if="isProductDropdownOpen" class="micro-review__select-menu" role="listbox">
                <button
                  v-for="product in products"
                  :key="product.slug"
                  type="button"
                  class="micro-review__select-option"
                  :class="{ 'micro-review__select-option_active': product.slug === productSlug }"
                  :aria-selected="product.slug === productSlug"
                  role="option"
                  @click="selectProduct(product.slug)"
                >
                  <span class="micro-review__select-thumb" aria-hidden="true">
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      loading="lazy"
                    >
                    <span v-else>{{ product.name.charAt(0) }}</span>
                  </span>
                  <span>{{ product.name }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <label class="micro-review__field">
          <span>Имя</span>
          <input v-model.trim="author" type="text" placeholder="Например, Мария" autocomplete="name">
        </label>

        <div class="micro-review__field">
          <span>Оценка</span>
          <div class="micro-review__rating" role="radiogroup" aria-label="Оценка отзыва">
            <div class="micro-review__rating-stars">
              <button
                v-for="value in 5"
                :key="value"
                type="button"
                class="micro-review__rating-star"
                :class="{ 'micro-review__rating-star_active': value <= rating }"
                :aria-label="`${value} из 5`"
                :aria-checked="rating === value"
                role="radio"
                @click="setRating(value)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.6l2.86 5.8 6.4.93-4.63 4.52 1.1 6.37L12 17.2l-5.73 3.02 1.1-6.37-4.63-4.52 6.4-.93L12 2.6z" />
                </svg>
              </button>
            </div>
            <span class="micro-review__rating-text">{{ rating }} из 5</span>
          </div>
        </div>

        <label class="micro-review__field micro-review__field_full">
          <span>Заголовок</span>
          <input v-model.trim="title" type="text" placeholder="Коротко о впечатлении">
        </label>

        <label class="micro-review__field micro-review__field_full">
          <span>Текст отзыва</span>
          <textarea v-model.trim="text" rows="5" placeholder="Расскажите, какой продукт использовали и что вам понравилось" />
        </label>

        <div class="micro-review__upload-grid micro-review__field_full">
          <label class="micro-review__upload micro-review__upload_photo">
            <span class="micro-review__upload-bg" aria-hidden="true">
              <svg viewBox="0 0 72 72" fill="none">
                <rect x="10" y="19" width="52" height="38" rx="10" stroke="currentColor" stroke-width="5" />
                <path d="M22 20l5-8h18l5 8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="36" cy="38" r="10" stroke="currentColor" stroke-width="5" />
              </svg>
            </span>
            <span class="micro-review__upload-icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path
                  d="M8.5 9.2l1.4-2.1h8.2l1.4 2.1h2.1a2.6 2.6 0 012.6 2.6v7.7a2.6 2.6 0 01-2.6 2.6H6.4a2.6 2.6 0 01-2.6-2.6v-7.7a2.6 2.6 0 012.6-2.6h2.1z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle cx="14" cy="15.6" r="4.1" stroke="currentColor" stroke-width="2" />
              </svg>
            </span>
            <span class="micro-review__upload-title">Фото</span>
            <span class="micro-review__upload-text">Галерея или камера смартфона</span>
            <span class="micro-review__upload-action">Выбрать фото</span>
            <input type="file" accept="image/*" multiple @change="onPhotoChange">
          </label>

          <label class="micro-review__upload micro-review__upload_video">
            <span class="micro-review__upload-bg" aria-hidden="true">
              <svg viewBox="0 0 72 72" fill="none">
                <rect x="10" y="20" width="36" height="32" rx="9" stroke="currentColor" stroke-width="5" />
                <path d="M46 31l15-8v26l-15-8" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="micro-review__upload-icon" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <rect
                  x="3.5"
                  y="7.5"
                  width="14.5"
                  height="13"
                  rx="3"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M18 12l5.8-3.2v10.4L18 16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="micro-review__upload-title">Видео</span>
            <span class="micro-review__upload-text">Короткий живой отзыв с продуктом</span>
            <span class="micro-review__upload-action">Выбрать видео</span>
            <input type="file" accept="video/*" multiple @change="onVideoChange">
          </label>
        </div>

        <div v-if="photos.length || videos.length" class="micro-review__files micro-review__field_full">
          <p v-if="photos.length">Фото: {{ photos.map(file => file.name).join(', ') }}</p>
          <p v-if="videos.length">Видео: {{ videos.map(file => file.name).join(', ') }}</p>
        </div>

        <div class="micro-review__reward micro-review__field_full">
          {{ rewardText }}
        </div>

        <p v-if="errorMessage" class="micro-review__error micro-review__field_full">{{ errorMessage }}</p>
        <p v-if="successMessage" class="micro-review__success micro-review__field_full">{{ successMessage }}</p>

        <div v-if="reward?.code" class="micro-review__promo micro-review__field_full">
          <span class="micro-review__promo-label">Ваш промокод</span>
          <strong>{{ reward.code }}</strong>
          <button type="button" @click="copyRewardCode">
            {{ copied ? 'Скопировано' : 'Скопировать' }}
          </button>
          <small v-if="reward.already_issued">Промокод уже был выдан ранее за другой отзыв.</small>
          <small v-else>Сохраните промокод и примените его в корзине.</small>
        </div>

        <button class="micro-review__submit micro-review__field_full" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Отправляем...' : 'Отправить отзыв' }}
        </button>
      </form>
    </section>
  </UiModal>
</template>

<style scoped>
:global(.micro-review-modal-panel) {
  width: min(760px, calc(100vw - 24px));
  max-height: min(92vh, 920px);
  overflow: auto;
  border-radius: 30px !important;
  padding: 0 !important;
}

.micro-review {
  --micro-primary: #f24391;
  --micro-primary-end: #ff8550;
  --micro-primary-dark: #d9307a;
  --micro-primary-soft: rgba(242, 67, 145, .12);
  position: relative;
  padding: clamp(22px, 4vw, 38px);
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 67, 145, .18), transparent 28%),
    radial-gradient(circle at 92% 12%, rgba(242, 67, 145, .10), transparent 30%),
    #fff;
}

.micro-review__close {
  position: sticky;
  top: 14px;
  float: right;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: -8px -8px 0 12px;
  border: 0;
  border-radius: 999px;
  background: rgba(242, 67, 145, .12);
  color: var(--micro-primary-dark);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.micro-review__head {
  max-width: 620px;
  margin-bottom: 24px;
}

.micro-review__eyebrow {
  margin-bottom: 8px;
  color: var(--micro-primary) !important;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: .18em;
  text-transform: uppercase;
}

.micro-review__head h2 {
  margin: 0 0 10px;
  color: #111827;
  font-size: clamp(28px, 5vw, 46px);
  font-weight: 500;
  line-height: 1.04;
}

.micro-review__head p {
  color: rgba(17, 24, 39, .68);
  font-size: 16px;
  line-height: 1.5;
}

.micro-review__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.micro-review__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.micro-review__field_full {
  grid-column: 1 / -1;
}

.micro-review__field span {
  color: rgba(17, 24, 39, .74);
  font-size: 13px;
  font-weight: 600;
}

.micro-review__field input,
.micro-review__field select,
.micro-review__field textarea {
  width: 100%;
  border: 1px solid rgba(242, 67, 145, .26);
  border-radius: 10px;
  background: rgba(255, 255, 255, .90);
  padding: 13px 15px;
  color: #111827;
  font-size: 15px;
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.micro-review__field textarea {
  resize: vertical;
}

.micro-review__field input:focus,
.micro-review__field select:focus,
.micro-review__field textarea:focus {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, .14);
}

.micro-review__select {
  position: relative;
}

.micro-review__select-button {
  display: flex;
  width: 100%;
  min-height: 62px;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(242, 67, 145, .26);
  border-radius: 10px;
  background: rgba(255, 255, 255, .90);
  padding: 10px 13px;
  color: #111827;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.micro-review__select-button:hover,
.micro-review__select_open .micro-review__select-button,
.micro-review__select-button:focus-visible {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, .14);
}

.micro-review__select-button:disabled {
  cursor: wait;
  opacity: .72;
}

.micro-review__select-value {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
}

.micro-review__select-thumb {
  display: inline-flex;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, .96), rgba(255, 255, 255, .38) 42%, transparent 60%),
    linear-gradient(135deg, rgba(242, 67, 145, .18), rgba(255, 133, 80, .18));
  color: var(--micro-primary-dark);
  font-size: 18px;
  font-weight: 800;
}

.micro-review__select-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.micro-review__select-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.micro-review__select-copy strong,
.micro-review__select-option span:last-child {
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.micro-review__select-copy small {
  color: rgba(17, 24, 39, .50);
  font-size: 12px;
  line-height: 1.2;
}

.micro-review__select-arrow {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  color: rgba(17, 24, 39, .48);
  transition: transform .2s ease, color .2s ease;
}

.micro-review__select_open .micro-review__select-arrow {
  color: var(--micro-primary-dark);
  transform: rotate(180deg);
}

.micro-review__select-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  right: 0;
  left: 0;
  max-height: 286px;
  overflow: auto;
  border: 1px solid rgba(242, 67, 145, .18);
  border-radius: 18px;
  background: rgba(255, 255, 255, .98);
  padding: 7px;
  box-shadow: 0 22px 48px rgba(93, 52, 105, .16);
  backdrop-filter: blur(14px);
}

.micro-review__select-option {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  padding: 9px;
  text-align: left;
  cursor: pointer;
  transition: background .18s ease, color .18s ease;
}

.micro-review__select-option:hover,
.micro-review__select-option_active {
  background: linear-gradient(135deg, rgba(242, 67, 145, .12), rgba(255, 133, 80, .08));
}

.micro-review__select-option_active span:last-child {
  color: var(--micro-primary-dark);
}

.micro-review-select-enter-active,
.micro-review-select-leave-active {
  transition: opacity .16s ease, transform .16s ease;
}

.micro-review-select-enter-from,
.micro-review-select-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.micro-review__rating {
  display: flex;
  min-height: 50px;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(242, 67, 145, .26);
  border-radius: 10px;
  background: rgba(255, 255, 255, .90);
  padding: 8px 12px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.micro-review__rating:focus-within {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, .14);
}

.micro-review__rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.micro-review__rating-star {
  display: inline-flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: rgba(17, 24, 39, .18);
  cursor: pointer;
  padding: 0;
  transition: color .18s ease, transform .18s ease;
}

.micro-review__rating-star:hover,
.micro-review__rating-star_active {
  color: #ffb23f;
}

.micro-review__rating-star:hover {
  transform: translateY(-1px) scale(1.06);
}

.micro-review__rating-star svg {
  width: 26px;
  height: 26px;
  fill: currentColor;
  filter: drop-shadow(0 4px 8px rgba(255, 178, 63, .22));
}

.micro-review__rating-text {
  margin-left: auto;
  color: rgba(17, 24, 39, .56) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  white-space: nowrap;
}

.micro-review__upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.micro-review__upload {
  position: relative;
  display: flex;
  min-height: 152px;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  border: 1px dashed rgba(242, 67, 145, .48);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(242, 67, 145, .10), rgba(255, 255, 255, .86));
  padding: 18px 18px 18px 92px;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}

.micro-review__upload:hover {
  transform: translateY(-1px);
  border-color: var(--micro-primary);
  box-shadow: 0 18px 38px rgba(242, 67, 145, .14);
}

.micro-review__upload::after {
  content: '+';
  position: absolute;
  right: 16px;
  top: 10px;
  color: rgba(242, 67, 145, .72);
  font-size: 34px;
  font-weight: 300;
}

.micro-review__upload_video {
  background: linear-gradient(135deg, rgba(242, 67, 145, .08), rgba(255, 247, 241, .96));
}

.micro-review__upload-bg {
    position: absolute;
    right: -7px;
    bottom: -14px;
    width: 114px;
    height: 114px;
    color: rgba(242, 67, 145, .09);
    pointer-events: none;
}

.micro-review__upload-bg svg {
  width: 100%;
  height: 100%;
}

.micro-review__upload-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
  color: #fff;
  box-shadow: 0 14px 30px rgba(242, 67, 145, .24);
  transform: translateY(-50%);
}

.micro-review__upload-icon svg {
  width: 28px;
  height: 28px;
}

.micro-review__upload-title {
  color: #111827;
  font-size: 18px;
  font-weight: 600;
}

.micro-review__upload-text {
margin-top: 6px;
    max-width: 129px;
    color: rgb(17 24 39 / 63%);
    font-size: 13px;
    line-height: 1.35;
}

.micro-review__upload-action {
  display: inline-flex;
  width: fit-content;
  margin-top: 12px;
  border-radius: 999px;
  background: rgba(242, 67, 145, .12);
  padding: 6px 10px;
  color: var(--micro-primary-dark);
  font-size: 12px;
  font-weight: 500;
}

.micro-review__upload input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.micro-review__files {
  border-radius: 16px;
  background: rgba(242, 67, 145, .08);
  padding: 12px 14px;
  color: rgba(17, 24, 39, .70);
  font-size: 13px;
  line-height: 1.45;
}

.micro-review__reward {
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(242, 67, 145, .12), rgba(242, 67, 145, .06));
  padding: 14px 16px;
  color: #111827;
  font-size: 15px;
  font-weight: 500;
}

.micro-review__promo {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px 12px;
  align-items: center;
  border: 1px solid rgba(242, 67, 145, .20);
  border-radius: 20px;
  background:
    radial-gradient(circle at 12% 0%, rgba(242, 67, 145, .14), transparent 34%),
    linear-gradient(135deg, rgba(255, 247, 241, .96), rgba(255, 255, 255, .94));
  padding: 16px;
  box-shadow: 0 16px 34px rgba(242, 67, 145, .10);
}

.micro-review__promo-label,
.micro-review__promo small {
  grid-column: 1 / -1;
}

.micro-review__promo-label {
  color: rgba(17, 24, 39, .58);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.micro-review__promo strong {
  min-width: 0;
  color: #493768;
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 850;
  letter-spacing: .08em;
  line-height: 1;
  overflow-wrap: anywhere;
}

.micro-review__promo button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.micro-review__promo small {
  color: rgba(17, 24, 39, .58);
  font-size: 13px;
  line-height: 1.35;
}

.micro-review__error,
.micro-review__success {
  border-radius: 16px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.4;
}

.micro-review__error {
  background: rgba(239, 68, 68, .10);
  color: #b91c1c;
}

.micro-review__success {
  background: rgba(34, 197, 94, .12);
  color: #166534;
}

.micro-review__submit {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--micro-primary) 0%, var(--micro-primary-end) 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  box-shadow: 0 16px 36px rgba(242, 67, 145, .25);
}

.micro-review__submit:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--micro-primary-dark) 0%, var(--micro-primary-end) 100%);
  transform: translateY(-1px);
  box-shadow: 0 20px 42px rgba(242, 67, 145, .32);
}

.micro-review__submit:disabled {
  cursor: wait;
  opacity: .68;
}

@media (max-width: 640px) {
  .micro-review__form,
  .micro-review__upload-grid {
    grid-template-columns: 1fr;
  }

  .micro-review__upload {
    min-height: 132px;
    padding-left: 82px;
  }

  .micro-review__select-menu {
    max-height: 240px;
  }

  .micro-review__select-copy strong,
  .micro-review__select-option span:last-child {
    font-size: 14px;
  }

  .micro-review__rating {
    justify-content: space-between;
  }

  .micro-review__rating-star {
    width: 28px;
    height: 28px;
  }

  .micro-review__rating-star svg {
    width: 24px;
    height: 24px;
  }
}
</style>
