// import { defineStore } from 'pinia'
// import type { Product } from '~/types/product'

// export const useProductStore = defineStore('product', () => {
//   const product = ref<Product | null>(null)
//   const pending = ref(false)
//   const error = ref<string | null>(null)

//   const loadProduct = async (slug: string) => {
//     // Если уже загружен тот же slug — повторно не дергаем
//     if (product.value?.slug && product.value.slug === slug) return

//     pending.value = true
//     error.value = null

//     const { data, error: fetchError } = await useFetch<Product>(`/api/shop/${slug}` as const, {
//       key: `product:${slug}`,
//       server: true
//     })

//     if (fetchError.value) {
//       error.value = fetchError.value?.message || 'Ошибка загрузки товара'
//       product.value = null
//       pending.value = false
//       return
//     }

//     product.value = data.value || null
//     pending.value = false
//   }

//   return { product, pending, error, loadProduct }
// })



import { defineStore } from 'pinia'
import type { Product } from '~/types/product'

export const useProductStore = defineStore('product', () => {
  const product = ref<Product | null>(null)

  const loadProduct = async (slug: string) => {
    const { data } = await useFetch(`/api/shop/${slug}`)
    product.value = data.value as Product
  }

  return { product, loadProduct }
})




// import { defineStore } from 'pinia'
// import type { Product } from '~/types/product'

// export const useProductStore = defineStore('product', () => {
//   const product = ref<Product | null>(null)
//   const pending = ref(false)
//   const error = ref<string | null>(null)

//   const loadProduct = async (slug: string) => {
//     pending.value = true
//     error.value = null
//     try {
//       const { data, error: fetchError } = await useFetch<Product>(`/api/shop/products/${slug}/card`, {
//         key: `product:${slug}`, // для кеша useFetch
//         server: true
//       })
//       if (fetchError.value) {
//         throw fetchError.value
//       }
//       product.value = data.value || null
//     } catch (e: any) {
//       error.value = e?.message || 'Ошибка загрузки товара'
//       product.value = null
//     } finally {
//       pending.value = false
//     }
//   }

//   return { product, pending, error, loadProduct }
// })
