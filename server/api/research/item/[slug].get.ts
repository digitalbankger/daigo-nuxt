import { getRouterParams, createError } from 'h3'
import type { ArticleDetail } from '~/types/articles'

const DETAIL_BY_SLUG: Record<string, ArticleDetail> = {
  'proizvodstvo-daigo': {
    id: 1,
    slug: 'proizvodstvo-daigo',
    title: 'Производство Даиго',
    preview: 'Как работают метабиотики и почему важен курсовой приём.',
    image: 'https://daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'https://daigo.ru/images/mock/article/gen.jpg',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Производство Даиго', to: '/researches/proizvodstvo-daigo' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Производство</h2>
      <div class="wysiwyg js-wysiwyg-container">

 </span></b><b>Производство революционного продукта Daigo:</b><br class="is-revealed">
 На собственной фабрике у подножья горы Фудзи производится продукт Daigo. Компания-производитель B&amp;S corporation.<br class="is-revealed">
 Фабрика расположена в заповедном и экологичном районе, в который не доходят токсичные испарения города Токио.<br class="is-revealed">
 Помимо собственной фабрики у компании есть собственные поля, на которых выращиваются соевые бобы для производства Daigo.<br class="is-revealed">
 <br class="is-revealed">
 <b>Технология производства:</b><br class="is-revealed">
 Приблизительно 15кг соевых бобов используется для производства 100л соевого молока. Соевые бобы размалываются и кипятятся в воде, полностью очищенной от любых примесей. Для отделения окары (кашица из мякоти соевых бобов) используется пресс. Готовое соевое молоко используется в качестве среды для выращивания кисломолочных лактобактерий рода Lactobacillus. Культивирование лактобактерий в соевом молоке приводит к культивации бактерий более высокой плотности (в 1000 раз больше) и более высокого качества.<br class="is-revealed">
 <br class="is-revealed">
 В начале 16 штаммов лактобактерий подразделяются по степени совместимости на 4 группы и проходят процесс первичного брожения. Затем они сливаются вместе в емкость для совместного брожения. После этого этапа бактерии культивируются в течении 1 года. После прошествия данного периода ферментированную среду стерилизуют и фильтруют. На конечном этапе производства Daigo в очищенный ферментированный концентрат культуральной жидкости вносят молочную кислоту и лимонную кислоту в качестве регуляторов кислотности.<br class="is-revealed">
 <br class="is-revealed">
 В очищенной культуральной жидкости не содержатся живые бактерии (не является пробиотиком).<br class="is-revealed">
 Экстракт не содержит питательную среду для микробов (не является пребиотиком).<br class="is-revealed">
 <b>Daigo- </b>это экстракт брожения лактобактерий, представляет собой смесь секреторных выделений (метаболитов), бактериальных клеток и неживых микроорганизмов- <b>метабиотик</b>.<br class="is-revealed">
 <br class="is-revealed">
 <b>Принцип действия:</b><br class="is-revealed">
 При попадании метаболитов лактобактерий в кишечную трубку резко усиливаются колонизационные возможности физиологической кишечной флоры (начинают размножаться полезные бактерии идентичные 16 штаммам, метаболиты которых входят в состав Daigo), повышается устойчивость к неблагоприятной среде кишечника, возрастают антагонистические свойства (вытеснение и подавление жизнедеятельности патогенной, гнилостной, бродильной и другой негативной флоры), увеличиваются жизнеспособность собственных лактобактерий, их ферментационные и защитные свойства. <br class="is-revealed">
 Клеточный материал 16 штаммов лактобактерий стимулирует Пейеровые бляшки. За счет данной стимуляции происходит выпуск лейкоцитов в кишечник и в кровь. Благодаря этому наш иммунитет повышается и быстрее борется с воспалительными процессами в организме.<br class="is-revealed">
 <br class="is-revealed">
 <br class="is-revealed">
<img width="972" alt="Презентация Daigo производство-1.png" src="https://s3.firstvds.ru/researches/qu3k26vvoq53bfe5bj7gedxtari8qzxm.png" height="1024" title="Презентация Daigo производство-1.png" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <img width="1024" alt="Презентация Daigo производство-2.png" src="https://s3.firstvds.ru/researches/01klzil9qn3rg0c62if0gsdhyhs7nkw3.png" height="755" title="Презентация Daigo производство-2.png" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <img width="911" alt="Презентация Daigo производство-3.png" src="https://s3.firstvds.ru/researches/lgn7valdx4m468li0ubv5rx4u2ujy82p.png" height="1024" title="Презентация Daigo производство-3.png" class="is-revealed"><br class="is-revealed">
<p class="is-revealed">
 <b><span style="font-size: 16pt;">Местное применение:</span></b>
</p>
 <b><span style="font-size: 14pt;"> </span></b>
<p class="is-revealed">
 <b>Кожа</b>
</p>
<p class="is-revealed">
	 Кожа содержит много микробов, выделяющих ряд веществ, выполняющих защитную функцию. Применение бактерицидных средств приносит вред защитной флоре.
</p>
<p class="is-revealed">
	 Для поддержания защитной функции кожи используется нанесение Daigo на проблемные участки кожи.
</p>
<p class="is-revealed">
	 При принятии ванны необходимо добавление Daigo в воду.&nbsp;
</p>
<p class="is-revealed">
	 Ежедневное нанесение на лицо раствора в расчёте 1 часть Daigo на 10 частей воды улучшает микроциркуляцию и эффективно разглаживает кожу.
</p>
<p class="is-revealed">
	 При повреждении кожи и нагноении промывание и последующее нанесение позволяет быстро избавиться от гнойного воспаления и добиться ускорения безрубцовой репарации.
</p>
<p class="is-revealed">
	 При кожных и ногтевых микозах эффективным является обработка поражённых участков после мытья.
</p>
<p class="is-revealed">
 <b>Ротовая полость</b><br>
</p>
<p class="is-revealed">
	 После чистки зубов рекомендуется полоскание рта раствором Daigo, эффективно ликвидирующим запах изо рта, предупреждающий воспалительные заболевания слизистой, образование зубного налёта и кариеса.
</p>
<p class="is-revealed">
	 Стоматологические клиники в Японии используют Daigo в лечении гнойно-воспалительных заболеваний тканей пародонта и дёсен.
</p>
<p class="is-revealed">
 <b>Горло, зев, миндалины</b>
</p>
<p class="is-revealed">
	 Daigo закапывается непосредственно в горло на миндалины при ангине/гриппе несколько раз в день. Также им можно полоскать горло в разведении 1:10.
</p>
<p class="is-revealed">
 <b>Нос и пазухи</b>
</p>
<p class="is-revealed">
	 Раствор Daigo в разведении 1:10 по 4-5 капель вносится в нос при гнойном или серозном рините, синуситах, гайморите.
</p>
<p class="is-revealed">
 <b>Коньюнктива</b>
</p>
<p class="is-revealed">
	 Возможно добавление нескольких капель растворённого Daigo 1:20 в глазные растворы и последующее внесение в коньюнктивальный мешок при конъюнктивите, особенно гнойном, или других воспалительных заболеваниях глаз. Существенно ускоряется купирование процесса.
</p>
<p class="is-revealed">
	 При ячмене необходимо частое смазывание Daigo проблемного участка века.
</p>
<p class="is-revealed">
 <b>Влагалище</b>
</p>
<p class="is-revealed">
	 Используется орошение слизистой раствором Daigo в соотношении 1:20. Эффективно при различных вагинозах и вагинитах, цервицитах, эрозиях шейки матки.
</p>
<p class="is-revealed">
	 Не эффективно при венерических инфекциях.
</p>
<p class="is-revealed">
	 Наиболее эффективным является сочетание местного использования Daigo с его внутренним приёмом.
</p>
<p class="is-revealed">
 <br>
</p>
<p class="is-revealed">
 <b><span style="font-size: 16pt;">Внутренний приём</span></b><span style="font-size: 14pt;"> </span>
</p>
 <span style="font-size: 14pt;" class="is-revealed"> </span>
<p class="is-revealed">
	 Daigo принимается внутрь независимо от еды по 5-10 мл, растворенный в 50-100 мл воды. С целью поддержания активного долголетия и профилактики дисбактериоза необходим 1-2-кратный приём в день.
</p>
<p class="is-revealed">
	 С лечебной целью желательно принимать 2-3 раза в день.
</p>
<p class="is-revealed">
	 Для профилактики пищевой интоксикации в период беременности и в период кормления грудью чрезвычайно важно использование Daigo: обычно по 5 мл 3 раза в день.
</p>
<p class="is-revealed">
	 Daigo рекомендуется использовать детям для гармонизации физического и умственного развития, формирования ЖКТ, профилактики нарушений его функций, для формирования иммунитета, повышения инфекционной резистентности и профилактики аллергий.
</p>
<p class="is-revealed">
	 Daigo чрезвычайно эффективен при острых состояниях, связанных с нарушением функций ЖКТ. При колитах (боли, метеоризм, спазмы), обострениях холецистита, панкреатита, гепатита, пищевой непереносимости, пищевых отравлениях (алкоголь, избыточное питание и др.) и токсикоинфекциях, особенно в начальной стадии, а также при подозрениях на недоброкачественность пищи необходим частый внутренний приём Daigo по 5 мл каждые 30-40 минут до купирования клинических проявлений.
</p>
<p class="is-revealed">
 <br>
</p>
 <b>
<p style="text-align: left;">
 <span style="font-size: 24px; font-weight:500;">Видеоролики о метабиотике Daigo</span>
</p>
 </b><br class="is-revealed">
 <br class="is-revealed">
 <a href="http://youtu.be/jxcol2FZHWI?si=Ek3NUbb2QBQJaO1n" rel="noreferrer" target="_blank" class="link link--underlined is-revealed">Ролик о производстве Daigo</a><br class="is-revealed">
 <br class="is-revealed">
 <a href="http://youtu.be/KURz-oVkPtg?si=rlRHiUpVs5i8Wgk1" rel="noreferrer" target="_blank" class="link link--underlined is-revealed">Ролик о метабиотике Daigo</a><br class="is-revealed">        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  },
  'kombinirovannoe-vozdeystvie-sublingvalnoy-immunoterapii-i-daigo-na-simptomy-pollinoza-vyzyvaemogo-py': {
    id: 2,
    slug: 'kombinirovannoe-vozdeystvie-sublingvalnoy-immunoterapii-i-daigo-na-simptomy-pollinoza-vyzyvaemogo-py',
    title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра',
    preview: 'Участники исследования и методы: пятнадцать пациентов, страдающих поллинозом, вызываемым пыльцой кедра, были разделены на три группы',
    image: 'https://daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'https://daigo.ru/images/mock/article/gen.jpg',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Комбинированное воздействие ...', to: '/researches/kombinirovannoe-vozdeystvie-sublingvalnoy-immunoterapii-i-daigo-na-simptomy-pollinoza-vyzyvaemogo-py' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра</h2>
      <div class="wysiwyg js-wysiwyg-container">
            <p class="is-revealed">
	 Участники исследования и методы: пятнадцать пациентов, страдающих поллинозом, вызываемым пыльцой кедра, были разделены на три группы. Пациенты были распределены на три группы следующим образом: три пациента в группе, получавшей стандартизированный экстракт кедровой пыльцы (группа S), семь пациентов в группе, получавшей экстракт лактобактерий (группа L), и пять пациентов в группе комбинированной терапии, получавшей стандартизированный экстракт кедровой пыльцы и экстракт лактобактерий (группа SL). Участники исследования проходили лечение в течение трёх лет, что соответствует трём сезонам рассеивания кедровой пыльцы, и наблюдались в соответствии с критериями оценки.
</p>
<p class="is-revealed">
	 Сублингвальная иммунотерапия (СЛИТ), при которой вводится стандартизированный раствор экстракта пыльцы кедра, применялась для лечения поллиноза пищевой ингредиент, облегчает различные аллергические симптомы. В данном исследовании проводился сравнительный анализ эффективности Daigo и СЛИТ в лечении поллиноза, вызываемого пыльцой кедра. Было также проанализировано, может ли комбинированное применение СЛИТ и Daigo обеспечить скорейшее наступление терапевтического эффекта при лечении поллиноза, вызываемого пыльцой кедра. Кроме того, исследована эффективность Daigo в качестве терапии второй линии (терапии спасения) для пациентов, которым не помогла СЛИТ, вызываемого пыльцой кедра. Однако применение СЛИТ сопряжено с определёнными проблемами, поскольку для достижения эффекта требуется много времени, а в некоторых случаях СЛИТ оказывается неэффективной даже после продолжительного лечения.
</p>
<p class="is-revealed">
	 Также было проанализировано, может ли комбинированное применение СЛИТ и Daigo обеспечить скорейшее наступление терапевтического эффекта при лечении поллиноза, вызываемого пыльцой кедра и исследована эффективность Daigo в качестве терапии второй линии (терапии спасения) для пациентов, которым не помогла СЛИТ.
</p>
<p class="is-revealed">
</p>
<p class="is-revealed">
 <a href="https://daigo.ru/upload/medialibrary/895/95blefvk6na3wmf0jtmbv0jw8kzo6a48.pdf" target="_blank" class="link link--underlined">Подробнее об эффективности Daigo в полной версии исследования</a>
</p>        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  },
  'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki': {
    id: 3,
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
    preview: 'Исследования Daigo от Института повышения квалификации Федерального медико-биологического агентства',
    image: 'https://daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'https://s3.firstvds.ru/researches/w6kb99yu0r2esm5gvw2s0cbs76cjecyl.webp',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Дайго способствует ...', to: '/researches/daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Исследования Daigo от Института повышения квалификации Федерального медико-биологического агентства</h2>
      <div class="wysiwyg js-wysiwyg-container">
 <br class="is-revealed">
 Кирилл Иванович Прощаев<br class="is-revealed">
 Директор Автономной некоммерческой организации «Научно-исследовательский медицинский центр «Геронтология», д.м.н., профессор<br class="is-revealed">
 <br class="is-revealed">
 Андрей Николаевич Ильницкий<br class="is-revealed">
 Первый заместитель директора Автономной некоммерческой организации «Научно-исследовательский медицинский центр «Геронтология», заведующий кафедрой терапии, гериатрии и антивозрастной медицины ИПК ФМБА России, д.м.н., профессор<br class="is-revealed">
<h2 class="is-revealed"><br>
 </h2>
<h2 class="is-revealed">Дайго как иммуномодулятор, нейропротектор, антиоксидант и биологически активный компонент, улучшающий психологическое здоровье и качество жизни</h2>
 Было выбрано 30 пациентов (15 мужчин и 15 женщин) среднего возраста ( от 32 до 56 лет) с компенсированными соматическими заболеваниями. Пациенты принимали&nbsp;<a href="https://daigo.ru/catalog/metabiotik-daigo/" class="link link--underlined is-revealed">метабиотик Дайго</a>&nbsp;3 раза в день в течение 3-х месяцев.<br class="is-revealed">
 <br class="is-revealed">
 Пациенты такого возраста выбраны для составления профилактики возрастных болезней с помощью&nbsp;Дайго.<br class="is-revealed">
 <br>
 В клиническом исследовании оценивались поведение, эмоции и психологические изменения до и после 3-х месяцев приема&nbsp;Дайго.<br>
<h2><br>
 </h2>
<h2>Делимся с вами некоторыми выводами:</h2>
 Дайго уменьшает проницаемость кишечной стенки. Этот синдром – один из факторов риска развития болезни Альцгеймера у пожилых людей!<br>
 <br>
<ul>
	<li>Улучшает подвижность суставов и баланс тела, снижает вероятность развития синдрома падений в пожилом возрасте</li>
	<li>Благодаря тому, что кишечная микробиота воздействует на головной мозг и поведение человека, «Дайго» предупреждает развитие депрессии и деменции (старческое слабоумие) в пожилом возрасте</li>
	<li>Старение человека сопровождается дисбиозом кишечной микрофлоры. Прием «Дайго» улучшает иммунитет, восстанавливает здоровый баланс микрофлоры кишечника и снижает у пожилых людей предрасположенность к инфекционным заболеваниям, кишечным расстройствам, гипертонии, сердечно-сосудистым заболеваниям, болезни Паркинсона, склонность к развитию злокачественных опухолей</li>
	<li>Назначение «Дайго», как органического продукта питания, актуально для снижения количества принимаемых пожилыми пациентами лекарственных препаратов</li>
</ul>
 Благодаря таким исследованиям, мы уже сейчас можем заложить основу здоровой, счастливой и активной жизни нашим родителям в пожилом возрасте!<br>
 <br>
 <iframe width="1280" height="720" src="https://www.youtube.com/embed/oUuYgNoRCu4?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen="" title="Новое в медицине: психобиогенезис">
</iframe> <br>        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  },
  'issledovanie-o-vliyanii-daygo-na-mikrobiotu-kishechnika-sportsmenovi-i-povyshenie-vynoslivosti': {
    id: 4,
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    title: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
    preview: 'Исследование о влиянии Дайго на микробиоту кишечника спортсменов и повышение их выносливости',
    image: 'https://daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Как Дайго влияет на организм спортсменов?',
    cover: 'https://s3.firstvds.ru/researches/port.png',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Исследование о влиянии ...', to: '/researches/issledovanie-o-vliyanii-daygo-na-mikrobiotu-kishechnika-sportsmenovi-i-povyshenie-vynoslivosti' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Как Дайго влияет на организм спортсменов?</h2>
      <div class="wysiwyg js-wysiwyg-container">

 <b><span style="font-size: 13pt;">Изменения в микрофлоре под нагрузкой</span></b><br class="is-revealed">
 Пилотное японское исследование показало, что даже однократное участие в соревнованиях вызывает значительные изменения в составе кишечной микробиоты спортсменов. У них наблюдалось уменьшение количества бактерий типа Bacteroidetes и увеличение Firmicutes. Примечательно, что эти изменения сохранялись до двух недель после забега.<br class="is-revealed">
 Подобные сдвиги в микробном сообществе могут иметь важные последствия. Например, дисбаланс между Firmicutes и Bacteroidetes ранее связывали с различными метаболическими нарушениями. Кроме того, у бегунов отмечался чрезмерный рост дрожжевых грибов (особенно Candida), что способствует развитию воспалительных процессов и повышенной утомляемости.<br class="is-revealed">
 <b><span style="font-size: 13pt;"><br>
 </span></b><b><span style="font-size: 13pt;">Польза Daigo</span></b><br class="is-revealed">
 На фоне приема экстракта брожения 16-ти штаммов лактобактерий исследователи зафиксировали несколько положительных эффектов. Во-первых, добавка способствовала снижению маркеров дрожжевой активности в моче. Концентрация арабинозы (показатель активности Candida) и других грибковых метаболитов значительно уменьшилась.<br class="is-revealed">
 Во-вторых, Daigo стабилизировал состав кишечной микрофлоры после соревновательных нагрузок. Если без добавки изменения микробиоты были выраженными и длительными, то на фоне приема Daigo микрофлора быстрее возвращалась к исходному состоянию.<br class="is-revealed">
 В-третьих, анализ мочи показал, что добавка может улучшать митохондриальный метаболизм. У спортсменов снижался уровень метаболитов, связанных с нарушением энергетического обмена, что способствует лучшему восстановлению после нагрузок.<br class="is-revealed">
 <b><span style="font-size: 13pt;"><br>
</span></b><b><span style="font-size: 13pt;">Практическое значение</span></b><br class="is-revealed">
 Результаты особенно актуальны для бегунов на длинные дистанции, которые регулярно подвергают организм экстремальным нагрузкам. Поддержание здорового баланса кишечной микрофлоры может стать важным элементом подготовки, наряду с традиционными методами восстановления.<br class="is-revealed">
 Исследование также поднимает вопрос о необходимости персонализированного подхода к питанию и добавкам у спортсменов. Возможно, в будущем анализ микробиоты и метаболитов поможет разрабатывать индивидуальные схемы для улучшения результатов и сохранения здоровья атлетов.<br class="is-revealed">
 <br class="is-revealed">
 <span style="font-size: 13pt;" class="is-revealed"><b>Ключевые моменты</b></span><br class="is-revealed">
 • Соревновательные нагрузки вызывают продолжительные изменения в микробиоте;<br class="is-revealed">
 • Daigo помогает в поддержании микробного баланса;<br class="is-revealed">
 • Daigo улучшает метаболические процессы.<br class="is-revealed">
 <br class="is-revealed">
 С полным исследованием, переведенным на русский язык и опубликованным в научно-практическом журнале "Вопросы питания",&nbsp;можно ознакомиться по <a title="Фукути_ВП_2_2024_правка_ верстка на согл. 09.04.pdf" href="/upload/medialibrary/212/aek9t56ilopnjk2w8fzm2a6whrzewsoz.pdf" class="link link--underlined is-revealed">ссылке</a>.        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  },
  'daygo-i-aktivatsiya-kletok-naturalnykh-killerov-i-immunoregulyatsiya': {
    id: 5,
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    title: 'Дайго и активация клеток натуральных киллеров и иммунорегуляция',
    preview: 'Дайго и активация клеток натуральных киллеров и иммунорегуляция',
    image: 'https://s3.firstvds.ru/researches/c8y2xvmydy7unrw9m3zqt01l06byiqgo.webp',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства. Отделение научного животноводства Университета сельского хозяйства в Токио.Как Дайго влияет на организм спортсменов?',
    cover: 'https://s3.firstvds.ru/researches/c8y2xvmydy7unrw9m3zqt01l06byiqgo.webp',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Дайго и активация клеток ...', to: '/researches/daygo-i-aktivatsiya-kletok-naturalnykh-killerov-i-immunoregulyatsiya' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства. Отделение научного животноводства Университета сельского хозяйства в Токио.</h2>
      <div class="wysiwyg js-wysiwyg-container">
<h3 class="is-revealed">Краткий обзор:<br>
 </h3>
 Метод INT использовался для обнаружения иммуностимулирующего эффекта по активности клеток натуральных киллеров при приеме внутрь экстракта брожения молочнокислых бактерий.<br class="is-revealed">
 <br class="is-revealed">
 Результаты показали, что у здоровых мышей не было значительного изменения активности клеток натуральных киллеров, в то время как активность клеток натуральных киллеров у мышей с множественной саркомой, вызванной введением В-16 меланомного антигена, значительно возрастала при приеме экстракта брожения молочнокислых бактерий внутрь по сравнению с другими контрольными группами.<br class="is-revealed">
<h3 class="is-revealed">Цели:<br>
 </h3>
 Клетки натуральных киллеров функционируют не только, чтобы вызвать индивидуальную защиту антител от вирусных инфекций и устранить опухолевые клетки, но также демонстрируют разрушительное действие зависимых антител на инфицированные вирусом клетки и опухолевые клетки.<br class="is-revealed">
 <br>
 Как и макрофаги (MФ), клетки натуральных киллеров играют важную роль, выступая в качестве биологического механизма защиты до выработки антител, в частности, в качестве противоопухолевых клеток-эффекторов.<br>
 <br>
 При изучении иммуностимулирующих эффектов экстракта брожения молочнокислых бактерий, исследование было сосредоточено на влиянии перорального приема экстракта брожения молочнокислых бактерий на клетки натуральных киллеров.
<h3>Метод:<br>
 </h3>
 Экстракт брожения молочнокислых бактерий вводился мышам в дозе 0,2 мл / кг на постоянной основе в течение семи дней;<br>
 <br>
 Пероральное введение мышам с саркомой, имплантированной с B-16 меланомой, началось через три дня после имплантации;<br>
 <br>
 Контрольная группа состояла из мышей, которым вместо экстракта брожения молочнокислых бактерий назначался дозированный физиологический раствор с фосфатным буфером — Клетки селезенки (эффектора) были инкубированы с YAC-1 клетки-мишени, центробежно разделены, а затем испытаны в соответствии с INT методом на активность клеток натуральных киллеров против YAC-1 клеток-мишеней.
<h3>Результаты:</h3>
 Никаких изменений в активности клеток натуральных киллеров не наблюдалось у нормальных мышей, независимо от того, был ли им введен перорально физиологический раствор с фосфатным буфером или экстракт брожения молочнокислых бактерий.<br>
 <br>
 Было отмечено увеличение активности клеток натуральных киллеров у мышей с саркомой, имплантированной с B-16 меланомой, по сравнению с контрольной группой перорально введенного физиологического раствора с фосфатным буфером.<br>
 <br>
 Считается, что стимулирующий эффект перорально введенного Дайго на деятельность клеток натуральных киллеров становится очевидным, только когда на иммунной системе мышей применяются некоторые формы стимула, такие как имплантация опухолевых клеток. Не выявлено чрезмерной активности при нормальной иммунной системе.<br>        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  },
  'daigo-i-effektinaya-borba-s-mikrobom-khelikobakter-pilori': {
    id: 6,
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    title: 'Daigo и эффектиная борьба с микробом Хеликобактер Пилори',
    preview: 'Daigo и эффектиная борьба с микробом Хеликобактер Пилори',
    image: 'https://s3.firstvds.ru/researches/1a4gj9sezzmfp0fm0ec06pkakc6eq76w6.webp',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Эффективная борьба с микробом Helicobacter Pylori',
    cover: 'https://s3.firstvds.ru/researches/1a4gj9sezzmfp0fm0ec06pkakc6eq76w6.webp',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Daigo и эффектиная борьба ...', to: '/researches/daigo-i-effektinaya-borba-s-mikrobom-khelikobakter-pilori' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 1,
      name: 'Нобору Фурукава',
      position: 'Профессор',
      avatarUrl: 'https://daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-2xl sm:text-product font-medium mb-4">Эффективная борьба с микробом Helicobacter Pylori.</h2>
      <div class="wysiwyg js-wysiwyg-container">
 В 1982 году Р. Уоррену и Б. Маршаллу&nbsp;удалось культивировать из человеческого желудка микроорганизм&nbsp;«хеликобактер пилори» (Helicobacter pylori), после чего произошло быстрое развитие череды исследований, и тогда стало ясно, что данный микроорганизм провоцирует возникновение хронического гастрита.<br class="is-revealed">
 <br class="is-revealed">
 Известно, что в наши дни около 70% всего населения планеты инфицировано микробом Helicobacter pylori, среди них есть пациенты с атрофическим гастритом, язвой желудка, язвой двенадцатиперстной кишки и прочими воспалениями, а также носители патогенных бактерий, вызывающих рак желудка, MALT-лимфому и другие ракообразования.<br class="is-revealed">
 <br class="is-revealed">
 Ликвидация микроба&nbsp;Helicobacter pylori&nbsp;проводится, главным образом, с помощью антибиотиков, однако медикаменты провоцируют диарею, колики, потерю чувства вкуса, поражение функции печени, также возможен риск прочих побочных эффектов, а недавно возникла проблема снижения эффективности ликвидации бактерий, так как они стали более выносливыми по отношению к антибиотикам.<br class="is-revealed">
 <br class="is-revealed">
 Около 25% бактерий выносливы к антибиотику&nbsp;«кларитромицин», притом среди не ликвидированных бактерий большая их часть становится еще более выносливой.&nbsp;Поэтому если первоначально с помощью медикаментов ликвидировалось около 90% бактерий, то сейчас это число снизилось до 60-70%.<br class="is-revealed">
 <br class="is-revealed">
 В последние годы благодаря эффективному контролю над микробом Helicobacter pylori стало известно, что ликвидировать микроб можно не только с помощью медикаментов, но и определенными продуктами питания. Исходя из отчета стало известно, что в течение двух месяцев принятия в пищу ростков брокколи у инфицированных снизилась численность микроба Helicobacter pylori в желудке, таким же образом влияют следующие продукты: японская слива или катехины зеленого чая, какао, йогурт, кофе и т.п.<br class="is-revealed">
 <br class="is-revealed">
 Кроме этого, во всем мире существует множество диссертаций, привлекающих внимание к работе лактобактерий, которые противостоят Helicobacter pylori.<br class="is-revealed">
 <br class="is-revealed">
 <img src="https://s3.firstvds.ru/researches/__2021-04-27__115012.png" data-original="https://s3.firstvds.ru/researches/__2021-04-27__115012.png" imgfield="img" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <br class="is-revealed">
 Болезни, спровоцированные микробом Helicobacter pylori<br class="is-revealed">
<ol class="is-revealed">
	<li>Язва желудка и двенадцатиперстной кишки</li>
	<li>MALT-лимфома желудка</li>
	<li>Идиопатическая тромбоцитопеническая пурпура</li>
	<li>Рак желудка</li>
	<li>Атрофический гастрит.</li>
	<li>Гиперпластические полипы желудка.</li>
	<li>Функциональная диспепсия</li>
	<li>Рефлюкс-эзофагит</li>
	<li>Заболевания желудочно-кишечного тракта (железодефицитная анемия у детей, хроническая крапивница и т.п.)</li>
</ol>
 Поставив целью выяснить, является ли&nbsp;<a href="https://daigo.ru/catalog/" class="link link--underlined is-revealed">daigo</a>&nbsp;действенным против микроба Helicobacter pylori, было проведено исследование, в котором 25 инфицированных носителей принимали экстракт лактобактерий daigo, и итог дал положительный результат.<br class="is-revealed">
<h3 class="is-revealed">Метод тестирования</h3>
 Тестирующий врач:<br class="is-revealed">
 Профессор кафедры медициского университета имени Альберта Эйнштейна, доктор медицинских наук — Хироми Шинья.<br class="is-revealed">
 <br class="is-revealed">
 Объекты тестирования:<br class="is-revealed">
 25 японцев, инфицированных микробом Helicobacter pylori.<br class="is-revealed">
 <br class="is-revealed">
 Тестируемое вещество:<br class="is-revealed">
 Экстракт лактобактерий daigo, 10 мл.<br class="is-revealed">
 <br class="is-revealed">
 Способ и период применения:<br class="is-revealed">
 Орально (ежедневно по 10 мл) в течение 6 месяцев.<br class="is-revealed">
 <br class="is-revealed">
 Метод проверки:<br class="is-revealed">
 Перед началом применения тестируемого вещества и после окончания срока его применения проводили эндоскопию желудка каждому из тестируемых человек.<br class="is-revealed">
<h3 class="is-revealed">Результат и заключение</h3>
 По истечении 6-месячного приема препарата daigo было установлено, что из 25 человек у 68% (17 человек) испытуемых микроб ликвидирован, тем самым было подтверждено, что&nbsp;daigo&nbsp;способен ликвидировать Helicobacter pylori.<br class="is-revealed">
 <br class="is-revealed">
 Если сравнивать&nbsp;daigo&nbsp;с ингибиторами протонного насоса, антибиотиками и прочими медикаментами, то в отличие от последних продукт&nbsp;daigo&nbsp;не имеет никаких побочных эффектов в виде колик, диареи, потери чувства вкуса и т.д.<br class="is-revealed">
 <br class="is-revealed">
 Кроме того, подобные медикаменты не являются лекарствами, направленными лишь на один микроб&nbsp;Helicobacter pylori, они также губительно действуют и на другие бактерии. А ведь есть группы кишечных бактерий, играющих важную роль в кишечной флоре, от которых зависит усвоение и впитывание полезных веществ, и если они подвергаются удару, как следствие, у человека нарушается пищеварение и возникает расстройство стула.<br class="is-revealed">
 <br class="is-revealed">
 В тоже время&nbsp;daigo&nbsp;не только приводит в порядок кишечную флору, но и положительно влияет на полезные кишечные бактерии: поддерживает их и способствует их росту.<br class="is-revealed">
 <img src="https://s3.firstvds.ru/researches/__2021-04-27__114517.png" data-original="https://s3.firstvds.ru/researches/__2021-04-27__114517.png" imgfield="img" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <br class="is-revealed">        </div>
    `,
    // materials: {
    //   title: 'Материалы исследования',
    //   text: '<p class="mb-2">Рекомендации от профессора</p> <p>Ключи к восстановлению и энергии</p>',
    //   files: [
    //     { id: 1, title: 'Отчёт исследования', url: '/files/research.pdf', size: '1 MB', mime: 'application/pdf' }
    //   ],
    //   specialist: {
    //     name: 'Нобору Фурукава',
    //     position: 'Профессор',
    //     avatarUrl: 'https://daigo.ru/images/mock/research/author.jpg',
    //     description: 'Исследует микробиоту и влияние метабиотиков.',
    //     social: [
    //       { type: 'dzen', url: 'https://dzen.ru/daigo' }
    //     ]
    //   },
    //   downloadAllUrl: '/files/research-all.zip'
    // },
    contentBottom: `
    `,
    recommended: [
      {
        id: 2,
        slug: 'kishechnaya-stenka',
        title: 'Комбинированное воздействие сублингвальной иммунотерапии и Daigo...',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-2.png',
        date: '2025-02-18',
        time: 6,
        views: 150,
        comments: 3,
        properties: {} as any
      },
      {
        id: 3,
        slug: 'snizhenie-pronicaemosti',
        title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
        preview: '',
        image: 'https://daigo.ru/images/mock/researches/subcat-3.png',
        date: '2025-02-18',
        time: 5,
        views: 120,
        comments: 1,
        properties: {} as any
      }
    ],
    popular: [],
    faq: [],
    productsIds: [
      '71700acb-3584-490b-a5f7-62e8cb57b3c9', 
    ]
  }
}

export default cachedEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const data = DETAIL_BY_SLUG[slug as string]
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Research not found' })
  }
  return data
}, { maxAge: 60 })
