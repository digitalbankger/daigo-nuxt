export default {
  mounted(el: HTMLElement, binding: any) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        binding.value()
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })

    observer.observe(el)
  }
}
