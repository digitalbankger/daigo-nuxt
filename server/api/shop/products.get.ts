import type { Product, ProductCard } from '~/types/product'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const perPage = 9

  const allProducts: ProductCard[] = [
    {
      id: 1,
      slug: 'daigo-lux',
      name: 'Daigo Lux',
      subtitle: 'Для кишечника и иммунитета',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-lux.png',
      price: 95700,
      properties: {
        'pomogaet-pri': 'allergiya',
        'napravlennost': 'kishechnik-i-immunitet',
        'klass-produkta': 'aminobiotiki',
        'produkty': 'daigo-lux',
        'dlya-kogo': 'dlya-detej-i-mam',
        'sostav': 'peptid-khlorelly-iph-c',
        'forma-vypuska': 'zhidkost',
        'strana-proizvoditel': 'yaponiya'
      }
    },
    {
      id: 2,
      slug: 'daigo-lux',
      name: 'Daigo Dent',
      subtitle: 'Для зубов и дёсен',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-dent.png',
      price: 3200,
      properties: {
        'pomogaet-pri': 'karies',
        'napravlennost': 'zuby-i-desna',
        'klass-produkta': 'metobiotiki',
        'produkty': 'daigo-dent',
        'dlya-kogo': 'dlya-detej-i-mam',
        'sostav': 'vitamin-b3',
        'forma-vypuska': 'pasta',
        'strana-proizvoditel': 'yaponiya'
      }
    },
    {
      id: 3,
      slug: 'daigo-lux',
      name: 'Daigo Brainy',
      subtitle: 'Для мозга и памяти',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-brainy.png',
      price: 8900,
      properties: {
        'pomogaet-pri': 'demenciya',
        'napravlennost': 'mozg-i-nervnaya-sistema',
        'klass-produkta': 'plazmalogeny',
        'produkty': 'daigo-brainy',
        'dlya-kogo': 'dlya-aktivnogo-dolgoletiya',
        'sostav': 'vitamin-b14',
        'forma-vypuska': 'kapsuly',
        'strana-proizvoditel': 'italiya'
      }
    },
    {
      id: 4,
      slug: 'daigo-lux',
      name: 'Daigo Dermic',
      subtitle: 'Для кожи',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-dermic.png',
      price: 16200,
      properties: {
        'pomogaet-pri': 'akne',
        'napravlennost': 'kozha-i-volosy',
        'klass-produkta': 'aminobiotiki',
        'produkty': 'daigo-dermic',
        'dlya-kogo': 'dlya-detej-i-mam',
        'sostav': 'vitamin-a',
        'forma-vypuska': 'gel-kapsuly',
        'strana-proizvoditel': 'yaponiya'
      }
    },
    {
      id: 5,
      slug: 'daigo-lux',
      name: 'Tamotsu',
      subtitle: 'Для энергии и иммунитета',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/tamotsu.png',
      price: 67500,
      properties: {
        'pomogaet-pri': 'utomlyaemost',
        'napravlennost': 'kishechnik-i-immunitet',
        'klass-produkta': 'omega-3',
        'produkty': 'tamotsu',
        'dlya-kogo': 'dlya-aktivnogo-dolgoletiya',
        'sostav': 'omega-9',
        'forma-vypuska': 'kapsuly',
        'strana-proizvoditel': 'italiya'
      }
    },
    {
      id: 5,
      slug: 'daigo-lux',
      name: 'Daigo Dent',
      subtitle: 'Зубы и десна',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-dent.png',
      price: 3200,
      properties: { 'Помогает при': 'teeth', 'Состав': 'lacto' }
    },
    {
      id: 6,
      slug: 'daigo-lux',
      name: 'Daigo Shampoo',
      subtitle: 'Кожа и волосы',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-shampoo.png',
      price: 16200,
      properties: { 'Помогает при': 'skin', 'Состав': 'ferment' }
    },
    {
      id: 7,
      slug: 'daigo-lux',
      name: 'Omega-3',
      subtitle: 'Жир печени трески',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/omega-3.png',
      price: 14000,
      properties: { 'Помогает при': 'heart', 'Состав': 'omega3' }
    },
    {
      id: 8,
      slug: 'daigo-lux',
      name: 'Lactis zoo',
      subtitle: 'Для животных',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/lactis-zoo.png',
      price: 6200,
      properties: { 'Помогает при': 'animals', 'Состав': 'lacto' }
    },
    {
      id: 9,
      slug: 'daigo-lux',
      name: 'Daigo Emperor',
      subtitle: 'Год здоровья в подарок',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-emperor.png',
      price: 1097000,
      properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
    },
    {
      id: 10,
      slug: 'daigo-lux',
      name: 'Daigo Lux 2 страница',
      subtitle: 'Для кишечника и иммунитета',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-lux.png',
      price: 95700,
      properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
    },
    {
      id: 11,
      slug: 'daigo-lux',
      name: 'Daigo 5 ml 2 страница',
      subtitle: 'Для кишечника и иммунитета',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-5ml.png',
      price: 13100,
      properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
    },
    {
      id: 12,
      slug: 'daigo-lux',
      name: 'Daigo 10 ml 2 страница',
      subtitle: 'Для кишечника и иммунитета',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-10ml.png',
      price: 24100,
      properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
    },
    {
      id: 13,
      slug: 'daigo-lux',
      name: 'Tamotsu 2 страница',
      subtitle: 'Для мозга и нервной системы',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/tamotsu.png',
      price: 67500,
      properties: { 'Помогает при': 'brain', 'Состав': 'peptides' }
    },
    {
      id: 14,
      slug: 'daigo-lux',
      name: 'Daigo Dent 2 страница',
      subtitle: 'Зубы и десна',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-dent.png',
      price: 3200,
      properties: { 'Помогает при': 'teeth', 'Состав': 'lacto' }
    },
    {
      id: 15,
      slug: 'daigo-lux',
      name: 'Daigo Shampoo 2 страница',
      subtitle: 'Кожа и волосы',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-shampoo.png',
      price: 16200,
      properties: { 'Помогает при': 'skin', 'Состав': 'ferment' }
    },
    {
      id: 16,
      slug: 'daigo-lux',
      name: 'Omega-3 2 страница',
      subtitle: 'Жир печени трески',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/omega-3.png',
      price: 14000,
      properties: { 'Помогает при': 'heart', 'Состав': 'omega3' }
    },
    {
      id: 17,
      slug: 'daigo-lux',
      name: 'Lactis zoo 2 страница',
      subtitle: 'Для животных',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/lactis-zoo.png',
      price: 6200,
      properties: { 'Помогает при': 'animals', 'Состав': 'lacto' }
    },
    {
      id: 18,
      slug: 'daigo-lux',
      name: 'Daigo Emperor 2 страница',
      subtitle: 'Год здоровья в подарок',
      image: 'https//nuxt.daigo.ru/images/mock/catalog/daigo-emperor.png',
      price: 1097000,
      properties: { 'Помогает при': 'immunity', 'Состав': 'ferment' }
    }
  ]

  if (query.ids) {
    const ids = Array.isArray(query.ids)
      ? query.ids.flatMap(i => i.toString().split(','))
      : query.ids.toString().split(',')

    const idNums = ids.map(Number)
    return {
      items: allProducts.filter(p => idNums.includes(p.id)),
      total: idNums.length
    }
  }

  const filtered = allProducts.filter(p =>
    Object.entries(query).every(([key, value]) => {
      if (key === 'page') return true
      return p.properties[key] === value
    })
  )

  const total = filtered.length
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return {
    items: paginated,
    total
  }
})
