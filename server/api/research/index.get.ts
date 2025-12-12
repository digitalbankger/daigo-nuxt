export default defineEventHandler(() => {
  return [
    {
      id: 1,
      slug: 'metabiotiki',
      title: 'Метабиотики',
      image: 'https://daigo.ru/images/mock/researches/cat-1.png',
      researchCount: 6,
    },
    {
      id: 2,
      slug: 'plazmogeny',
      title: 'Плазмалогены',
      image: 'https://daigo.ru/images/mock/researches/cat-2.png',
      researchCount: 2,
    },
    // можно добавить другие категории по мере необходимости
  ]
})
