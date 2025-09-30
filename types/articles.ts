// types/articles.ts
export interface Breadcrumb {
  label: string
  to: string
}

export interface ArticleAuthor {
  id: number
  name: string
  position?: string
  avatarUrl?: string
  about?: string
  social?: Array<{ type: 'vk' | 'tg' | 'wa' | 'yt' | 'ig' | 'x'; url: string }>
}

export interface ArticleTag {
  id: number
  slug: string
  label: string
}

export interface ArticleFAQ {
  q: string
  a: string
}

export interface ArticleFile {
  id: number
  title: string
  url: string
  size?: string // e.g. "2.1 MB"
  mime?: string // e.g. "application/pdf"
}

export interface ArticleSpecialist {
  name: string
  position: string
  avatarUrl?: string
  description?: string
  social?: Array<{ type: 'dzen' | 'vk' | 'tg' | 'wa' | 'yt' | 'ig' | 'x'; url: string }>
}

export interface ArticleProductMini {
  id: number
  title: string
  image: string
  price: number
  url: string
  badge?: string
}

export interface ArticleListItem {
  id: number
  slug: string
  title: string
  preview: string
  image: string
  date: string // ISO
  time: number // read minutes
  views: number
  comments: number
  properties: Record<string, string>
}

export interface ArticleDetail extends ArticleListItem {
  description?: string
  cover?: string
  breadcrumbs?: Breadcrumb[]
  tags?: ArticleTag[]
  author?: ArticleAuthor
  // контент делим на две части (по макету)
  contentTop?: string // HTML (sanitized на бэке)
  contentBottom?: string // HTML
  // блок "Полезные материалы"
  materials?: {
    title: string
    text?: string
    files: ArticleFile[]
    specialist?: ArticleSpecialist
    downloadAllUrl?: string
  }
  // виджеты
  faq?: ArticleFAQ[]
  topFive?: ArticleListItem[]
  recommended?: ArticleListItem[]
  popular?: ArticleListItem[]
  products?: ArticleProductMini[] // "Покупают вместе"
}

export interface ArticleComment {
  id: number
  author: {
    name: string
    avatarUrl?: string
  }
  message: string
  createdAt: string // ISO
  replies?: ArticleComment[]
}

// API generic
export interface Paged<T> {
  items: T[]
  total: number
}
