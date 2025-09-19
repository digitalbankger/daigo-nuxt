export default defineEventHandler((event) => {
  const { slug } = event.context.params!

  const category = {
    id: 1,
    slug,
    title: 'Метабиотики',
    image: 'https://nuxt.daigo.ru/images/mock/researches/cat-1.png',
    researchCount: 10
  }

  // Один массив, у “основных” добавлен isFeatured
  const items = [
    {
      id: 1,
      title: 'Производство Да́йго',
      slug: 'proizvodstvo-daigo',
      image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-1.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },
    {
      id: 2,
      title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра',
      slug: 'kombinirovannoe-vozdeystvie-sublingvalnoy-immunoterapii-i-daigo-na-simptomy-pollinoza-vyzyvaemogo-py',
      image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-2.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },
    {
      id: 3,
      title: 'Дайго способствует уменьшению проницаемости кишечной стенки',
      slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
      image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-3.png',
      date: '2025-02-18',
      category: slug,
      isFeatured: true
    },

    // далее — обычные карточки
    {
      id: 4,
      title: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
      slug: 'issledovanie-o-vliyanii-daygo-na-mikrobiotu-kishechnika-sportsmenovi-i-povyshenie-vynoslivosti',
      image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-4.png',
      date: '2025-06-30',
      category: slug
    },
    {
      id: 5,
      title: 'Дайго и активация клеток натуральных киллеров и иммунорегуляция',
      slug: 'daygo-i-aktivatsiya-kletok-naturalnykh-killerov-i-immunoregulyatsiya',
      image: 'https://s3.firstvds.ru/researches/c8y2xvmydy7unrw9m3zqt01l06byiqgo.webp',
      date: '2025-06-30',
      category: slug
    },
    {
      id: 6,
      title: 'Daigo и эффектиная борьба с микробом Хеликобактер Пилори',
      slug: 'daigo-i-effektinaya-borba-s-mikrobom-khelikobakter-pilori',
      image: 'https://s3.firstvds.ru/researches/1a4gj9sezzmfp0fm0ec06pkakc6eq76w6.webp',
      date: '2025-06-30',
      category: slug
    },
  ]

  return { category, items }
})
