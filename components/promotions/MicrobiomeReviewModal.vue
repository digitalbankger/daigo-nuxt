<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import UiModal from "~/components/ui/UiModal.vue";
import { useAuthStore } from "~/stores/authStore";
import { useUserStore } from "~/stores/userStore";

type ProductOption = {
  product_id?: number | string;
  slug: string;
  name: string;
  image?: string;
};

type UploadPreview = {
  id: string;
  file: File;
  name: string;
  size: string;
  url: string;
  type: "photo" | "video";
};

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  "update:show": [value: boolean];
}>();

const authStore = useAuthStore();
const userStore = useUserStore();
const route = useRoute();

const fallbackProducts: ProductOption[] = [
  { slug: "lux-daigo-metabiotik", name: "Метабиотик для кишечника Daigo Lux" },
  { slug: "tamotsu", name: "Tamotsu" },
  { slug: "daigo-dent", name: "Daigo Dent" },
];

const isLoadingProducts = ref(false);
const productsLoaded = ref(false);
const products = ref<ProductOption[]>(fallbackProducts);

const productSlug = ref(fallbackProducts[0]?.slug || "");
const author = ref("");
const rating = ref(5);
const title = ref("");
const text = ref("");
const photos = ref<File[]>([]);
const videos = ref<File[]>([]);
const photoPreviews = ref<UploadPreview[]>([]);
const videoPreviews = ref<UploadPreview[]>([]);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const isProductDropdownOpen = ref(false);
const productDropdownRef = ref<HTMLElement | null>(null);
const reward = ref<{ code: string; already_issued: boolean } | null>(null);
const copied = ref(false);

const selectedProduct = computed(
  () =>
    products.value.find((item) => item.slug === productSlug.value) ||
    products.value[0],
);
const selectedProductName = computed(
  () => selectedProduct.value?.name || "Выберите товар",
);
const hasVideo = computed(() => videos.value.length > 0);
const hasPhoto = computed(() => photos.value.length > 0);
// const rewardText = computed(() => {
//   if (hasVideo.value)
//     return "Видеоотзыв выбран: после отправки откроем Ваш подарок.";
//   if (hasPhoto.value)
//     return "Фотоотзыв выбран: после отправки откроем Ваш подарок.";
//   return "Добавьте фото или видео — после отправки ";
// });

function authHeaders() {
  const headers: Record<string, string> = {};
  if (authStore.token) headers.Authorization = `Bearer ${authStore.token}`;
  return headers;
}

function getDaigoId() {
  return authStore.userId ? Number(authStore.userId) : null;
}

async function ensureAuthenticated() {
  if (authStore.isAuthenticated && getDaigoId()) return true;

  errorMessage.value = "Чтобы отправить отзыв, сначала авторизуйтесь.";
  authStore.openAuth(route.fullPath);
  return false;
}

async function prefillAuthorFromProfile() {
  if (!authStore.isAuthenticated || author.value.trim()) return;

  try {
    await userStore.loadProfile();
    const profile = userStore.profile;
    const fullName = [profile?.first_name, profile?.last_name]
      .map((part) => String(part || "").trim())
      .filter(Boolean)
      .join(" ");

    if (fullName) author.value = fullName;
  } catch (error) {
    console.warn("[microbiome-review] profile prefill failed", error);
  }
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Б";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} МБ`;
}

function revokePreviews(items: UploadPreview[]) {
  if (!import.meta.client) return;
  items.forEach((item) => URL.revokeObjectURL(item.url));
}

function buildPreviews(files: File[], type: "photo" | "video") {
  if (!import.meta.client) return [];

  return files.map((file, index) => ({
    id: `${type}-${file.name}-${file.size}-${file.lastModified}-${index}`,
    file,
    name: file.name,
    size: formatFileSize(file.size),
    url: URL.createObjectURL(file),
    type,
  }));
}

function refreshPhotoPreviews(files: File[]) {
  revokePreviews(photoPreviews.value);
  photoPreviews.value = buildPreviews(files, "photo");
}

function refreshVideoPreviews(files: File[]) {
  revokePreviews(videoPreviews.value);
  videoPreviews.value = buildPreviews(files, "video");
}

