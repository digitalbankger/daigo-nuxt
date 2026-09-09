<script setup lang="ts">
definePageMeta({ layout: 'main' })

usePageCanonical('/articles/kak-mikroflora-sozdaet-garmoniyu-v-otnosheniyah-i-pochemu-ey-nuzhna-zabota')
import BaseContainer from '~/components/layout/BaseContainer.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import PopularArticles from '~/components/articles/PopularArticles.vue'
import ProductsCarousel from '~/components/articles/ProductsCarousel.vue'

useHead({
  title: 'Как микрофлора создает гармонию в отношениях и почему ей нужна забота?',
  meta: [
    { name: 'description', content: 'Микрофлора кишечника влияет на эмоциональное состояние и качество отношений. Узнайте, как забота о здоровье кишечника улучшает гармонию в отношениях.' },
    { property: 'og:title', content: 'Как микрофлора создает гармонию в отношениях и почему ей нужна забота?' },
    { property: 'og:description', content: 'Микрофлора кишечника влияет на эмоциональное состояние и качество отношений. Узнайте, как забота о здоровье кишечника улучшает гармонию в отношениях.' },
    { property: 'og:image', content: 'https://daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg' },
    { property: 'og:url', content: 'https://daigo.ru/articles/kak-mikroflora-sozdaet-garmoniyu-v-otnosheniyah-i-pochemu-ey-nuzhna-zabota' },
    { property: 'og:type', content: 'article' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Как микрофлора создает гармонию в отношениях и почему ей нужна забота?',
        image: ['https://daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg'],
        author: {
          '@type': 'Organization',
          name: 'daigo'
        },
        publisher: {
          '@type': 'Organization',
          name: 'daigo',
          logo: {
            '@type': 'ImageObject',
            url: 'https://daigo.ru/logo.svg'
          }
        },
        datePublished: '2025-07-16',
        mainEntityOfPage: 'https://daigo.ru/articles/kak-mikroflora-sozdaet-garmoniyu-v-otnosheniyah-i-pochemu-ey-nuzhna-zabota'
      })
    }
  ]
})

type Card = {
  title: string
  text: string
  icon: string // путь к png/svg
}

const important = {
  title: 'Важно!',
  text:'У мужчин дисбиоз часто протекает бессимптомно или со смазанными признаками (незначительный дискомфорт, легкое покраснение), что создает ложное ощущение благополучия, но при этом представляет риск для партнерши',   
  icon: '/images/feb/article/c1.png',
}

const cards: Card[] = [
  {
    title: 'Антибиотики',
    text: 'Антибиотикотерапия (особенно частый или необоснованный прием)',
    icon: '/images/feb/article/c2.png',
  },
  {
    title: 'Половые связи',
    text: 'Беспорядочные половые связи, ведущие к постоянному «обновлению» микробного состава и риску занесения патогенов',
    icon: '/images/feb/article/c3.png',
  },
  {
    title: 'Гигиена',
    text: 'Погрешности в гигиене: редкий душ или, наоборот, чрезмерное использование антибактериального мыла, которое уничтожает и защитную флору',
    icon: '/images/feb/article/c4.png',
  },
  {
    title: 'Хронические болезни',
    text: 'Хронические болезни: сахарный диабет создает благоприятную среду для грибков, ожирение меняет микроклимат',
    icon: '/images/feb/article/c5.png',
  },
  {
    title: 'Стресс',
    text: 'Стресс, который, как и у женщин, является мощным дестабилизирующим фактором',
    icon: '/images/feb/article/c6.png',
  },
  {
    title: 'Вредные привычки',
    text: 'Вредные привычки: курение и алкоголь снижают общий и местный иммунитет',
    icon: '/images/feb/article/c7.png',
  },
]

const popularArticles = [
  {
    id: 1,
    title: 'Что такое Метабиотики',
    image: '/images/articles/metabolity.jpg',
    date: '08.05.2025',
    views: 1023,
    comments: 0,
    slug: '/articles/chto-takoe-metabiotiki',
  },
  { 
    id: 2,
    title: '1. По полочкам: принцип действия Daigo',
    image: '/media-s3/products/daigo-5/instructions.png',
    date: '18.05.2025',
    views: 988,
    comments: 8,
    slug: '/articles/po-polochkam-printsip-deystviya-daigo',
  },
  {
    id: 3,
    title: '2. На что влияет микрофлора кишечника?',
    image: '/media-s3/articles/yhyqpieqe92gcppbxm8cfhwnu87vv79f.jpg',
    date: '2025-06-30',
    views: 612,
    comments: 5,
    slug: '/articles/na-chto-vliyaet-mikroflora-kishechnika',
  }
]

