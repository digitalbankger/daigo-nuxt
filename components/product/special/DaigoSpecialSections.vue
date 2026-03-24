<script setup lang="ts">
import { computed, ref } from 'vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'

type ProductId = string | number

type BadgeItem = {
  icon: string
  title: string
}

type BenefitSection = {
  id: string
  title: string
  image: string
  imageAlt: string
  background: 'white' | 'muted'
  reverse?: boolean
  items: string[]
}

type ResearchCard = {
  title: string
  text: string
  image: string
  imageAlt: string
}

type ResultItem = {
  value: number
  text: string
}

type StepItem = {
  number: number
  text: string
}

type StrainItem = {
  title: string
  progress: number
  text: string
}

type ComparisonRow = {
  label: string
  daigo: string
  probiotics: string
  prebiotics: string
}

type FaqItem = {
  id: string
  question: string
  answer: string
}

type FaqGroup = {
  id: string
  label: string
  items: FaqItem[]
}

type SimpleFeature = {
  title: string
  text: string
}

const props = withDefaults(
  defineProps<{
    productId?: ProductId | null
    productSlug?: string | null
    enabledProductIds?: ProductId[]
    enabledProductSlugs?: string[]
  }>(),
  {
    productId: null,
    productSlug: null,
    enabledProductIds: () => [],
    enabledProductSlugs: () => ['metabiotik-daigo', 'metabiotik-daigo-10ml']
  }
)

const normalizedSlug = computed(() => (props.productSlug || '').trim().toLowerCase())
const normalizedEnabledSlugs = computed(() => props.enabledProductSlugs.map((item) => item.trim().toLowerCase()))
const normalizedEnabledIds = computed(() => props.enabledProductIds.map((item) => String(item)))

const shouldRender = computed(() => {
  const bySlug = normalizedSlug.value && normalizedEnabledSlugs.value.includes(normalizedSlug.value)
  const byId = props.productId !== null && normalizedEnabledIds.value.includes(String(props.productId))
  return Boolean(bySlug || byId)
})

const badgeImage = {
  src: 'https://daigoworld.com/cdn/shop/files/metabiotic-daigo-5ml-548226.webp?v=1731001158',
  alt: 'Метабиотик Daigo'
}

const badges: BadgeItem[] = [
  { icon: 'https://daigoworld.com/cdn/shop/files/smiling-face.png?v=1753019155', title: 'Подходит для всей семьи' },
  { icon: 'https://daigoworld.com/cdn/shop/files/sugar-blood-level.png?v=1753019777', title: 'Подходит людям с сахарным диабетом' },
  { icon: 'https://daigoworld.com/cdn/shop/files/old-people.png?v=1753019776', title: 'Подходит людям старшего возраста' },
  { icon: 'https://daigoworld.com/cdn/shop/files/allergen-free.png?v=1753019776', title: 'Без аллергенов' },
  { icon: 'https://daigoworld.com/cdn/shop/files/additive.png?v=1753019777', title: 'Без искусственных добавок' },
  { icon: 'https://daigoworld.com/cdn/shop/files/organic.png?v=1753019774', title: '100% органический продукт' },
  { icon: 'https://daigoworld.com/cdn/shop/files/leaf.png?v=1752991598', title: 'Подходит веганам' },
  { icon: 'https://daigoworld.com/cdn/shop/files/lactose-free-2.png?v=1753019774', title: 'Без лактозы' },
  { icon: 'https://daigoworld.com/cdn/shop/files/gluten-free-2.png?v=1753019778', title: 'Без глютена' },
  { icon: 'https://daigoworld.com/cdn/shop/files/no-gmo.png?v=1752991739', title: 'Без ГМО' },
  { icon: 'https://daigoworld.com/cdn/shop/files/prenatal-care.png?v=1753019777', title: 'Без живых бактерий' }
]

