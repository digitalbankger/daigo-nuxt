import { useHead } from '#imports'

/**
 * Montserrat больше не загружается глобально.
 * Вызывайте composable только на промо/спецстраницах, где font-mont реально нужен.
 */
export function useMontserratFont() {
  useHead({
    link: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap',
      },
    ],
  })
}
