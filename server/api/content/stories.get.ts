import { Story } from '~/types/content'

export default defineEventHandler((): Story[] => {
  return [
    {
      id: 1,
      title: "Акция 2+1",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse1.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story.png", "http:/localhost:3000//images/mock/stories/story2.png"],
      productIds: [1, 15]
    },
    {
      id: 2,
      title: "Tamotsu",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse2.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story2.png"],
      productIds: [1, 15]
    },
    {
      id: 3,
      title: "Shampoo",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse3.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story3.png"]
    },
    {
      id: 4,
      title: "Акция 2+1",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse1.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story.png", "http:/localhost:3000//images/mock/stories/story2.png"]
    },
    {
      id: 5,
      title: "Tamotsu",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse2.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story2.png"]
    },
    {
      id: 6,
      title: "Shampoo",
      thumbnail: "https//nuxt.daigo.ru/images/mock/stories/ellipse3.jpeg",
      slides: ["https//nuxt.daigo.ru/images/mock/stories/story3.png"]
    }
  ]  
})
