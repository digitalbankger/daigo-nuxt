import { getCategoryCounts } from '~/server/utils/researchContent'

export default defineEventHandler(() => {
  const counts = getCategoryCounts()

  return [
    {
      id: 1,
      slug: 'metabiotiki',
      title: 'Метабиотики',
      image: 'https://daigo.ru/images/mock/researches/cat-1.png',
      researchCount: counts.metabiotiki,
    },
    {
      id: 2,
      slug: 'plazmogeny',
      title: 'Плазмалогены',
      image: 'https://daigo.ru/images/mock/researches/cat-2.png',
      researchCount: counts.plazmogeny,
    },
  ]
})