const benefitSections: BenefitSection[] = [
  {
    id: 'digestive-health',
    title: 'Поддержка пищеварения',
    image: 'https://daigoworld.com/cdn/shop/files/ChatGPT_Image_5_._2025_._19_52_38.webp?v=1754395639',
    imageAlt: 'Поддержка пищеварения Daigo',
    background: 'white',
    items: [
      'Способствует восстановлению здорового баланса кишечной микрофлоры.',
      'Поддерживает моторику кишечника и регулярность пищеварения.',
      'Помогает нормализовать стул.',
      'Способствует уменьшению вздутия и газообразования.',
      'Поддерживает естественные процессы детоксикации.',
      'Может быть полезен при дисбиозе и синдроме раздражённого кишечника.'
    ]
  },
  {
    id: 'immune-support',
    title: 'Поддержка иммунной системы',
    image: 'https://daigoworld.com/cdn/shop/files/ChatGPT_Image_5_._2025_._19_46_22.webp?v=1754395646',
    imageAlt: 'Поддержка иммунитета Daigo',
    background: 'white',
    reverse: true,
    items: [
      'Способствует активации иммунных клеток кишечника.',
      'Поддерживает более сбалансированный иммунный ответ.',
      'Помогает поддерживать активность иммунных клеток.',
      'Может способствовать снижению частоты простудных состояний.',
      'Поддерживает естественную защиту организма от вирусов и аллергенов.'
    ]
  },
  {
    id: 'helicobacter',
    title: 'Поддержка при Helicobacter pylori',
    image: 'https://daigoworld.com/cdn/shop/files/ChatGPT_Image_5_._2025_._19_59_08.webp?v=1754395646',
    imageAlt: 'Поддержка желудка Daigo',
    background: 'muted',
    items: [
      'Может способствовать снижению колонизации H. pylori.',
      'Помогает уменьшить воспалительную нагрузку на слизистую желудка.',
      'Поддерживает защиту слизистой и комфорт пищеварения.',
      'Мягкая формула без живых бактерий и агрессивного воздействия.'
    ]
  },
  {
    id: 'skin-wellness',
    title: 'Кожа и общее самочувствие',
    image: 'https://daigoworld.com/cdn/shop/files/ChatGPT_Image_5_._2025_._20_20_07.webp?v=1754396529',
    imageAlt: 'Кожа и общее самочувствие Daigo',
    background: 'white',
    reverse: true,
    items: [
      'Поддерживает здоровье кожи и микробиом.',
      'Способствует лучшему усвоению нутриентов.',
      'Освежает дыхание и поддерживает здоровье полости рта.',
      'Поддерживает ежедневный тонус и общее самочувствие.'
    ]
  }
]

const mechanismIntro = {
  title: 'Как Daigo поддерживает здоровье кишечника и иммунитет',
  text: 'В отличие от классических пробиотиков и антибиотиков, Daigo использует современный подход к восстановлению микробиома без добавления живых бактерий. Это метабиотик: в его основе — биоактивные секреторные вещества, которые полезные лактобактерии вырабатывают в процессе ферментации. Эти вещества помогают поддерживать полезную флору и сдерживать патогенную.'
}

const mechanismFooter = 'Когда микробиом кишечника в балансе, пищеварение работает стабильнее, обменные процессы протекают спокойнее, а иммунная защита получает надёжную поддержку.'

const steps: StepItem[] = [
  { number: 1, text: 'Способствует росту полезной кишечной микрофлоры' },
  { number: 2, text: 'Сдерживает нежелательные микроорганизмы без агрессивного подавления' },
  { number: 3, text: 'Помогает восстановить естественный микробный баланс' },
  { number: 4, text: 'Поддерживает иммунную систему через кишечник' }
]

const resultItems: ResultItem[] = [
  { value: 93, text: 'пользователей отмечали уменьшение вздутия уже в течение первой недели курса' },
  { value: 82, text: 'отмечали улучшение пищеварения и обменных процессов через 1–1,5 месяца' },
  { value: 87, text: 'сообщали об уменьшении газообразования уже в течение первой недели' }
]

const researchCards: ResearchCard[] = [
  {
    title: 'Albert Einstein College of Medicine, США',
    text: 'Отмечено значимое улучшение состояния ЖКТ у пациентов.',
    image: 'https://daigoworld.com/cdn/shop/files/einstein_700x700.webp?v=1753192524',
    imageAlt: 'Albert Einstein College of Medicine'
  },
  {
    title: 'Университет Кюсю, Япония',
    text: 'Показана выраженная эффективность в поддержке здоровья кишечника.',
    image: 'https://daigoworld.com/cdn/shop/files/ito-campus_700x700.webp?v=1753192605',
    imageAlt: 'Университет Кюсю'
  },
  {
    title: 'Университет Ниигата, Япония',
    text: 'Подтверждена поддержка иммунного баланса и активности иммунных клеток.',
    image: 'https://daigoworld.com/cdn/shop/files/ku_img01_700x700.webp?v=1753192605',
    imageAlt: 'Университет Ниигата'
  }
]

