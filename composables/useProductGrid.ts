import type { Product } from '~/types/product'

interface ProductWithMeta extends Product {
  index: number
  globalIndex: number
  isLast: boolean
}

export const useProductGrid = (products: Product[], splitPattern = [3, 3]) => {
  const blocks: ProductWithMeta[][] = []
  let currentIndex = 0
  let globalIndex = 0

  for (const blockSize of splitPattern) {
    const block = products.slice(currentIndex, currentIndex + blockSize).map((p, i) => ({
      ...p,
      index: i,
      globalIndex: globalIndex + i,
      isLast: false
    }))
    blocks.push(block)
    currentIndex += blockSize
    globalIndex += block.length
  }

  const remaining = products.slice(currentIndex).map((p, i) => ({
    ...p,
    index: i,
    globalIndex: globalIndex + i,
    isLast: false
  }))
  if (remaining.length > 0) blocks.push(remaining)

  const lastBlock = blocks.at(-1)
  if (lastBlock && lastBlock.length > 0) {
    lastBlock[lastBlock.length - 1].isLast = true
  }

  return blocks
}
