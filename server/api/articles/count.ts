import type { Article } from '~/types/articles'

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const allArticles: Article[] = [
    {
      id: 1,
      slug: 'printsip-dejstviya-metabiotikov',
      title: 'Принцип действия метабиотиков',
      preview: 'Секреторные выделения лактобактерий активизируют действие родных лактобактерий кишечника...',
      image: '/images/articles/1.jpg',
      date: '2025-06-30',
      time: 8,
      views: 200,
      comments: 10,
      properties: {
        napravlennost: 'kishechnik-i-immunitet',
      }
    },
    {
      id: 2,
      slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu',
      title: 'Как подготовить кожу к пляжному сезону?',
      preview: 'Красота изнутри: как подготовить кожу за пару недель...',
      image: '/images/articles/2.jpg',
      date: '2025-06-24',
      time: 10,
      views: 150,
      comments: 4,
      properties: {
        napravlennost: 'kozha-i-volosy',
      }
    },
    {
      id: 3,
      slug: 'sindrom-puteshestvennika',
      title: 'Синдром путешественника',
      preview: 'Как перелёты и смена климата влияют на микробиом...',
      image: '/images/articles/3.jpg',
      date: '2025-05-31',
      time: 6,
      views: 180,
      comments: 2,
      properties: {
        napravlennost: 'mozg-i-nervnaya-sistema',
      }
    }
  ]

  const filtered = allArticles.filter(article =>
    Object.entries(query).every(([key, raw]) => {
      if (key === 'page') return true

      const values = typeof raw === 'string'
        ? raw.split(',')
        : Array.isArray(raw) ? raw.flatMap(v => v.split(',')) : []

      return values.includes(article.properties[key as keyof typeof article.properties])
    })
  )

  return { count: filtered.length }
})
