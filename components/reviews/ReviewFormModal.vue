<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import UiModal from '@/components/ui/UiModal.vue'

type ProductOption = {
  id?: string | number
  product_id?: string | number
  slug?: string
  title?: string
  name?: string
  image?: string
}

type UploadPreview = {
  id: string
  name: string
  size: string
  url: string
  type: 'photo' | 'video'
}

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  products?: ProductOption[]
  fixedProduct?: ProductOption | null
  submitting?: boolean
  error?: string
}>(), {
  title: 'Оставить отзыв',
  products: () => [],
  fixedProduct: null,
  submitting: false,
  error: '',
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: {
    author: string
    rating: number
    title: string
    text: string
    product: ProductOption | null
    photos: File[]
    videos: File[]
    formData: FormData
  }): void
}>()

const MAX_PHOTOS = 5
const MAX_VIDEOS = 2
const MAX_PHOTO_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

const form = ref({ author: '', rating: 5, title: '', text: '', productKey: '' })
const photos = ref<File[]>([])
const videos = ref<File[]>([])
const photoPreviews = ref<UploadPreview[]>([])
const videoPreviews = ref<UploadPreview[]>([])
const localErrors = ref<{ author?: string; text?: string; product?: string; files?: string }>({})
const sent = ref(false)

const normalizedProducts = computed(() => props.products || [])
const hasProductSelect = computed(() => !props.fixedProduct && normalizedProducts.value.length > 0)

const productKey = (p: ProductOption) => String(p.slug || p.product_id || p.id || p.title || p.name || '')
const productTitle = (p?: ProductOption | null) => String(p?.title || p?.name || p?.slug || 'Товар')

const selectedProduct = computed<ProductOption | null>(() => {
  if (props.fixedProduct) return props.fixedProduct
  if (!form.value.productKey) return null
  return normalizedProducts.value.find(p => productKey(p) === form.value.productKey) || null
})

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 Б'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} МБ`
}

function revokePreviews(items: UploadPreview[]) {
  if (!import.meta.client) return
  items.forEach(item => URL.revokeObjectURL(item.url))
}

function buildPreviews(files: File[], type: 'photo' | 'video') {
  if (!import.meta.client) return []
  return files.map((file, index) => ({
    id: `${type}-${file.name}-${file.size}-${file.lastModified}-${index}`,
    name: file.name,
    size: formatFileSize(file.size),
    url: URL.createObjectURL(file),
    type,
  }))
}

function refreshPhotoPreviews(files: File[]) {
  revokePreviews(photoPreviews.value)
  photoPreviews.value = buildPreviews(files, 'photo')
}

function refreshVideoPreviews(files: File[]) {
  revokePreviews(videoPreviews.value)
  videoPreviews.value = buildPreviews(files, 'video')
}

function resetFiles() {
  revokePreviews(photoPreviews.value)
  revokePreviews(videoPreviews.value)
  photos.value = []
  videos.value = []
  photoPreviews.value = []
  videoPreviews.value = []
}

function onPhotoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''

  if (files.length > MAX_PHOTOS) {
    localErrors.value = { ...localErrors.value, files: `Можно прикрепить не более ${MAX_PHOTOS} фотографий.` }
    return
  }
  const oversized = files.find(file => file.size > MAX_PHOTO_BYTES)
  if (oversized) {
    localErrors.value = { ...localErrors.value, files: `Фото «${oversized.name}» превышает 10 МБ.` }
    return
  }

  photos.value = files
  refreshPhotoPreviews(files)
  localErrors.value = { ...localErrors.value, files: '' }
}

function onVideoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''

  if (files.length > MAX_VIDEOS) {
    localErrors.value = { ...localErrors.value, files: `Можно прикрепить не более ${MAX_VIDEOS} видео.` }
    return
  }
  const oversized = files.find(file => file.size > MAX_VIDEO_BYTES)
  if (oversized) {
    localErrors.value = { ...localErrors.value, files: `Видео «${oversized.name}» превышает 50 МБ.` }
    return
  }

  videos.value = files
  refreshVideoPreviews(files)
  localErrors.value = { ...localErrors.value, files: '' }
}