function removeUploadedFile(type: "photo" | "video", index: number) {
  if (type === "photo") {
    photos.value = photos.value.filter((_, itemIndex) => itemIndex !== index);
    refreshPhotoPreviews(photos.value);
    return;
  }

  videos.value = videos.value.filter((_, itemIndex) => itemIndex !== index);
  refreshVideoPreviews(videos.value);
}

function closeProductDropdown() {
  isProductDropdownOpen.value = false;
}

function toggleProductDropdown() {
  if (isLoadingProducts.value) return;
  isProductDropdownOpen.value = !isProductDropdownOpen.value;
}

function selectProduct(slug: string) {
  productSlug.value = slug;
  closeProductDropdown();
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!isProductDropdownOpen.value) return;

  const target = event.target as Node | null;
  if (target && productDropdownRef.value?.contains(target)) return;

  closeProductDropdown();
}

function setRating(value: number) {
  rating.value = Math.min(5, Math.max(1, value));
}

function close() {
  closeProductDropdown();
  emit("update:show", false);
  setTimeout(resetForm, 220);
}

function resetFields() {
  author.value = "";
  rating.value = 5;
  title.value = "";
  text.value = "";
  revokePreviews(photoPreviews.value);
  revokePreviews(videoPreviews.value);
  photos.value = [];
  videos.value = [];
  photoPreviews.value = [];
  videoPreviews.value = [];
}

function resetForm() {
  closeProductDropdown();
  resetFields();
  errorMessage.value = "";
  successMessage.value = "";
}

async function loadProducts() {
  if (productsLoaded.value || isLoadingProducts.value) return;

  isLoadingProducts.value = true;

  try {
    const response = await $fetch<{ items?: any[] }>("/api/shop/products", {
      query: {
        page: 1,
        page_size: 100,
        no_total: "1",
      },
    });

    const items = Array.isArray(response?.items)
      ? response.items
          .map((item: any) => ({
            product_id: item.product_id ?? item.id,
            slug: String(item.slug || "").trim(),
            name: String(item.name || item.title || item.slug || "").trim(),
            image: item.image,
          }))
          .filter((item: ProductOption) => item.slug && item.name)
      : [];

    if (items.length) {
      products.value = items;
      if (!items.some((item) => item.slug === productSlug.value)) {
        productSlug.value = items[0].slug;
      }
    }
  } catch (error) {
    console.warn("[microbiome-review] products load failed", error);
    products.value = fallbackProducts;
    productSlug.value = fallbackProducts[0]?.slug || "";
  } finally {
    productsLoaded.value = true;
    isLoadingProducts.value = false;
  }
}

const MAX_PHOTOS = 5;
const MAX_VIDEOS = 2;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

function onPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = "";

  if (files.length > MAX_PHOTOS) {
    errorMessage.value = `Можно прикрепить не более ${MAX_PHOTOS} фотографий.`;
    return;
  }
  const oversized = files.find((f) => f.size > MAX_PHOTO_BYTES);
  if (oversized) {
    errorMessage.value = `Файл «${oversized.name}» превышает 10 МБ.`;
    return;
  }

  photos.value = files;
  refreshPhotoPreviews(photos.value);
  reward.value = null;
  successMessage.value = "";
  errorMessage.value = "";
}

function onVideoChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = "";

  if (files.length > MAX_VIDEOS) {
    errorMessage.value = `Можно прикрепить не более ${MAX_VIDEOS} видео.`;
    return;
  }
  const oversized = files.find((f) => f.size > MAX_VIDEO_BYTES);
  if (oversized) {
    errorMessage.value = `Файл «${oversized.name}» превышает 50 МБ.`;
    return;
  }

  videos.value = files;
  refreshVideoPreviews(videos.value);
  reward.value = null;
  successMessage.value = "";
  errorMessage.value = "";
}

function appendFiles(formData: FormData, fieldName: string, files: File[]) {
  files.forEach((file) => {
    formData.append(fieldName, file, file.name);
  });
}

