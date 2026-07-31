import type {
  BundleContentSection,
  BundleRelatedProduct,
  Product,
  ProductVariant,
} from '~/types/product'

/**
 * Временные данные трёх новых страниц наборов.
 *
 * Все тексты, slug, product_id, variant_id, цены и изображения для замены
 * собраны в этом файле. Компоненты страницы менять при обновлении контента
 * не нужно.
 */
type BundleMockDefinition = {
  productId: string
  slug: string
  weekProductSort: number
  title: string
  subtitle: string
  shortDescription: string
  partnerName: string
  partnerProductId: string
  partnerImage: string
  partnerFeatureImage: string
  partnerDescription: string
  heroImages: string[]
  variantIds: [string, string]
  prices: [number, number]
  originalPrices: [number, number]
  giftLabel?: string
  relevanceItems: string[]
  faq: Array<{ q: string; a: string }>
}

const OMEGA_PRODUCT_ID = '1e2585ab-8523-4638-bff5-d15fa3be21cb'
const OMEGA_IMAGE = '/media-s3/products/omega/product-1.png'

const definitions: BundleMockDefinition[] = [
  {
    productId: '8dea5513-5c3a-4350-9ad4-35edf8696f0c',
    slug: 'obnovlenie-kozhi',
    weekProductSort: 2,
    title: 'ОБНОВЛЕНИЕ КОЖИ DAIGO Омега-3 + Dermic',
    subtitle: 'Комплексная поддержка красоты и здоровья кожи',
    shortDescription:
      'Набор сочетает натуральный источник Омега-3 и пептидный комплекс Daigo Dermic. Компоненты работают на поддержку клеточных мембран, естественных процессов обновления и защиты кожи.',
    partnerName: 'Daigo Dermic',
    partnerProductId: 'e59b81a8-1d61-4fc3-b96e-edd2b86907ad',
    partnerImage: '/media-s3/products/dermic/product-1.png',
    partnerFeatureImage: '/media-s3/products/dermic/principles.png',
    partnerDescription:
      'Daigo Dermic содержит натуральный короткий пептид хлореллы IPH и комплекс нутриентов, направленных на поддержку естественного обновления кожи.',
    heroImages: [
      '/media-s3/products/dermic/product-1.png',
      OMEGA_IMAGE,
      '/media-s3/products/dermic/principles.png',
    ],
    variantIds: [
      '16908f72-d05e-4e48-8174-881d9d33ec0b',
      'b6e337e2-5bee-4f4f-9a80-27c713e36431',
    ],
    prices: [31025, 46070],
    originalPrices: [36500, 54200],
    giftLabel: 'Подарок для расширенного варианта',
    relevanceItems: [
      'При тусклом цвете и неровном тоне кожи',
      'При высокой нагрузке и недостатке полезных жиров в рационе',
      'В период сезонного стресса для кожи',
      'Для комплексной поддержки изнутри',
    ],
    faq: [
      {
        q: 'Почему в наборе две упаковки разных продуктов?',
        a: 'Продукты решают взаимодополняющие задачи: Омега-3 поддерживает клеточные мембраны, а Dermic — естественные процессы обновления кожи.',
      },
      {
        q: 'Можно ли принимать продукты одновременно?',
        a: 'Да, продукты набора рассчитаны на совместное применение. Перед использованием ознакомьтесь с рекомендациями на упаковке.',
      },
      {
        q: 'Как выбрать вариант набора?',
        a: 'Базовый вариант содержит одну упаковку Омега-3, расширенный — две. Остальной состав набора одинаковый.',
      },
    ],
  },
  {
    productId: '6bc6d4f7-2c7e-47b8-a7f4-59cfdf9b1002',
    slug: 'svoboda-dyhaniya',
    weekProductSort: 3,
    title: 'СВОБОДА ДЫХАНИЯ DAIGO Омега-3 + Aminobiotics',
    subtitle: 'Комплекс для ежедневной поддержки защитных функций организма',
    shortDescription:
      'Набор объединяет натуральную Омега-3 и Daigo Aminobiotics. Страница использует общий шаблон новых наборов; тексты и изображения можно заменить в одном моковом объекте.',
    partnerName: 'Daigo Aminobiotics',
    partnerProductId: 'd33b8be4-2fab-4ac9-a9cd-c3dca5d1a002',
    partnerImage: '/media-s3/products/dent/product-1.png',
    partnerFeatureImage: '/media-s3/products/dent/principles.png',
    partnerDescription:
      'Временное описание второго продукта набора. Замените его актуальным текстом после согласования контента с бэкендом и маркетингом.',
    heroImages: [
      '/media-s3/products/dent/product-1.png',
      OMEGA_IMAGE,
      '/media-s3/products/dent/principles.png',
    ],
    variantIds: [
      '3184d090-3f98-4c64-9e59-195785af2001',
      '4a5b6d43-46ea-4b54-8aca-9b9d70d12002',
    ],
    prices: [31025, 42925],
    originalPrices: [36500, 50500],
    giftLabel: 'Подарок для расширенного варианта',
    relevanceItems: [
      'В сезон простуд и высокой нагрузки',
      'При несбалансированном рационе',
      'В период восстановления',
      'Для ежедневной комплексной поддержки',
    ],
    faq: [
      {
        q: 'Чем набор отличается от отдельных продуктов?',
        a: 'Набор объединяет продукты в готовый комплекс и позволяет выбрать количество Омега-3.',
      },
      {
        q: 'Можно ли принимать продукты в один период?',
        a: 'Да, если это не противоречит индивидуальным рекомендациям вашего врача и инструкции к продуктам.',
      },
      {
        q: 'Какой вариант выбран по умолчанию?',
        a: 'По умолчанию выбран вариант с одной упаковкой Омега-3.',
      },
    ],
  },
  {
    productId: '42a6bb34-a1a0-4a50-8c10-bf6c5e3a1001',
    slug: 'dvizhenie-mysli',
    weekProductSort: 1,
    title: 'ДВИЖЕНИЕ МЫСЛИ DAIGO Омега-3 + Brainy',
    subtitle: 'Многоуровневая нутрицевтическая поддержка нервной системы',
    shortDescription:
      'Набор работает с информацией, клеточными мембранами и когнитивными процессами. Участники комплекса дополняют друг друга, поддерживая ясность мышления и интеллектуальный ресурс.',
    partnerName: 'Daigo Brainy',
    partnerProductId: '3e719f30-647d-4234-ac98-90824d573801',
    partnerImage: '/media-s3/products/brainy/product-1.png',
    partnerFeatureImage: '/media-s3/products/brainy/principles.png',
    partnerDescription:
      'Daigo Brainy — направленная нутрицевтическая формула для поддержки когнитивных процессов, аминокислотного обмена и устойчивости к информационным нагрузкам.',
    heroImages: [
      '/media-s3/products/brainy/product-1.png',
      OMEGA_IMAGE,
      '/media-s3/products/brainy/product-2.png',
      '/media-s3/products/omega/product-2.png',
    ],
    variantIds: [
      '67fbbda5-f3f0-41bf-b1ea-0e6f74cf3001',
      'b47a7151-3121-45d4-9e2d-baf868a63002',
    ],
    prices: [31025, 42925],
    originalPrices: [36500, 54200],
    giftLabel: '1 × Daigo Dent в подарок',
    relevanceItems: [
      'В периоды интенсивной умственной работы и высокой ответственности',
      'При постоянном переключении между задачами и большом объёме информации',
      'Во время подготовки к важным проектам, выступлениям или обучению',
      'Когда хочется поддержать концентрацию и ментальную устойчивость',
      'Для тех, кто предпочитает не отдельный продукт, а продуманную архитектуру формул',
    ],
    faq: [
      {
        q: 'Почему в наборе две упаковки Омега-3?',
        a: 'Расширенный вариант позволяет увеличить продолжительность курса Омега-3. Базовый вариант содержит одну упаковку.',
      },
      {
        q: 'Чем набор отличается от отдельного Brainy?',
        a: 'Brainy дополняется натуральными жирными кислотами EPA и DHA, которые являются структурными компонентами клеточных мембран.',
      },
      {
        q: 'Заменяет ли набор сон, питание и восстановление?',
        a: 'Нет. Добавки работают как часть комплексного подхода и не заменяют полноценное питание, сон и рекомендации врача.',
      },
      {
        q: 'Можно ли принимать продукты в один период?',
        a: 'Да, продукты рассчитаны на совместный курс при соблюдении инструкции и индивидуальных рекомендаций.',
      },
      {
        q: 'Чем отличается Омега-3 от Daigo?',
        a: 'Это разные продукты линейки: Омега-3 содержит жир печени трески, а Daigo — метабиотические компоненты.',
      },
    ],
  },
]