function removeUploadedFile(type: 'photo' | 'video', index: number) {
  if (type === 'photo') {
    photos.value = photos.value.filter((_, i) => i !== index)
    refreshPhotoPreviews(photos.value)
    return
  }
  videos.value = videos.value.filter((_, i) => i !== index)
  refreshVideoPreviews(videos.value)
}

watch(() => props.show, (value) => {
  if (!value) return
  sent.value = false
  localErrors.value = {}
  resetFiles()
  form.value = {
    author: '',
    rating: 5,
    title: '',
    text: '',
    productKey: props.fixedProduct ? productKey(props.fixedProduct) : '',
  }
})

function appendFiles(formData: FormData, fieldName: string, files: File[]) {
  files.forEach(file => formData.append(fieldName, file, file.name))
}

function submit() {
  const e: typeof localErrors.value = {}
  if (!form.value.author.trim()) e.author = 'Введите имя'
  if (form.value.text.trim().length < 10) e.text = 'Минимум 10 символов'
  if (!selectedProduct.value) e.product = 'Выберите товар'
  localErrors.value = e
  if (Object.keys(e).length) return

  const product = selectedProduct.value
  const productName = productTitle(product)
  const formData = new FormData()
  formData.append('author', form.value.author.trim())
  formData.append('rating', String(Number(form.value.rating) || 5))
  formData.append('title', form.value.title.trim() || `Отзыв о ${productName}`)
  formData.append('text', form.value.text.trim())
  if (product?.product_id || product?.id) formData.append('product_id', String(product.product_id || product.id))
  if (product?.slug) formData.append('product_slug', String(product.slug))
  appendFiles(formData, 'photos', photos.value)
  appendFiles(formData, 'videos', videos.value)

  emit('submit', {
    author: form.value.author.trim(),
    rating: Number(form.value.rating) || 5,
    title: form.value.title.trim(),
    text: form.value.text.trim(),
    product,
    photos: photos.value,
    videos: videos.value,
    formData,
  })
}

onBeforeUnmount(resetFiles)
defineExpose({ markSent: () => { sent.value = true; resetFiles() } })
</script>