async function submitReview() {
  if (isSubmitting.value) return;

  errorMessage.value = "";
  successMessage.value = "";
  reward.value = null;
  copied.value = false;

  const daigoId = getDaigoId();

  if (!(await ensureAuthenticated())) return;

  if (!daigoId) {
    errorMessage.value =
      "Не удалось определить пользователя. Обновите страницу и авторизуйтесь ещё раз.";
    return;
  }

  if (!productSlug.value) {
    errorMessage.value = "Выберите товар, о котором оставляете отзыв.";
    return;
  }

  if (!author.value.trim()) {
    errorMessage.value = "Укажите имя автора отзыва.";
    return;
  }

  if (text.value.trim().length < 10) {
    errorMessage.value = "Напишите отзыв подробнее: минимум 10 символов.";
    return;
  }

  // if (!photos.value.length && !videos.value.length) {
  //   errorMessage.value = "Для участия в акции прикрепите фото или видео.";
  //   return;
  // }

  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append("author", author.value.trim());
    formData.append("rating", String(rating.value));
    formData.append(
      "title",
      title.value.trim() || `Отзыв о ${selectedProduct.value?.name || "Daigo"}`,
    );
    formData.append("text", text.value.trim());
    appendFiles(formData, "photos", photos.value);
    appendFiles(formData, "videos", videos.value);

    const rewardResponse = await $fetch(
      `/api/shop/reviews/${encodeURIComponent(productSlug.value)}`,
      {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      },
    );

    resetFields();
    successMessage.value = rewardResponse.already_issued
      ? "Отзыв отправлен"
      : "Спасибо! ";
  } catch (error: any) {
    errorMessage.value =
      error?.data?.message ||
      error?.data?.statusMessage ||
      error?.statusMessage ||
      error?.message ||
      "Не удалось отправить отзыв. Попробуйте еще раз.";
  } finally {
    isSubmitting.value = false;
  }
}

watch(
  () => props.show,
  async (value) => {
    if (!value) return;
    await loadProducts();
    await prefillAuthorFromProfile();
  },
  { immediate: true },
);

watch(
  () => authStore.isAuthenticated,
  async (value) => {
    if (value && props.show) {
      errorMessage.value = "";
      await prefillAuthorFromProfile();
    }
  },
);

watch(isProductDropdownOpen, (value) => {
  if (!import.meta.client) return;

  if (value) {
    document.addEventListener("pointerdown", onDocumentPointerDown);
  } else {
    document.removeEventListener("pointerdown", onDocumentPointerDown);
  }
});

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.removeEventListener("pointerdown", onDocumentPointerDown);
});
</script>

