<template>
  <div class="relative py-0">
    <div class="relative max-w-[1310px] w-full mx-auto flex items-center justify-between mb-6">
      <h2 class="text-slider sm:text-product lg:text-slider font-medium leading-tight mb-2 sm:mb-6">
        Награды и сертификаты
      </h2>
    </div>

    <div class="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-5">
      <div
        v-for="(reward, index) in rewards"
        :key="index"
        class="w-[calc(50%_-_0.375rem)] sm:w-[calc(50%_-_0.5rem)] lg:w-[calc(20%_-_1rem)]"
      >
        <RewardCard
          :reward="reward"
          @open="openReward"
        />
      </div>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <div
      v-if="isModalOpen && selectedReward"
      class="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6"
      @keydown.esc="closeReward"
      tabindex="-1"
    >
      <button
        type="button"
        class="absolute inset-0 bg-black/50"
        aria-label="Закрыть"
        @click="closeReward"
      />

      <div class="relative z-[201] w-full max-w-[980px] bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
        <div class="flex items-center justify-between px-4 md:px-6 py-4 border-b">
          <div class="font-medium text-base md:text-lg pr-4">
            {{ selectedReward.name }}
          </div>

          <button
            type="button"
            class="w-10 h-10 rounded-full hover:bg-black/5 transition flex items-center justify-center"
            @click="closeReward"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div class="max-h-[80vh] overflow-auto p-4 md:p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
            <div class="rounded-xl bg-black/5 p-3 md:p-4">
              <img
                v-if="selectedReward.image"
                :src="selectedReward.image"
                :alt="selectedReward.name"
                class="w-full h-auto object-contain rounded-lg"
                loading="lazy"
              />
            </div>

            <div>
              <img
                v-if="selectedReward.logo"
                :src="selectedReward.logo"
                :alt="selectedReward.name"
                class="max-w-[160px] h-auto mb-4"
                loading="lazy"
              />

              <p class="text-sm md:text-base text-black/70 mb-4 whitespace-pre-line">
                {{ selectedReward.about }}
              </p>

              <p class="border-l-2 border-black ps-3 md:ps-4 text-sm md:text-base whitespace-pre-line">
                {{ selectedReward.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RewardCard from '~/components/RewardCard.vue'

type Reward = {
  image?: string
  name: string
  about: string
  description: string
  logo?: string
}

const isModalOpen = ref(false)
const selectedReward = ref<Reward | null>(null)

const openReward = (reward: Reward) => {
  selectedReward.value = reward
  isModalOpen.value = true
}

const closeReward = () => {
  isModalOpen.value = false
  selectedReward.value = null
}

// Перечень наград и премий. Каждому объекту соответствуют
// изображение сертификата, логотип организации, название,
// краткое описание (about) и подробное описание (description).
const rewards = [
  {
    image: '/images/rewards/brand-goda-rossii-2025.jpg',
    name: 'Национальная премия «Бренд Года в России»',
    about:
      'Общественно значимый проект по признанию и поддержке компаний, которые активно работают на российском рынке.',
    description:
      'Номинация: «БАДы и оздоровительные пищевые добавки». Результат: Лауреат. Продукт: Бренд Daigo.',
  },
  {
    image: '/images/rewards/prof-beauty-star-2025.png',
    name: 'Prof Beauty Star 2025',
    about:
      'Премия присуждается за значимый вклад и успешную деятельность на рынке профессиональной продукции для косметологии и эстетической медицины',
    description:
      'Номинация: «Лучшая продукция для косметолога». Результат: Лауреат 3 степени. Продукт: Daigo Dermic.',
  },
  {
    image: '/images/sert1.png',
    logo: '/images/sert-logo1.png',
    name: 'Благодарность',
    about:
      'АНО ЦПМС «МногоМама» ведет ежедневную и ежечасную работу, помогая многодетным семьям России!',
    description:
      'Благодарность за предоставление продукции компании для наших 6000 подопечных',
  },
  {
    image: '/images/sert2.png',
    logo: '/images/sert-logo-2.png',
    name: 'Благодарственное письмо',
    about:
      'АВТОНОМНАЯ НЕКОММЕРЧЕСКАЯ ОРГАНИЗАЦИЯ СОЦИАЛЬНОЙ ПОМОЩИ СЕМЬЕ И ДЕТЯМ',
    description: 'Благодарность за участие в акции',
  },

  // Новые награды из документа
  {
    image: '/images/rewards/world-food-2025.png',
    name: 'Международная выставка продуктов питания WorldFood 2025',
    about:
      'Международная осенняя выставка продуктов питания, которая создает максимальные возможности для развития бизнеса: найти новых клиентов и партнёров, презентовать новинки, расширить экспортные возможности, изучить рынок. А для представителей торговых предприятий и предприятий общественного питания — это возможность найти новых поставщиков качественной продовольственной продукции.',
    description:
      'Номинация: «Продукты здорового питания. Продукт года». Результат: Золотая медаль. Продукт: Daigo Evolution.',
  },
  {
    image: '/images/rewards/world-food-2016.png',
    name: 'Международная выставка продуктов питания WorldFood 2016',
    about:
      'Международная осенняя выставка продуктов питания, которая создаёт максимальные возможности для развития бизнеса: найти новых клиентов и партнёров, презентовать новинки, расширить экспортные возможности, изучить рынок. А для представителей торговых предприятий и предприятий общественного питания — это возможность найти новых поставщиков качественной продовольственной продукции.',
    description:
      'Номинация: Продукт года. Результат: Золотая медаль. Продукт: Daigo.',
  },
  {
    image: '/images/rewards/world-food-2015.png',
    name: 'Международная выставка продуктов питания WorldFood 2015',
    about:
      'Международная осенняя выставка продуктов питания, которая создаёт максимальные возможности для развития бизнеса: найти новых клиентов и партнёров, презентовать новинки, расширить экспортные возможности, изучить рынок. А для представителей торговых предприятий и предприятий общественного питания — это возможность найти новых поставщиков качественной продовольственной продукции.',
    description:
      'Номинация: Продукт года. Результат: Бронзовая медаль. Продукт: Daigo. Эмблема за 2015 год отсутствует в хорошем качестве.',
  },
  {
    image: '/images/rewards/prodexpo-2016.png',
    name: 'XXIII Международный конкурс продовольственных товаров на выставке «Продэкспо-2016» и 2017',
    about:
      'Крупнейшая в России продовольственная выставка для бизнеса. Её отличают обилие трендовых новинок и обширная деловая коммуникация. Продукцию представляют около 2 000 компаний более чем из 35 стран. Около 70 тыс. байеров более чем из 100 стран находят поставщиков и договариваются о закупках на «Продэкспо». Ассортимент — от базовых продуктов и напитков до деликатесов, а также продукты халяль, органическое, спортивное, функциональное питание, ЗОЖ, экзотические продукты.',
    description:
      'Номинация: Лучший инновационный продукт. Результат: Золотая медаль. Продукт: Daigo.',
  },
  {
    image: '/images/rewards/consumer-rights-2016.png',
    name: 'Права потребителей и качество обслуживания 2016, 2017',
    about:
      'Премия в области качества продукта и сервиса «ВЫБОР ПОТРЕБИТЕЛЕЙ» — ежегодная общественно значимая награда, вручаемая наиболее успешным проектам в области сервиса и качества товаров и услуг. Лауреаты премии — лидеры отрасли, ответственно относящиеся к соблюдению прав потребителей, производству товаров и оказанию услуг, оправдывающие делами самое высокое доверие — доверие потребителей.',
    description:
      'Номинация: Без номинации. Результат: Лауреат. Продукт: Daigo.',
  },
  {
    image: '/images/rewards/best-enterprises-2016.jpg',
    name: '«100 лучших предприятий и организаций России в сфере здорового образа жизни и активного долголетия, 2016»',
    about:
      'Основной задачей конкурса является поощрение руководителей предприятий и организаций, регионов и региональных органов управления за создание условий для осуществления активной социальной деятельности по повышению качества и продолжительности жизни населения.',
    description:
      'Номинация: «Производство и реализация продуктов диетического питания, продуктов детского питания, продуктов спортивного питания, продуктов лечебного питания, продуктов здорового питания, витаминов, биоактивных добавок». Результат: Победитель. Продукт: Бренд Daigo.',
  },
  {
    image: '/images/rewards/beauty-awards-2025.png',
    name: 'Главная онлайн-премия в области здоровья и красоты Beauty Awards 2025',
    about:
      'Престижная премия в сфере красоты, здоровья и wellness, признанный индикатор качества товаров и услуг, соответствующих высоким международным стандартам. Премия служит ориентиром для потребителей, выбирающих лучшее, и для профессионалов, стремящихся к лидерству в индустрии. BEAUTY AWARDS — это не только знак признания от экспертов и ценителей здорового образа жизни, но и мощная площадка для нетворкинга, сильнейший инструмент для развития бренда, укрепления репутации и привлечения клиентов.',
    description:
      'Номинация: «Лучший ЗОЖ-бренд». Результат: Победитель. Продукт: Бренд Daigo.',
  },
  {
    image: '/images/rewards/zdorovoe-pitanie-2016.png',
    name: 'Премия «Здоровое питание» 2016 и 2017',
    about:
      'Ежегодная общественно значимая награда, призванная способствовать привлечению внимания общества к популяризации здорового образа жизни в целом и питания в частности. Вручается с 2013 года.',
    description:
      'Номинация: Без номинации. Результат: Победитель. Продукт: Daigo.',
  },
  {
    image: '/images/rewards/parkzoo-award.png',
    name: 'Международная выставка зооиндустрии',
    about:
      'Главное событие для роста бизнеса в зооиндустрии. В выставке принимают участие более 300 компаний-экспонентов из России, Беларуси, Китая и других стран. Мероприятие посещают более 15,5 тысячи профессионалов отрасли.',
    description:
      'Номинация: «Ветеринарные препараты». Результат: Победитель конкурса новинок. Продукт: Lactis zoo.',
  },
]
</script>
