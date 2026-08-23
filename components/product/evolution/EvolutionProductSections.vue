<script setup lang="ts">
const featureCards = [
  {
    title: 'Поддержка до и во время нагрузки',
    text: 'Если вы знаете, что впереди насыщенный день, Evolution 10 + Mg можно включить заранее, как часть подготовки к высокой повседневной и интеллектуальной нагрузке.',
    image: '/images/evolution/feature-daily.webp',
  },
  {
    title: 'Формула с магнием для активных дней',
    text: '132 мг магния, L-теанин и витамины B6, B9, B12 и K2 объединены в одной формуле для поддержки нервной системы и энергетического обмена.',
    image: '/images/evolution/feature-magnesium.webp',
  },
  {
    title: 'Метабиотическое ядро Daigo',
    text: 'В основе напитка — метабиотический комплекс Daigo: метаболиты 16 штаммов Lactobacillus как функциональная база формулы.',
    image: '/images/evolution/meta-state.webp',
  },
  {
    title: 'Удобный формат на каждый день',
    text: '330 мл готового напитка: удобно взять с собой, выпить в течение дня и встроить в привычный ритм жизни.',
    image: '/images/evolution/feature-keys.png',
  },
]

const nutrients = [
  ['132 мг Mg', '33% РУСП*'],
  ['1 мг B6', '50% РУСП'],
  ['100 мкг B9', '50% РУСП'],
  ['0,5 мкг B12', '50% РУСП'],
  ['120 мкг K2', '100% РУСП'],
  ['30 мг L-теанина', ''],
]

const usage = [
  ['Перед насыщенным днём', 'Если впереди плотный график, встречи, дорога или несколько часов высокой концентрации — поддержку можно подключить заранее.'],
  ['В период нагрузки', 'Evolution 10 + Mg удобно встроить непосредственно в активную часть дня, когда особенно востребованы нервная система и энергетический обмен.'],
  ['Готов к употреблению', 'Одна банка — 330 мл готовой функциональной формулы. Не нужно отмерять, разводить или собирать комплекс из нескольких продуктов.'],
  ['До 2 банок в сутки', 'Рекомендуемый объём потребления — не более двух банок по 330 мл в сутки. После вскрытия напиток следует употребить сразу.'],
]
</script>

