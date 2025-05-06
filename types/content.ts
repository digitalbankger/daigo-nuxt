export interface Banner {
  id: number
  image: string
  title: string
  titleSize: string
  descWidth: string
  html: string
  buttonText: string
  buttonLink: string
}

export interface Story {
  id: number
  title: string
  thumbnail: string
  slides: string[]
}

export interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  avatar?: string
}
