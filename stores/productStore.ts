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