const quote = {
  text: 'Полный курс Daigo помогает снизить количество нежелательной микрофлоры, поддерживает рост полезных бактерий и способствует активации иммунных клеток кишечника.',
  author: '— доктор Хироми Синья, профессор хирургии Albert Einstein College of Medicine'
}

const leftStrains: StrainItem[] = [
  {
    title: 'L. CURTAVUS (BSC 001, BSC 002)',
    progress: 100,
    text: 'Поддерживает баланс кишечной флоры и помогает уменьшить воспалительную нагрузку. Способствует более комфортному пищеварению и регулярности.'
  },
  {
    title: 'L. CASEI (BSC 003, BSC 004)',
    progress: 80,
    text: 'Поддерживает иммунную систему и помогает при переваривании лактозы. Может способствовать уменьшению вздутия и пищевой чувствительности.'
  },
  {
    title: 'L. ACIDOPHILUS (BSC 005, BSC 006)',
    progress: 90,
    text: 'Способствует лучшему усвоению нутриентов и поддерживает pH-баланс микрофлоры. Часто ассоциируется с поддержкой кожи и слизистых.'
  },
  {
    title: 'L. PLANTARUM (BSC 007, BSC 008, BSC 009)',
    progress: 90,
    text: 'Поддерживает слизистую кишечника, помогает снижать воспаление и поддерживает обменные процессы и иммунный ответ.'
  }
]

const rightStrains: StrainItem[] = [
  {
    title: 'L. FERMENTUM (BSC 010)',
    progress: 67,
    text: 'Содержит антиоксидантный потенциал и поддерживает процессы детоксикации, в том числе функцию печени.'
  },
  {
    title: 'L. SALIVARIUS (BSC 011, BSC 012)',
    progress: 96,
    text: 'Поддерживает баланс микробиома полости рта, кишечника и кожи. Способствует свежему дыханию и иммунной поддержке.'
  },
  {
    title: 'L. BREVIS (BSC 013, BSC 014)',
    progress: 92,
    text: 'Поддерживает кишечный барьер и связан с регуляцией уровней ГАМК, что может быть полезно при стрессовой нагрузке.'
  },
  {
    title: 'L. RHAMNOSUS (BSC 015, BSC 016)',
    progress: 92,
    text: 'Обеспечивает сильную иммунную поддержку и помогает противодействовать нежелательной микрофлоре, включая H. pylori.'
  }
]

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Биодоступность',
    daigo: 'Максимальная: готовые активные метаболиты.',
    probiotics: 'Зависит от выживаемости бактерий.',
    prebiotics: 'Косвенный механизм действия.'
  },
  {
    label: 'Скорость начала действия',
    daigo: 'Поддержка начинается с первых дней приёма.',
    probiotics: 'Нужен регулярный и длительный приём.',
    prebiotics: 'Эффект накапливается постепенно.'
  },
  {
    label: 'Риск конфликтов между бактериями',
    daigo: 'Нет — живые бактерии не добавляются.',
    probiotics: 'В чувствительном кишечнике возможен дискомфорт.',
    prebiotics: 'Конфликтов нет, но эффект ограничен.'
  },
  {
    label: 'Стабильность хранения',
    daigo: 'Не требует холодильника.',
    probiotics: 'Часто требует холодовой цепочки.',
    prebiotics: 'Как правило, стабильны.'
  },
  {
    label: 'Применение при СРК / СИБР / дисбиозе',
    daigo: 'Подходит мягкий формат без живых бактерий.',
    probiotics: 'Может усиливать симптомы у части людей.',
    prebiotics: 'Эффект обычно умеренный.'
  },
  {
    label: 'Наличие активных метаболитов',
    daigo: 'Да — ферменты, органические кислоты, биоактивные соединения.',
    probiotics: 'Только если бактерии выживут и колонизируются.',
    prebiotics: 'Нет готовых метаболитов.'
  },
  {
    label: 'Противовоспалительная поддержка',
    daigo: 'Выраженная поддержка кишечника и микробиома.',
    probiotics: 'Зависит от конкретного штамма.',
    prebiotics: 'Прямого эффекта почти нет.'
  },
  {
    label: 'Иммунная регуляция',
    daigo: 'Поддерживает иммунитет без избыточной стимуляции.',
    probiotics: 'Эффект менее предсказуем.',
    prebiotics: 'Ограниченная поддержка.'
  },
  {
    label: 'Совместимость с лекарствами',
    daigo: 'Можно сочетать с другими схемами, включая антибиотики.',
    probiotics: 'Часто страдают при одновременном приёме антибиотиков.',
    prebiotics: 'Обычно совместимы.'
  },
  {
    label: 'Технологичность',
    daigo: 'Современный метабиотический подход.',
    probiotics: 'Классическая культура живых бактерий.',
    prebiotics: 'Базовые пищевые субстраты для флоры.'
  },
  {
    label: 'Универсальность',
    daigo: 'Не зависит от того, какие штаммы уже живут в кишечнике.',
    probiotics: 'Эффект зависит от исходного состава микробиома.',
    prebiotics: 'Зависят от текущей бактериальной среды.'
  }
]

