export default defineEventHandler((event) => {
  const { slug } = event.context.params!

  const productsMock = [
    {
      id: 1,
      slug: 'daigo-lux',
      title: 'Метабиотик для кишечника Daigo Lux',
      subtitle: 'Японский органический метабиотик премиум-класса',
      shortDescription: 'Daigo Lux создаёт идеальную среду для роста родных полезных кишечных бактерий, одновременно блокируя патогенную микрофлору, способствуя восстановлению здорового баланса кишечной микрофлоры и правильной работы ЖКТ.',
      // descriptionSections: [
      //   {
      //     type: 'text-with-image',
      //     title: 'Особенности Daigo Lux',
      //     content: `
      //       <p>Дайго Люкс содержит <span class="text-primary font-medium">в 1,5 раза больше</span> активных веществ, чем Дайго.</p>
      //       <p>В процессе производства Дайго Люкс проходит <span class="text-primary font-medium">дополнительную ступень ферментации</span>, которая значительно повышает усваиваемость продукта.</p>
      //       <p>Дайго Люкс <span class="text-primary font-medium">работает быстрее</span>, чем Дайго, но при меньшей дозировке.</p>
      //       <p>На полноценный курс хватает одной бутылочки.</p>
      //     `,
      //     image: '/images/mock/product/lux1.png',
      //     imagePosition: 'right'
      //   },
      //   {
      //     type: 'feature-cards',
      //     items: [
      //       {
      //         title: 'Восстанавливает иммунитет',
      //         description: 'Активируя пейеровы бляшки в кишечнике',
      //         image: '/icons/shield.png'
      //       },
      //       {
      //         title: 'Повышает уровень энергии',
      //         description: 'Содержит витамин K2, необходимый для усвоения кальция, свертывания крови',
      //         image: '/images/content/energy.png'
      //       },
      //       {
      //         title: 'Подавляет Хеликобактер Пилори',
      //         description: 'Способствует подавлению Helicobacter pylori, не имеет побочных эффектов',
      //         image: '/icons/bacteria.png'
      //       },
      //       {
      //         title: 'Восстанавливает родную микрофлору',
      //         description: 'Поддерживает полезные бактерии и способствует их росту',
      //         image: '/icons/microflora.png'
      //       }
      //     ]
      //   },
      //   {
      //     type: 'text-with-image',
      //     title: 'Регулярный приём',
      //     content: `
      //       Курсовое или долговременное применение препарата Дайго приводит к уничтожению условно-патогенных и патогенных бактерий в кишечнике, вызывает рост полезной микрофлоры, активизирует иммунные клетки кишечника. Приём препарата Дайго вызывает улучшение самочувствия, нормализует сон и повышает трудоспособность.
      //     `,
      //     image: '/images/content/regular-use.png',
      //     imagePosition: 'left'
      //   },
      //   {
      //     type: 'text-with-image',
      //     title: 'Влияние Дайго Люкс на обмен веществ',
      //     content: `
      //       Дайго Люкс способствует улучшению углеводного, жирового, белкового и витаминного обмена веществ, а также восстановлению организма на клеточном уровне, что способствует активному долголетию.
      //     `,
      //     image: '/images/mock/product/lux3.png',
      //     imagePosition: 'right'
      //   }
      // ],

      descriptionSections: [
        {
          type: 'cards',
          layout: '7',
          cards: [
            {
              title: 'Особенности Daigo Lux',
              text: `<p>Дайго Люкс содержит <span class="text-primary font-medium">в 1,5 раза больше</span> активных веществ, чем Дайго.</p>
                <p>В процессе производства Дайго Люкс проходит <span class="text-primary font-medium">дополнительную ступень ферментации</span>, которая значительно повышает усваиваемость продукта.</p>
                <p>Дайго Люкс <span class="text-primary font-medium">работает быстрее</span>, чем Дайго, но при меньшей дозировке.</p>
                <p>На полноценный курс хватает одной бутылочки.</p>
              `,
              image: '/images/mock/product/lux1.png'
            },
            {
              title: 'Восстанавливает иммунитет',
              text: 'Активируя пейеровы бляшки в кишечнике',
              image: '/icons/shield.png'
            },
            {
              title: 'Повышает уровень энергии',
              text: 'Содержит витамин K2, необходимый для усвоения кальция, свертывания крови',
              image: '/images/content/energy.png'
            },
            {
              title: 'Подавляет Хеликобактер Пилори',
              text: 'Способствует подавлению Helicobacter pylori, не имеет побочных эффектов',
              image: '/icons/bacteria.png'
            },
            {
              title: 'Восстанавливает родную микрофлору',
              text: 'Поддерживает полезные бактерии и способствует их росту',
              image: '/icons/microflora.png'
            },
            {
              title: 'Регулярный приём',
              text: `Курсовое или долговременное применение препарата Дайго приводит к уничтожению условно-патогенных и патогенных бактерий в кишечнике, вызывает рост полезной микрофлоры, активизирует иммунные клетки кишечника. Приём препарата Дайго вызывает улучшение самочувствия, нормализует сон и повышает трудоспособность.`,
              image: '/images/content/regular-use.png'
            },
            {
              title: 'Влияние Дайго Люкс на обмен веществ',
              text: `Дайго Люкс способствует улучшению углеводного, жирового, белкового и витаминного обмена веществ, а также восстановлению организма на клеточном уровне, что способствует активному долголетию.`,
              image: '/images/mock/product/lux3.png'
            }
          ]
        }
      ],
      price: 109700,
      oldPrice: 110900,
      category: 'metabiotic',
      actionMechanism: 'Активизирует действие родных лактобактерий кишечника...',
      productionDetails: 'Производится более двух лет с многоступенчатой ферментацией...',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      videoPoster: '/images/mock/product/lux-poster.jpg',
      isActive: true,
      actionPrinciple: {
        title: 'Принцип действия',
        image: '/images/mock/product/lux-principles.jpg',
        text: `
          <h4 class="font-semibold mb-2">Секреторные выделения лактобактерий</h4>
          <p>Активизируют действие родных лактобактерий кишечника и способствуют их размножению. Кроме того, ограничивают размножение патогенных бактерий и снижают их количество. Таким образом, патогенные бактерии замещаются полезными, и кишечная среда улучшается.</p>

          <h4 class="font-semibold my-2">Тела бактерий (клеточный материал)</h4>
          <p>Активизируют иммунные клетки, стимулируют Пейеровы бляшки кишечника, которые выпускают лейкоциты в кишечник и в кровь, стимулируя снижение воспалительных процессов.</p>

          <p class="mt-2 font-semibold">Одна бутылочка Дайго Люкс соответствует 12-ти коробочкам обычного Дайго!</p>
        `
      },
      effect: {
        title: 'Эффект',
        image: '/images/mock/product/lux-effect.jpg',
        content: `
          <h4 class="font-medium mb-4">Способствует улучшению при:</h4>
          <ul class="list-disc list-inside ml-5 space-y-1">
            <li>Дисбактериозе различного происхождения</li>
            <li>Профилактике Helicobacter pylori</li>
            <li>Хронических заболеваниях ЖКТ</li>
            <li>Аллергических заболеваниях</li>
            <li>Снижении иммунитета</li>
            <li>После антибиотиков и химио- / лучевой терапии</li>
            <li>Замедленном метаболизме</li>
            <li>Старении и сухости кожи</li>
          </ul>
          <p class="!mt-8">
            Эффективность Daigo была проверена и доказана при помощи японских (B&S corporation), испанских (Life Length) и российских (НИИ Склифосовского) исследованиях.
            Продукт сертифицирован международным сертификатом GMP.</p>
        `
      },
      composition: {
        title: 'Состав',
        content: `
          <p>Вода, метаболиты 16 штаммов молочнокислых бактерий рода <strong>Lactobacillus</strong>:</p>
          <p>
            L. curtvavus (BSC 001), L. curtvavus (BSC 002), L. casel (BSC 003), L. casel (BSC 004),<br/>
            L. acidophilus (BSC 005), L. acidophilus (BSC 006), L. plantarum (BSC 007),<br/>
            L. plantarum (BSC 008), L. plantarum (BSC 009), L. fermentum (BSC 010),<br/>
            L. salivarius (BSC 011), L. salivarius (BSC 012), L. brevis (BSC 013),<br/>
            L. brevis (BSC 014), L. rhamnosus (BSC 015), L. rhamnosus (BSC 016);
          </p>
          <p>Регуляторы кислотности: молочная кислота, лимонная кислота, витамин K2.</p>
        `,
        image: '/images/mock/product/lux-comp.jpg',
      },
      usageInstructions: {    //Инструкция для разных возрастов + видео и уведомление
        groups: [
          {
            title: 'Взрослым',
            steps: [
              { icon: '/icons/drop.svg', text: 'По 1–2 миллилитру в сутки' },
              { icon: '/icons/water.svg', text: 'Развести в чистой воде' },
            ]
          },
          {
            title: 'Детям от 1 до 2 лет',
            steps: [
              { icon: '/icons/drop.svg', text: '1 капля' },
              { icon: '/icons/bottle.svg', text: 'Добавить в смесь для кормления' },
            ]
          },
          {
            title: 'Детям от 2 до 3 лет',
            steps: [
              { icon: '/icons/drop.svg', text: '2 капли' },
              { icon: '/icons/water.svg', text: 'Развести в чистой воде' },
            ]
          },
          {
            title: 'Детям от 3 до 6 лет',
            steps: [
              { icon: '/icons/drop.svg', text: '4 капли' },
              { icon: '/icons/bottle.svg', text: 'Развести в чистой воде' },
            ]
          },
          {
            title: 'Детям от 6 до 10 лет',
            steps: [
              { icon: '/icons/drop.svg', text: '8 капель' },
              { icon: '/icons/water.svg', text: 'Развести в чистой воде' },
            ]
          },
          {
            title: 'Детям до 10 лет',
            steps: [
              { icon: '/icons/drop.svg', text: '25 капель' },
              { icon: '/icons/bottle.svg', text: 'Развести в чистой воде' },
            ]
          },
        ],
        videoUrl: '/videos/daigo.mp4',
        videoPoster: '/images/mock/product/instr-poster.jpg',
        footnote: 'Можно применять для профилактики постоянно. Срок годности — 3 года...',
        text: `<p class="text-2xl font-medium">Можно применять для профилактики постоянно.</p>
              <p class="text-2xl">Срок годности — 3 года.<br>
              Условия хранения: хранить в сухом, прохладном, защищённом от света, недоступном для детей месте, при температуре от 0 °C до 25 °C.</p>`
      },
      productionSection: {
        type: 'production',
        title: 'Производство революционного продукта Daigo Lux',
        images: {
          type: 'single',
          image: '/images/mock/product/lux-prod.jpg',
        },
        details: {
          soyBeansKg: 15,
          soyMilkL: 100,
          cultivationMultiplier: 1000,
          head: 'Уникальный продукт, изготавливаемый более двух лет',
          description: [
            'Приблизительно 15 кг соевых бобов используется для производства 100 л соевого молока. Соевые бобы размачиваются и кипятятся в воде, полностью очищенной от любых примесей.',
            'Для отделения окары (кашицы из мякоти соевых бобов) используется пресс. Готовое соевое молоко используется в качестве среды для выращивания кисломолочных лактобактерий рода Lactobacillus.',
            'Культивирование лактобактерий в соевом молоке приводит к культивации бактерий более высокой плотности (в 1000 раз больше) и более высокого качества.',
            'В начале 16 штаммов лактобактерий подразделяются по степени совместимости на 4 группы и проходят процесс первичного брожения. Затем они сливаются вместе в ёмкость для совместного брожения.',
            'После этого этапа бактерии культивируются в течение 1 года. По истечению данного периода ферментированную среду стерилизуют и фильтруют.',
            'На конечном этапе производства Daigo Lux в очищенный ферментированный концентрат культурной жидкости вносят молочную кислоту и лимонную кислоту в качестве регуляторов кислотности.',
            'В очищенной культурной жидкости не содержатся живые бактерии (не является пробиотиком). Экстракт не содержит питательную среду для микробов (не является пребиотиком).',
            'Метабиотик Daigo Lux — это экстракт брожения лактобактерий, представляет собой смесь секреторных выделений (метаболитов), бактериальных клеток и неживых микроорганизмов.'
          ],
          image: '/images/mock/product/lux1.png'
        }
      },
      images: [
            {
                image_url: "https//nuxt.daigo.ru/images/mock/product/lux1.png",
                is_primary: true,
                display_order: 0
            },
            {
                image_url: "https//nuxt.daigo.ru/images/mock/product/lux2.png",
                is_primary: false,
                display_order: 0
            },
            {
                image_url: "https//nuxt.daigo.ru/images/mock/product/lux3.png",
                is_primary: false,
                display_order: 0
            },
            {
                image_url: "https//nuxt.daigo.ru/images/mock/product/lux4.png",
                is_primary: false,
                display_order: 0
            }
      ],
    }
    // другие товары из апишки


    // Пример инструкции для наборов (2 товара)

    // usageInstructions: {
    //   groups: [
    //     {
    //       title: 'Daigo Lux',
    //       steps: [
    //         { icon: '/icons/drop.svg', text: 'По 1–2 миллилитру в сутки' },
    //         { icon: '/icons/water.svg', text: 'Развести в чистой воде' },
    //       ]
    //     },
    //     {
    //       title: 'Tamotsu',
    //       steps: [
    //         { icon: '/icons/capsule.svg', text: 'По 1 капсуле 2 раза в день' },
    //         { icon: '/icons/food.svg', text: 'Во время приема пищи' },
    //       ]
    //     }
    //   ]
    // }


    // Пример инструкции картинка + текст 

    // usageInstructions: {
    //   image: '/images/shampoo.png',
    //   text: `
    //     Нанести необходимое количество шампуня на влажные волосы...
    //     Можно использовать как маску...
    //   `,
    //   videoUrl: '/videos/shampoo.mp4',
    //   videoPoster: '/images/posters/shampoo.jpg'
    // }


    //Пример инструкции картинка + инструкция

    // usageInstructions: {
    //   image: '/images/fishcapsule.png',
    //   groups: [
    //     {
    //       title: 'Взрослым',
    //       steps: [
    //         { icon: '/icons/capsule.svg', text: '2 капсулы в день во время еды' },
    //         { icon: '/icons/water.svg', text: 'Запивать водой' },
    //         { icon: '/icons/calendar.svg', text: 'Продолжительность приема 1 месяц' },
    //       ]
    //     }
    //   ],
    //   videoUrl: '/videos/fishoil.mp4',
    //   videoPoster: '/images/posters/fishoil.jpg',
    //   footnote: 'Перед применением проконсультируйтесь с врачом.'
    // }


    // Пример описания Омега

    // descriptionSections: [
    //   {
    //     type: 'cards',
    //     cards: [
    //       {
    //         title: 'Жирные кислоты',
    //         text: `Жир печени трески с идеальным соотношением полезных веществ. Жир печени трески с идеальным соотношением полезных веществ: жирных кислот EPA и DHA, витаминов A и D.

    // Сбор происходит в период наибольшего накопления полезных веществ – нереста трески.

    // Не содержит синтетических добавок и лишних примесей.`,
    //         image: '/images/mock/product/fat-acid-1.png'
    //       },
    //       {
    //         title: 'Омега-3',
    //         text: `Омега-3 жирные кислоты являются важнейшей для здоровья добавкой к пище. Это строительный материал для мембран клеток всех органов и систем человеческого организма. Однако сам организм их не производит, они поступают только извне.

    // Омега-3 жирные кислоты необходимы для полноценного роста и развития, а также для функционирования нервной, иммунной и сердечно-сосудистой систем, улучшают вязкость крови, поддерживают активность лейкоцитов, снижают уровень холестерина.`,
    //         image: '/images/mock/product/fat-acid-2.png'
    //       }
    //     ]
    //   }
    // ]



  ]

  const product = productsMock.find(p => p.slug === slug)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return product
})