type ArticleProduct = {
  product_id: string
  title: string
  image: string
  price: number
  url?: string
  badge?: string
  slug?: string
  name?: string
  tag?: string
  subtitle?: string
}

const productsIds: string[] = [
  '71700acb-3584-490b-a5f7-62e8cb57b3c9',
  'cafac368-1074-417d-bb3e-4470b4e28190',
  '8631769b-3431-4fa7-9e36-5a9fe0da2412',
  'f4b6d734-7eea-4926-8bfa-dfe0969e19ee',
]

// ✅ То, что ты передаёшь в ProductsCarousel
const productIds = computed<(string | number)[]>(() => productsIds)

</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
        <section class="relative w-full overflow-hidden">
            <h1 class="text-2xl sm:text-product leading-tight font-medium mb-8">
                Как микрофлора создает гармонию в отношениях и почему ей нужна забота?
            </h1>
            <img
                src="/images/feb/article/art-1.jpg"
                alt="Микрофолора и отношения"
                loading="lazy"
                width="1232"
                height="192"
                class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
        </section>

        <section class="flex flex-col gap-6">
            <p class="text-sm sm:text-lg leading-relaxed">
            <span class="float-left font-medium text-[48px] sm:text-[64px] leading-[0.8] mr-3">В</span>
            день всех влюбленных мы говорим о чувствах, совместимости и близости. Но что, если настоящая гармония начинается там, где глаз не видит — в мире триллионов микроскопических организмов, которые живут в нас? Наше интимное здоровье, комфорт и даже благополучие в паре напрямую зависят от хрупкого баланса микрофлоры. В этой статье, основанной на современных научных данных, мы разберемся, почему забота о микрофлоре — это не просто гигиена, а инвестиция в качество жизни и доверительные отношения. И как в поддержании этого хрупкого баланса могут помочь современные средства, такие как метабиотик Daigo.
            </p>

        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start py-1 sm:py-5">
            <div class="w-full lg:w-5/12">
            <img
                src="/images/feb/article/art-2.jpg"
                alt="Tamotsu упаковки"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full mt-2"
            />
            </div>
            <div class="w-full lg:w-7/12 flex flex-col gap-4">
            <h2 class="text-2xl sm:text-[46px] w-full sm:w-10/12 font-medium leading-tight">
                Её мир: хрупкий сад, который требует защиты
            </h2>
            <p class="text-sm sm:text-base font-normal">
                Интимная экосистема женщины — это удивительно сбалансированный и при этом хрупкий мир. Представьте себе цветущий сад, где главные садовники — лактобациллы. Их основная работа — поддерживать специальную кислую среду (как уникальный состав почвы), которая естественным образом подавляет рост «сорняков»: патогенных бактерий и грибков. Лактобациллы производят молочную кислоту, поддерживая кислую среду (pH 3.8-4.5). Они также вырабатывают перекись водорода и бактериоцины — природные антибиотики. 

                <br><br>То, что делают лактобактерии называется «колонизационной резистентностью»: полезные бактерии просто не оставляют места и ресурсов вредным. Они создают природный барьер, который защищает от внешних и внутренних воздействий. Научные данные подтверждают, что именно лактобациллы играют ключевую роль в предотвращении распространенных проблем, таких как бактериальный вагиноз или молочница [1]. Но наш внутренний сад легко может выйти из равновесия.

                <br><br>Организм посылает четкие сигналы SOS, когда баланс нарушен: дискомфорт, необычные выделения, зуд, сухость или рецидивирующие инфекции. Это значит, пора не просто лечить симптомы, а восстанавливать саму почву — баланс микрофлоры.            </p>
            </div>
        </section>

        <div
          class="relative overflow-hidden relative w-full bg-[#F7F7F7] px-4 py-6 sm:py-6 sm:px-6 pb-4 rounded-2xl sm:rounded-3xl relative flex flex-col items-start gap-6"
        >
          <div class="w-10/12 sm:w-10/12 relative z-10">
            <h3 class="text-xl sm:text-cardhead font-medium mb-3 leading-tight sm:w-2/3 lg:w-full">Сильнейшие факторы, влияющие на экосистему женщины</h3>
            <hr class="text-black/15 border my-4 w-1/2" />
            <div class="flex flex-col space-y-3 text-xs sm:text-base w-full sm:w-10/12 list-disc pl-4" >
                <li> Антибиотики, которые, как ураган, выметают все подряд — и вредное, и полезное.</li>
                <li> Гормональные перепады (беременность, менопауза, цикл).</li>
                <li> Хронический стресс, меняющий внутренний «климат».</li>
                <li> Неправильная гигиена (спринцевания, агрессивные средства), вымывающая естественных защитников.</li>
                <li> Смена полового партнера, что равносильно внесению в экосистему новых, непривычных «семян».</li>
            </div>
          </div>
          <div class="w-3/12">
            <img
                src="/images/feb/article/art-3.png"
                class="absolute z-0 bottom-4 -right-10 sm:right-4 w-[140px] sm:w-[300px]"
            />
          </div>
        </div>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Интимное здоровье мужчин — упущенное звено</h2>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-7/12 flex flex-col gap-6">
                    <div class="flex flex-col gap-6">
                        <div class="flex flex-col gap-4 text-sm sm:text-lg font-normal">
                            <p>
                                Долгое время мужское интимное здоровье рассматривалось упрощенно, а роль микрофлоры игнорировалась. Сегодня наука раскрывает сложную картину: мочеполовой тракт мужчины — это не стерильная среда, а динамичная экосистема, полноценный «микробиомный ландшафт». Его стабильность — ключ не только к локальному комфорту, но и к здоровью второй половинки. 
                            </p>
                        </div>
                    </div>

                    <div
                        class="relative overflow-hidden relative w-full bg-[#F7F7F7] px-4 py-6 sm:py-6 sm:px-6 pb-4 rounded-2xl sm:rounded-3xl relative flex flex-col items-start gap-6"
                    >
                        <div class="w-full relative z-10">
                            <h3 class="text-xl sm:text-cardhead font-medium mb-3 leading-tight sm:w-2/3">Основные «ниши» полезных бактерий у мужчин:</h3>
                            <hr class="text-black/15 border my-4 w-1/2" />
                            <div class="flex flex-col space-y-8 text-sm sm:text-base w-full list-disc pl-5" >
                                <li>
                                    На коже и под крайней плотью (препуциальный мешок). Эта область теплая и влажная, что требует особого микробного баланса. Полезные бактерии (такие как Corynebacterium, Staphylococcus epidermidis и некоторые лактобациллы) конкурируют с условными патогенами, предотвращая воспаления (баланопостит).
                                </li>
                                <li>
                                    В уретре. Микрофлора мочеиспускательного канала — первый барьер на пути восходящей инфекции к мочевому пузырю и простате. Здоровая микрофлора создает биохимический щит и не дает болезнетворным бактериям (вроде E. coli, Chlamydia) прикрепиться к слизистой. Антибиотики, которые, действуют как ураган, выметая все подряд — и вредное, и полезное.
                                </li>
                               
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-5/12 ms-auto flex flex-col gap-4">
                    <img
                        src="/images/feb/article/art-4.jpg"
                        alt="Капсула Tamotsu"
                        format="webp"
                        quality="80"
                        loading="lazy"
                        width="300"
                        height="300"
                        class="rounded-xl sm:rounded-2xl object-contain w-full mt-2"
                    />
                </div>
            </div>
            <div class="flex flex-col gap-4 text-sm sm:text-lg font-normal mt-3">
                <p>
                    Исследования, опубликованные в авторитетных журналах, показывают, что дисбиоз (нарушение баланса) мужской урогенитальной микрофлоры ассоциируется с повышенным риском неспецифического уретрита, хронического простатита, синдрома хронической тазовой боли (СХТБ) и даже может влиять на качество спермы [2]. Полезные бактерии выполняют функцию «естественных миролюбцев», сдерживая рост агрессивных соседей и поддерживая здоровый местный иммунитет. Что нарушает мужской микробиом?                </p>
            </div>
        </section>

        <section class="w-full">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <!-- Левая большая карточка -->
            <article
                class="relative overflow-hidden rounded-2xl sm:rounded-2xl bg-[#F7F7F7]
                    p-5 sm:p-6 min-h-[240px] lg:min-h-[340px]
                    "
            >
                <div class="relative z-10 max-w-[90%]">
                <h3 class="text-lg sm:text-xl font-medium mb-4">
                    {{ important.title }}
                </h3>
                <div class="h-px w-2/3 bg-black/10 mb-4"></div>
                <p class="text-sm sm:text-lg leading-relaxed">
                    {{ important.text }}
                </p>
                </div>

                <!-- иконка -->
                <img
                :src="important.icon"
                alt=""
                class="absolute right-1 top-1 w-16 h-16 sm:w-24 sm:h-24 opacity-95"
                loading="lazy"
                decoding="async"
                />
            </article>

            <!-- Правая сетка карточек 3x2 -->
            <div class="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <article
                v-for="(c, idx) in cards"
                :key="idx"
                class="relative overflow-hidden rounded-2xl sm:rounded-2xl bg-[#F7F7F7]
                        p-5 sm:p-6 min-h-[160px]
                        "
                >
                <h4 class="text-base sm:text-lg font-medium mb-3">
                    {{ c.title }}
                </h4>

                <div class="h-px w-2/3 bg-black/10 mb-4"></div>

                <p class="text-sm sm:text-base leading-relaxed pr-4">
                    {{ c.text }}
                </p>

                <!-- иконка внизу справа -->
                <img
                    :src="c.icon"
                    alt=""
                    class="absolute right-2 bottom-1 w-16 h-16 sm:w-24 sm:h-24 object-contain"
                    loading="lazy"
                    decoding="async"
                />
                </article>
            </div>
            </div>
        </section>

        <section class="relative w-full overflow-hidden">
            <img
                src="/images/feb/article/art-5.jpg"
                alt="Микрофолора и отношения"
                loading="lazy"
                width="1232"
                height="192"
                class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-3xl sm:text-product leading-tight font-medium mb-2">
                Обмен не только эмоциями: микробиом в отношениях
            </h2>
            <p class="text-sm sm:text-lg leading-relaxed">
                В паре мы делимся не только эмоциями и чувствами, но и микрофлорой — это явление иногда называют «микробиологическим петтингом». И здесь кроется важный нюанс. Если у одного из партнеров есть бессимптомный дисбаланс, он может постоянно провоцировать проблемы у другого. Мужчина может быть просто носителем, а у женщины это будет вызывать повторяющиеся нарушения. И наоборот! Поэтому забота об интимном здоровье перестает быть личным делом — это акт взаимной ответственности и заботы о гармонии в паре. Это инвестиция в общий комфорт и доверие.
            </p>

        </section>



        <section class="flex flex-col lg:flex-row gap-6 items-start py-5">
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
                <p class="text-sm sm:text-lg font-normal">
                    Когда мы слышим о поддержке микрофлоры, на ум чаще приходят пробиотики (сами полезные бактерии) и пребиотики (их пища). Но наука шагнула дальше, и теперь есть метабиотики. Что это? Представьте, что вместо того чтобы привезти в сад новых садовников (пробиотики), мы получаем готовые, концентрированные инструменты, знания и удобрения, которые создали лучшие из них. Метабиотик — это продукт жизнедеятельности полезных бактерий (метаболиты), их «секретное оружие» против врагов и инструкции для нашего иммунитета. Такая форма имеет свои плюсы: она начинает работать сразу, устойчива к желудочному соку и антибиотикам, и, что важно, максимально безопасна. Она не подселяет чужие штаммы, а помогает «расшевелить» и усилить собственную микрофлору, давая ей все необходимое для победы в конкуренции с патогенами [3].
                </p>
            </div>

            <div class="w-full lg:w-1/2">
                <div
                    class="relative overflow-hidden relative w-full bg-[#F7F7F7] px-4 py-6 sm:py-6 sm:px-6 pb-4 rounded-2xl sm:rounded-3xl relative flex flex-col items-start gap-6 mt-2"
                >
                    <div class="w-full relative z-10">
                        <h3 class="text-xl sm:text-cardhead font-medium mb-3 leading-tight sm:w-2/3">Метабиотик</h3>
                        <hr class="text-black/15 border my-4 w-1/2" />
                        <div class="flex flex-col space-y-8 text-sm sm:text-xl w-full sm:w-9/12 pt-4 pb-10" >
                            Продукт жизнедеятельности полезных бактерий (метаболиты), их «секретное оружие» против врагов и инструкции для нашего иммунитета.
                        </div>
                        <img
                            src="/images/feb/article/c1.png"
                            alt=""
                            class="absolute -right-3 -top-3 w-12 h-12 sm:w-24 sm:h-24 opacity-95"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-3xl sm:text-[56px] leading-tight font-medium mb-0 w-full sm:w-10/12">
                Daigo: поддержка изнутри для гармонии снаружи
            </h2>
        </section>

        <section class="flex flex-col lg:flex-row gap-10 items-start py-3">
            <div class="w-full lg:w-7/12">
            <img
                src="/images/feb/article/art-6.jpg"
                alt="Tamotsu упаковки"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
            <div class="w-full lg:w-4/12 flex flex-col gap-4">
            <p class="text-sm sm:text-base font-normal w-full sm:w-11/12">
                Органический метабиотик Daigo - экстракт ферментации 16 штаммов лакто- и бифидобактерий. По сути, это квинтэссенция их полезной работы: молочная кислота, бактериоцины и другие активные вещества. Как это может помочь именно интимному здоровью? Ключ — в сильной связи между кишечником и всеми слизистыми оболочками, так называемая ось «кишечник-влагалище/уретра» [4].
                <br><br>Принимая метабиотик, мы в первую очередь поддерживаем микробиом кишечника, где находится до 80% наших иммунных клеток. Стабильная, здоровая среда в кишечнике посылает правильные сигналы всему организму, мягко модулируя иммунный ответ и снижая общий фон воспаления. 
                <br><br>Это укрепляет общую сопротивляемость, включая защитные силы интимной зоны. Кроме того, снижая количество условно-патогенных организмов в кишечнике, мы уменьшаем их потенциальную миграцию. Можно сказать, мы наводим порядок в «столице» (кишечнике), и тогда в «регионах» (слизистых) тоже становится спокойнее.
            </p>
            </div>
        </section>

        
        <section class="flex flex-col gap-6">
            <p class="text-sm sm:text-lg leading-relaxed">
               Включение такого подхода в жизнь пары — это современный и осознанный шаг. Это может быть совместный профилактический курс в периоды стресса или после приема антибиотиков, чтобы поддержать хрупкий баланс. Или как часть заботы о себе после разрешения острых ситуаций, чтобы продлить состояние комфорта!        
            </p>
        </section>

        <div
          class="relative overflow-hidden relative w-full bg-[#F7F7F7] px-4 py-6 sm:py-6 sm:px-6 pb-4 rounded-2xl sm:rounded-3xl relative flex flex-col items-start gap-6"
        >
          <div class="w-10/12 sm:w-10/12 relative z-10">
            <h3 class="text-xl sm:text-cardhead font-medium mb-3 leading-tight sm:w-2/3 lg:w-full">Научно обоснованная забота</h3>
            <hr class="text-black/15 border my-4 w-1/2" />
            <div class="flex flex-col space-y-3 text-sm sm:text-lg w-full sm:w-11/12 py-4" >
                В День всех влюбленных самый глубокий подарок — это внимание. Внимание не только к душе, но и к телу партнера, к его внутреннему, невидимому благополучию. Забота о микрофлоре — это и есть такая форма нежной, научно обоснованной заботы. Когда в порядке невидимый мир внутри, гармония и уверенность наполняют и внешнюю жизнь, делая близость по-настоящему легкой и радостной.
            </div>
          </div>
          <div class="w-3/12">
            <img
                src="/images/feb/article/art-7.png"
                class="absolute z-0 bottom-0 -right-10 sm:right-0 w-[140px] sm:w-[380px]"
            />
          </div>
        </div>

        <ProductsCarousel
            :product-ids="productIds"
            title="Рекомендуемые товары"
        />

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Часто задаваемые вопросы</h2>
            <div class="flex flex-col md:flex-row gap-6 items-start">
            <img
                src="https://daigo.ru/images/principes/faq.jpg"
                alt="Tamotsu на тарелке"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full md:w-2/6"
            />
            <div class="w-full md:w-4/6 flex flex-col">
                <AccordionItem title="Что такое коэнзим Q10?">
                    Это антиоксидант, участвующий в выработке энергии в клетках. Поддерживает сердечно-сосудистую систему.
                </AccordionItem>
                <AccordionItem title="Чем полезен Tamotsu?">
                    Улучшает память, когнитивные функции и поддерживает работу мозга.
                </AccordionItem>
                <AccordionItem title="Как хранить Tamotsu?">
                    В сухом месте, при температуре до 25°C, вдали от света.
                </AccordionItem>
                <AccordionItem title="Какая польза от Tamotsu для мозга?">
                    Защищает нейроны, улучшает связь между клетками, снижает возрастные изменения.
                </AccordionItem>
                <AccordionItem title="Где производят Tamotsu?">
                    В Японии, Хоккайдо, по стандарту GMP.
                </AccordionItem>
            </div>
            </div>
        </section>

        <section class="flex flex-col gap-6 py-5">
            <h2 class="text-product font-medium">Популярные статьи</h2>
            <PopularArticles />
        </section>
    </div>
  </BaseContainer>
</template>
