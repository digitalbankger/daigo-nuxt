export interface Banner {
  id: number
  image: string
  title: string
  titleSize: string
  descWidth: string
  html: string
  buttonText: string
  buttonLink: string
  tags?: BannerTag[]
}

export interface BannerTag {
  label: string
  color?: string      
  href?: string 
}

export interface Story {
  id: number
  title: string
  thumbnail: string
  slides: string[]
  productIds?: number[]
}

export interface Review {
  id: number
  type?: 'video' | 'text' | 'celebrity' | 'audio'
  preview?: string
  avatar?: string
  video_url?: string
  mediaUrl?: string
  mediaStory?: string[]
  duration?: string
  photo_urls?: string[]
  file_url?: string
  feedback_preview?: string
  author: string
  author_role?: string
  productIds?: number[]
  related_products?: { name: string; link: string }[]
}