const faqGroups: FaqGroup[] = [
  {
    id: 'about',
    label: 'О Daigo и принципе действия',
    items: [
      {
        id: 'faq-what-is-daigo',
        question: 'Что такое Daigo?',
        answer: 'Daigo — это органический продукт из Японии, относящийся к классу метабиотиков. В составе — секреторные вещества и клеточный материал 16 видов полезных лактобактерий. Такой состав помогает создавать благоприятную среду для собственной полезной микрофлоры кишечника и поддерживает иммунную систему.'
      },
      {
        id: 'faq-daigo-vs-lux',
        question: 'Чем отличается Daigo от Daigo Lux?',
        answer: 'Daigo Lux содержит более высокую концентрацию активных веществ и проходит дополнительную ферментацию. За счёт этого продукт усваивается быстрее, а дозировка может быть ниже.'
      },
      {
        id: 'faq-made-in',
        question: 'Где производится Daigo?',
        answer: 'Daigo производится в Японии у подножия горы Фудзи — в экологически чистом районе с высоким стандартом контроля производства GMP.'
      },
      {
        id: 'faq-gmp',
        question: 'Что такое стандарт GMP?',
        answer: 'GMP — это международный стандарт надлежащей производственной практики. Он подтверждает, что сырьё, технологические процессы и контроль качества соответствуют строгим требованиям.'
      },
      {
        id: 'faq-metabiotics',
        question: 'Что такое метабиотики?',
        answer: 'Метабиотики — это продукты жизнедеятельности полезных бактерий и их клеточный материал. В отличие от пробиотиков, они не содержат живых бактерий, но помогают создать среду, благоприятную для собственной полезной флоры организма.'
      },
      {
        id: 'faq-immunity',
        question: 'Как Daigo поддерживает иммунитет?',
        answer: 'Поддержка иммунитета идёт через кишечник. Клеточный материал и биоактивные соединения в составе помогают активировать иммунные клетки, связанные с кишечным барьером.'
      }
    ]
  },
  {
    id: 'composition',
    label: 'Состав и научная база',
    items: [
      {
        id: 'faq-microorganisms',
        question: 'Есть ли в составе живые микроорганизмы?',
        answer: 'Нет. Daigo не содержит живых микроорганизмов. В нём присутствуют только секреторные вещества и клеточный материал 16 видов полезных лактобактерий.'
      },
      {
        id: 'faq-ingredients',
        question: 'Есть ли дополнительные ингредиенты?',
        answer: 'Помимо биоактивных компонентов, в составе используются вода, органические кислоты и вспомогательные компоненты. Продукт не содержит ГМО, глютен и сахариды/подсластители.'
      },
      {
        id: 'faq-effectiveness',
        question: 'Подтверждены ли эффективность и безопасность?',
        answer: 'Да, продукт изучался в Японии, Европе и других странах. На странице выше собраны ключевые исследовательские направления и наблюдаемые эффекты.'
      }
    ]
  },
  {
    id: 'how-to-take',
    label: 'Как принимать',
    items: [
      {
        id: 'faq-frequency',
        question: 'Как часто принимать Daigo?',
        answer: 'Daigo можно принимать курсами по 3–6 месяцев или длительно на постоянной основе. Минимальный рекомендуемый курс — 3 месяца. Схема приёма подбирается индивидуально.'
      },
      {
        id: 'faq-with-meds',
        question: 'Можно ли принимать Daigo вместе с другими препаратами?',
        answer: 'Да, продукт совместим с БАДами и лекарственными схемами. При наличии серьёзных заболеваний схему приёма лучше согласовать с лечащим врачом.'
      },
      {
        id: 'faq-with-probiotics',
        question: 'Можно ли сочетать Daigo с пробиотиками?',
        answer: 'Да, сочетание возможно. Но сам формат метабиотика уже закрывает задачу поддержки микробиома без внесения живых бактерий.'
      },
      {
        id: 'faq-weight',
        question: 'Может ли Daigo использоваться в программах коррекции веса?',
        answer: 'Daigo может быть частью комплексного подхода к нормализации веса за счёт поддержки кишечного микробиома, пищеварения и пищевых привычек.'
      },
      {
        id: 'faq-diet',
        question: 'Нужна ли специальная диета во время приёма?',
        answer: 'Нет, специальная диета не требуется. При этом сбалансированное питание обычно усиливает общий эффект от курса.'
      },
      {
        id: 'faq-antibiotics',
        question: 'Помогает ли Daigo после антибиотиков?',
        answer: 'Да, Daigo часто используют для поддержки микробиома после курса антибиотиков. Его также можно принимать параллельно и затем продолжить курс после завершения антибиотикотерапии.'
      }
    ]
  },
  {
    id: 'impact',
    label: 'Влияние на здоровье и профилактика',
    items: [
      {
        id: 'faq-prevention',
        question: 'Подходит ли Daigo для профилактики нарушений ЖКТ?',
        answer: 'Да, курсовой приём часто используют в профилактических программах для поддержки ЖКТ, иммунитета и общего микробиомного баланса.'
      },
      {
        id: 'faq-digestion',
        question: 'Может ли Daigo облегчить проблемы с пищеварением?',
        answer: 'Да, за счёт восстановления микробиомного баланса продукт помогает уменьшать дискомфорт, вздутие, нестабильность стула и другие проявления нарушений ЖКТ.'
      },
      {
        id: 'faq-ibs',
        question: 'Может ли Daigo быть полезен при синдроме раздражённого кишечника?',
        answer: 'Daigo нередко включают в программы поддержки при СРК, поскольку формат метабиотика обычно переносится мягче, чем пробиотики с живыми штаммами.'
      }
    ]
  },
  {
    id: 'safety',
    label: 'Безопасность и длительность приёма',
    items: [
      {
        id: 'faq-pregnancy',
        question: 'Можно ли принимать Daigo во время беременности и грудного вскармливания?',
        answer: 'В международных материалах продукт описывается как мягкий и безопасный. Но для российского рынка рекомендации по приёму в период беременности и лактации лучше дополнительно согласовывать с врачом.'
      },
      {
        id: 'faq-side-effects',
        question: 'Есть ли риск побочных эффектов или аллергической реакции?',
        answer: 'Как правило, продукт переносится хорошо. Отсутствие живых бактерий и сахаридов дополнительно снижает вероятность нежелательных реакций у чувствительных пользователей.'
      },
      {
        id: 'faq-when-results',
        question: 'Через сколько появляется результат?',
        answer: 'Первые изменения часто замечают в течение первого месяца, а более выраженный эффект раскрывается после полноценного курса 3–6 месяцев.'
      }
    ]
  }
]

