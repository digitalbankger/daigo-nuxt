import type { ResearchCategory, ResearchItem } from '~/types/research'

const CATEGORIES: Record<string, ResearchCategory> = {
  metabiotiki: {
    id: 1,
    slug: 'metabiotiki',
    title: 'Метабиотики',
    image: 'https://daigo.ru/images/mock/researches/cat-1.png',
    researchCount: 6,
  },
  plazmogeny: {
    id: 2,
    slug: 'plazmogeny',
    title: 'Плазмогены',
    image: 'https://daigo.ru/images/mock/researches/cat-2.png',
    researchCount: 2,
  },
}

const ALL_ITEMS: ResearchItem[] = [
  {
    id: 1,
    title: 'Производство Да́йго',
    slug: 'proizvodstvo-daigo',
    image: 'https://daigo.ru/images/mock/researches/subcat-1.png',
    date: '2025-02-18',
    category: 'metabiotiki',
    isFeatured: true,
  },
  {
    id: 2,
    title:
      'Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра',
    slug: 'kombinirovannoe-vozdeystvie-sublingvalnoy-immunoterapii-i-daigo-na-simptomy-pollinoza-vyzyvaemogo-py',
    image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
    date: '2025-02-18',
    category: 'metabiotiki',
    isFeatured: true,
  },
  {
    id: 3,
    title: 'Дайго способствует уменьшению проницаемости кишечной стенки',
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
    date: '2025-02-18',
    category: 'metabiotiki',
    isFeatured: true,
  },
  {
    id: 4,
    title:
      'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
    slug: 'issledovanie-o-vliyanii-daygo-na-mikrobiotu-kishechnika-sportsmenovi-i-povyshenie-vynoslivosti',
    image: 'https://daigo.ru/images/mock/researches/subcat-4.png',
    date: '2025-06-30',
    category: 'metabiotiki',
  },
  {
    id: 5,
    title: 'Дайго и активация клеток натуральных киллеров и иммунорегуляция',
    slug: 'daygo-i-aktivatsiya-kletok-naturalnykh-killerov-i-immunoregulyatsiya',
    image: 'https://s3.firstvds.ru/researches/c8y2xvmydy7unrw9m3zqt01l06byiqgo.webp',
    date: '2025-06-30',
    category: 'metabiotiki',
  },
  {
    id: 6,
    title: 'Daigo и эффектиная борьба с микробом Хеликобактер Пилори',
    slug: 'daigo-i-effektinaya-borba-s-mikrobom-khelikobakter-pilori',
    image: 'https://s3.firstvds.ru/researches/1a4gj9sezzmfp0fm0ec06pkakc6eq76w6.webp',
    date: '2025-06-30',
    category: 'metabiotiki',
  },
  {
    id: 7,
    slug: 'vliyanie-daygo-na-umenshenie-faktorov-vliyayushchikh-na-progressirovanie-pochechnoy-nedostatochnosti',
    title:
      'Влияние Дайго на уменьшение факторов, влияющих на прогрессирование почечной недостаточности',
    image:
      'https://mail.daigo.ru/upload/resize_webp/resize_cache/iblock/c8b/840_560_1/ywdjd5omxsdms5ju6jhfisz0thqkggl1.webp',
    date: '2025-06-30',
    time: 8,
    views: 32240,
    category: 'plazmogeny',
  },
  {
    id: 8,
    slug: 'issledovanie-effektivnost-peroralnogo-priyema-plazmalogena-tamotsu-tamotsu-',
    title: 'Исследование: эффективность перорального приёма плазмалогена Tamotsu (Тамоцу)',
    image:
      'https://mail.daigo.ru/upload/resize_webp/iblock/3d8/1la6nvowxft073uth6hoy1w3ejprniff.webp',
    date: '2025-04-13',
    time: 8,
    views: 37140,
    category: 'plazmogeny',
  },
]

export default defineEventHandler((event) => {
  const { slug } = event.context.params!

  const categorySlug = slug === 'plazmogeny' ? 'plazmogeny' : 'metabiotiki'
  const category = CATEGORIES[categorySlug]

  const items = ALL_ITEMS.filter((item) => item.category === categorySlug)

  return { category, items }
})