<template>
  <UiModal
    :show="show"
    :closable="false"
    panel-class="micro-review-modal-panel z-[2147483300]"
    @close="close"
  >
    <section
      class="micro-review"
      aria-label="Форма отзыва ко Дню микробиома"
      @wheel.stop
      @touchmove.stop
    >
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
        <h2>Ваш отзыв — это подарок для</h2>
        <p>
          Выберите продукт, приложите фото или видео и расскажите о своём опыте.
        </p>
      </div>

      <form class="micro-review__form" @submit.prevent="submitReview">
        <div
          ref="productDropdownRef"
          class="micro-review__field micro-review__field_full"
        >
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
                  />
                  <span v-else>{{ selectedProductName.charAt(0) }}</span>
                </span>

                <span class="micro-review__select-copy">
                  <strong>{{
                    isLoadingProducts
                      ? "Загружаем товары..."
                      : selectedProductName
                  }}</strong>
                  <small>Выберите продукт из каталога</small>
                </span>
              </span>

              <svg
                class="micro-review__select-arrow"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
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
              <div
                v-if="isProductDropdownOpen"
                class="micro-review__select-menu"
                role="listbox"
                @wheel.stop
                @touchmove.stop
              >
                <button
                  v-for="product in products"
                  :key="product.slug"
                  type="button"
                  class="micro-review__select-option"
                  :class="{
                    'micro-review__select-option_active':
                      product.slug === productSlug,
                  }"
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
                    />
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
          <input
            v-model.trim="author"
            type="text"
            placeholder="Например, Мария"
            autocomplete="name"
          />
        </label>

        <div class="micro-review__field">
          <span>Оценка</span>
          <div
            class="micro-review__rating"
            role="radiogroup"
            aria-label="Оценка отзыва"
          >
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
                  <path
                    d="M12 2.6l2.86 5.8 6.4.93-4.63 4.52 1.1 6.37L12 17.2l-5.73 3.02 1.1-6.37-4.63-4.52 6.4-.93L12 2.6z"
                  />
                </svg>
              </button>
            </div>
            <span class="micro-review__rating-text">{{ rating }} из 5</span>
          </div>
        </div>

        <label class="micro-review__field micro-review__field_full">
          <span>Заголовок</span>
          <input
            v-model.trim="title"
            type="text"
            placeholder="Коротко о впечатлении"
          />
        </label>

        <label class="micro-review__field micro-review__field_full">
          <span>Текст отзыва</span>
          <textarea
            v-model.trim="text"
            rows="5"
            placeholder="Расскажите, какой продукт использовали и что вам понравилось"
          />
        </label>

        <div class="micro-review__upload-grid micro-review__field_full">
          <label class="micro-review__upload micro-review__upload_photo">
            <span class="micro-review__upload-bg" aria-hidden="true">
              <svg viewBox="0 0 72 72" fill="none">
                <rect
                  x="10"
                  y="19"
                  width="52"
                  height="38"
                  rx="10"
                  stroke="currentColor"
                  stroke-width="5"
                />
                <path
                  d="M22 20l5-8h18l5 8"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="36"
                  cy="38"
                  r="10"
                  stroke="currentColor"
                  stroke-width="5"
                />
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
                <circle
                  cx="14"
                  cy="15.6"
                  r="4.1"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </span>
            <span class="micro-review__upload-title">Фото</span>
            <span class="micro-review__upload-text"
              >Галерея или камера смартфона</span
            >
            <span class="micro-review__upload-action">Выбрать фото</span>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="onPhotoChange"
            />
          </label>

          <label class="micro-review__upload micro-review__upload_video">
            <span class="micro-review__upload-bg" aria-hidden="true">
              <svg viewBox="0 0 72 72" fill="none">
                <rect
                  x="10"
                  y="20"
                  width="36"
                  height="32"
                  rx="9"
                  stroke="currentColor"
                  stroke-width="5"
                />
                <path
                  d="M46 31l15-8v26l-15-8"
                  stroke="currentColor"
                  stroke-width="5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
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
            <span class="micro-review__upload-text"
              >Короткий живой отзыв с продуктом</span
            >
            <span class="micro-review__upload-action">Выбрать видео</span>
            <input
              type="file"
              accept="video/*"
              multiple
              @change="onVideoChange"
            />
          </label>
        </div>

        <div
          v-if="photoPreviews.length || videoPreviews.length"
          class="micro-review__files micro-review__field_full"
        >
          <div
            v-if="photoPreviews.length"
            class="micro-review__preview-section"
          >
            <p>Загруженные фото</p>
            <div class="micro-review__preview-grid">
              <article
                v-for="(item, index) in photoPreviews"
                :key="item.id"
                class="micro-review__preview-card"
              >
                <img :src="item.url" :alt="item.name" loading="lazy" />
                <button
                  type="button"
                  aria-label="Удалить фото"
                  @click="removeUploadedFile('photo', index)"
                >
                  ×
                </button>
                <span>{{ item.name }}</span>
                <small>{{ item.size }}</small>
              </article>
            </div>
          </div>

          <div
            v-if="videoPreviews.length"
            class="micro-review__preview-section"
          >
            <p>Загруженные видео</p>
            <div class="micro-review__preview-grid">
              <article
                v-for="(item, index) in videoPreviews"
                :key="item.id"
                class="micro-review__preview-card micro-review__preview-card_video"
              >
                <video :src="item.url" muted playsinline preload="metadata" />
                <button
                  type="button"
                  aria-label="Удалить видео"
                  @click="removeUploadedFile('video', index)"
                >
                  ×
                </button>
                <span>{{ item.name }}</span>
                <small>{{ item.size }}</small>
              </article>
            </div>
          </div>
        </div>

        <!-- <div class="micro-review__reward micro-review__field_full"> -->
        <!--   {{ rewardText }} -->
        <!-- </div> -->

        <p
          v-if="errorMessage"
          class="micro-review__error micro-review__field_full"
        >
          {{ errorMessage }}
        </p>
        <p
          v-if="successMessage"
          class="micro-review__success micro-review__field_full"
        >
          {{ successMessage }}
        </p>

        <!-- <div -->
        <!--   v-if="reward?.code" -->
        <!--   class="micro-review__promo micro-review__field_full" -->
        <!-- > -->
        <!--   <span class="micro-review__promo-label">Ваш промокод</span> -->
        <!--   <strong>{{ reward.code }}</strong> -->
        <!--   <button type="button" @click="copyRewardCode"> -->
        <!--     {{ copied ? "Скопировано" : "Скопировать" }} -->
        <!--   </button> -->
        <!--   <small v-if="reward.already_issued" -->
        <!--     >Промокод уже был выдан ранее за другой отзыв.</small -->
        <!--   > -->
        <!--   <small v-else>Сохраните промокод и примените его в корзине.</small> -->
        <!-- </div> -->

        <button
          class="micro-review__submit micro-review__field_full"
          type="submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? "Отправляем..." : "Отправить отзыв" }}
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
  --micro-primary-soft: rgba(242, 67, 145, 0.12);
  position: relative;
  box-sizing: border-box;
  max-height: min(92vh, 920px);
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable;
  padding: clamp(22px, 4vw, 38px);
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(242, 67, 145, 0.18),
      transparent 28%
    ),
    radial-gradient(
      circle at 92% 12%,
      rgba(242, 67, 145, 0.1),
      transparent 30%
    ),
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
  background: rgba(242, 67, 145, 0.12);
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
  font-size: 12px !important;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.micro-review__head h2 {
  margin: 0 0 10px;
  color: #111827;
  font-size: clamp(24px, 5vw, 46px);
  font-weight: 500;
  line-height: 1.04;
}

