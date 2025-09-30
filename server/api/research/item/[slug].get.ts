import { getRouterParams, createError } from 'h3'
import type { ArticleDetail } from '~/types/articles'

const DETAIL_BY_SLUG: Record<string, ArticleDetail> = {
  'proizvodstvo-daigo': {
    id: 1,
    slug: 'proizvodstvo-daigo',
    title: 'Принцип действия метабиотиков',
    preview: 'Как работают метабиотики и почему важен курсовой приём.',
    image: 'http://localhost:3000/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'http://localhost:3000/images/mock/article/gen.jpg',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/research' },
      { label: 'Принцип действия метабиотиков', to: '/research/printsip-dejstviya-metabiotikov' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'http://localhost:3000/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-product font-medium mb-4">Метабиотик Daigo</h2>
      <p>В современном мире всё больше людей обращают внимание на натуральные добавки...</p>
      <img src="/images/articles/a1.jpg" alt="Иллюстрация" loading="lazy"/>
    `,
    materials: {
      title: 'Материалы исследования',
      text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
      files: [
        { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
      ],
      specialist: {
        name: 'Нобору Фурукава',
        position: 'Профессор',
        avatarUrl: 'http://localhost:3000/images/mock/research/author.jpg',
        description: 'Исследует микробиоту и влияние метабиотиков.',
        social: [
          { type: 'dzen', url: 'https://dzen.ru/daigo' }
        ]
      },
      downloadAllUrl: '/files/research-all.zip'
    },
    contentBottom: `
      <h2 class="text-product font-medium mb-4">Заключение</h2>
      <p>Метабиотики Daigo показывают высокую эффективность при длительном приёме...</p>
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'http://localhost:3000/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'http://localhost:3000/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    products: []
  }
}

export default cachedEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const data = DETAIL_BY_SLUG[slug as string]
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Research not found' })
  }
  return data
}, { maxAge: 60 })
