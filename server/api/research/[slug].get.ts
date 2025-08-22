export default defineEventHandler((event) => {
  const { slug } = event.context.params!

  const category = {
    id: 1,
    slug,
    title: 'Метабиотики',
    image: 'http://localhost:3000/images/mock/researches/cat-1.png',
    researchCount: 10
  }

  // Один массив, у “основных” добавлен isFeatured
  const items = [
    {
      id: 1,
      title: 'Производство Да́йго',
      slug: 'proizvodstvo-daigo',
      image: 'http://localhost:3000/images/mock/researches/subcat-1.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },
    {
      id: 2,
      title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра',
      slug: 'kishechnaya-stenka',
      image: 'http://localhost:3000/images/mock/researches/subcat-2.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },
    {
      id: 3,
      title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
      image: 'http://localhost:3000/images/mock/researches/subcat-3.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },

    // далее — обычные карточки
    {
      id: 4,
      title: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
      slug: 'sport-microbiota',
      image: 'http://localhost:3000/images/mock/researches/subcat-4.png',
      date: '2025-06-30',
      category: slug
    },
    {
      id: 5,
      title: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливостицип действия метабиотиков',
      slug: 'gastro',
      image: 'http://localhost:3000/images/mock/researches/subcat-5.png',
      date: '2025-06-30',
      category: slug
    },
    {
      id: 6,
      title: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
      slug: 'gastro',
      image: 'http://localhost:3000/images/mock/researches/subcat-5.png',
      date: '2025-06-30',
      category: slug
    },
  ]

  return { category, items }
})
