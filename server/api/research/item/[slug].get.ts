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
	 Для возможного большего и стойкого эффекта желательно принимать 2-3 раза в день.
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
	<li>Назначение «Дайго», как органического продукта питания, актуально для совместного приема с лекарственными препаратами против болезни Альцгеймера</li>
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
 С полным исследованием, переведенным на русский язык и опубликованным в научно-практическом журнале "Вопросы питания",&nbsp;можно ознакомиться по <a title="Фукути_ВП_2_2024_правка_ верстка на согл. 09.04.pdf" href="/upload/medialibrary/212/aek9t56ilopnjk2w8fzm2a6whrzewsoz.pdf" class="link link--underlined is-revealed">ссылке</a>.        
  \n\n <p class=\"text-base text-gray-500 mt-4 flex flex-row gap-2\"><span class=\"text-red-500 text-2xl leading-[1.1rem]\">*</span><span>Эффективность Daigo подтверждена российскими и японскими исследованиями. Например, «Влияние Дайго на уменьшение факторов, влияющих на прогрессирование почечной недостаточности»<span></p>

 </div>
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
  },

  //Новые
  'vliyanie-daygo-na-umenshenie-faktorov-vliyayushchikh-na-progressirovanie-pochechnoy-nedostatochnosti': {
    id: 7,
    slug: 'vliyanie-daygo-na-umenshenie-faktorov-vliyayushchikh-na-progressirovanie-pochechnoy-nedostatochnosti',
    title: 'Влияние Дайго на уменьшение факторов, влияющих на прогрессирование почечной недостаточности',
    preview: 'Влияние Дайго на уменьшение факторов, влияющих на прогрессирование почечной недостаточности',
    image: 'https://mail.daigo.ru/upload/resize_webp/resize_cache/iblock/c8b/840_560_1/ywdjd5omxsdms5ju6jhfisz0thqkggl1.webp',
    date: '2025-06-30',
    time: 8,
    views: 32240,
    comments: 0,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследования доказали, что экстракт брожения молочнокислых бактерий потенциально полезен для контролирования фазовой стабилизации почечной недостаточности.',
    cover: 'https://mail.daigo.ru/upload/resize_webp/resize_cache/iblock/c8b/840_560_1/ywdjd5omxsdms5ju6jhfisz0thqkggl1.webp',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Уменьшение факторов, влияющих на прогрессирование почечной недостаточности', to: '/researches/vliyanie-daygo-na-umenshenie-faktorov-vliyayushchikh-na-progressirovanie-pochechnoy-nedostatochnosti' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 2,
      name: 'Доктор Акира Кавашима',
      position: 'Доцент почечного центра женской лаборатории в Аояма',
      avatarUrl: '',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
      ]
    },
    contentTop: `
    <div class="wysiwyg js-wysiwyg-container">
            <h2 class="is-revealed">Уменьшение факторов, влияющих на прогрессирование почечной недостаточности</h2>
 Доктор Акира Кавашима<br class="is-revealed">
 Доцент почечного центра женской лаборатории в Аояма<br class="is-revealed">
 <br class="is-revealed">
 Исследования доказали, что экстракт брожения молочнокислых бактерий потенциально полезен для контролирования фазовой стабилизации почечной недостаточности.<br class="is-revealed">
<h3 class="is-revealed">Цель:</h3>
 Изучить потенциальное применение экстракта брожения молочнокислых бактерий в фазовой стабилизации почечной недостаточности. Эффекты от применения экстракта брожения молочнокислых бактерий изучались путем измерения содержания в сыворотке крови индоксила сульфата у пациентов, находящихся на диализе.<br class="is-revealed">
<h3 class="is-revealed">Метод:</h3>
 4 пациентам на диализе (м/ж=2/2; средний возраст 58 года, среднее время нахождения на диализе 17 лет) был назначен экстракт брожения молочнокислых бактерий 1 раз в день в течение года.<br class="is-revealed">
 <br class="is-revealed">
 До и после приема препарата в сыворотке крови пациентов измеряли индоксил сульфата, азот мочевины (BUN-blood urea nitrogen), P (фосфор), K (калий), Ca (кальций) и Cr (хром).<br class="is-revealed">
<h3 class="is-revealed">Обсуждение:</h3>
 Предполагается, что экстракт брожения молочнокислых бактерий Daigo уменьшает продукцию уремических токсинов в кишечном тракте.<br class="is-revealed">
 <br class="is-revealed">
 Экстракт брожения молочнокислых бактерий способен улучшать метаболизм белков у пациентов, находящихся на диализе. Исследования доказали, что экстракт брожения молочнокислых бактерий потенциально полезен для контролирования фазовой стабилизации почечной недостаточности.<br class="is-revealed">
<h3 class="is-revealed">Комментарий доктора Акира Кавашима:</h3>
 Исследование пациентов, находящихся на диализе, показало эффективное поддержание на минимальном уровне индоксила сульфата в сыворотке крови. Это означает, что перенос уремического токсического индоксила сульфата в кровь поддерживается на минимальном уровне.<br class="is-revealed">
 <br class="is-revealed">
 Иными словами, существует возможность контролировать прогрессирование хронической почечной недостаточности. И механизмом в этом процессе является супрессия продукции индоловых токсинов в кишечнике экстрактом брожения молочнокислых бактерий.<br class="is-revealed">
 <br class="is-revealed">
 Исследования доказали, что экстракт брожения молочнокислых бактерий потенциально полезен для контролирования фазовой стабилизации почечной недостаточности.<br class="is-revealed">
 <br class="is-revealed">
 <img src="https://thumb.tildacdn.com/tild3537-6135-4934-a464-663332353438/-/resize/510x/-/format/webp/tab2.png" data-original="https://static.tildacdn.com/tild3537-6135-4934-a464-663332353438/tab2.png" imgfield="img" class="is-revealed"><br class="is-revealed">
         </div>
 \n\n <p class=\"text-base text-gray-500 mt-4 flex flex-row gap-2\"><span class=\"text-red-500 text-2xl leading-[1.1rem]\">*</span><span>Эффективность Daigo подтверждена российскими и японскими исследованиями. Например, «Влияние Дайго на уменьшение факторов, влияющих на прогрессирование почечной недостаточности»<span></p>
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
  'issledovanie-effektivnost-peroralnogo-priyema-plazmalogena-tamotsu-tamotsu-': {
    id: 8,
    slug: 'issledovanie-effektivnost-peroralnogo-priyema-plazmalogena-tamotsu-tamotsu-',
    title: 'Исследование: эффективность перорального приёма плазмалогена Tamotsu (Тамоцу)',
    preview: 'Исследование: эффективность перорального приёма плазмалогена Tamotsu (Тамоцу)',
    image: 'https://mail.daigo.ru/upload/resize_webp/iblock/3d8/1la6nvowxft073uth6hoy1w3ejprniff.webp',
    date: '2025-04-13',
    time: 8,
    views: 37140,
    comments: 0,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'По имеющимся сведениям, количество плазмалогенов (Пл) в мозгу и крови умерших пациентов, страдавших болезнью Альцгеймера, уменьшалось/',
    cover: 'https://mail.daigo.ru/upload/resize_webp/iblock/3d8/1la6nvowxft073uth6hoy1w3ejprniff.webp',
    breadcrumbs: [
      { label: 'Главная', to: '/' },
      { label: 'Исследования', to: '/researches' },
      { label: 'Исследование: эффективность перорального приёма плазмалогена Tamotsu (Тамоцу)', to: '/researches/issledovanie-effektivnost-peroralnogo-priyema-plazmalogena-tamotsu-tamotsu-' }
    ],
    tags: [
      { id: 1, slug: 'kishechnik-i-immunitet', label: 'Кишечник и иммунитет' },
      { id: 2, slug: 'metabiotiki', label: 'Метабиотики' }
    ],
    // Автор исследования
    author: {
      id: 2,
      name: 'Такехико Фудзино а, Тацуо Ямада b, Такаси Асада c, Ёсио Цубои d, Тикако Ваканаe, Сиро Маватариa, Суминори Коно',
      position: '',
      avatarUrl: '',
      about: '',
      social: [
      ]
    },
    contentTop: `
    <div class="wysiwyg js-wysiwyg-container">
            <h2 class="is-revealed">Эффективность перорального приёма плазмалогена Tamotsu (Тамоцу)</h2>
 Изменение&nbsp;содержания&nbsp;плазмалогена в крови у пациентов, страдающих болезнью Альцгеймера в лёгкой стадии и умеренными когнитивными нарушениями: двойное слепое рандомизированное многоцентровое плацебо-контролируемое исследование<br class="is-revealed">
 <br class="is-revealed">
 Исследовательская работа<br class="is-revealed">
 <br class="is-revealed">
 Оглавление доступно на сайте ScienceDirect EbioMedicine<br class="is-revealed">
 Главная страница журнала:&nbsp;<a href="http://www.ebiomedicine.com/" class="link link--underlined is-revealed">www.ebiomedicine.com</a><br class="is-revealed">
 <br class="is-revealed">
 Такехико Фудзино а, Тацуо Ямада b, Такаси Асада c, Ёсио Цубои d, Тикако Ваканаe, Сиро Маватариa, Суминори Коно f<br class="is-revealed">
