// import { Story } from '~/types/content'

// export default defineEventHandler((): Story[] => {
//   return [
//     {
//       id: 1,
//       title: "Акция 2+1",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse1.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story.png", "http:/localhost:3000//images/mock/stories/story2.png"],
//       productIds: [1, 15]
//     },
//     {
//       id: 2,
//       title: "Tamotsu",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse2.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story2.png"],
//       productIds: [1, 15]
//     },
//     {
//       id: 3,
//       title: "Shampoo",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse3.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story3.png"]
//     },
//     {
//       id: 4,
//       title: "Акция 2+1",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse1.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story.png", "http:/localhost:3000//images/mock/stories/story2.png"]
//     },
//     {
//       id: 5,
//       title: "Tamotsu",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse2.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story2.png"]
//     },
//     {
//       id: 6,
//       title: "Shampoo",
//       thumbnail: "http://localhost:3000/images/mock/stories/ellipse3.jpeg",
//       slides: ["http://localhost:3000/images/mock/stories/story3.png"]
//     }
//   ]  
// })




export default defineEventHandler(async (event) => {
  const base = useRuntimeConfig(event).public.daigoApiBase || 'https://api.daigo.ru'
  const url  = `${base}/v1/shop/content/stories`

  const raw = await $fetch<any[]>(url).catch(() => [])
  // Нормализуем под список «кружков»: id + thumbnail
  return (raw || []).map(s => ({
    id: s.id,
    // у бэка может быть thumbnail или thumbnail_url — поддержим обе формы
    thumbnail: s.thumbnail ?? s.thumbnail_url ?? '',
    title: s.title ?? '',     // опционально (на будущее)
  }))
})
