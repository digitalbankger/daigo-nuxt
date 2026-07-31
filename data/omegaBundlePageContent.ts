import type { BundleContentSection, ProductFaq, ProductImage } from '~/types/product'
import type { OmegaBundleSlug } from '~/constants/omegaBundles'

export type OmegaBundlePageContent = {
  name: string
  bundleSections: BundleContentSection[]
  faq: ProductFaq
  heroImage: string
  galleryImages: ProductImage[]
  fallbackShortDescription: string
  fallbackFullDescription: string
}

type BundleDefinition = {
  partnerName: string
  heroImage: string
  omegaImage: string
  partnerImage: string
  systemImage: string
  relevanceImage: string
  faqImage: string
  name: string
  fallbackShortDescription: string
  fallbackFullDescription: string
  featureLead: string
  partnerDescription: string
  fact: string
  relevanceItems: string[]
  faq: ProductFaq['items']
}

const ASSET_BASE = '/images/omega-bundle'

const definitions: Record<OmegaBundleSlug, BundleDefinition> = {
  'dvizhenie-mysli': {
    partnerName: 'Brainy',
    heroImage: `${ASSET_BASE}/movement-hero.png`,
    omegaImage: `${ASSET_BASE}/omega-brainy-flatlay.png`,
    partnerImage: `${ASSET_BASE}/brainy-products.png`,
    systemImage: `${ASSET_BASE}/omega-brainy-system.png`,
    relevanceImage: `${ASSET_BASE}/movement-relevance.png`,
    faqImage: `${ASSET_BASE}/faq-support.png`,
    name: 
      'ДВИЖЕНИЕ МЫСЛИ DAIGO Омега-3 + Brainy',
    fallbackShortDescription:
      'Многоуровневая нутрицевтическая поддержка нервной системы в периоды, когда особенно важны концентрация, ясность мышления и способность сохранять рабочий ритм при высокой нагрузке.',
    fallbackFullDescription:
      'Набор подойдёт тем, кто много работает с информацией, постоянно переключается между задачами, учится, готовится к важным проектам или переживает особенно интенсивный интеллектуальный период.',
    featureLead:
      '<p>Рабочий день может закончиться, но мысль редко останавливается по расписанию. Переговоры, решения, переключение между задачами и постоянный поток информации требуют от нервной системы непрерывной адаптации.</p><p>Набор «Движение мысли» объединяет японскую DAIGO Омега-3 и аминобиотик Brainy. Омега-3 обеспечивает организм EPA и DHA, а Brainy продолжает этот липидный фундамент через холин, нервоновую кислоту, аминокислоты и витамины группы B. Компоненты не повторяют друг друга, а подключаются к разным элементам одной физиологической системы.</p>',
    partnerDescription:
      '<p class="font-medium">Brainy - направленная пятиуровневая формула оси «кишечник-мозг».</p><p>Пептидный компонент задает архитектуру продукта, аминокислоты формируют субстратный уровень, целлюлаза работает на пищеварительном этапе, нервоновая кислота создает функциональный липидный акцент, а холин и витамины группы B дополняют фосфолипидный и кофакторный контуры.</p>',
    fact:
      'DHA и нервоновая кислота относятся к разным элементам липидной структуры нервной ткани. В клеточных исследованиях смесь рыбьего жира с эфиром нервоновой кислоты влияла на синтез сфингомиелина и маркеров миелина в человеческих олигодендроцитах.`',
    relevanceItems: [
      'В периоды интенсивной умственной работы и высокой ответственности',
      'При постоянном переключении между задачами и большом объёме информации',
      'Во время подготовки к важным проектам, выступлениям или обучению',
      'Когда хочется поддержать устойчивость нервного ресурса и когнитивные процессы',
      'Для тех, кто предпочитает не отдельный ингредиент, а продуманную архитектуру формул',
    ],
    faq: [
      { q: 'Почему в наборе две упаковки Омега-3?', a: 'Расширенная комплектация увеличивает продолжительность курса. Точный состав выбранного варианта всегда показывается в карточке и приходит с сервера.' },
      { q: 'Чем набор отличается от отдельного Brainy?', a: 'Brainy обеспечивает функциональную нутриентную поддержку, а EPA и DHA из Омега-3 участвуют в поддержании структуры клеточных мембран.' },
      { q: 'Заменяет ли набор сон, питание и восстановление?', a: 'Нет. Биологически активные добавки дополняют рацион, но не заменяют полноценное питание, сон и рекомендации специалиста.' },
      { q: 'Можно ли принимать продукты в один период?', a: 'Продукты рассчитаны на совместный курс при соблюдении инструкции. При наличии заболеваний или приёме лекарств проконсультируйтесь со специалистом.' },
      { q: 'Чем отличается Омега-3 от Дайго?', a: 'Это разные продукты с разным составом и назначением. В наборе Омега-3 сочетается с направленной формулой Brainy.' },
    ],
  },
  'obnovlenie-kozhi': {
    partnerName: 'Dermic',
    heroImage: `${ASSET_BASE}/renewal-skin-hero.png`,
    omegaImage: `${ASSET_BASE}/omega-brainy-flatlay.png`,
    partnerImage: `${ASSET_BASE}/renewal-skin-hero.png`,
    systemImage: `${ASSET_BASE}/omega-brainy-system.png`,
    relevanceImage: `${ASSET_BASE}/renewal-skin-hero.png`,
    faqImage: `${ASSET_BASE}/faq-support.png`,
    name: 'ОБНОВЛЕНИЕ КОЖИ DAIGO Омега-3 + Dermic',
    fallbackShortDescription: 'Комплексная нутрицевтическая поддержка кожи: структурные липиды Омега-3 и направленная формула DAIGO Dermic.',
    fallbackFullDescription: 'Набор создан для периодов, когда коже особенно важны питание изнутри, поддержка защитного барьера и естественных процессов обновления.',
    featureLead: '<p>Кожа постоянно обновляется и реагирует на рацион, стресс, сезонные изменения и качество сна. Комплекс объединяет Омега-3 и DAIGO Dermic, чтобы поддерживать её на структурном и нутриентном уровнях.</p>',
    partnerDescription: 'DAIGO Dermic содержит натуральный короткий пептид хлореллы IPH и комплекс нутриентов, направленных на поддержку естественного обновления кожи.',
    fact: 'Состояние кожи связано не только с наружным уходом: значимую роль играют полноценный рацион, жирные кислоты и нутриенты, участвующие в обновлении тканей.',
    relevanceItems: ['При тусклом цвете и неровном тоне кожи', 'При высокой нагрузке и недостатке полезных жиров в рационе', 'В период сезонного стресса для кожи', 'Для комплексной поддержки кожи изнутри'],
    faq: [
      { q: 'Почему в наборе продукты с разным составом?', a: 'Омега-3 поддерживает липидные структуры клеток, а Dermic дополняет комплекс направленной формулой для кожи.' },
      { q: 'Можно ли принимать продукты одновременно?', a: 'Да, при соблюдении рекомендаций на упаковке и отсутствии индивидуальных противопоказаний.' },
      { q: 'Как выбрать вариант набора?', a: 'Сравните состав вариантов в верхней части страницы: комплектации и цены поступают напрямую с сервера.' },
    ],
  },
  'svoboda-dyhaniya': {
    partnerName: 'Jontic',
    heroImage: `${ASSET_BASE}/freedom-breath-hero.png`,
    omegaImage: `${ASSET_BASE}/omega-brainy-flatlay.png`,
    partnerImage: `${ASSET_BASE}/freedom-breath-hero.png`,
    systemImage: `${ASSET_BASE}/omega-brainy-system.png`,
    relevanceImage: `${ASSET_BASE}/freedom-breath-hero.png`,
    faqImage: `${ASSET_BASE}/faq-support.png`,
    name: 'СВОБОДА ДЫХАНИЯ DAIGO Омега-3 + Jontic',
    fallbackShortDescription: 'Комплексная поддержка организма в сезон повышенной нагрузки: натуральная Омега-3 и направленная формула DAIGO Jontic.',
    fallbackFullDescription: 'Набор подойдёт для периодов сезонной нагрузки, восстановления и несбалансированного рациона.',
    featureLead: '<p>Дыхательная система особенно чувствительна к сезонной нагрузке и общему состоянию организма. Комплекс объединяет натуральную Омега-3 и DAIGO Jontic в единую поддерживающую систему.</p>',
    partnerDescription: 'DAIGO Jontic дополняет комплекс направленной формулой аминобиотиков и нутриентов для периодов повышенной сезонной нагрузки.',
    fact: 'Согласованная работа иммунной, нервной и обменной систем важна для устойчивости организма к изменению режима, рациона и сезонным факторам.',
    relevanceItems: ['В сезон простуд и высокой нагрузки', 'При несбалансированном рационе', 'В период восстановления', 'Для ежедневной комплексной поддержки'],
    faq: [
      { q: 'Чем набор отличается от отдельных продуктов?', a: 'Набор объединяет продукты в готовый комплекс и позволяет выбрать подходящую комплектацию.' },
      { q: 'Можно ли принимать продукты в один период?', a: 'Да, при соблюдении инструкции и индивидуальных рекомендаций специалиста.' },
      { q: 'Какой вариант выбран по умолчанию?', a: 'Вариант по умолчанию определяется бэкендом полем is_default.' },
    ],
  },
}

