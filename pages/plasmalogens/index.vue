<script setup lang="ts">
definePageMeta({ layout: 'main' })
import BaseContainer from '~/components/layout/BaseContainer.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import PopularArticles from '~/components/articles/PopularArticles.vue'

useHead({
  title: 'Принцип действия плазмалогенов – Tamotsu | daigo',
  meta: [
    { name: 'description', content: 'Узнайте, что такое плазмалогены и как они поддерживают здоровье мозга. Tamotsu – единственный зарегистрированный в России источник натуральных плазмалогенов.' },
    { property: 'og:title', content: 'Принцип действия плазмалогенов – Tamotsu | daigo' },
    { property: 'og:description', content: 'Узнайте, как плазмалогены помогают мозгу. Tamotsu – источник здоровья из Японии.' },
    { property: 'og:image', content: 'https://nuxt.daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg' },
    { property: 'og:url', content: 'https://daigo.ru/articles/plasmalogens' },
    { property: 'og:type', content: 'article' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Принцип действия плазмалогенов',
        image: ['https://nuxt.daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg'],
        author: {
          '@type': 'Organization',
          name: 'daigo'
        },
        publisher: {
          '@type': 'Organization',
          name: 'daigo',
          logo: {
            '@type': 'ImageObject',
            url: 'https://daigo.ru/logo.png'
          }
        },
        datePublished: '2025-07-16',
        mainEntityOfPage: 'https://daigo.ru/articles/plasmalogens'
      })
    }
  ]
})

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
    image: 'https://products.s3.firstvds.ru/daigo-5/instructions.png',
    date: '18.05.2025',
    views: 988,
    comments: 8,
    slug: '/articles/po-polochkam-printsip-deystviya-daigo',
  },
  {
    id: 3,
    title: '2. На что влияет микрофлора кишечника?',
    image: 'https://s3.firstvds.ru/articles/yhyqpieqe92gcppbxm8cfhwnu87vv79f.jpg',
    date: '2025-06-30',
    views: 612,
    comments: 5,
    slug: '/articles/na-chto-vliyaet-mikroflora-kishechnika',
  }
]
</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
        <section class="relative w-full overflow-hidden">
            <h1 class="text-3xl sm:text-head leading-tight font-medium mb-8">
            Принципы действия плазмалогенов
            </h1>
            <img
            src="https://nuxt.daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg"
            alt="Tamotsu упаковка"
            format="webp"
            quality="80"
            loading="lazy"
            width="1232"
            height="192"
            class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Что такое плазмалогены?</h2>
            <p class="text-sm sm:text-lg font-normal">
                Плазмалогены для мозга представляют собой один из видов фосфолипидов, которые оказывают на организм антиоксидантное действие.<br>
                Они в большом количестве содержатся в нервных клетках головного мозга. Плазмалогены являются основой нервных волокон,           которые связывают нервные клетки мозга – нейроны – между собой. 
                Путем роста нервных связей между нейронами мозг развивается, поэтому плазмалоген является оптимальным средством против          деменции. 
                К тому же, для активного развития мозга плазмалогены рекомендуют употреблять при нарушениях мозговой активности у детей.
            </p>
            <p class="text-sm sm:text-lg font-normal">
                Проведенные в США исследования доказывают, что плазмалоген уменьшает явления деменции у пациентов с болезнью Альцгеймера.
                А в Университете Кюсю были проведены исследования, которые доказали благотворное влияние плазмалогена из морского гребешка 
                на когнитивные функции головного мозга.
            </p>
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Что такое Tamotsu?</h2>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-3/5 flex flex-col gap-6">
                    <div class="flex flex-col gap-6">
                        <img
                            src="https://nuxt.daigo.ru/images/principes/tamotsu-bad-plasmalogeny-dlya-pamyati.jpg"
                            alt="Tamotsu капсулы"
                            format="webp"
                            quality="80"
                            loading="lazy"
                            width="700"
                            height="400"
                            class="rounded-xl sm:rounded-2xl object-cover w-full lg:max-w-full"
                        />
                        <div class="flex flex-col gap-4 text-sm sm:text-lg font-normal">
                            <p>
                            Тамоцу (в переводе с японского – «защитник») — это БАД из Японии, единственный зарегистрированный в России источник плазмалогенов в комбинации с коэнзимом Q10. Высококачественные чистые плазмалогены из Тамоцу на 100% усваиваются человеческим организмом, так как добываются из японского глубоководного морского гребешка. Это современный препарат предназначен для защиты, комплексной терапии и профилактики заболеваний энергозатратных органов, а также возраст-ассоциированных и сердечно-сосудистых заболеваний, улучшает работу мозга.
                            </p>
                            <p>
                            Данный продукт является единственным зарегистрированным на территории Российской Федерации источником натурального высококачественного плазмалогена в комбинации с коэнзимом Q10.
                            </p>
                            <p>
                            Доказано, что плазмалогены являются ключевыми компонентами мембран клеток головного мозга и нервной системы в целом. Также они входят в состав клеточных мембран иммунной и сердечно-сосудистой системы.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/6 ms-auto flex flex-col gap-4">
                    <img
                        src="https://nuxt.daigo.ru/images/principes/kapsuly-plasmalogenov-tamotsu-coenzyme-q10.jpg"
                        alt="Капсула Tamotsu"
                        format="webp"
                        quality="80"
                        loading="lazy"
                        width="300"
                        height="300"
                        class="rounded-xl sm:rounded-2xl object-contain w-full "
                    />
                    <p class="text-base">
                        Коэнзим-Q10 это природный антиоксидант, принимающий участие в процессах клеточного дыхания. Поступление коэнзима Q10 с организм обеспечивает замедление процессов преждевременного старения, способствует улучшению работы сердечно-сосудистой системы 
        и активации защитных механизмов организма.
                    </p>
                </div>
            </div>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start py-5">
            <div class="w-full lg:w-1/2">
            <img
                src="https://nuxt.daigo.ru/images/principes/tamotsu-primenenie-upakovka-v-ruke.jpg"
                alt="Tamotsu в руке"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 class="text-2xl sm:text-[46px] font-medium">Применение</h2>
            <p class="text-sm sm:text-lg font-normal">
                Взрослым по 1 капсуле 2 раза в день во время приёма пищи. Продолжительность курса — 1 месяц / 1 коробка.
                При необходимости курс можно продлить для достижения наилучших результатов.
            </p>
            <div class="">
                <h3 class="text-xl font-medium my-4">Показания к применению:</h3>
                <ul class="list-disc list-inside text-sm sm:text-lg font-normal space-y-3">
                <li>Когнитивная усталость</li>
                <li>Нарушения обмена веществ</li>
                <li>Сосудистые заболевания</li>
                <li>Сердечно- и сердечно-сосудистые заболевания</li>
                <li>Нейродегенеративные заболевания</li>
                <li>Восстановление после операций и травм</li>
                </ul>
            </div>
            </div>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start py-5">
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 class="text-2xl sm:text-[46px] font-medium leading-tight">
                Какие компоненты Tamotsu<br />
                могут поддержать работу мозга?
            </h2>
            <p class="text-sm sm:text-lg font-normal">
                Главный компонент состава Тамоцу — это высококачественные чистые плазмалогены, добытые из японского глубоководного морского гребешка, которые на 100% усваиваются человеческим организмом. Плазмалогены умеют встраиваться в мембраны повреждённых клеток энергозатратных органов, в том числе головного мозга, восстанавливая их работу. Также в состав Тамоцу входит коэнзим Q10, который омолаживает клетки и является антиоксидантом. Плазмалогены в комбинации с коэнзимом Q10 позитивно влияют на работу мозга.
            </p>
            </div>
            <div class="w-full lg:w-1/2">
            <img
                src="https://nuxt.daigo.ru/images/principes/tamotsu-neskolko-upakovok.jpg"
                alt="Tamotsu упаковки"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start">
            <div class="w-full lg:w-4/5 grid grid-cols-2 gap-4">
            <img
                src="https://nuxt.daigo.ru/images/principes/yaponiya-grebeshok-more.jpg"
                alt="Японское море – добыча плазмалогенов"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            <img
                src="https://nuxt.daigo.ru/images/principes/tamotsu-korobka-i-blister.jpg"
                alt="Tamotsu – блистер и упаковка"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 class="text-2xl sm:text-[46px] font-medium">Производство</h2>
            <p class="text-sm sm:text-lg font-normal">
                Тамоцу производится в Японии. Производство соответствует международному стандарту GMP. 
            </p>
            <p class="text-sm sm:text-lg font-normal">
                Страной производства биодоступного коэнзима Q10 и экстракта морского гребешка приморского, так же является Япония (Хоккайдо).
            </p>
            </div>
        </section>

        <section class="relative w-full overflow-hidden py-5">
            <h2 class="text-2xl sm:text-[46px] leading-tight font-medium mb-8">
                В чем разница между БАД Тамоцу и другими похожими продуктами?
            </h2>
            <img
                src="https://nuxt.daigo.ru/images/principes/defferent.jpg"
                alt="Tamotsu упаковка"
                format="webp"
                quality="80"
                loading="lazy"
                width="1232"
                height="192"
                class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
            <p class="text-sm sm:text-lg font-normal mt-6">
                Основная разница в качестве.<br>
                Тамоцу — это единственный зарегистрированный в России источник плазмалогенов в комбинации с коэнзимом Q10. Уникальность обусловлена его составом: в составе Тамоцу уникальные высококачественные чистые плазмалогены, добытые по сложной инновационной технологии из японского глубоководного морского гребешка.<br><br>

                Плазмалогены абсолютно безопасны и на 100% усваиваются человеческим организмом. В мире чаще всего источниками плазмалогена выступают сердечная мышца и головной мозг крупного рогатого скота, кожа кур и жировая фракция морских беспозвоночных. Эти пищевые продукты достаточно специфичны и не всегда могут приниматься в пищу.<br><br>

                Качество плазмалогенов, произведённых из субпродуктов крупного рогатого скота и кожи кур, довольно низкое, поскольку в рацион этих животных и птиц на промышленном производстве входят и антибиотики, и гормоны.<br><br>

                Важным отличием Тамоцу также является натуральный и безопасный состав оболочки ее капсул. Капсулы с Тамоцу не содержат диоксид титана, который обычно используют, чтобы придать оболочке капсулы белизну. Накапливаясь в организме, это вещество негативно влияет на микрофлору кишечника и работу ЖКТ, поджелудочную железу, печень и почки. Поэтому мы исключили диоксид титана из оболочки капсул Тамоцу.
            </p>
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Часто задаваемые вопросы</h2>
            <div class="flex flex-col md:flex-row gap-6 items-start">
            <img
                src="https://nuxt.daigo.ru/images/principes/faq.jpg"
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