const relatedProducts: BundleRelatedProduct[] = definitions.map((definition) => ({
  product_id: definition.productId,
  slug: definition.slug,
  title: definition.title,
  image: definition.heroImages[0],
  price: definition.prices[0],
  originalPrice: definition.originalPrices[0],
}))

function createVariants(definition: BundleMockDefinition): ProductVariant[] {
  const baseItems = [
    {
      component_product_id: OMEGA_PRODUCT_ID,
      quantity: 1,
      name: 'Омега-3',
      image: OMEGA_IMAGE,
    },
    {
      component_product_id: definition.partnerProductId,
      quantity: 1,
      name: definition.partnerName,
      image: definition.partnerImage,
    },
  ]

  return [
    {
      variant_id: definition.variantIds[0],
      title: `${definition.title.split(' DAIGO')[0]} 1`,
      label: `1x Омега-3 + 1x ${definition.partnerName.replace('Daigo ', '')}`,
      price: definition.prices[0],
      originalPrice: definition.originalPrices[0],
      is_default: true,
      sort_order: 0,
      items: baseItems,
    },
    {
      variant_id: definition.variantIds[1],
      title: `${definition.title.split(' DAIGO')[0]} 2`,
      label: `2x Омега-3 + 1x ${definition.partnerName.replace('Daigo ', '')}`,
      price: definition.prices[1],
      originalPrice: definition.originalPrices[1],
      is_default: false,
      sort_order: 1,
      giftLabel: definition.giftLabel,
      items: [
        { ...baseItems[0], quantity: 2 },
        baseItems[1],
      ],
    },
  ]
}

