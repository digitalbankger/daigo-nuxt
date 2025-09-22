import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useScrolled(threshold = 120) {
  const scrolled = ref(false)
  let ticking = false

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      scrolled.value = (window.scrollY || window.pageYOffset) > threshold
      ticking = false
    })
  }

  onMounted(() => {
    if (process.client) {
      scrolled.value = (window.scrollY || window.pageYOffset) > threshold
      window.addEventListener('scroll', onScroll, { passive: true })
    }
  })

  onBeforeUnmount(() => {
    if (process.client) {
      window.removeEventListener('scroll', onScroll)
    }
  })

  return { scrolled }
}
