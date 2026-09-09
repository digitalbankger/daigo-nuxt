<script setup lang="ts">
definePageMeta({ layout: 'main' })

usePageCanonical('/aminobiotics')
import BaseContainer from '~/components/layout/BaseContainer.vue'
import AccordionItem from '~/components/ui/AccordionItem.vue'
import PopularArticles from '~/components/articles/PopularArticles.vue'

useHead({
  title: 'Принцип действия аминобиотиков | daigo',
  meta: [
    { name: 'description', content: 'Узнайте, что такое аминобиотики и как они поддерживают здоровье мозга. Daigo Brainy, Jointic, Dermic, уникальные продукты на рынке пищевых добавок' },
    { property: 'og:title', content: 'Принцип действия аминобиотиков | daigo' },
    { property: 'og:description', content: 'Узнайте, как аминобиотики помогают твоему  организму. Линейка аминобиотиков Brainy, Jointic, Dermic – источник здоровья из Японии.' },
    { property: 'og:image', content: 'https://daigo.ru/images/principes/plasmalogeny-dlya-mozga-upakovka-tamotsu.jpg' },
    { property: 'og:url', content: 'https://daigo.ru/aminobiotics' },
    { property: 'og:type', content: 'article' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Принцип действия аминобиотиков',
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
        mainEntityOfPage: 'https://daigo.ru/aminobiotics'
      })
    }
  ]
})

</script>

<template>
  <BaseContainer>
    <div class="flex flex-col gap-10">
        <section class="relative w-full overflow-hidden">
            <h1 class="text-3xl sm:text-head leading-tight font-medium mb-8">
            Принципы действия аминобиотиков
            </h1>
            <img
            src="https://daigo.ru/images/principes-amino/aminobiotiki.jpg"
            alt="Линейка аминобиотиков Brainy, Jointic, Dermic"
            format="webp"
            quality="80"
            loading="lazy"
            width="1232"
            height="192"
            class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Что такое аминобиотики?</h2>
            <p class="text-sm sm:text-lg font-normal">
                Аминобиотики — новое слово на рынке пищевых добавок. Это уникальный класс нутрицевтиков, способных оказывать оздоравливающее воздействие на организм. Благодаря инновационному составу, они обладают высочайшей биодоступностью, а органический состав обеспечивает высокий профиль безопасности.
Аминобиотики Daigo.Brainy, Daigo.Jointic и Daigo.Dermic имеют под собой единую основу: пептид Хлореллы + 4 универсальные аминокислоты. Почему именно так?
            </p>
            <p class="text-sm sm:text-lg font-normal">
                Хлорелла — это одноклеточная зелёная водоросль, известная своим уникальным составом и мощными оздоровительными свойствами. 