.micro-review__head p {
  color: rgba(17, 24, 39, 0.68);
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
  color: rgba(17, 24, 39, 0.74);
  font-size: 13px;
  font-weight: 600;
}

.micro-review__field input,
.micro-review__field select,
.micro-review__field textarea {
  width: 100%;
  border: 1px solid rgba(242, 67, 145, 0.26);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 13px 15px;
  color: #111827;
  font-size: 15px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.micro-review__field textarea {
  resize: vertical;
}

.micro-review__field input:focus,
.micro-review__field select:focus,
.micro-review__field textarea:focus {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, 0.14);
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
  border: 1px solid rgba(242, 67, 145, 0.26);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 13px;
  color: #111827;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.micro-review__select-button:hover,
.micro-review__select_open .micro-review__select-button,
.micro-review__select-button:focus-visible {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, 0.14);
}

.micro-review__select-button:disabled {
  cursor: wait;
  opacity: 0.72;
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
    radial-gradient(
      circle at 30% 20%,
      rgba(255, 255, 255, 0.96),
      rgba(255, 255, 255, 0.38) 42%,
      transparent 60%
    ),
    linear-gradient(135deg, rgba(242, 67, 145, 0.18), rgba(255, 133, 80, 0.18));
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
}

.micro-review__select-copy small {
  color: rgba(17, 24, 39, 0.5);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.micro-review__select-arrow {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
  color: rgba(17, 24, 39, 0.48);
  transition:
    transform 0.2s ease,
    color 0.2s ease;
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
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  border: 1px solid rgba(242, 67, 145, 0.18);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  padding: 7px;
  box-shadow: 0 22px 48px rgba(93, 52, 105, 0.16);
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
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.micro-review__select-option:hover,
.micro-review__select-option_active {
  background: linear-gradient(
    135deg,
    rgba(242, 67, 145, 0.12),
    rgba(255, 133, 80, 0.08)
  );
}

.micro-review__select-option_active span:last-child {
  color: var(--micro-primary-dark);
}

.micro-review-select-enter-active,
.micro-review-select-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
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
  border: 1px solid rgba(242, 67, 145, 0.26);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.micro-review__rating:focus-within {
  border-color: var(--micro-primary);
  box-shadow: 0 0 0 4px rgba(242, 67, 145, 0.14);
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
  color: rgba(17, 24, 39, 0.18);
  cursor: pointer;
  padding: 0;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
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
  filter: drop-shadow(0 4px 8px rgba(255, 178, 63, 0.22));
}

.micro-review__rating-text {
  margin-left: auto;
  color: rgba(17, 24, 39, 0.56) !important;
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
  border: 1px dashed rgba(242, 67, 145, 0.48);
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(242, 67, 145, 0.1),
    rgba(255, 255, 255, 0.86)
  );
  padding: 18px 18px 18px 92px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.micro-review__upload:hover {
  transform: translateY(-1px);
  border-color: var(--micro-primary);
  box-shadow: 0 18px 38px rgba(242, 67, 145, 0.14);
}

.micro-review__upload::after {
  content: "+";
  position: absolute;
  right: 16px;
  top: 10px;
  color: rgba(242, 67, 145, 0.72);
  font-size: 34px;
  font-weight: 300;
}

.micro-review__upload_video {
  background: linear-gradient(
    135deg,
    rgba(242, 67, 145, 0.08),
    rgba(255, 247, 241, 0.96)
  );
}

.micro-review__upload-bg {
  position: absolute;
  right: -7px;
  bottom: -14px;
  width: 114px;
  height: 114px;
  color: rgba(242, 67, 145, 0.09);
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
  background: linear-gradient(
    135deg,
    var(--micro-primary) 0%,
    var(--micro-primary-end) 100%
  );
  color: #fff;
  box-shadow: 0 14px 30px rgba(242, 67, 145, 0.24);
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
  background: rgba(242, 67, 145, 0.12);
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
  display: grid;
  gap: 14px;
  border-radius: 18px;
  background: rgba(242, 67, 145, 0.08);
  padding: 14px;
  color: rgba(17, 24, 39, 0.7);
  font-size: 13px;
  line-height: 1.45;
}

.micro-review__preview-section {
  display: grid;
  gap: 10px;
}

.micro-review__preview-section p {
  margin: 0;
  color: rgba(17, 24, 39, 0.7);
  font-size: 13px;
  font-weight: 700;
}

.micro-review__preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
  gap: 10px;
}

.micro-review__preview-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(242, 67, 145, 0.16);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 26px rgba(93, 52, 105, 0.08);
}