<template>
  <div
    id="evolution-description"
    class="space-y-8 py-4 sm:space-y-12 sm:py-10"
  >
    <!-- =====================================================
         ОПИСАНИЕ / FEATURE GRID
         ===================================================== -->

    <section class="space-y-5">
      <h2
        class="mb-8 text-3xl font-medium sm:text-product xl:text-slider"
      >
        Описание товара
      </h2>

      <div class="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <!-- Большая карточка -->

        <article
          class="
            relative
            min-h-[260px]
            overflow-hidden
            rounded-2xl
            bg-[#F7F7F7]
            p-5
            sm:min-h-[320px]
            sm:p-7
          "
        >
          <div class="relative z-10 max-w-[66%]">
            <h3 class="text-xl font-medium sm:text-4xl">
              Evolution Mg
            </h3>

            <hr class="my-4 border-black/10" />

            <div
              class="
                space-y-3
                text-sm
                leading-relaxed
                sm:text-base
              "
            >
              <p>
                <strong>132 мг магния</strong><br />
                <span class="text-black">
                  33% рекомендуемого суточного уровня потребления
                </span>
              </p>

              <p>
                <strong>
                  L-теанин + B6 · B9 · B12 · K2
                </strong><br />

                <span class="text-black">
                  функциональный комплекс под периоды высокой нагрузки
                </span>
              </p>

              <p>
                <strong>
                  Метабиотическое ядро Daigo
                </strong><br />

                <span class="text-black">
                  метаболиты 16 штаммов Lactobacillus
                </span>
              </p>

              <ol class="list-inside list-disc text-black">
                <li>330 мл</li>
                <li>газированный</li>
                <li>без искусственных красителей и консервантов</li>
              </ol>
            </div>
          </div>

          <img
            src="/images/evolution/can-cutout.webp"
            alt="Daigo Evolution Mg10"
            class="
              absolute
              bottom-20
              right-0
              h-[86%]
              w-[66%]
              object-contain
              object-bottom
            "
            loading="lazy"
            decoding="async"
          />
        </article>

        <!-- 4 маленьких карточки -->

        <div
          class="
            grid
            gap-4
            sm:grid-cols-2
            lg:gap-6
          "
        >
          <article
            v-for="card in featureCards"
            :key="card.title"
            class="
              relative
              min-h-[190px]
              overflow-visible
              rounded-2xl
              bg-[#F7F7F7]
              p-5
            "
          >
            <div class="relative z-10 max-w-full">
              <h3
                class="
                  text-base
                  font-medium
                  leading-tight
                  sm:text-lg
                "
              >
                {{ card.title }}
              </h3>

              <hr class="my-3 border-black/10" />

              <p
                class="
                  max-w-[78%]
                  text-sm
                  leading-relaxed
                "
              >
                {{ card.text }}
              </p>
            </div>

            <img
              :src="card.image"
              alt=""
              class="
                absolute
                bottom-4
                -right-5
                h-[130px]
                w-[140px]
                object-contain
                object-right-bottom
              "
              loading="lazy"
              decoding="async"
            />
          </article>
        </div>
      </div>

      <!-- Нижние две карточки -->

      <div
        class="
          grid
          gap-4
          lg:grid-cols-2
          lg:gap-6
        "
      >
        <article
          class="
            relative
            min-h-[250px]
            overflow-hidden
            rounded-2xl
            bg-[#F7F7F7]
            p-5
            sm:p-7
          "
        >
          <div class="relative z-10 max-w-[72%]">
            <h3
              class="
                text-xl
                font-medium
                leading-tight
                sm:text-2xl
              "
            >
              Почему это Мета-напиток
            </h3>

            <hr class="my-4 border-black/10" />

            <div
              class="
                space-y-3
                text-sm
                leading-relaxed
                sm:text-base
              "
            >
              <p>
                Evolution 10 + Mg создаётся не вокруг одного ингредиента,
                а вокруг функционального состояния.
              </p>

              <p>
                Сначала определяется, какие процессы особенно востребованы
                при высокой повседневной и интеллектуальной нагрузке.
                Затем под эту задачу собирается функциональный комплекс.
              </p>

              <p class="font-medium">
                Состояние → процессы → компоненты → готовая формула
              </p>
            </div>
          </div>

          <img
            src="/images/evolution/meta-state.webp"
            alt=""
            class="
              absolute
              bottom-0
              right-0
              h-[70%]
              w-[38%]
              object-contain
              object-right-bottom
            "
            loading="lazy"
            decoding="async"
          />
        </article>

        <article
          class="
            relative
            min-h-[250px]
            overflow-hidden
            rounded-2xl
            bg-[#F7F7F7]
            p-5
            sm:p-7
          "
        >
          <div class="relative z-10 max-w-[72%]">
            <h3
              class="
                text-xl
                font-medium
                leading-tight
                sm:text-2xl
              "
            >
              12 банок — на серию насыщенных дней
            </h3>

            <hr class="my-4 border-black/10" />

            <div
              class="
                space-y-3
                text-sm
                leading-relaxed
                sm:text-base
              "
            >
              <p>
                Evolution 10 + Mg удобно держать под рукой, когда впереди
                период высокой нагрузки: рабочая неделя, проект, поездка,
                интенсивный график или несколько дней с повышенной
                концентрацией.
              </p>

              <p>
                Готовый формат 330 мл не требует приготовления — одну банку
                легко взять с собой в офис, дорогу или на встречу.
              </p>
            </div>
          </div>

          <img
            src="/images/evolution/meta-series.webp"
            alt=""
            class="
              absolute
              bottom-0
              right-0
              h-[70%]
              w-[38%]
              object-contain
              object-right-bottom
            "
            loading="lazy"
            decoding="async"
          />
        </article>
      </div>
    </section>

    <section
      class="
        grid
        items-stretch
        gap-5
        lg:grid-cols-2
        lg:gap-8
      "
    >
      <div
        class="
          min-h-[280px]
          overflow-hidden
          rounded-2xl
          bg-[#F7F7F7]
        "
      >
        <img
          src="/images/evolution/gallery-three.webp"
          alt="Daigo Evolution 10 + Mg"
          class="
            h-full
            min-h-[280px]
            w-full
            object-cover
          "
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="flex flex-col justify-center">
        <h2
          class="
            text-2xl
            font-medium
            leading-tight
            sm:text-4xl
          "
        >
          Как работает Evolution 10 + Mg
        </h2>

        <div
          class="
            mt-4
            space-y-4
            text-sm
            leading-relaxed
            sm:text-base
          "
        >
          <div>
            <h3 class="font-medium text-lg">
              Нервная система
            </h3>

            <p class="mt-3">
              Магний, витамины B6 и B12 и L-теанин формируют
              функциональный блок поддержки в периоды повышенной
              интеллектуальной и нервной нагрузки.
            </p>
          </div>

          <div>
            <h3 class="font-medium text-lg">
              Энергетический обмен
            </h3>

            <p class="mt-3">
              Магний и витамины группы B участвуют в процессах,
              связанных с энергетическим обменом и активной работой организма.
            </p>
          </div>

          <div>
            <h3 class="font-medium text-base sm:text-lg">
              Кишечник и внутренняя среда
            </h3>

            <p class="mt-3">
              Метабиотическое ядро Daigo — продукты ферментации,
              сформированные с участием 16 штаммов Lactobacillus,
              — создаёт постоянную основу формулы.
            </p>
          </div>

          <p class="font-medium">
            Насыщенный день нагружает организм комплексно.<br />
            Evolution 10 + Mg отвечает комплексной формулой.
          </p>
        </div>
      </div>
    </section>

    <section
      class="
        grid
        items-center
        gap-5
        lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]
        lg:gap-8
      "
    >
      <div class="
        order-2
        sm:order-1
      ">
        <h2
          class="
            text-2xl
            font-medium
            leading-tight
            sm:text-4xl
          "
        >
          Что получает организм <br class="hidden sm:inline"/>из одной банки
        </h2>

        <p
          class="
            mt-4
            text-sm
            leading-relaxed
            sm:text-base
            w-full
            sm:w-[80%]
          "
        >
          330 мл готовой функциональной формулы — с конкретным количеством
          каждого ключевого компонента.
        </p>

        <div
          class="
            mt-5
            grid
            grid-cols-2
            gap-x-8
            gap-y-5
            sm:grid-cols-3
          "
        >
          <div
            v-for="item in nutrients"
            :key="item[0]"
          >
            <div
              class="
                text-lg
                font-medium
                sm:text-xl
              "
            >
              {{ item[0] }}
            </div>

            <div
              v-if="item[1]"
              class="
                mt-1
                text-xs
                text-black/60
                sm:text-sm
              "
            >
              {{ item[1] }}
            </div>
          </div>
        </div>

        <p class="mt-5 text-xs text-black/55">
          *Рекомендованный уроверь суточного потребления
        </p>
      </div>

      <div
        class="
          overflow-hidden
          rounded-2xl
          bg-[#F7F7F7]
          order-1
          sm:order-2
        "
      >
        <img
          src="/images/evolution/woman-drinking.webp"
          alt="Evolution 10 + Mg в течение дня"
          class="
            aspect-[4/3]
            w-full
            object-cover
          "
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>

    <section
      class="
        overflow-hidden
        rounded-[18px]
        bg-[#EEF4FF]
        sm:rounded-[44px]
      "
    >
      <img
        src="/images/evolution/wide-cans.webp"
        alt="Daigo Evolution 10 + Mg"
        class="
          h-auto
          w-full
          object-cover
        "
        loading="lazy"
        decoding="async"
      />
    </section>

    <section
      class="
        grid
        items-stretch
        gap-5
        lg:grid-cols-2
        lg:gap-8
      "
    >
      <div
        class="
          min-h-[280px]
          overflow-hidden
          rounded-2xl
          bg-[#F7F7F7]
        "
      >
        <img
          src="/images/evolution/gallery-hand.webp"
          alt="Банка Daigo Evolution 10 + Mg"
          class="
            h-full
            min-h-[280px]
            w-full
            object-cover
          "
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="flex flex-col justify-center">
        <h2
          class="
            text-2xl
            font-medium
            leading-tight
            sm:text-4xl
          "
        >
          Состав
        </h2>

        <div
          class="
            mt-4
            space-y-3
            text-sm
            leading-relaxed
            sm:text-base
          "
        >
          <p class="font-medium text-base sm:text-lg">
            Daigo Evolution 10 + Mg — функциональный
            газированный напиток на метабиотической основе Daigo с магнием,
            L-теанином и витаминами B6, B9, B12 и K2.
          </p>

          <p>
            Состав:
          </p>

          <p>
            вода подготовленная, компонент DAIGO® — ферментированный
            экстракт соевого молока (метаболиты 16 штаммов молочнокислых
            бактерий рода Lactobacillus), цитрат магния, регуляторы
            кислотности: молочная кислота, лимонная кислота, L-теанин,
            экстракт зелёного чая, экстракт цедры лимона,
            пиридоксина гидрохлорид, цианокобаламин,
            фолиевая кислота, диоксид углерода.
          </p>

          <p>
            <strong>Активные компоненты на 330 мл:</strong>
            магний — 132 мг (33% РУСП), L-теанин — 30 мг,
            витамин B6 — 1 мг (50% РУСП), витамин B9 — 100 мкг
            (50% РУСП), витамин B12 — 0,5, витамин K2 —
            120 мкг (100% РУСП)
          </p>

          <p>
            <strong>Пищевая ценность на 330 мл:</strong>
            белки — 0 г, жиры — 0 г, углеводы — 0,1 г,
            энергетическая ценность — 15 кДж / 4 ккал
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-5 !mt-20 !mb-16">
      <h2
        class="
          text-3xl
          font-medium
          leading-tight
          sm:text-product
          xl:text-slider
          mb-6
        "
      >
        Как и когда пить Evolution 10 + Mg
      </h2>

      <div
        class="
          grid
          items-center
          gap-5
          lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]
          lg:gap-8
        "
      >
        <div
          class="
            overflow-hidden
            rounded-2xl
            bg-[#F7F7F7]
          "
        >
          <img
            src="/images/evolution/man-day.webp"
            alt="Evolution 10 + Mg перед насыщенным днём"
            class="
              aspect-[4/3]
              w-full
              object-cover
            "
            loading="lazy"
            decoding="async"
          />
        </div>

        <div
          class="
            grid
            gap-x-8
            gap-y-6
            sm:grid-cols-2
          "
        >
          <div
            v-for="item in usage"
            :key="item[0]"
          >
            <h3
              class="
                text-xl
                font-medium
                leading-tight
                sm:text-2xl
              "
            >
              {{ item[0] }}
            </h3>

            <p
              class="
                mt-3
                text-sm
                leading-relaxed
                sm:text-base
              "
            >
              {{ item[1] }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-5">
      <div
        class="
          grid
          gap-5
          lg:flex
          lg:gap-8
        "
      >
        <div class="flex flex-col justify-center w-full sm:w-[80%]">
          <h2
            class="
              text-3xl
              font-medium
              leading-tight
              sm:text-product
              xl:text-slider
              w-full
              sm:w-[80%]
            "
          >
            Японская технология Daigo
          </h2>
        </div>

        <div
          class="
            space-y-3
            text-sm
            leading-relaxed
            sm:text-base
          "
        >
          <p>
            Метабиотическое ядро Evolution создаётся на производстве
            B&S Corporation в Японии — на собственной фабрике
            у подножия Фудзи.
          </p>

          <p>
            Производство расположено в экологически чистом районе.
            Компания контролирует не только сам процесс ферментации,
            но и сырьё: соевые бобы для Daigo выращиваются
            на собственных полях.
          </p>

          <p>
            Именно здесь начинается основа всех продуктов Daigo —
            ферментированный комплекс, сформированный с участием
            16 штаммов Lactobacillus.
          </p>
        </div>
      </div>

      <div
        class="
          overflow-hidden
          rounded-[18px]
          bg-[#EEF4FF]
          sm:rounded-[44px]
        "
      >
        <img
          src="/images/evolution/fuji.webp"
          alt="Гора Фудзи"
          class="
            h-auto
            w-full
            object-cover
          "
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>

    <section
      class="
        grid
        gap-6
        lg:grid-cols-[.18fr_.55fr_.27fr]
        lg:items-start
        lg:gap-8
      "
    >
      <!-- Цифры -->

      <div class="space-y-7">
        <div>
          <img
            src="/images/evolution/soy-beans.webp"
            alt="Соевые бобы"
            class="h-20 w-20 object-contain"
            loading="lazy"
          />

          <p class="mt-2 text-3xl font-medium">
            15кг
          </p>

          <p
            class="
              mt-1
              text-xs
              leading-relaxed
            "
          >
            Соевых бобов используется для производства
          </p>
        </div>

        <div>
          <p class="text-3xl font-medium">
            100л
          </p>

          <p class="mt-1 text-xs">
            Соевого молока
          </p>
        </div>

        <div>
          <img
            src="/images/evolution/soy-milk.webp"
            alt="Соевое молоко"
            class="h-20 w-20 object-contain"
            loading="lazy"
          />

          <p
            class="
              mt-2
              text-xs
              leading-relaxed
            "
          >
            Культивация лактобактерий в соевом молоке
          </p>
        </div>

        <div>
          <p class="text-3xl font-medium">
            в 1000 раз
          </p>

          <p
            class="
              mt-1
              text-xs
              leading-relaxed
            "
          >
            больше и более высокого качества, чем в коровьем молоке
          </p>
        </div>
      </div>

      <!-- Основной текст -->

      <div>
        <h2
          class="
            text-2xl
              font-medium
              leading-tight
              sm:text-product
              xl:text-slider
          "
        >
          От соевых бобов — к метабиотическому ядру
        </h2>

        <div
          class="
            mt-4
            space-y-3
            text-sm
            leading-relaxed
            sm:text-base
          "
        >
          <p>
            Приблизительно 15 кг соевых бобов используется для производства
            100 л соевого молока. Соевые бобы размалываются и кипятятся
            в воде, полностью очищенной от любых примесей.
          </p>

          <p>
            Для отделения окары (кашица из мякоти соевых бобов)
            используется пресс. Готовое соевое молоко используется
            в качестве среды для выращивания кисломолочных
            лактобактерий рода Lactobacillus.
          </p>

          <p>
            Культивирование лактобактерий в соевом молоке приводит
            к культивации бактерий более высокой плотности
            (в 1000 раз больше) и более высокого качества.
          </p>

          <p>
            В начале 16 штаммов лактобактерий подразделяются
            по степени совместимости на 4 группы и проходят
            процесс первичного брожения.
          </p>

          <p>
            Затем они сливаются вместе в ёмкость для совместного брожения.
          </p>

          <p>
            После этого этапа бактерии культивируются в течении 1 года.
            После прошествия данного периода ферментированную среду
            стерилизуют и фильтруют.
          </p>

          <p>
            На конечном этапе производства Daigo в очищенный
            ферментированный концентрат культуральной жидкости
            вносят молочную кислоту и лимонную кислоту
            в качестве регуляторов кислотности.
          </p>

          <p>
            В очищенной культуральной жидкости не содержатся живые бактерии
            (не является пробиотиком).
          </p>

          <p>
            Экстракт не содержит питательную среду для микробов
            (не является пребиотиком).
          </p>

          <p>
            Daigo — это экстракт брожения лактобактерий,
            представляет собой смесь секреторных выделений
            (метаболитов), бактериальных клеток и неживых
            микроорганизмов — метабиотик.
          </p>
        </div>
      </div>

      <!-- Банка -->

      <img
        src="/images/evolution/can-straight-tech.png"
        alt="Daigo Evolution Mg10"
        class="
          mx-auto
          w-full
          max-w-[520px]
          object-contain
          lg:sticky
          lg:top-24
          lg:max-h-[960px]
        "
        loading="lazy"
        decoding="async"
      />
    </section>
  </div>
</template>