Она богата белком, витаминами, минералами, антиоксидантами и широко используется для очищения организма, повышения энергии 
и укрепления иммунитета.
            </p>
            <p class="text-sm sm:text-lg font-normal">
                Аминокислоты — это органические соединения, которые являются строительными блоками белков, которые необходимы для роста, восстановления и функционирования организма.
            </p>
        </section>

        <section class="flex flex-col gap-6">
            <h2 class="text-2xl sm:text-[46px] font-medium">Что такое хлорелла?</h2>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="w-full md:w-3/5 flex flex-col gap-6">
                    <div class="flex flex-col gap-6">
                        <img
                            src="https://daigo.ru/images/principes-amino/chto-takoe-hlorella.jpg"
                            alt="Что такое хлорелла?"
                            format="webp"
                            quality="80"
                            loading="lazy"
                            width="700"
                            height="400"
                            class="rounded-xl sm:rounded-2xl object-cover w-full lg:max-w-full"
                        />
                        <div class="flex flex-col gap-4 text-sm sm:text-lg font-normal">
                            <p>
                                Хлорелла (Chlorella) — это одноклеточная зелёная водоросль, которая растёт в пресной воде и существует на Земле миллионы лет. Её название происходит от греческих слов «chloros» (зелёный) и «ella» (маленькая), что подчёркивает её микроскопический размер и насыщенный зелёный цвет. Благодаря уникальному составу и полезным свойствам, хлорелла признана одним из самых ценных продуктов для здоровья человека. Её часто называют «суперфудом», ведь она помогает очищать организм, укреплять иммунитет и насыщать клетки полезными веществами. Хлорелла содержит огромное количество питательных веществ.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-2/6 ms-auto flex flex-col gap-4">
                    <img
                        src="https://daigo.ru/images/principes-amino/hlorella.jpg"
                        alt="Хлорелла"
                        format="webp"
                        quality="80"
                        loading="lazy"
                        width="300"
                        height="300"
                        class="rounded-xl sm:rounded-2xl object-contain w-full"
                    />
                    <p class="text-base">
                        Благодаря своему богатому составу, Хлорелла оказывает на организм человека комплексное положительное воздействие.
                    </p>
                </div>
            </div>
        </section>

        <section class="relative w-full overflow-hidden py-5">
            <h2 class="text-2xl sm:text-[46px] leading-tight font-medium mb-8">
                Аминокислоты: основа жизненно важных процессов в организме
            </h2>
            <img
                src="https://daigo.ru/images/principes-amino/amino1.jpg"
                alt="Tamotsu упаковка"
                format="webp"
                quality="80"
                loading="lazy"
                width="1232"
                height="192"
                class="rounded-xl sm:rounded-2xl w-full object-cover"
            />
            <p class="text-sm sm:text-lg font-normal mt-6">
                Когда речь заходит о здоровье, восстановлении и правильном питании, мы часто слышим о важности белков. Однако за кулисами этого процесса стоят аминокислоты — незаменимые участники всех жизненно важных функций организма. Они помогают строить мышцы, поддерживают работу мозга, укрепляют иммунитет и даже участвуют в регуляции настроения. Понимание роли аминокислот помогает взглянуть на питание и здоровье по-новому и осознать, как эти крошечные молекулы способны поддерживать тело и разум в отличной форме<br><br>

                Все аминокислоты имеют одинаковое «ядро» — аминогруппу и карбоксильную группу, которые присоединены к одному атому углерода. Однако каждая аминокислота отличается по своей боковой цепи (R-группе). Именно эта R-группа делает каждую аминокислоту особенной и определяет её свойства и функции в организме.
            </p>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start py-5">
            <div class="w-full lg:w-1/2">
            <img
                src="https://daigo.ru/images/principes-amino/amino2.jpg"
                alt="Daigo Brainy курс"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 class="text-[32px] font-medium">Daigo.Brainy: сохраняем и поддерживаем здоровье головного мозга.</h2>
            <p class="text-sm sm:text-lg font-normal">
                В современном мире мозг испытывает огромные перегрузки — это факт. Получается, нужно какое‑то универсальное средство защиты когнитивной и психологической деятельности. Имя ему — Daigo.Brainy!<br><br>

                Одним из ключевых эффектов пептида Хлоррелы на мозг является снижение воспалительных процессов и нейтрализация свободных радикалов, которые вызывают старение и повреждение нейронов. Благодаря этому замедляются возрастные изменения мозга и снижается риск нейродегенеративных заболеваний, таких как болезнь Альцгеймера. Пептид также улучшает кровообращение в мозге, обеспечивая нейроны кислородом и питательными веществами, что положительно влияет на память, концентрацию и общее умственное состояние.
            </p>
            </div>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start py-5">
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 class="text-[32px] font-medium leading-tight">
                Daigo.Dermic: сохраняем молодость и красоту кожи, предотвращая преждевременное старение.
            </h2>
            <p class="text-sm sm:text-lg font-normal">
                Кожа — это наш барьер между окружающей средой и внутренним миром. Насколько хорошо она выглядит более естественной, упругой, свежей, жизнерадостной, настолько хорошо выполняет все свои заявленные функции. Когда иммунная система ослаблена, кожа становится более восприимчивой к воспалениям, повышенной чувствительности и акне, вызывающим бактериальный дисбаланс. Для поддержания здоровья кожи был создан Daigo.Dermic.<br><br>

                Помимо питательных веществ, которые Хлорелла обеспечивает для выработки коллагена, она может способствовать улучшению здоровья кожи, положительно влияя на здоровье кровеносной и лимфатической систем. Именно эти сосудистые системы используются для доставки необходимых питательных веществ и других биологически активных веществ в ткани кожи, а также для выведения вредных продуктов жизнедеятельности.
            </p>
            </div>
            <div class="w-full lg:w-1/2">
            <img
                src="https://daigo.ru/images/principes-amino/amino4.jpg"
                alt="Daigo Dermic курс"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
        </section>

        <section class="flex flex-col lg:flex-row gap-6 items-start">
            <div class="w-full lg:w-1/2">
            <img
                src="https://daigo.ru/images/principes-amino/amino3.jpg"
                alt="Daigo Jointic курс"
                format="webp"
                quality="80"
                loading="lazy"
                class="rounded-xl sm:rounded-2xl object-cover w-full"
            />
            </div>
            <div class="w-full lg:w-1/2 flex flex-col gap-4">
                <h2 class="text-[32px] font-medium">Daigo.Jointic: комплексная поддержка всей опорно-двигательной системы!</h2>
                <p class="text-sm sm:text-lg font-normal">
                    Сустав — это ключевой механизм, рядом с которым находятся кости, мышцы, нервные волокна, есть кровоснабжение.Задача аминопептидобиотика Daigo Jointic — комплексное воздействие на максимально большое количество компонентов, обеспечивающих двигательную функцию.<br><br>

                    Пептид Хлореллы в составе борется с хроническим воспалением, поражающим суставы, а аминокислоты, которые регулируют нашу микробиоту, нужны для построения новой мышечной ткани и для сохранения увеличения существующей.<br><br>

                    Также в состав добавлены вещества, которые непосредственно нужны суставам — кальций и бор. Они играют важнейшую роль в поддержании здоровья суставов, обеспечивая их прочность, функциональность и защиту от воспалительных процессов.
                </p>
            </div>
        </section>

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
            <h2 class="text-2xl sm:text-[46px] font-medium">Популярные статьи</h2>
            <PopularArticles />
        </section>
    </div>
  </BaseContainer>
</template>