const activeFaqGroup = ref<string>(faqGroups[0]?.id || 'about')

const activeFaqItems = computed(() => {
  return faqGroups.find((group) => group.id === activeFaqGroup.value)?.items || []
})

const historyBlock = {
  title: '111 лет истории',
  quote: '«Я хочу, чтобы лактобактерии помогали людям становиться здоровее.»',
  author: 'Какутаро Масагаки',
  description: 'Более века исследований, развития ферментационных технологий и работы нескольких поколений японских специалистов легли в основу Daigo. Сегодня производство и исследовательская база компании позволяют выпускать продукт премиального уровня с фокусом на здоровье кишечника и долголетие.',
  image: 'https://daigoworld.com/cdn/shop/files/Betterimage.ai_1754476748858.jpg?v=1754476827',
  imageAlt: 'История бренда Daigo'
}

const productionBlock = {
  title: 'Производство Daigo',
  text: 'Daigo производится на собственной площадке у подножия горы Фудзи в экологически чистом регионе Японии. Для производства используются собственные ферментационные мощности и тщательно отобранное сырьё.',
  image: 'https://daigoworld.com/cdn/shop/files/fv03_pc.webp?v=1707067553',
  imageAlt: 'Производство Daigo'
}

const productionFeaturesA: SimpleFeature[] = [
  {
    title: 'Премиальное сырьё',
    text: 'Органические соевые бобы без пестицидной нагрузки, выращенные в экологичных условиях.'
  },
  {
    title: 'Симбиотическое культивирование',
    text: '16 штаммов Lactobacillus выращиваются совместно в гармоничной ферментационной среде.'
  },
  {
    title: 'Год ферментации',
    text: '365-дневный цикл позволяет накопить максимальную концентрацию полезных биоактивных соединений.'
  }
]