function createSections(definition: BundleDefinition): BundleContentSection[] {
  return [
    {
      type: 'feature-grid',
      title: 'Описание товара',
      cards: [
        { title: 'Особенности набора', text: definition.featureLead, image: `${ASSET_BASE}/o-1.png`,},
        { title: 'Мембранный фундамент', text: 'DHA из DAIGO Омега-3 входит в общий пул жирных кислот мембран нервной ткани, внутри которых работают рецепторы, каналы и ферменты.', image: `${ASSET_BASE}/o-2.png` },
        { title: 'Фосфолипидный обмен', text: 'Холин в составе Brainy необходим организму для синтеза фосфатидилхолина и сфингомиелина, а также служит предшественником ацетилхолина.', image: `${ASSET_BASE}/o-3.png` },
        { title: 'Миелиновый контекст', text: 'Нервоновая кислота связана со сфинголипидами и миелиновыми структурами - другим классом липидов нервной ткани.', image: `${ASSET_BASE}/o-4.png` },
        { title: 'Метаболические кофакторы', text: `Аминокислоты и витамины B1, B3 и B6 добавляют субстратный и кофакторный уровни энергетического и аминокислотного обмена.`, image: `${ASSET_BASE}/o-5.png` },
        {
          title: 'Как работает система',
          text: `
            <p>Фосфолипиды нервной ткани состоят не из одного вещества. DHA может входить в их жирнокислотную часть, а холин необходим для образования важных классов мембранных фосфолипидов. Нервоновая кислота относится к другой ветви липидной архитектуры и связана со сфинголипидами и миелиновыми структурами.</p>

            <p>Поэтому DAIGO Омега-3 и Brainy не создают «двойную дозу одного и того же». Омега-3 формирует общий мембранный и липидно-сигнальный уровень. Brainy дополняет его фосфолипидным, миелиновым, аминокислотным и кофакторным контурами.</p>
          `,
        },
        {
          title: 'Ключевая логика сочетания',
          text: `
            <p>DHA + холин + нервоновая кислота + аминокислоты и витамины группы B = несколько связанных уровней нутрицевтической поддержки нервной системы.</p>

            <a href="https://ods.od.nih.gov/factsheets/Choline-HealthProfessional/" class="text-primary cursor-pointer">Узнать больше о роли холина.</a>
          `,
          image: `${ASSET_BASE}/o-6.png`
        },
      ],
    },
    { type: 'split', title: 'Что дает DAIGO Омега-3', content: '<p>DAIGO Омега-3 производится из жира печени тихоокеанской трески японского происхождения. В суточной порции содержится 560 мг Омега-3, включая 280 мг EPA и 240 мг DHA.</p><p>DHA особенно широко представлена в нервной ткани. EPA и DHA входят в мембранные фосфолипиды и служат исходными молекулами для ряда липидных медиаторов. В этой паре Омега-3 выступает общим липидным фундаментом.</p>', image: definition.omegaImage, imageAlt: 'DAIGO Омега-3', imagePosition: 'left', noteTitle: 'Когда важна не только функция', noteContent: '<p>DAIGO выбирают не только по количеству миллиграммов. У продукта есть конкретное японское происхождение, сезонная история сырья и понятная суточная порция.</p>', linkLabel: 'Физиология EPA и DHA', linkHref: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/' },
    { type: 'split', title: `Что дает ${definition.partnerName}`, content: `<p>${definition.partnerDescription}</p>`, image: definition.partnerImage, imageAlt: `DAIGO ${definition.partnerName}`, imagePosition: 'right', noteTitle: 'Интересный факт', noteContent: `<p>${definition.fact}</p>`, linkLabel: 'Открыть исследование', linkHref: 'https://pubmed.ncbi.nlm.nih.gov/31362382/' },
    { type: 'wide-image', image: definition.systemImage, imageAlt: `Как работает сочетание Омега-3 и ${definition.partnerName}` },
    { type: 'checklist', title: 'Когда особенно актуален комплекс', image: definition.relevanceImage, imageAlt: `Комплекс Омега-3 и ${definition.partnerName}`, items: definition.relevanceItems },
  ]
}

export const omegaBundlePageContent = Object.fromEntries(
  Object.entries(definitions).map(([slug, definition]) => [slug, {
    name: definition.name,
    bundleSections: createSections(definition),
    faq: { image: definition.faqImage, items: definition.faq },
    heroImage: definition.heroImage,
    galleryImages: [
      definition.heroImage,
      definition.omegaImage,
      definition.partnerImage,
      definition.systemImage,
    ].filter((image, index, images) => images.indexOf(image) === index)
      .map((image_url, index) => ({
        image_url,
        is_primary: index === 0,
        display_order: index,
      })),
    fallbackShortDescription: definition.fallbackShortDescription,
    fallbackFullDescription: definition.fallbackFullDescription,
  }]),
) as Record<OmegaBundleSlug, OmegaBundlePageContent>

export function getOmegaBundlePageContent(slug: OmegaBundleSlug): OmegaBundlePageContent {
  return omegaBundlePageContent[slug]
}
