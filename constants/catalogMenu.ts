export type CatalogMenuProduct = {
  id: string
  product_id: string
  code: string
  title: string
  badge?: string
  image: string
  href: string
  description: string
}

export const catalogMenuProducts: CatalogMenuProduct[] = [
  {
    id: 'daigo-5',
    product_id: 'daigo',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo 5мл',
    badge: 'Хит',
    image: 'https://products.s3.firstvds.ru/daigo-5/product-1.png',
    href: '/catalog/metabiotik-daigo',
    description: 'Поддержка микробиома, пищеварения и общего баланса организма.'
  },
  {
    id: 'daigo-10',
    product_id: 'daigo',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo 10мл',
    image: 'https://products.s3.firstvds.ru/daigo-10/product-1.png',
    href: '/catalog/metabiotik-daigo',
    description: 'Поддержка микробиома, пищеварения и общего баланса организма.'
  },
  {
    id: 'daigo-lux',
    product_id: 'daigo-lux',
    code: 'Метабиотик',
    title: 'Метабиотик Daigo Lux',
    image: 'https://s3.firstvds.ru/products/lux/lux-effect.jpg',
    href: '/catalog/lux-daigo-metabiotik',
    description: 'Усиленная формула для курсового приема и комплексной поддержки.'
  },
  {
    id: 'tamotsu',
    product_id: 'tamotsu',
    code: 'Плазмалоген',
    title: 'Tamotsu',
    image: 'https://products.s3.firstvds.ru/tamotsu/product-1.png',
    href: '/catalog/tamotsu',
    description: 'Поддержка энергии, клеточного обмена и возрастного ресурса.'
  },
  {
    id: 'jointic',
    product_id: 'jointic',
    code: 'Аминобиотик',
    title: 'Daigo Jointic',
    image: 'https://products.s3.firstvds.ru/jointic/product-1.png',
    href: '/catalog/daigo-jointic',
    description: 'Поддержка суставов, связок и подвижности.'
  },
  {
    id: 'brainy',
    product_id: 'brainy',
    code: 'Аминобиотик',
    title: 'Daigo Brainy',
    image: 'https://products.s3.firstvds.ru/brainy/product-1.png',
    href: '/catalog/daigo-brainy',
    description: 'Поддержка концентрации, памяти и когнитивной активности.'
  },
  {
    id: 'dermic',
    product_id: 'dermic',
    code: 'Аминобиотик',
    title: 'Daigo Dermic',
    image: 'https://products.s3.firstvds.ru/dermic/product-1.png',
    href: '/catalog/daigo-dermic',
    description: 'Поддержка кожи, волос и общего внешнего тонуса.'
  }
]