<ul class="is-revealed">
	<li>Институт реологических свойств питания, 2241-1 Кубара, Хисаяма-мати, Касуя-гун, Фукуока 811-2501, Япония</li>
	<li>Реабилитационная клиника Готанды, 8-8-20 Нисиготанда, Синагава-ку, Токио 141-0031, Япония</li>
	<li>Клиника памяти Отяномидзу, 1-5-34, Юсима, Бункё-ку, Токио 113-0034, Япония</li>
	<li>Отделение неврологии, факультет медицины, Университет Фукуока, 7-45-1 Нанакума, Дзёхнан-ку, Фукуока 814-0180, Япония</li>
	<li>Клиника BOOCS, 6-18 Тенямати, Хаката-ку, Фукуока 812-0025, Япония</li>
	<li>Национальный институт здоровья и питания, Национальные институты биомедицинских инноваций, здоровья и питания, 1-23-1 Тояма, Синдзюку-ку, Токио 162-8636, Япония</li>
</ul>
 Информация о статье<br class="is-revealed">
 <br class="is-revealed">
 История статьи:<br class="is-revealed">
 Получена 22 декабря 2016 г.<br class="is-revealed">
 Получена в исправленной форме 6 февраля 2017 г.<br class="is-revealed">
 Принята 13 февраля 2017 г.<br class="is-revealed">
 Доступна онлайн с 24 февраля 2017 г.<br class="is-revealed">
 <br class="is-revealed">
 Краткий обзор: по имеющимся сведениям, количество плазмалогенов (Пл) в мозгу и крови умерших пациентов, страдавших болезнью Альцгеймера, уменьшалось. Недавно мы провели исследование, показавшее, что интраперитонеальный приём Пл вызывает улучшение когнитивной функции у подопытных животных.<br class="is-revealed">
 <br class="is-revealed">
 В ходе рассматриваемого исследования мы оценили эффективность перорального приёма Пл из морского гребешка в отношении когнитивной функции и изменения содержания Пл в крови у пациентов, страдающих болезнью Альцгеймера (БА) в лёгкой стадии и умеренными когнитивными нарушениями (УКН).<br class="is-revealed">
 <br class="is-revealed">
 Методы: двойное слепое рандомизированное многоцентровое плацебо-контролируемое исследование проводилось в течение 24 недель.<br class="is-revealed">
 <br class="is-revealed">
 В нём участвовали 328 пациентов в возрасте 60-85 лет с оценкой 20-27 баллов по Краткой шкале оценки психического статуса в Японии (MMSE-J) и пять и ниже баллов согласно краткой японской версии гериатрической шкалы депрессии (GDS-S-J).<br class="is-revealed">
 <br class="is-revealed">
 Испытуемые были случайным образом разделены на две группы: в одной группе пациенты принимали по 1 мг Пл из морского гребешка в сутки, в другой группе пациенты получали плацебо. Распределение по группам было скрыто от пациентов и врачей-исследователей.<br class="is-revealed">
 <br class="is-revealed">
 Первичным результатом являлась оценка по шкале MMSE-J. Вторичные результаты включали оценку по обновлённой шкале памяти Векслера (WMS-R), оценку по шкале GDS-S-J и уровень концентрации фосфатидилэтаноламинов плазмалогенов (ПлФЭ) в мембранах эритроцитов и плазме.<br class="is-revealed">
 <br class="is-revealed">
 Данное исследование зарегистрировано в Сети медицинской информации больниц при университетах за номером UMIN000014945.<br class="is-revealed">
 <br class="is-revealed">
 Результаты: 276 пациентов из 328 испытуемых прошли исследование до конца (140 человек из лечебной группы и 136 человек из контрольной группы).<br class="is-revealed">
 <br class="is-revealed">
 В результате анализа в соответствии с намерением применить вмешательство, где рассматривались результаты пациентов, страдающих как БА в лёгкой стадии (20 ≤ MMSE-J ≤ 23), так и УКН (24 ≤ MMSE ≤ 27), не было обнаружено значительных различий между лечебной и контрольной группами в отношении первичных и вторичных результатов, в обеих группах отсутствовали тяжёлые побочные явления. Показатель WMS-R значительно улучшился в лечебной группе, а межгрупповая разница была близка к значимой (P = 0,067).<br class="is-revealed">
 <br class="is-revealed">
 Как показал анализ данных в подгруппе пациентов с БА в лёгкой стадии, показатель WMS-R значительно улучшился у женщин и всех испытуемых старше 77 лет в лечебной группе, а межгрупповая разница была статистически значимой у женщин (P = 0,017) и испытуемых моложе 77 лет (P = 0,029).<br class="is-revealed">
 <br class="is-revealed">
 У пациентов с БА в лёгкой стадии было выявлено значительно большее снижение количества ПлФЭ в плазме в контрольной группе по сравнению с лечебной группой.<br class="is-revealed">
 <br class="is-revealed">
 Интерпретация: пероральный приём очищенного Пл из морского гребешка способствует улучшению когнитивных функций у пациентов, страдающих БА в лёгкой стадии.<br class="is-revealed">
 <br class="is-revealed">
 © 2017 г. Авторы. Опубликовано издательством Elsevier B.V. Данная статья находится в свободном доступе по лицензии CC (Creative Commons) BY-NC-ND.<br class="is-revealed">
 <br class="is-revealed">
 (<a href="http://creativecommons.org/licenses/by-nc-nd/4.0/" class="link link--underlined is-revealed">http://creativecommons.org/licenses/by-nc-nd/4.0/</a>)<br class="is-revealed">
 <br class="is-revealed">
 Ключевые слова: плазмалоген, Морской гребешок, Болезнь Альцгеймера, Умеренные когнитивные нарушения, Когнитивная функция
<h2 class="is-revealed"><br>
 </h2>
<h2 class="is-revealed">Введение</h2>
 Болезнь Альцгеймера (БА) — это возрастное нейродегенеративное заболевание, которое становится всё более распространённым по мере увеличения продолжительности жизни людей.<br class="is-revealed">
 <br class="is-revealed">
 Согласно прогнозам, распространённость БА может превысить 74 миллиона случаев по всему миру к 2030 году (World Alzheimer Report, 2015 г.).<br class="is-revealed">
 <br class="is-revealed">
 Причина и механизм БА до конца не выяснены, однако её<br class="is-revealed">
 нейропатологическим признаком является постепенное отложение бета-амилоидов и тау-белков.<br class="is-revealed">
 <br class="is-revealed">
 С другой стороны, тесная взаимосвязь между плазмалогенами (Пл) и БА подтверждена данными наблюдений, указывающими на уменьшение количества фосфатидилэтаноламинов плазмалогенов (ПлФЭ) в повреждённых участках головного мозга, таких как гиппокамп и лобная кора, у пациентов с БА (Гинсберг и др., 1995 г.; Гуан и др., 1999 г.; Хан и др., 2001 г.). Имеются данные о снижении уровня ПлФЭ в крови и спинномозговой жидкости пациентов с БА (Гооденове и др., 2007 г.; Вуд и др., 2010 г., 2015 г.; Ома и др., 2012 г.; Ямасита и др., 2015 г.).<br class="is-revealed">
 <br class="is-revealed">
 Однако остаётся неясным, является ли уменьшение количества Пл в мозговой ткани и плазме причиной или следствием данного заболевания. Последние исследования БА с участием животных моделей, проведённые нашей группой, показали, что интраперитонеальный приём очищенных Пл вызывает улучшение когнитивной функции (Катафути и др., 2012 г.; Хоссейн и др., 2013 г., 2016 г.).<br class="is-revealed">
 <br class="is-revealed">
 Пл представляют собой особый класс глицерофосфолипидов, характеризуемых наличием винилэфирной связи в позиции sn-1 глицеринового скелета. Их также называют плазменил-фосфолипидами или алкенил-акрил-фосфолипидами.<br class="is-revealed">
 <br class="is-revealed">
 Они содержатся практически во всех тканях млекопитающих и составляют около 18-20% от общего количества фосфолипидов в клеточных мембранах.<br class="is-revealed">
 <br class="is-revealed">
 Преобладающими Пл в тканях млекопитающих являются ПлФЭ и холин-плазмалоген. ПлФЭ является намного более распространённым, чем холин-плазмалоген, за исключением сердца и скелетных мышц. По имеющимся сведениям, Пл в большом количестве содержатся в головном мозге, сетчатке глаза, лейкоцитах (иммунных клетках), сперме, сердце и скелетных мышцах млекопитающих. Это типичное распределение Пл указывает на важность Пл для млекопитающих (Фаруки и Хоррокс, 2001 г.; Брейверман и Мосер, 2012 г.).<br class="is-revealed">
 <br class="is-revealed">
 Пл не только являются структурным компонентом клеточных мембран животных и хранилищем для вторичных мессенджеров, но также могут участвовать в слиянии мембран, переносе ионов и оттоке холестерина, а также действовать в качестве антиоксидантов в клеточных мембранах. Недавно сообщалось об ингибирующем воздействии Пл на гамма-секретазу (Онодера и др., 2015 г.). Цель настоящего исследования — оценить, приводит ли пероральный приём Пл, экстрагированных из морского гребешка, к улучшению когнитивной функции у пациентов, страдающих БА в лёгкой стадии и умеренными когнитивными нарушениями (УКН).
<h2 class="is-revealed"><br>
 </h2>
<h2 class="is-revealed">Методы</h2>
<h3 class="is-revealed">План и участники исследования</h3>
 Настоящее исследование представляет собой двойное слепое рандомизированное многоцентровое плацебо-контролируемое исследование для оценки эффективности улучшения памяти плазмалогенами из морского гребешка у пациентов с БА и УКН. Период исследования включал 24-недельный период приёма и четырёхнедельный послелечебный период без приёма (всего 28 недель).<br class="is-revealed">
 <br class="is-revealed">
 Испытуемыми были пациенты с оценкой 20-27 баллов по Краткой шкале оценки психического статуса в Японии (MMSE-J), т.е. пациенты, страдающие БА в лёгкой стадии (20 ≤ MMSE-J ≤ 23) или УКН (24 ≤ MMSE ≤ 27) (Сольфрицци и др., 2004 г.). Все пациенты должны были соответствовать критериям для БА в лёгкой стадии или УКН, указанным в пятом издании Диагностико-статистического руководства по психическим расстройствам (DSM-V). Отсутствие артериосклеротического слабоумия у пациентов было подтверждено посредством МРТ- или КТ-сканирования, проведённого не менее полугода назад.<br class="is-revealed">
 <br class="is-revealed">
 С целью исключения псевдодеменции было проверено и подтверждено, что пациенты имеют оценку пять или менее баллов согласно краткой японской версии гериатрической шкалы депрессии (GDS-S-J). В течение последних трёх месяцев режим пациентов, принимающих лекарства от болезни Альцгеймера, не изменялся. Все лица, ухаживающие за больными, были обязаны сопровождать их во время всех посещений на протяжении исследования и сообщали информацию о повседневной жизни пациентов и их самочувствии. Пациенты исключались из исследования в случае аллергии на морской гребешок, являющийся сырьём для исследуемого вещества. Было получено письменное осознанное согласие пациентов или их опекунов на данное исследование.<br class="is-revealed">
 <br class="is-revealed">
 Протокол исследования был утверждён Экспертными советами Больницы при университете Фукуоки (Фукуока), клиники Nihonbashi Sakura («Нихонбаси Сакура») (Токио) и клиники BOOCS в Фукуоке (Фукуока). Исследование было проведено в соответствии с Хельсинкской декларацией.
<h3 class="is-revealed">Слепой отбор и маскировка</h3>
 Эксперт компании CAC Croit Corporation («Си-Эй-Си Круа Корпорэйшн») (Токио) выдал сформированный компьютером, произвольный список распределения на основании метода блочной рандомизации, где каждый блок состоял из двух мест в группе приёма плацебо и двух мест в группе приёма Пл. Во все центры исследования были доставлены наборы с исследуемым веществом, пронумерованные согласно списку распределения. Они были пациентам лично в руки.<br class="is-revealed">
 <br class="is-revealed">
 В некоторых центрах исследования, где отсутствовали холодильники, пациенты ежемесячно получали наборы для испытания курьерской почтой. Таким образом, вовлечённым пациентам был случайным образом предписан приём 1,0 мг Пл/день или плацебо. Исследуемое вещество имело желеобразную консистенцию. Активное вещество и плацебо были идентичны по внешнему виду и вкусу. Распределение по группам было скрыто от пациентов, опекунов, лечащих врачей и медицинских сотрудников на протяжении периода исследования.
<h3 class="is-revealed">Процедуры</h3>
 Пациенты-участники исследования получали исследуемое вещество во время визита исходного уровня или через неделю после визита исходного уровня и получали указание принимать его перорально дважды в день в течение 24 недель. Они получали исследуемое вещество с запасом на месяц вперёд на случай пропуска следующего запланированного визита. Для подтверждения соответствия они были обязаны возвратить неиспользованное исследуемое вещество во время следующего визита.<br class="is-revealed">
 <br class="is-revealed">
 Пациентов-участников также просили по возможности не изменять свой режим в течение периода исследования. Если пациент изменял режим приёма своего лекарства, наблюдение за ним/ней прекращалось. Во время каждого визита мы фиксировали все осложнения и нежелательные явления, о которых сообщали пациенты.<br class="is-revealed">
 <br class="is-revealed">
 Первичной конечной точкой исследования была оценка MMSE-J. Вторичные конечные точки исследования включали оценку по обновлённой шкале памяти Векслера (WMS-R), оценку по шкале GDS-S-J, уровень концентрации ПлФЭ в плазме и относительная концентрация ПлФЭ в мембранах эритроцитов, а именно процентная доля Пл по отношению ко всем фосфолипидам в мембране эритроцита. Когнитивная функция оценивалась на исходном уровне, а затем на 12-ой, 24-ой и 28-ой неделях.<br class="is-revealed">
 <br class="is-revealed">
 Забор крови у пациентов проводился натощак на исходном уровне, а затем на 8-ой, 16-ой, 20-ой, 24-ой и 28-ой неделях для измерения содержания ПлФЭ в эритроцитах и плазме. Измерение содержания ПлФЭ производилось с использованием ранее применявшегося метода (Маватари и др., 2007 г., 2016 г.).<br class="is-revealed">
 <br class="is-revealed">
 Оценка безопасности осуществлялась путём фиксирования нежелательных явлений, а также медицинского осмотра и биохимических анализов крови, в том числе для оценки функции печени, почечной функции, уровня сахара в крови и уровня содержания липидов, во время каждого визита.
<h3 class="is-revealed">Статистический анализ</h3>
 Чтобы определить объём выборки, мы предположили, что оценка по шкале MMSE-J улучшится на 5% в контрольной группе и на 10% в лечебной группе при среднем отклонении 15% в обеих группах. При статистической мощности 0,80 и уровне значимости для одностороннего критерия 0,01 требуемый объём выборки составил 181 пробу в каждой группе. Было решено установить целевое количество образцов равным 200 в каждой группе с поправкой на долю испытуемых, которые могут выбыть из исследования.<br class="is-revealed">
 <br class="is-revealed">
 Разница между условиями испытания оценивалась с использованием критерия Стьюдента для одной выборки, а внутригрупповые изменения с исходного уровня оценивались с применением двустороннего критерия Стьюдента.<br class="is-revealed">
 <br class="is-revealed">
 Что касается результатов для когнитивной функции после лечения, указывались средние изменения по сравнению с исходным уровнем и 95-процентный доверительный интервал (ДИ). Анализы проводились с использованием программного продукта Stata версии 13 (StataCorp, College Station, TX). Данное исследование зарегистрировано в Сети медицинской информации больниц при университетах за номером UMIN000014945.
<h3 class="is-revealed">Роль источника финансирования</h3>
 Компания B&amp;S Corporation Co. Ltd. (Токио), одна из организаций, финансирующих Японское общество исследования плазмалогена, участвовала в доставке исследуемого вещества и плацебо в центры исследования, но не принимала участия в планировании исследования, подготовке исследователей, анализе данных, интерпретации результатов и написании отчёта.<br class="is-revealed">
 <br class="is-revealed">
 Соответствующий автор имел полный доступ ко всем данным исследования и нёс окончательную ответственность за решение о передаче сведений для публикации. Все соисследователи также имели полный доступ к указанным данным.
<h2 class="is-revealed"><br>
 </h2>
<h2 class="is-revealed">Результаты</h2>
<h3 class="is-revealed">Участники исследования</h3>
 Всего к участию в исследовании были привлечены 328 пациентов из 25 больниц и клиник в регионах Кюсю, Канто и Кансай в период с 15 ноября 2014 г. по 8 октября 2015 г.<br class="is-revealed">
 <br class="is-revealed">
 Они были случайным образом распределены по двум группам (166 испытуемых в группе приёма Пл и 162 пациента в группе приёма плацебо). Из 328 зарегистрированных пациентов 285 участвовали в исследовании в течение 12 недель, 276 испытуемых прошли 24-недельный период исследования.<br class="is-revealed">
 <br class="is-revealed">
 Среди испытуемых, прошедших исследование, были 11 пациентов (4,0%), которые использовали не более 80% предоставленного исследуемого вещества. На рис. 1 показана схема исследования.<br class="is-revealed">
 <img src="https://thumb.tildacdn.com/tild3435-3038-4338-a638-303362646639/-/resize/942x/-/format/webp/--2021-04-20--122925.png" data-original="https://static.tildacdn.com/tild3435-3038-4338-a638-303362646639/--2021-04-20--122925.png" imgfield="img" class="is-revealed"><br class="is-revealed">
 Не было отмечено значительных различий между группами в отношении возраста, оценок MMSE-J, GDS-S-J, WMS-R (0 мин), WMS-R (30 мин), содержания ПлФЭ в эритроцитах и плазме на исходном уровне, однако соотношение мужчин и женщин было значительно ниже в контрольной группе (Таблица 1).<br class="is-revealed">
 <img src="https://thumb.tildacdn.com/tild6438-3234-4961-b236-373063643137/-/format/webp/__2021-06-11__120354.png" data-original="https://static.tildacdn.com/tild6438-3234-4961-b236-373063643137/__2021-06-11__120354.png" imgfield="img" class="is-revealed">
<h2 class="is-revealed">Клиническая эффективность</h2>
<h3>Первичный анализ</h3>
 В анализе в соответствии с намерением применить вмешательство не было обнаружено значительного различия между лечебной и контрольной группами по первичным и вторичным результатам для когнитивной функции.<br>
 <br>
 Показатель MMSE-J показал почти значимое улучшение в лечебной группе, в то время как подобного улучшения не наблюдалось в лечебной группе, в соответствии с чем межгрупповая разница не была статистически значимой.<br>
 <br>
 Показатели WMS-R (0 мин) и WMS-R (30 минут) значительно улучшились в обеих группах, однако статистически значимая межгрупповая разница отсутствовала. Содержание ПлФЕ в эритроцитах и плазме снизилось в разной степени после лечения в обеих группах.<br>
 <br>
 Отсутствовала статистически значимая межгрупповая разница в любой момент времени, при этом количество ПлФЭ в плазме уменьшилось в большей степени в контрольной группе (Таблица 2).<br>
 <img src="https://thumb.tildacdn.com/tild6333-6233-4661-b432-396430353932/-/format/webp/--2021-04-20--124121.png" data-original="https://static.tildacdn.com/tild6333-6233-4661-b432-396430353932/--2021-04-20--124121.png" imgfield="img">
<h3>Анализ подгрупп</h3>
 Мы изучили изменение когнитивной функции у пациентов, страдающих БА в лёгкой степени и УКН, по отдельности. Показатель MMSE-J не изменился значительно ни в одной из групп.<br>
 <br>
 Показатели WMS-R (0 мин) и WMS-R (30 мин) улучшились статистически значимо в лечебной группе, и улучшение оказалось более заметным в лечебной группе в отношении значения для 0 мин (P = 0,067) и значения для 30 мин (P = 0,078) (Таблица 3).<br>
 <br>
 Таблица 3 Средняя разница по сравнению с исходным уровнем у пациентов с оценкой 20-23 по шкале MMSE-J<br>
 <img src="https://thumb.tildacdn.com/tild6465-3563-4334-a230-323964636262/-/format/webp/--2021-04-20--124216.png" data-original="https://static.tildacdn.com/tild6465-3563-4334-a230-323964636262/--2021-04-20--124216.png" imgfield="img">
<h3>Анализ подгрупп по полу и возрасту</h3>
 Далее, мы проанализировали когнитивную функцию у пациентов с БА в лёгкой степени по полу и возрасту (Таблица 4). Пациенты, страдающие БА в лёгкой степени, были разделены на две группы на основании медианта — 77 лет или младше и 78 лет или старше.<br>
 <br>
 У пациентов в возрасте 77 лет и младше показатель WMS-R (30 мин) увеличился статистически значимо в лечебной группе при значимой межгрупповой разнице (P = 0,029). У испытуемых женщин, страдающих БА в лёгкой степени, показатель WMS-R (30 мин) увеличился статистически значимо в лечебной группе при значимой межгрупповой разнице (P = 0,017). Отсутствовала значительная межгрупповая разница в анализе пациентов, страдающих УКН, по полу и возрасту.<br>
 <img src="https://thumb.tildacdn.com/tild6335-3862-4331-b432-353634386433/-/format/webp/--2021-04-20--124319.png" data-original="https://static.tildacdn.com/tild6335-3862-4331-b432-353634386433/--2021-04-20--124319.png" imgfield="img">
<h3>Изменения количества плазмалогенов в крови</h3>
 Были изучены изменения содержания ПлФЭ в крови у пациентов, страдающих БА в лёгкой стадии (Таблица 5).<br>
 <br>
 Уровень ПлФЭ в плазме снизился в контрольной группе со значимой межгрупповой разницей (P = 0,016). Наблюдалось статистически значимое повышение уровня ПлФЭ в эритроцитах на 16-ой неделе в лечебной группе и на 24-ой неделе в контрольной группе. Тем не менее, изменения между двумя группами не отличались значительно.<br>
 <img src="https://thumb.tildacdn.com/tild3731-3535-4862-a331-353239616436/-/format/webp/--2021-04-20--124353.png" data-original="https://static.tildacdn.com/tild3731-3535-4862-a331-353239616436/--2021-04-20--124353.png" imgfield="img">
<h3>Клиническая безопасность</h3>
<div>
	 В Таблице 6 обобщаются нежелательные явления. Между двумя группами отсутствовала значительная разница по частности нежелательных явлений.<br>
	 &nbsp; <br>
</div>
<table>
<thead>
<tr>
	<td colspan="1">
		 Список нежелательных явлений, о которых было сообщено
	</td>
	<td colspan="1">
		 Лечебная группа (n = 169)
	</td>
	<td colspan="1">
		 Контрольная группа (n = 167)
	</td>
</tr>
<tr>
	<td colspan="1">
		 Новообразования
	</td>
	<td colspan="1">
		 &nbsp;
	</td>
	<td colspan="1">
		 &nbsp;
	</td>
</tr>
<tr>
	<td colspan="1">
		 Рак пищевода<br>
	</td>
	<td colspan="1">
		 0
	</td>
	<td colspan="1">
		 1
	</td>
</tr>
<tr>
	<td>
		 Рак яичников
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Рак мочевого пузыря
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Нервная система
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Паркинсонизм
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Транзиторная ишемическая атака
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Глаза
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Экхимоз
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Кровеносная система
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Гипертензия
	</td>
	<td>
		 2
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Ишемическая болезнь сердца
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Желудочковая экстрасистола
	</td>
	<td>
		 0
	</td>
	<td>
		 2
	</td>
</tr>
<tr>
	<td>
		 Инсульт
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Субарахноидальное кровоизлияние
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Дыхательная система
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Простуда
	</td>
	<td>
		 2
	</td>
	<td>
		 3
	</td>
</tr>
<tr>
	<td>
		 Аспирационная пневмония
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Пищеварительная система
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Гемангиоматоз печени
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Стоматит
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Язвенная болезнь желудка
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Непроходимость кишечника
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Острая печёночная недостаточность
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Холецистолитиаз
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Кожа и подкожная ткань
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Опоясывающий герпес
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Ротовой герпес
	</td>
	<td>
		 0
	</td>
	<td>
		 2
	</td>
</tr>
<tr>
	<td>
		 Пруриго
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Сыпь
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Скелет и мускулатура
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Приступ подагры
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Мочеполовая система
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Почечная недостаточность
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Симптоматика
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Диарея
	</td>
	<td>
		 3
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Акатизия
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Онемение рук
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Боль в ушах
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Боль в горле
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Запор
	</td>
	<td>
		 2
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Боль в колене
	</td>
	<td>
		 2
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Боль в плече
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Мышечная боль
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Кашель
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Рвота
	</td>
	<td>
		 0
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Головокружение
	</td>
	<td>
		 0
	</td>
	<td>
		 3
	</td>
</tr>
<tr>
	<td>
		 Боль в животе
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Отёк
	</td>
	<td>
		 1
	</td>
	<td>
		 3
	</td>
</tr>
<tr>
	<td>
		 Повреждения
	</td>
	<td>
	</td>
	<td>
	</td>
</tr>
<tr>
	<td>
		 Ушиб
	</td>
	<td>
		 1
	</td>
	<td>
		 1
	</td>
</tr>
<tr>
	<td>
		 Перелом
	</td>
	<td>
		 4
	</td>
	<td>
		 4
	</td>
</tr>
<tr>
	<td>
		 Травматическое субарахноидальное кровоизлияние
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
<tr>
	<td>
		 Травма мениска
	</td>
	<td>
		 1
	</td>
	<td>
		 0
	</td>
</tr>
</thead>
</table>
<h2>Обсуждение<br>
 </h2>
 Насколько нам известно, настоящее исследование является беспрецедентным исследованием влияния перорального приёма Пл на когнитивную функцию у пациентов, страдающих БА в лёгкой стадии и УКН. Текущие результаты не показали значительной разницы первичных результатов (оценка MMSE-J) между лечебной и контрольной группами.<br>
 <br>
 Однако среди пациентов с БА в лёгкой стадии оценка MMSE-J значительно улучшилась в лечебной группе, и это улучшение выглядит более существенным, чем в контрольной группе. В анализе по подгруппам пациентов с БА в лёгкой стадии улучшение показателя MMSE-J было более заметным у женщин-пациенток и пациентов младше 77 лет. Эти результаты свидетельствуют о том, что пероральный приём очищенных Пл может оказать способствовать улучшению функции памяти у пациентов, страдающих БА в лёгкой стадии.<br>
 <br>
 Данное исследование не даёт результатов в пользу эффективности Пл для пациентов с БА в лёгкой стадии старше 78 лет или мужчин-пациентов. Низкая эффективность в этих случаях может объясняться возрастными необратимыми дегенеративными изменениями в головном мозге (Коу и др., 2011 г.). Неизвестно, почему эффективность была очевидна в отношении женщин в отличие от мужчин.<br>
 <br>
 Данное исследование не выявило эффективности Пл в отношении пациентов, страдающих УКН.<br>
 <br>
 Следует отметить, что оценка по шкале WMS-R значительно улучшилась ещё в конце исследования (24-ая неделя) и в контрольной группе. Эти результаты говорят о том, что у пациентов, страдающих УКН, эффект плацебо мог проявиться сильнее, чем у пациентов с БА в лёгкой стадии.<br>
 <br>
 У пациентов с УКН могут сохраняться такие высшие функции мозга, как ожидание и надежда. Вероятно, пациенты с БА в лёгкой стадии меньше подвержены эффекту плацебо, поскольку их когнитивная функция ухудшается и вышеупомянутая высшая функция мозга ослабляется более заметно, чем у пациентов с УКН. Данная цепь предположений указывает на то, что психическое состояние человека может вызывать изменения концентрации Пл в тканях головного мозга.<br>
 <br>
 Наши предыдущие исследования показали, что количество Пл в мембранах эритроцитов значительно увеличивается при пероральном приёме Пл, ещё одно исследование также показало, что количество ПлФЭ в плазме увеличивалось вскоре после их перорального приёма (Маватари и др., 2012 г.; Нисимукаи и др., 2003 г.).<br>
 <br>
 Однако в настоящем исследовании приём лишь очищенных Пл по 1,0 мг/день оказал эффект на функцию памяти у пациентов с БА в лёгкой стадии. Физиологический механизм данного эффекта при столь малом количестве Пл, принимаемом перорально, не ясен. Одна из гипотез состоит в том, что Пл могут проникать через определённые рецепторы, как гормоны.<br>
 <br>
 Считается, что липидные рафты клеточной мембраны связаны с сигнальной системой клетки (Хоссейн и др., 2016 г.; Нью и Вонг, 2007 г.). Имеются сведения о том, что липидные рафты содержат большое количество ПлФЭ (Пайк и др., 2002 г.). Рецепторы, сопряжённые с G-белком (GPRC), также сконцентрированы в липидных рафтах и ямках (Кини и Паренти, 2004 г.). Это указывает на вероятность того, что Пл действуют как лиганды GPRC. Уровень концентрации ПлФЭ в плазме крови человека достигает около 100 мкмоль/л, однако Пл могут циркулировать в плазме в виде липопротеинов. Пл в липопротеинах обычно не действуют в качестве лиганд рецепторов.<br>
 <br>
 Однако вполне возможно, что свободные Пл, полученные пероральным путём, даже в небольших количествах, могут действовать в качестве лиганды некоторых рецепторов в клетках кишечника перед превращением в липопротеины. Хорошо известно, что существует тесная связь между кишечником и головным мозгом посредством нейронных, эндокринных и иммунных проводящих путей (Яранди и др., 2016 г.).<br>
 <br>
 С другой стороны, существует множество сведений о тесной связи докозагексаеновой кислоты (DHA) и эйкозапентаеновой кислоты (EPA) с функциями головного мозга (Гримм и др., 2016 г.; Хоппертон и др., 2016 г.; Рен и др., 2017 г.). Пл из морского гребешка, использованные в данном исследовании, предположительно содержали относительно большое количество DHA и EPA (Краффе и др., 2004 г.; Ханус и др., 2009 г.).<br>
 <br>
 Существует вероятность, что омега-3-полиненасыщенные жирные кислоты могут способствовать улучшению когнитивной функции при БА в лёгкой стадии. Согласно некоторым исследованиям, DHA в форме фосфолипидов проходит через гематоэнцефалический барьер примерно в десять раз более эффективно, чем в форме свободных жирных кислот (Лагард и др., 2001 г., 2015 г.), хотя другие исследования показывают, что диета, богатая омега-3 жирными кислотами, такими как DHA и EPA, оказывает незначительный положительный эффект на когнитивную деятельность пациентов, страдающих БА (Куинн и др., 2010 г.; Филлипс и др., 2015 г.).<br>
 <br>
 Что касается изменения содержания ПлФЭ в крови после лечения, были отмечены значительные различия между лечебной и контрольной группами у пациентов, страдающих БА в лёгкой стадии. Количество ПлФЭ в плазме в контрольной группе значительно уменьшилось после лечения, в то время как в лечебной группе оно не изменилось.<br>
 <br>
 Согласно некоторым исследованиям, статины, класс лекарственных средств для снижения уровня холестерина в крови, повышают содержание ПлФЭ в крови (Мейкле и др., 2015 г.). В данном исследовании 23 (23,5%) из 98 пациентов, страдающих БА в лёгкой стадии, принимали статины в течение периода исследования. Тем не менее, значительные различия в уровне ПлФЭ в плазме между лечебной и контрольной группами отмечались и без учёта пациентов, принимающих статины. Данные результаты могут свидетельствовать о том, что выработка Пл в пероксисомах снижалась параллельно с развитием болезни Альцгеймера во время 24-недельного периода лечения и что пероральный приём Пл может способствовать поддержанию выработки Пл в пероксисомах.<br>
 <br>
 Данное исследование имеет несколько проблем и ограничений. Продолжительность исследования может быть недостаточной для определения эффекта Пл на пациентов, страдающих УКН, с оценкой по шкале MMSE-J выше 24, чьё состояние было определено недостаточно точно и могло лишь незначительно отличаться от состояния здоровых людей. Для решения данной проблемы нам необходимо провести дополнительное исследование, чтобы выяснить, возможно ли замедлить переход от УКН к БА при длительном наблюдении за пациентами, страдающими УКН, в лечебной группе. Также требуются дальнейшие рандомизированные контролируемые исследования в отношении пациентов, страдающих БА в средней и тяжёлой стадиях.<br>
<h3>Источники финансирования</h3>
 Данное исследование финансировалось Японским обществом исследования плазмалогена (Pls2014-01) (Фукуока, Япония) в качестве исследования, инициированного исследователем.<br>
<h3>Конфликты интересов</h3>
 ТФ и СМ подали заявку на патент на метод производства фосфолипидов (номер патентной заявки: PCT/JP2015/63617, PCT/JP2015/63740). ТЯ, ТА, ЁЦ, ТВ и СК заявляют, что у них отсутствуют конфликты интересов.<br>
<h3>Вклад авторов</h3>
 ТФ нёс ответственность за централизованное управление исследованием, в том числе за поиск литературы, составление плана исследования, сбор данных, интерпретацию данных и написание рукописи. ТЯ, ТА и ЁЦ участвовали в планировании исследования, отборе персонала и мониторинге исследования. ТВ участвовал в клиническом применении, сборе данных и написании рукописи. СМ участвовал в проведении исследования посредством проведения лабораторных измерений и написания рукописи. СК составлял план исследования, проводил статистический анализ данных и участвовал в написании рукописи. Все авторы проверили рукопись и подтвердили её окончательную версию.<br>
<h3>Выражение признательности</h3>
 Мы благодарим всех пациентов и ухаживающих за ними лиц, принявших участие в данном исследовании.<br>
 <br>
 Следующие лица участвовали в проведении испытания в качестве врачей-исследователей:&nbsp;Е. Нисикава (клиника Нисикава-наика, Симоносеки) Х. Фудзино (клиника Фудзино, Янагава), Х. Мацуо (больница Мацуо, Фукуока), Х. Навата (больница Мута, Фукуока), К. Фукуяма (больница Хасами, Нигасисоноги), К. Ирие (больница Хакуйюдзи, Фукуока), К. Саито, Н. Синфуку (клиника BOOCS в Фукуоке, Фукуока), К. Серикава (клиника психических расстройств Моновасуре, Фукуока), К. Такасаки (клиника нейрохирургии Такасаки, Касуя), М. Итимару (клинический комплекс BOOCS, Токио), М. Киносита (больница Нагато, Янагава), М. Мунака (клиника Хаяма, Мунаката), Н. Араки (реабилитационная клиника Сангэндзяя, Токио), С. Оума (больница при университете Фукуоки, Фукуока), С. Накано (клиника Nihonbashi Sakura, Токио), Т. Асада (Olive Clinic Ochanomizu, Токио, Клиника памяти Отяномидзу, Токио), Т. Канеко (больница Канеко, Янагава), Т. Киносита (клиника памяти Нозоми, Митака), Т. Ямада (больница Нисино, Китакюсю, больница Токорозава Меисеи, Токорозава), Т. Ёсимацу (больница Мито, Касуя), Ё. Накаяма (клиника Накаёси, Касуя), Ё. Секине (клиника Секине, Нираката).<br>
 <br>
 Данный текст охраняется законом РФ о защите авторских прав, а также международным законодательством в этой области.<br>
 <br>
 Любое частичное или полное копирование и воспроизведение без разрешения владельца запрещено. Лица, виновные в нарушении авторских прав и исключительных прав на использование текста, несут гражданско-правовую, административную и уголовную ответственность"<br>        </div>
 \n\n <p class=\"text-base text-gray-500 mt-4 flex flex-row gap-2\"><span class=\"text-red-500 text-2xl leading-[1.1rem]\">*</span><span>Согласно методическому пособию «Когнитивная астения и профилактика ее прогрессироввния: фокус на питание», АНО «Научно-исследовательский медицинский центр «Геронтология»<span></p>
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
