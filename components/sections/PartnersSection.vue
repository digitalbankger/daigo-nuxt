<template>
  <section class="relative w-full">
    <h2 class="text-slider font-medium mb-8">Наши партнёры</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <PartnerCard
        v-for="partner in partners"
        :key="partner.name"
        :logo="partner.logo"
        :name="partner.name"
        :description="partner.description"
      />
    </div>

    <div class="mt-16 flex justify-center">
      <NuxtImg
        src="http://localhost:3000/images/partners/partners-all.webp"
        alt="Наши партнёры"
        format="webp"
        loading="lazy"
        placeholder
        class="w-full"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import PartnerCard from '~/components/PartnerCard.vue'

const partners = [
  {
    logo: '/icons/partners/kivach.svg',
    name: 'Клиника Кивач',
    description:
      'Лидер в области очищения организма. На протяжении 20+ лет оказывает медицинские и оздоровительные услуги высокого класса.'
  },
  {
    logo: '/icons/partners/verba.svg',
    name: 'Verba Mayr',
    description:
      'Австрийский центр здоровья, открывший свои двери в России в 2015 году. Verba Mayr предлагает своим гостям программы омоложения и детокса по известной методике австрийского врача Франца Ксавьер Майера. Мы на регулярной основе проводим обучающие мероприятия о Дайго для врачей центра'
  },
  {
    logo: '/icons/partners/luciano.svg',
    name: 'Luciano',
    description:
      'Эксклюзивный спа-комплекс премиум класса входит в 10 лучших спа-отелей европы. Мы активно сотрудничаем с Luciano и проводим на территории комплекса обучающие мероприятия для ведущих врачей Татарстана. Дайго давно зарекомендовал себя как эффективное средство среди врачей и посетителей спа-комплекса'
  },
  {
    logo: '/icons/partners/36.svg',
    name: 'Аптечная сеть 36.6',
    description:
      'Сегодня аптеки «36.6» дают возможность управлять своим здоровьем. Это концепция образа жизни, включающая комплексные меры по поддержанию и сохранению активного долголетия и ухода за собой'
  },
  {
    logo: '/icons/partners/md.svg',
    name: 'Мать и дитя',
    description:
      '“Мать и дитя” сегодня - это 6 утльтра современных высокотехнологичных госпиталей и 36 клиник, обладающих мощным диагностическими и терапевтическими ресурсами, в 27 городах России, более 7000 квалифицированных специалистов, знающих и любящих свою работу, уникальный спект медицинских услуг для всей семьи'
  },
  {
    logo: '/icons/partners/bosco.svg',
    name: 'Аптеки Bosco',
    description:
      'Ведущее в России медицинское учреждение, оказывающее услуги омоложения и эстетической коррекции. Это первая в России клиника, где собраны все самые эффективные на сегодняшний день методики антивозрастной медицины. Врачи клиники широко применяют продукты Дайго в своей практике'
  }
]
</script>
