export interface ProductCard {
  tag: string | undefined
  oldPrice: number | undefined
  product_id: number
  slug: string
  name: string
  subtitle: string
  image: string
  price: number
  originalPrice?: number
  discount?: number
  sort: number
  sortOrder: number
  properties: Record<string, string | string[]>
}

export interface ProductMini {
  product_id: number
  title: string
  image: string
  price: number
  originalPrice: number
  url: string
  badge?: string
  sort?: number
}

export interface FaqItem { q: string; a: string }
export interface ProductFaq { image?: string; items: FaqItem[] }

export interface ProductUsage {
  ageGroup: string
  dosage: string
  instruction: string
}

export interface ProductImage {
  src: any
  image_url: string
  is_primary: boolean
  display_order: number
}

export interface ProductActionPrinciple {
  title: string
  image: string
  text: string
  imagePosition?: 'left' | 'right'
}

export interface ProductEffect {
  title: string
  image: string
  content: string
  imagePosition?: 'left' | 'right'
}

export interface ProductComposition {
  title: string
  image: string
  content: string
}

export interface ProductUsageInstruction {
  text?: string
  comboTitle?: string
  comboTitle2?: string                
  groups?: UsageGroup[]
  groups2?: UsageGroup[]
  combos?: UsageCombo[]
  image?: string 
  videoUrl?: string 
  videoPoster?: string
  footnote?: string
}

export interface UsageCombo {
  title: string
  text: string
  image: string
}

export interface UsageGroup {
  title: string 
  steps: UsageStep[]
}

export interface UsageStep {
  icon?: string
  text: string
}

export interface ProductDescriptionCard {
  title: string
  text: string
  note?: string
  image?: string
}

export interface ProductDescriptionSection {
  type: 'cards'
  layout: '2' | '5' | '7' | '734'
  cards: ProductDescriptionCard[]
}

export interface ProductProductionSection {
  type: 'production'
  title: string
  subtitle?: string
  images:
    | { type: 'single'; image: string }
    | { type: 'gallery'; topImage: string; bottomImages: [string, string] }
  details?: {
    soyBeansKg?: number
    soyMilkL?: number
    cultivationMultiplier?: number
    head: string
    description?: string[]
    image?: string
  }
}

export interface Product {
  sort: number
  product_id: number
  slug: string
  title: string
  subtitle?: string
  shortDescription: string
  fullDescription: string
  price: number
  originalPrice?: number
  category: string
  actionMechanism?: string
  productionDetails?: string
  composition?: ProductComposition[]
  compositionCombo?: ProductComposition[]
  videoUrl?: string
  videoPoster?: string
  isActive: boolean
  nabor?: {
    title: string
    image: string
    text: string
  }
  naborCombo?: {
    title: string
    image: string
    text: string
  }
  combo?: {
    title: string
    image: string
    text: string
  }
  usage?: ProductUsage
  actionPrinciple?: ProductActionPrinciple
  effect?: ProductEffect
  effectCombo?: ProductEffect
  usageInstructions?: ProductUsageInstruction
  productionSection?: ProductProductionSection
  images?: ProductImage[]
  descriptionSections?: ProductDescriptionSection[]
  faq?: ProductFaq
}
