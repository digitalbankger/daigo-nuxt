import { Banner } from '~/types/content'

export default defineEventHandler((): Banner[] => {
  return [
    {
      id: 1,
      image: '/images/mock/main.png',
      imageMobile: '/images/mock/main-mobile.jpg',
      mobileHeight: '405px',
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
      html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма',
      buttonText: 'Узнать больше о Дайго',
      mobileButtonText: 'Больше о Дайго',
      buttonLink: '/catalog'
    },
    {
      id: 2,
      image: '/images/mock/main.png',
      imageMobile: '/images/mock/main-mobile.jpg',
      mobileHeight: '405px',
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
      html: '<p class="text-[clamp(0.875rem,4vw,1.5rem)] ">Для всех систем организма',
      buttonText: 'Узнать больше о Дайго',
      mobileButtonText: 'Больше о Дайго',
      buttonLink: '/catalog'
    },
  ]
})