.micro-review__preview-card img,
.micro-review__preview-card video {
  display: block;
  width: 100%;
  height: 92px;
  background: rgba(255, 255, 255, 0.72);
  object-fit: cover;
}

.micro-review__preview-card_video::before {
  content: "▶";
  position: absolute;
  left: 50%;
  top: 46px;
  z-index: 1;
  display: inline-flex;
  width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: var(--micro-primary-dark);
  font-size: 13px;
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.14);
  transform: translate(-50%, -50%);
}

.micro-review__preview-card button {
  position: absolute;
  right: 7px;
  top: 7px;
  z-index: 2;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.7);
  color: #fff;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}

.micro-review__preview-card span,
.micro-review__preview-card small {
  display: block;
  overflow: hidden;
  padding: 0 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.micro-review__preview-card span {
  margin-top: 9px;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.micro-review__preview-card small {
  margin: 2px 0 10px;
  color: rgba(17, 24, 39, 0.5);
  font-size: 11px;
  font-weight: 600;
}

.micro-review__reward {
  border-radius: 18px;
  background: linear-gradient(
    135deg,
    rgba(242, 67, 145, 0.12),
    rgba(242, 67, 145, 0.06)
  );
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
  border: 1px solid rgba(242, 67, 145, 0.2);
  border-radius: 20px;
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(242, 67, 145, 0.14),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      rgba(255, 247, 241, 0.96),
      rgba(255, 255, 255, 0.94)
    );
  padding: 16px;
  box-shadow: 0 16px 34px rgba(242, 67, 145, 0.1);
}

.micro-review__promo-label,
.micro-review__promo small {
  grid-column: 1 / -1;
}

.micro-review__promo-label {
  color: rgba(17, 24, 39, 0.58);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.micro-review__promo strong {
  min-width: 0;
  color: #493768;
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 850;
  letter-spacing: 0.08em;
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
  background: linear-gradient(
    135deg,
    var(--micro-primary) 0%,
    var(--micro-primary-end) 100%
  );
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.micro-review__promo small {
  color: rgba(17, 24, 39, 0.58);
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
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
}

.micro-review__success {
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
}

.micro-review__submit {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    var(--micro-primary) 0%,
    var(--micro-primary-end) 100%
  );
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  box-shadow: 0 16px 36px rgba(242, 67, 145, 0.25);
}

.micro-review__submit:hover:not(:disabled) {
  background: linear-gradient(
    135deg,
    var(--micro-primary-dark) 0%,
    var(--micro-primary-end) 100%
  );
  transform: translateY(-1px);
  box-shadow: 0 20px 42px rgba(242, 67, 145, 0.32);
}

.micro-review__submit:disabled {
  cursor: wait;
  opacity: 0.68;
}

@media (max-width: 640px) {
  :global(.micro-review-modal-panel),
  .micro-review {
    max-height: calc(100vh - 24px);
  }

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
