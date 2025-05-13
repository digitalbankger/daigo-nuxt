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
  id: number;
  photo_urls: string[];
  file_url?: string;
  feedback_preview: string;
  author: string;
}