const productionFeaturesB: SimpleFeature[] = [
  {
    title: 'Ультравысокая плотность культивирования',
    text: 'Концентрация культур многократно выше, чем в обычных молочнокислых средах.'
  },
  {
    title: 'Биоактивная экстракция',
    text: 'В продукт отбираются только секретируемые биоактивные соединения и клеточный материал — без живых бактерий.'
  },
  {
    title: 'Жёсткая стандартизация',
    text: 'Контроль качества ведётся на каждом этапе производства: от сырья до финального розлива.'
  }
]
</script>

<template>
  <section v-if="shouldRender" class="bg-white text-neutral-950">
    <div class="mx-auto max-w-[1600px]">
      <section class="pb-6 pt-10 lg:pb-8 lg:pt-14">
        <div class="grid items-start gap-10 lg:grid-cols-[1.1fr_0.8fr] lg:gap-12">
          <div>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 xl:gap-6">
              <article
                v-for="badge in badges"
                :key="badge.title"
                class="transition hover:-translate-y-0.5"
              >
                <div class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                  <img
                    :src="badge.icon"
                    :alt="badge.title"
                    class="h-12 w-12 object-contain"
                    loading="lazy"
                    decoding="async"
                  >
                </div>
                <p class="text-sm leading-5 text-neutral-900 sm:text-[15px]">
                  {{ badge.title }}
                </p>
              </article>
            </div>
          </div>

          <div class="mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] bg-neutral-100 shadow-sm">
            <img
              :src="badgeImage.src"
              :alt="badgeImage.alt"
              class="aspect-[9.6/13] w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto max-w-[1200px]">
          <h2 class="max-w-4xl text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Клинически изученные преимущества и комплексная поддержка организма с Daigo
          </h2>
        </div>
      </section>

      <section
        v-for="section in benefitSections"
        :key="section.id"
        :class="section.background === 'muted' ? 'bg-neutral-100' : 'bg-white'"
        class="px-4 py-12 sm:px-6 lg:px-16 lg:py-16"
      >
        <div
          class="mx-auto grid max-w-[1400px] items-center gap-8 lg:grid-cols-2 lg:gap-14"
          :class="section.reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''"
        >
          <div>
            <h3 class="text-2xl font-medium tracking-tight sm:text-3xl lg:text-4xl">
              {{ section.title }}
            </h3>

            <ul class="mt-8 space-y-4">
              <li
                v-for="item in section.items"
                :key="item"
                class="flex items-start gap-4"
              >
                <span class="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-4 border-primary text-xs font-black text-primary">
                  ✓
                </span>
                <span class="text-base leading-7 text-neutral-700 sm:text-lg">
                  {{ item }}
                </span>
              </li>
            </ul>
          </div>

          <div class="overflow-hidden rounded-[28px] bg-neutral-100 shadow-sm">
            <img
              :src="section.image"
              :alt="section.imageAlt"
              class="w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              {{ mechanismIntro.title }}
            </h2>
            <p class="mt-6 text-base leading-8 text-neutral-700 sm:text-lg">
              {{ mechanismIntro.text }}
            </p>
            <div class="mt-8 overflow-hidden rounded-[28px] bg-white shadow-sm lg:max-w-[460px]">
              <img
                src="https://daigoworld.com/cdn/shop/files/metabiotic-daigo-5ml-516975.webp?v=1741771813"
                alt="Как работает Daigo"
                class="aspect-square w-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </div>
          </div>

          <div>
            <div class="space-y-6 rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <div
                v-for="step in steps"
                :key="step.number"
                class="flex gap-4 border-b border-neutral-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-neutral-200 text-lg font-medium text-neutral-900">
                  {{ step.number }}
                </div>
                <div class="flex items-center text-lg font-medium leading-7 text-neutral-900">
                  {{ step.text }}
                </div>
              </div>
            </div>

            <p class="mt-8 text-base leading-8 text-neutral-700 sm:text-lg">
              {{ mechanismFooter }}
            </p>
          </div>
        </div>
      </section>

      <section class="bg-white px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              Реальные измеримые результаты
            </h2>
            <p class="mt-4 max-w-2xl text-sm leading-6 text-neutral-500 sm:text-base">
              Ниже — агрегированные показатели, приведённые в исходных зарубежных материалах производителя.
            </p>
          </div>

          <div class="space-y-4">
            <article
              v-for="item in resultItems"
              :key="item.text"
              class="flex items-center gap-4 rounded-[28px] border border-neutral-200 bg-neutral-50 px-4 py-4 sm:gap-6 sm:px-6"
            >
              <div
                class="result-ring flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white text-2xl font-medium text-neutral-900 sm:h-28 sm:w-28"
                :style="{ '--ring-value': `${item.value}%` }"
              >
                {{ item.value }}%
              </div>
              <p class="text-base leading-7 text-neutral-700 sm:text-lg">
                {{ item.text }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-white px-4 pb-12 sm:px-6 lg:px-16 lg:pb-16">
        <div class="mx-auto max-w-[1400px]">
          <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Клинически подтверждённая эффективность
          </h2>

          <div class="mt-8 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible">
            <article
              v-for="card in researchCards"
              :key="card.title"
              class="min-w-[280px] snap-start overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-sm lg:min-w-0"
            >
              <img
                :src="card.image"
                :alt="card.imageAlt"
                class="aspect-[12/8] w-full object-cover"
                loading="lazy"
                decoding="async"
              >
              <div class="p-5 sm:p-6">
                <h3 class="text-lg font-medium leading-7 text-neutral-900">
                  {{ card.title }}
                </h3>
                <p class="mt-3 text-sm leading-6 text-neutral-700 sm:text-base">
                  {{ card.text }}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-white px-4 pb-12 sm:px-6 lg:px-16 lg:pb-16">
        <div class="mx-auto max-w-[1100px] rounded-[32px] border border-neutral-200 bg-neutral-50 px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
          <p class="text-lg italic leading-8 text-neutral-800 sm:text-xl">
            «{{ quote.text }}»
          </p>
          <p class="mt-5 text-sm font-medium uppercase tracking-[0.12em] text-neutral-500 sm:text-base">
            {{ quote.author }}
          </p>
        </div>
      </section>

      <section class="bg-white px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto max-w-[1500px]">
          <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Метаболиты 16 штаммов Lactobacillus: что они делают
          </h2>

          <div class="mt-10 grid gap-8 lg:grid-cols-[1fr_0.85fr_1fr] lg:items-center">
            <div class="space-y-8">
              <article v-for="item in leftStrains" :key="item.title">
                <h3 class="text-lg font-medium uppercase leading-6 text-neutral-900 sm:text-xl">
                  {{ item.title }}
                </h3>
                <div class="mt-3 h-px w-full bg-neutral-200">
                  <div class="h-px bg-neutral-900" :style="{ width: `${item.progress}%` }" />
                </div>
                <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
                  {{ item.text }}
                </p>
              </article>
            </div>

            <div class="overflow-hidden rounded-[32px] bg-neutral-50 shadow-sm">
              <img
                src="https://daigoworld.com/cdn/shop/files/metabiotic-daigo-5ml-481137.png?v=1741776597"
                alt="Метабиотик Daigo"
                class="aspect-square w-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </div>

            <div class="space-y-8">
              <article v-for="item in rightStrains" :key="item.title">
                <h3 class="text-lg font-medium uppercase leading-6 text-neutral-900 sm:text-xl">
                  {{ item.title }}
                </h3>
                <div class="mt-3 h-px w-full bg-neutral-200">
                  <div class="h-px bg-neutral-900" :style="{ width: `${item.progress}%` }" />
                </div>
                <p class="mt-4 text-sm leading-7 text-neutral-700 sm:text-base">
                  {{ item.text }}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto max-w-[1500px]">
          <h2 class="text-center text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Daigo vs традиционные пробиотики и пребиотики
          </h2>

          <div class="mt-8 overflow-x-auto rounded-[28px] border border-neutral-200 bg-white shadow-sm">
            <table class="min-w-[980px] w-full border-collapse text-left">
              <thead>
                <tr class="border-b border-neutral-200 bg-neutral-50">
                  <th class="px-5 py-4 text-sm font-medium uppercase tracking-[0.12em] text-neutral-500">Критерий</th>
                  <th class="px-5 py-4 text-base font-medium text-neutral-900">Daigo</th>
                  <th class="px-5 py-4 text-base font-medium text-neutral-900">Пробиотики</th>
                  <th class="px-5 py-4 text-base font-medium text-neutral-900">Пребиотики</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in comparisonRows"
                  :key="row.label"
                  class="border-b border-neutral-200 last:border-b-0"
                >
                  <td class="px-5 py-5 align-top text-sm font-medium leading-6 text-neutral-900 sm:text-base">
                    {{ row.label }}
                  </td>
                  <td class="px-5 py-5 align-top text-sm leading-6 text-neutral-700 sm:text-base">
                    {{ row.daigo }}
                  </td>
                  <td class="px-5 py-5 align-top text-sm leading-6 text-neutral-700 sm:text-base">
                    {{ row.probiotics }}
                  </td>
                  <td class="px-5 py-5 align-top text-sm leading-6 text-neutral-700 sm:text-base">
                    {{ row.prebiotics }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto max-w-[1500px]">
          <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Часто задаваемые вопросы
          </h2>

          <div class="mt-10 grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
            <aside class="lg:sticky lg:top-24 lg:h-fit">
              <div class="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                <button
                  v-for="group in faqGroups"
                  :key="group.id"
                  type="button"
                  class="min-w-max rounded-full border px-4 py-2 text-left text-sm font-medium transition lg:rounded-2xl lg:px-5 lg:py-4 lg:text-base"
                  :class="
                    activeFaqGroup === group.id
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900'
                  "
                  @click="activeFaqGroup = group.id"
                >
                  {{ group.label }}
                </button>
              </div>
            </aside>

            <div class="rounded-[32px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
              <div class="mb-6 border-b border-neutral-200 pb-5">
                <h3 class="text-xl font-medium tracking-tight text-neutral-900 sm:text-2xl">
                  {{ faqGroups.find((group) => group.id === activeFaqGroup)?.label }}
                </h3>
              </div>

              <div class="space-y-3">
                <AccordionItem
                  v-for="item in activeFaqItems"
                  :key="item.id"
                  :title="item.question"
                >
                  <div class="prose prose-sm max-w-none text-neutral-700 sm:prose-base">
                    <p>{{ item.answer }}</p>
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="overflow-hidden rounded-[32px] bg-neutral-100 shadow-sm lg:order-1">
            <img
              :src="historyBlock.image"
              :alt="historyBlock.imageAlt"
              class="w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="lg:order-2">
            <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              {{ historyBlock.title }}
            </h2>
            <p class="mt-8 text-2xl italic leading-9 text-neutral-900 sm:text-3xl">
              {{ historyBlock.quote }}
            </p>
            <p class="mt-4 text-base font-medium uppercase tracking-[0.12em] text-neutral-500">
              {{ historyBlock.author }}
            </p>
            <p class="mt-8 text-base leading-8 text-neutral-700 sm:text-lg">
              {{ historyBlock.description }}
            </p>
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 class="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
              {{ productionBlock.title }}
            </h2>
            <p class="mt-8 text-base leading-8 text-neutral-700 sm:text-lg">
              {{ productionBlock.text }}
            </p>
          </div>
          <div class="overflow-hidden rounded-[32px] bg-white shadow-sm">
            <img
              :src="productionBlock.image"
              :alt="productionBlock.imageAlt"
              class="w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </section>

      <section class="bg-white px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="order-2 lg:order-1 overflow-hidden rounded-[32px] bg-neutral-100 shadow-sm">
            <img
              src="https://daigoworld.com/cdn/shop/files/fv09_pc.jpg?v=1707067613"
              alt="Сырьё и ферментация Daigo"
              class="w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="order-1 lg:order-2 space-y-5">
            <article
              v-for="feature in productionFeaturesA"
              :key="feature.title"
              class="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h3 class="text-xl font-medium uppercase tracking-tight text-neutral-900 sm:text-2xl">
                {{ feature.title }}
              </h3>
              <p class="mt-3 text-base leading-7 text-neutral-700 sm:text-lg">
                {{ feature.text }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-neutral-100 px-4 py-12 sm:px-6 lg:px-16 lg:py-16">
        <div class="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="space-y-5">
            <article
              v-for="feature in productionFeaturesB"
              :key="feature.title"
              class="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h3 class="text-xl font-medium uppercase tracking-tight text-neutral-900 sm:text-2xl">
                {{ feature.title }}
              </h3>
              <p class="mt-3 text-base leading-7 text-neutral-700 sm:text-lg">
                {{ feature.text }}
              </p>
            </article>
          </div>
          <div class="overflow-hidden rounded-[32px] bg-white shadow-sm">
            <img
              src="https://daigoworld.com/cdn/shop/files/fv10_pc.webp?v=1707067819"
              alt="Стандартизация и экстракция Daigo"
              class="w-full object-cover"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.result-ring {
  background:
    radial-gradient(closest-side, #ffffff 78%, transparent 79% 100%),
    conic-gradient(#aab5c8 var(--ring-value), #e5e7eb 0);
}
.bg-neutral-100 {
    /* background-color: #dad2ba2b !important; */
    background-color: #9db0d326 !important;
    border-radius: 1.5rem;
}
</style>
