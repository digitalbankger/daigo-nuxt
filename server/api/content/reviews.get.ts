import type { Review } from '~/types/content'

export default defineEventHandler((): Review[] => {
  return [
    {
      id: 1,
      type: 'video',
      author: 'Алёна Долецкая',
      author_role: 'Журналист, публицист, переводчик. Первый главный редактор журнала Vogue Russia (1998–2010) и первый главный редактор журнала Andy Warhol\'\s Interview Russia (2011–2016)',
      feedback_preview: 'Это мое маленькое японское спасение, оно спасло меня уже раза 3, и я подсела на него каждый день. Живот работает идеально, никаких гриппов и простуд...',
      photo_urls: ['https://feedbacks.s3.firstvds.ru/stars/doleckaya.png'],
      file_url: 'https://feedbacks.s3.firstvds.ru/stars/doleckaya.mp4',
    },
    {
      id: 2,
      type: 'video',
      author: 'Елена Летучая',
      author_role: 'Ведущая программы "Ревизорро" на телеканале Пятница!',
      feedback_preview: 'Утром пью свою самую любимую добавочку, которая когда либо появлялась в моем доме! Укрепляет иммунитет, оздаравливает мой организм на клеточном уровне...',
      photo_urls: ['https://feedbacks.s3.firstvds.ru/stars/elena.jpg'],
      file_url: 'https://feedbacks.s3.firstvds.ru/stars/letuchaya.mp4',
    },
    {
      id: 3,
      type: 'video',
      author: 'Дмитрий Маликов',
      author_role: 'Советский и российский эстрадный певец, композитор, пианист, дирижёр, продюсер, актёр театра и кино, телеведущий',
      feedback_preview: 'Если правильно вкладываться в свой организм (правильным питанием, полноценным сном, хорошим настроением), то он ответит тебе взаимностью!',
      photo_urls: ['https://s3.firstvds.ru/feedbacks/stars/malikov.jpg'],
      file_url: 'https://s3.firstvds.ru/feedbacks/stars/malikov.mp4',
    },
    
  ]
})