function createSections(definition: BundleMockDefinition): BundleContentSection[] {
  return [
    {
      type: 'feature-grid',
      title: 'Описание товара',
      cards: [
        {
          title: 'Особенности набора',
          text: `<p>Комплекс объединяет натуральную Омега-3 и ${definition.partnerName}. Формулы дополняют друг друга и работают на разных уровнях.</p><p>Данные блока временные и меняются непосредственно в <strong>mockBundleProducts.ts</strong>.</p>`,
          image: definition.partnerImage,
        },
        {
          title: 'Мембранный фундамент',
          text: 'EPA и DHA из Омега-3 участвуют в поддержке структуры клеточных мембран.',
          image: '/media-s3/products/omega/desc-1.png',
        },
        {
          title: 'Функциональная поддержка',
          text: `${definition.partnerName} дополняет комплекс собственной направленной формулой.`,
          image: definition.partnerFeatureImage,
        },
        {
          title: 'Многоуровневый контекст',
          text: 'Компоненты набора рассматриваются как единая система ежедневной поддержки.',
          image: '/media-s3/products/omega/desc-2.png',
        },
        {
          title: 'Готовый сценарий курса',
          text: 'Выберите вариант с одной или двумя упаковками Омега-3.',
          image: definition.partnerImage,
        },
      ],
    },
    {
      type: 'split',
      title: 'Что дает DAIGO Омега-3',
      content:
        '<p>DAIGO Омега-3 производится из натурального жира печени трески и содержит жирные кислоты EPA и DHA, а также витамины A и D.</p><p>Компоненты поддерживают клеточные мембраны, нервную и сердечно-сосудистую системы.</p>',
      image: '/media-s3/products/omega/product-2.png',
      imageAlt: 'Омега-3 Daigo',
      imagePosition: 'left',
      noteTitle: 'Когда важна не только функция',
      noteContent:
        '<p>Натуральное происхождение и технология производства помогают сохранить биологическую ценность продукта.</p>',
      linkLabel: 'Подробнее об Омега-3',
      linkHref: '/catalog/zhir-pecheni-treski-omega-3',
    },
    {
      type: 'split',
      title: `Что дает ${definition.partnerName}`,
      content: `<p>${definition.partnerDescription}</p>`,
      image: definition.partnerImage,
      imageAlt: definition.partnerName,
      imagePosition: 'right',
      noteTitle: 'Интересный факт',
      noteContent:
        '<p>Дополнительный информационный блок можно использовать для исследования, технологии производства или важного преимущества продукта.</p>',
    },
    {
      type: 'wide-image',
      image: definition.partnerFeatureImage,
      imageAlt: `Как работает сочетание Омега-3 и ${definition.partnerName}`,
    },
    {
      type: 'checklist',
      title: 'Когда особенно актуален комплекс',
      image: definition.heroImages[0],
      imageAlt: definition.title,
      items: definition.relevanceItems,
    },
    {
      type: 'related-products',
      title: 'Другие новые наборы',
      products: relatedProducts,
    },
  ]
}

export const mockBundleProducts: Product[] = definitions.map((definition) => {
  const variants = createVariants(definition)

  return {
    product_id: definition.productId,
    slug: definition.slug,
    title: definition.title,
    subtitle: definition.subtitle,
    shortDescription: definition.shortDescription,
    fullDescription: definition.shortDescription,
    price: variants[0].price,
    originalPrice: variants[0].originalPrice,
    sort: 0,
    category: 'bundle',
    isActive: true,
    isWeekProduct: true,
    weekProductSort: definition.weekProductSort,
    properties: {
      napravlennost:
        definition.slug === 'obnovlenie-kozhi'
          ? ['kozha-i-volosy']
          : definition.slug === 'dvizhenie-mysli'
            ? ['mozg-i-nervnaya-sistema']
            : ['kishechnik-i-immunitet'],
      produkty: ['nabory'],
      podarochnye: ['nabory'],
    },
    variants,
    bundleSections: createSections(definition),
    images: definition.heroImages.map((image, index) => ({
      image_url: image,
      is_primary: index === 0,
      display_order: index,
    })),
    faq: {
      image: definition.heroImages[0],
      items: definition.faq,
    },
  }
})
