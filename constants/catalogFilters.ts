import type { FilterGroup } from '~/types/filter'

export const CATALOG_FILTERS: FilterGroup[] = [
    {
      label: 'Направления',
      slug: 'napravlennost',
      options: [
        { label: 'Кишечник и иммунитет', value: 'kishechnik-i-immunitet' },
        { label: 'Мозг и нервная система', value: 'mozg-i-nervnaya-sistema' },
        { label: 'Кожа и волосы', value: 'kozha-i-volosy' },
        { label: 'Кости и мышцы', value: 'kosti-i-myshtsy' },
        { label: 'Зубы и десны', value: 'zuby-i-desna' },
      ]
    },
    {
      label: 'Помогает при',
      slug: 'pomogaet-pri',
      options: [
        { label: 'Аллергия', value: 'allergiya' },
        { label: 'Пищевая непереносимость', value: 'pishchevaya-neperenosimost' },
        { label: 'Кишечная непроходимость (запор)', value: 'kishechnaya-neprokhodimost-zapor' },
        { label: 'Эмоциональная перегрузка', value: 'emotsionalnaya-peregruzka' },
        { label: 'Деменция', value: 'demenciya' },
        { label: 'Себорея', value: 'siboreya' },
        { label: 'Стоматит', value: 'stomatit' },
        { label: 'Язва', value: 'yazva' },
        { label: 'Гастрит', value: 'gastrit' },
        { label: 'Выпадение волос', value: 'vypadenie-volos' },
        { label: 'Акне', value: 'akne' },
        { label: 'Дисбактериоз', value: 'disbakterioz' },
        { label: 'Альцгеймер', value: 'alcegeymer' },
        { label: 'Постренировочные мышечные боли', value: 'posttrenirovochnye-mysh-boli' },
        { label: 'Невралгия (мышечные боли)', value: 'nevralgiya-mysh-boli' },
        { label: 'Хеликобактер пилори', value: 'helicobacter-pylori' },
        { label: 'Метеоризм', value: 'meteorism' },
        { label: 'Кариес', value: 'karies' },
        { label: 'Нейродермит', value: 'neyrodermit' },
        { label: 'Атопический дерматит', value: 'atopicheskij-dermatit' },
        { label: 'Псориаз', value: 'psoriaz' },
        { label: 'Сухость кожи', value: 'sukhaya-kozha' },
        { label: 'Утомляемость', value: 'utomlyaemost' },
        { label: 'Похмелье', value: 'pokhmelie' },
        { label: 'Восстановление микрофлоры', value: 'vosstanovlenie-mikroflory' },
      ]
    },
    {
      label: 'Класс продукта',
      slug: 'klass-produkta',
      options: [
        { label: 'Аминобиотики', value: 'aminobiotiki' },
        { label: 'Метабиотики', value: 'metobiotiki' },
        { label: 'Плазмалогены', value: 'plazmalogeny' },
      ]
    },
    {
      label: 'Продукты',
      slug: 'produkty',
      options: [
        { label: 'Daigo 5 мл', value: 'daigo-5ml' },
        { label: 'Daigo 10 мл', value: 'daigo-10ml' },
        { label: 'Daigo Lux', value: 'daigo-lux' },
        { label: 'Tamotsu', value: 'tamotsu' },
        { label: 'Daigo Dent', value: 'daigo-dent' },
        { label: 'Daigo Shampoo', value: 'daigo-shampoo' },
        { label: 'Daigo Brainy', value: 'daigo-brainy' },
        { label: 'Daigo Dermic', value: 'daigo-dermic' },
        { label: 'Daigo Jointic', value: 'daigo-jointic' },
        { label: 'Daigo Lactis Zoo', value: 'daigo-lactis-zoo' },
        { label: 'Омега 3', value: 'omega-3' },
        { label: 'Сертификаты', value: 'sertificate' },
      ],
    },
    // {
    //   label: 'Для кого',
    //   slug: 'dlya-kogo',
    //   options: [
    //     { label: 'Для детей и мам', value: 'dlya-detej-i-mam' },
    //     { label: 'Для активного долголетия', value: 'dlya-aktivnogo-dolgoletiya' },
    //     { label: 'Для повышения продуктивности', value: 'dlya-produktivnosti' },
    //     { label: 'Для животных', value: 'dlya-zhivotnyh' },
    //   ],
    // },
    {
      label: 'Состав',
      slug: 'sostav',
      options: [
        { label: 'Пептид хлореллы IPH C', value: 'peptid-khlorelly-iph-c' },
        { label: 'L-глутамин', value: 'l-glutamin' },
        { label: 'L-изолейцин', value: 'l-izolejcin' },
        { label: 'L-лейцин', value: 'l-lejcin' },
        { label: 'L-аргинин', value: 'l-arginin' },
        { label: 'Целлюлаза', value: 'cellulaza' },
        { label: 'Холин', value: 'kholin' },
        { label: 'Диметиламиноэтанол', value: 'dimetilaminoetanol' },
        { label: 'Витамин В14', value: 'vitamin-b14' },
        { label: 'Витамин В3', value: 'vitamin-b3' },
        { label: 'Омега 9', value: 'omega-9' },
        { label: 'Витамин В1', value: 'vitamin-b1' },
        { label: 'Витамин B6', value: 'vitamin-b6' },
        { label: 'Витамин K2', value: 'vitamin-k2' },
        { label: 'Пектиназа', value: 'pektinaza' },
        { label: 'Альфа-липоевая кислота', value: 'alpha-lipoevaya-kislota' },
        { label: 'Цинк', value: 'cink' },
        { label: 'Витамин B5', value: 'vitamin-b5' },
        { label: 'Витамин A', value: 'vitamin-a' },
        { label: 'Витамин H', value: 'vitamin-h' },
        { label: 'Липаза', value: 'lipaza' },
        { label: 'Бор', value: 'bor' },
        { label: 'Марганец', value: 'marganec' },
        { label: 'Хром', value: 'khrom' },
        { label: 'Культуральная жидкость Lactobacillus', value: 'kulturnaya-zhidkost-lactobacillus' },
        { label: 'Коэнзим Q10', value: 'koenzim-q10' },
        { label: 'Экстракт морского гребешка', value: 'ekstrakt-grebeshek' },
      ],
    },
    {
      label: 'Подарочные',
      slug: 'podarochnye',
      options: [
        { label: 'Наборы', value: 'nabory' },
        { label: 'Сертификаты', value: 'sertificate' }
      ]
    },

    // {
    //   label: 'Форма выпуска',
    //   slug: 'forma-vypuska',
    //   options: [
    //     { label: 'Жидкость', value: 'zhidkost' },
    //     { label: 'Капсулы', value: 'kapsuly' },
    //     { label: 'Гель-капсулы', value: 'gel-kapsuly' },
    //     { label: 'Паста', value: 'pasta' },
    //   ]
    // },
    // {
    //   label: 'Страна производитель',
    //   slug: 'strana-proizvoditel',
    //   options: [
    //     { label: 'Япония', value: 'yaponiya' },
    //     { label: 'Италия', value: 'italiya' },
    //   ],
    // }
  ]

export const CATALOG_FILTER_SLUGS = CATALOG_FILTERS.map((group) => group.slug)