<template>
  <UiModal :show="show" @close="emit('close')" :panelClass="'sm:max-w-2xl p-0 overflow-hidden'">
    <div class="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
      <div class="text-lg font-medium">{{ title }}</div>
      <button type="button" class="text-sm text-[#6B7280] hover:text-[#111]" @click="emit('close')">Закрыть</button>
    </div>

    <div class="p-5 max-h-[80vh] overflow-y-auto">
      <div v-if="sent" class="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <div class="text-lg font-semibold mb-2">Отзыв отправлен</div>
        <p class="text-sm text-[#6B7280]">После модерации он появится на сайте.</p>
        <button type="button" class="mt-5 h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition" @click="emit('close')">
          Понятно
        </button>
      </div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <div v-if="fixedProduct" class="rounded-xl bg-[#F7F7F7] px-4 py-3 text-sm">
          Товар: <span class="font-medium">{{ productTitle(fixedProduct) }}</span>
        </div>

        <div v-else-if="hasProductSelect">
          <label class="block text-sm font-medium mb-1">Товар</label>
          <select v-model="form.productKey" class="w-full h-11 rounded-lg border border-[#E5E7EB] bg-white px-3 outline-none focus:border-[#111] transition">
            <option value="">Выберите товар</option>
            <option v-for="p in normalizedProducts" :key="productKey(p)" :value="productKey(p)">{{ productTitle(p) }}</option>
          </select>
          <div v-if="localErrors.product" class="mt-1 text-xs text-red-600">{{ localErrors.product }}</div>
        </div>

        <div v-else class="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Не удалось загрузить список товаров. Обновите страницу и попробуйте ещё раз.
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Ваше имя</label>
          <input v-model="form.author" type="text" class="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 outline-none focus:border-[#111] transition" placeholder="Например: Татьяна" />
          <div v-if="localErrors.author" class="mt-1 text-xs text-red-600">{{ localErrors.author }}</div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Оценка</label>
          <div class="flex items-center gap-2">
            <button v-for="i in 5" :key="i" type="button" class="h-10 w-10 rounded-lg border border-[#E5E7EB] grid place-items-center transition" :class="i <= form.rating ? 'bg-[#FFF7E0] border-[#e3c97b]' : 'bg-white'" @click="form.rating = i">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" :class="i <= form.rating ? 'text-[#e3c97b]' : 'text-[#E5E7EB]'">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.159c.969 0 1.371 1.24.588 1.81l-3.366 2.447a1 1 0 00-.363 1.118l1.286 3.957c.3.921-.755 1.688-1.539 1.118L10.59 15.77a1 1 0 00-1.176 0L6.943 17.999c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.96 9.384c-.783-.57-.38-1.81.588-1.81h4.159a1 1 0 00.95-.69l1.286-3.957z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Заголовок</label>
          <input v-model="form.title" type="text" class="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 outline-none focus:border-[#111] transition" placeholder="Коротко о главном" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Текст отзыва</label>
          <textarea v-model="form.text" rows="6" class="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 outline-none focus:border-[#111] transition resize-none" placeholder="Поделитесь вашим опытом…" />
          <div v-if="localErrors.text" class="mt-1 text-xs text-red-600">{{ localErrors.text }}</div>
        </div>

        <div class="space-y-3">
          <div class="text-sm font-medium">Фото или видео <span class="text-[#6B7280] font-normal">необязательно</span></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="cursor-pointer rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm hover:border-primary transition">
              <span class="font-medium">Добавить фото</span>
              <span class="block mt-1 text-xs text-[#6B7280]">до 5 файлов, каждый до 10 МБ</span>
              <input type="file" accept="image/*" multiple class="hidden" @change="onPhotoChange" />
            </label>
            <label class="cursor-pointer rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm hover:border-primary transition">
              <span class="font-medium">Добавить видео</span>
              <span class="block mt-1 text-xs text-[#6B7280]">до 2 файлов, каждый до 50 МБ</span>
              <input type="file" accept="video/*" multiple class="hidden" @change="onVideoChange" />
            </label>
          </div>

          <div v-if="photoPreviews.length || videoPreviews.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="(item, index) in photoPreviews" :key="item.id" class="relative rounded-xl overflow-hidden border border-[#E5E7EB] bg-white">
              <img :src="item.url" :alt="item.name" class="h-24 w-full object-cover" />
              <button type="button" class="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs" @click="removeUploadedFile('photo', index)">×</button>
              <div class="p-2 text-xs text-[#6B7280] truncate">{{ item.name }} · {{ item.size }}</div>
            </div>
            <div v-for="(item, index) in videoPreviews" :key="item.id" class="relative rounded-xl overflow-hidden border border-[#E5E7EB] bg-white">
              <video :src="item.url" class="h-24 w-full object-cover" muted />
              <button type="button" class="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs" @click="removeUploadedFile('video', index)">×</button>
              <div class="p-2 text-xs text-[#6B7280] truncate">{{ item.name }} · {{ item.size }}</div>
            </div>
          </div>
          <div v-if="localErrors.files" class="text-xs text-red-600">{{ localErrors.files }}</div>
        </div>

        <div v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button type="button" class="h-11 rounded-lg border border-[#E5E7EB] bg-white px-4 text-sm font-medium text-[#111] hover:border-[#111] transition" @click="emit('close')">Отмена</button>
          <button type="submit" :disabled="submitting" class="h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-hoverbtn hover:text-black transition disabled:cursor-not-allowed disabled:opacity-60">
            {{ submitting ? 'Отправляем…' : 'Отправить отзыв' }}
          </button>
        </div>

        <p class="text-xs text-[#6B7280]">Отзыв будет опубликован после модерации.</p>
      </form>
    </div>
  </UiModal>
</template>
