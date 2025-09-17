import { getRouterParams, createError } from 'h3'
import type { ArticleDetail } from '~/types/articles'

const DETAIL_BY_SLUG: Record<string, ArticleDetail> = {
  'proizvodstvo-daigo': {
    id: 1,
    slug: 'proizvodstvo-daigo',
    title: 'Производство Даиго',
    preview: 'Как работают метабиотики и почему важен курсовой приём.',
    image: 'https://nuxt.daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'https://nuxt.daigo.ru/images/mock/article/gen.jpg',
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
      avatarUrl: 'https://nuxt.daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-product font-medium mb-4">Производство</h2>
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
<img width="972" alt="Презентация Daigo производство-1.png" src="/upload/medialibrary/fe5/qu3k26vvoq53bfe5bj7gedxtari8qzxm.png" height="1024" title="Презентация Daigo производство-1.png" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <img width="1024" alt="Презентация Daigo производство-2.png" src="/upload/medialibrary/315/01klzil9qn3rg0c62if0gsdhyhs7nkw3.png" height="755" title="Презентация Daigo производство-2.png" class="is-revealed"><br class="is-revealed">
 <br class="is-revealed">
 <img width="911" alt="Презентация Daigo производство-3.png" src="/upload/medialibrary/7b7/lgn7valdx4m468li0ubv5rx4u2ujy82p.png" height="1024" title="Презентация Daigo производство-3.png" class="is-revealed"><br class="is-revealed">
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
    //     avatarUrl: 'https://nuxt.daigo.ru/images/mock/research/author.jpg',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-2.png',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-3.png',
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
    image: 'https://nuxt.daigo.ru/images/mock/article/gen.jpg',
    date: '2025-06-30',
    time: 8,
    views: 200,
    comments: 2,
    properties: { napravlennost: 'kishechnik-i-immunitet' },
    description: 'Исследуем действие метабиотиков и накопительный эффект.',
    cover: 'https://nuxt.daigo.ru/images/mock/article/gen.jpg',
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
      avatarUrl: 'https://nuxt.daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-product font-medium mb-4">Комбинированное воздействие сублингвальной иммунотерапии и Daigo на симптомы поллиноза, вызываемого пыльцой кедра</h2>
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
    //     avatarUrl: 'https://nuxt.daigo.ru/images/mock/research/author.jpg',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-2.png',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-3.png',
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
    id: 2,
    slug: 'daygo-sposobstvuet-umensheniyu-pronitsaemost-kishechnoy-stenki',
    title: 'Дайго способствует уменьшению проницаемость кишечной стенки',
    preview: 'Исследования Daigo от Института повышения квалификации Федерального медико-биологического агентства',
    image: 'https://nuxt.daigo.ru/images/mock/article/gen.jpg',
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
      avatarUrl: 'https://nuxt.daigo.ru/images/mock/researches/author.png',
      about: 'Профессор Нобору Фурукава (Noboru Furukawa) Лаборатория по использованию продуктов животноводства.',
      social: [
        { type: 'tg', url: 'https://t.me/daigo' },
        { type: 'vk', url: 'https://vk.com/daigo' }
      ]
    },
    contentTop: `
      <h2 class="text-product font-medium mb-4">Исследования Daigo от Института повышения квалификации Федерального медико-биологического агентства</h2>
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
    //     avatarUrl: 'https://nuxt.daigo.ru/images/mock/research/author.jpg',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-2.png',
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
        image: 'https://nuxt.daigo.ru/images/mock/researches/subcat-3.png',
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
