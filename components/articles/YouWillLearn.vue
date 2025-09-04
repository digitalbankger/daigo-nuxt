<script setup lang="ts">
type HeadingItem = { id: string; text: string; level: 2 | 3 }

const props = withDefaults(defineProps<{
  containerIds?: string[]
  title?: string
  limit?: number
}>(), {
  containerIds: () => ['article-top', 'article-bottom'],
  title: 'Вы узнаете',
  limit: 0
})

const open = ref(true)
const items = ref<HeadingItem[]>([])

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?«»"']/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function collect() {
  const list: HeadingItem[] = []
  for (const cid of props.containerIds) {
    const root = document.getElementById(cid)
    if (!root) continue
    const headings = root.querySelectorAll<HTMLElement>('h2, h3')
    headings.forEach(h => {
      const level = (h.tagName.toLowerCase() === 'h2' ? 2 : 3) as 2 | 3
      const raw = h.innerText || h.textContent || ''
      const text = raw.trim()
      if (!text) return
      if (!h.id) h.id = slugify(text)
      list.push({ id: h.id, text, level })
    })
  }
  // убрать дубли по id
  const map = new Map<string, HeadingItem>()
  list.forEach(i => { if (!map.has(i.id)) map.set(i.id, i) })
  const arr = Array.from(map.values())
  items.value = props.limit > 0 ? arr.slice(0, props.limit) : arr
}

onMounted(() => {
  collect()
  // на случай, если v-html дорисовывается позже
  requestAnimationFrame(collect)
})

watch(() => props.containerIds, () => {
  if (process.client) collect()
})

function go(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.add('yl-highlight')
  setTimeout(() => el.classList.remove('yl-highlight'), 1000)
}
</script>

<template>
  <!-- без бордеров/фона, максимально “чисто” -->
  <nav v-if="items.length" aria-label="Оглавление статьи" class="select-none">
    <button
      type="button"
      class="w-full flex items-center justify-start gap-4 text-xl md:text-cardhead leading-none font-medium"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ title }}</span>
      <img
        src="/icons/arrow-right-pag.svg"
        alt=""
        class="w-4 md:w-6 h-4 md:h-6 transition-transform duration-200 mt-1"
        :class="open ? '-rotate-90' : 'rotate-90'"
      />
    </button>

    <ul
      v-show="open"
      class="mt-6 md:mt-8 space-y-2 md:space-y-4 list-disc pl-4 md:pl-6"
    >
      <li
        v-for="i in items"
        :key="i.id"
        :class="[
          'marker:text-primary marker:font-semibold md:marker:text-2xl',
          i.level === 3 ? 'ml-4' : ''
        ]"
      >
        <a
          href="#"
          class="text-sm md:text-xl text-primary hover:border-b hover:border-primary transition-colors duration-300"
          @click.prevent="go(i.id)"
        >
          {{ i.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.yl-highlight { outline: 2px solid rgba(59,130,246,.35); transition: outline-color .8s ease; }
</style>
