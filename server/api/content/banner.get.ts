import { Banner } from '~/types/content'

export default defineEventHandler((): Banner[] => {
  return [
    {
      id: 1,
      image: '/images/mock/main.png',
      tags: [
        { label: 'Кишечник и иммунитет', color: '#FFF05D' },
        { label: 'Кожа и волосы',        color: '#9AFF9F' },
        { label: 'Зубы и десны',         color: '#FFBCD8' },
        { label: 'Кости и мышцы',        color: '#89DEFF' },
        { label: 'Нервная система и мозг', color: '#9AFF9F' }
      ],
      title: 'DAIGO — натуральные БАДы из Японии ',
      titleSize: '5em',
      descWidth: '550px',
      html: '<p class="mb-3 text-[clamp(1rem,6vw,1.5rem)] ">Для всех систем организма',
      buttonText: 'Узнать больше о Дайго',
      buttonLink: '/catalog'
    },
    {
      id: 2,
      image: '/images/mock/main.png',
      title: 'Второй баннер',
      titleSize: '5em',
      descWidth: '550px',
      html: '<p>Другой текст</p>',
      buttonText: 'Подробнее',
      buttonLink: '/about',
    },
  ]
})
