import { Banner } from '~/types/content'

export default defineEventHandler((): Banner => {
  return {
    id: 1,
    image: '/images/mock/main.png',
    title: 'Daigo & Tamotsu',
    titleSize: '5em',
    descWidth: '550px',
    html: '<p class="mb-3 text-[clamp(1rem,6vw,1.5rem)] ">Органические продукты из Японии, Официальный представитель B&S Corporation.</p><p class="text-[clamp(1rem,6vw,1.5rem)] ">Бесплатная доставка и программа скидок постоянным клиентам.</p>',
    buttonText: 'Я тут впервые',
    buttonLink: '/catalog'
  }
})
