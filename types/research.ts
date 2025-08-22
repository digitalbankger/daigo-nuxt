// types/research.ts
export interface ResearchCategory {
  id: number
  slug: string
  title: string
  image: string
  researchCount: number
}

export interface ResearchItem {
  id: number
  title: string
  slug: string
  image: string
  date: string
  category: string
  isFeatured?: boolean
  content?: string
  tags?: string[]
  related?: number[]
}
