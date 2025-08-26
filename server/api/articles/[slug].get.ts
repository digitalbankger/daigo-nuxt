import { EventHandler, getRouterParams, createError } from 'h3'
import type { ArticleDetail } from '~/types/articles'

const DETAIL_BY_SLUG: Record<string, ArticleDetail> = {
  'printsip-dejstviya-metabiotikov': {
    id: 1,
    slug: 'printsip-dejstviya-metabiotikov',
    title: 'Принцип действия метабиотиков',
    preview: 'Как работают метабиотики и почему важен курсовой приём.',
    image: 'https//nuxt.daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 10,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Разбираем этапы восстановления микрофлоры и накопительный эффект.',
    cover: 'https//nuxt.daigo.ru/images/mock/article/gen.jpg',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Статьи', to: '/articles' },
      { label: 'Принцип действия метабиотиков', to: '/articles/printsip-dejstviya-metabiotikov' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    author: {
      id: 1,
      name: 'Анна Иванова',
      position: 'Главный врач',
      avatarUrl: 'https//nuxt.daigo.ru/images/mock/article/spec.jpg',
      about: 'Специализируется на лечении заболеваний ЖКТ. Занимается ведением пациентов с инфекционной патологией.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 id="first" class="text-product font-medium mb-4">Метабиотик Дайго</h2>
      <p>В современном мире, где фармацевтические препараты часто предлагают быстрое, но кратковременное решение проблем со здоровьем, все больше людей обращают внимание на натуральные добавки, которые работают на клеточном уровне. Одной из таких добавок является метабиотик Daigo, который зарекомендовал себя как эффективное средство для восстановления микрофлоры кишечника и улучшения общего состояния организма. Однако, в отличие от синтетических препаратов, Дайго требует курсового приёма для достижения максимального эффекта. В этой статье мы расскажем, какие изменения происходят в организме на каждом этапе приёма Daigo, и почему длительный приём так важен.
<br><br>
Дайго — это органический метабиотик из Японии, который содержит ферменты и клеточный материал 16 видов полезных кишечных лактобактерий. Эти компоненты работают синергетически, чтобы восстановить баланс микрофлоры кишечника, улучшить пищеварение и укрепить иммунитет, тем самым положительно влияя на все важнейшие процессы в организме. В отличие от пробиотиков, которые содержат живые бактерии, метабиотики содержат продукты их метаболизма, что делает их более устойчивыми к воздействию желудочного сока, позволяет им эффективно достигать кишечника и восстанавливать родную микрофлору, а не пытаться заселить чужеродную.
<br><br>
Органический состав Daigo делает продукт уникальным и безопасным, при этом сохраняя высокую эффективность. Однако натуральность всегда работает на принципе накопительного эффекта. Это означает, что работать метабиотик начинает сразу, но его действие проявляется постепенно, по мере того как организм адаптируется к изменениям. Кратковременный приём может дать временное улучшение, но только длительный курс позволяет достичь устойчивых результатов. Это связано с тем, что восстановление микрофлоры кишечника — это сложный процесс, который требует времени.
<br><br>
Процесс коррекции и восстановления микрофлоры кишечника — это сложный и многоэтапный процесс, который требует времени и зависит от множества факторов, включая исходное состояние микрофлоры, образ жизни, питание и индивидуальные особенности организма. С научной точки зрения, восстановление микрофлоры кишечника занимает от нескольких недель до нескольких месяцев, а в некоторых случаях — до года и более. Это связано с жизненным циклом бактерий, скоростью обновления клеток кишечника и необходимостью создания устойчивого баланса между полезными и патогенными микроорганизмами.</p>
      <img src="/images/articles/a1.jpg" alt="Иллюстрация" loading="lazy" decoding="async"/>
    `,
    materials: {
      title: 'Полезные материалы',
      text: '<p class="mb-2">Рекомендации от нашего главного врача</p> <p>Внутренние резервы организма: откройте 4 ключа к восстановлению, долголетию и энергии</p>',
      files: [
        { id: 1, title: 'Восстановление организма', url: '/files/guide.pdf', size: '1.2 MB', mime: 'application/pdf' },
        { id: 2, title: 'Долголетие', url: '/files/research.pdf', size: '980 KB', mime: 'application/pdf' },
        { id: 3, title: 'Энергия', url: '/files/energy.pdf', size: '1.5 MB', mime: 'application/pdf' }
      ],
      specialist: {
        name: 'Анна Иванова',
        position: 'Главный врач',
        avatarUrl: 'https//nuxt.daigo.ru/images/mock/article/spec.jpg',
        description: 'Специализируется на лечении заболеваний ЖКТ. Занимается ведением пациентов с инфекционной патологией.',
        social: 
        [
          { type: 'tg', url: 'https://t.me/daigo' },
          { type: 'vk', url: 'https://vk.com/daigo' },
          { type: 'dzen', url: 'https://dzen.ru/daigo' }
        ]
      },
      downloadAllUrl: '/files/all.zip'
    },
    contentBottom: `
      <h2 id="second" class="text-product font-medium mb-4">Где купить надежные метабиотки?</h2>
      <img src="/images/mock/article/a2.jpg" alt="Этапы восстановления" loading="lazy" decoding="async"/>
      <p>Органический состав Daigo делает продукт уникальным и безопасным, при этом сохраняя высокую эффективность. Однако натуральность всегда работает на принципе накопительного эффекта. Это означает, что работать метабиотик начинает сразу, но его действие проявляется постепенно, по мере того как организм адаптируется к изменениям. Кратковременный приём может дать временное улучшение, но только длительный курс позволяет достичь устойчивых результатов. Это связано с тем, что восстановление микрофлоры кишечника — это сложный процесс, который требует времени.</p>
    `,
    // Топ-5 и популярные/рекомендованные можно получить отдельными ручками, но для SSR тут тоже положим
    recommended: [
      { id: 2, slug: 'podgotovka-kozhi-k-plyazhnomu-sezonu', title: 'Как подготовить кожу к пляжному сезону?', preview: '', image: 'https//nuxt.daigo.ru/images/mock/article/gen.jpg', date: '2025-06-24', time: 10, views: 150, comments: 4, properties: {} as any }
    ],
    popular: [
      { id: 1, slug: 'printsip-dejstviya-metabiotikov', title: 'Принцип действия метабиотиков', preview: '', image: '/images/articles/first.jpg', date: '2025-06-30', time: 8, views: 200, comments: 10, properties: {} as any }
    ],
    faq: [
      { q: 'Что такое коэнзим Q10?', a: 'Антиоксидант, участвующий в выработке энергии...' },
      { q: 'Чем полезен Tamotsu?', a: 'Улучшает память, когнитивные функции...' }
    ],
    products: [
      { id: 1, title: 'Daigo Lux', image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-lux.png', price: 95700, url: '/catalog/daigo-lux', badge: 'Хит' },
      { id: 5, title: 'Tamotsu', image: 'https//nuxt.daigo.ru/images/mock/catalog/tamotsu.png', price: 67500, url: '/catalog/tamotsu' }
    ]
  }
}

export default cachedEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const data = DETAIL_BY_SLUG[slug as string]
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Article not found' })
  }
  return data
}, { maxAge: 60 })
