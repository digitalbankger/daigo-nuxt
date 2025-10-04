<script setup lang="ts">
type H3Item = { id: string; text: string }
type H2Item = { id: string; text: string; children: H3Item[] }

const props = withDefaults(defineProps<{
  containerIds?: string[]
  title?: string
  /** максимум видимых h2; остальные — под кнопкой «Показать ещё» */
  limit?: number
}>(), {
  containerIds: () => ['article-top', 'article-bottom'],
  title: 'Вы узнаете',
  limit: 5
})

const openToc = ref(true)                // всё оглавление свёрнуто/развёрнуто
const groups = ref<H2Item[]>([])         // h2 с дочерними h3
const expandedH2 = ref<Record<string, boolean>>({}) // раскрытие каждого h2
const showAllH2 = ref(false)             // показать больше h2

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?«»"']/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function collect() {
  const result: H2Item[] = []
  for (const cid of props.containerIds) {
    const root = document.getElementById(cid)
    if (!root) continue

    // берём только h2 и h3, но выводим потом h2; h3 — как дети
    const headings = root.querySelectorAll<HTMLElement>('h2, h3')
    let currentH2: H2Item | null = null

    headings.forEach(h => {
      const tag = h.tagName.toLowerCase()
      const text = (h.innerText || h.textContent || '').trim()
      if (!text) return
      if (!h.id) h.id = slugify(text)

      if (tag === 'h2') {
        currentH2 = { id: h.id, text, children: [] }
        result.push(currentH2)
        // по умолчанию сворачиваем h3 у каждого h2
        expandedH2.value[h.id] ??= false
      } else if (tag === 'h3' && currentH2) {
        currentH2.children.push({ id: h.id, text })
      }
    })
  }

  // уберём дубли h2 по id (на случай нескольких контейнеров)
  const map = new Map<string, H2Item>()
  result.forEach(i => { if (!map.has(i.id)) map.set(i.id, i) })
  groups.value = Array.from(map.values())
}

onMounted(() => {
  collect()
  // v-html может дорисоваться чуть позже
  requestAnimationFrame(collect)
})

watch(() => props.containerIds, () => { if (process.client) collect() })

function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.add('yl-highlight')
  setTimeout(() => el.classList.remove('yl-highlight'), 1000)
}
</script>

<template>
  <nav v-if="groups.length" aria-label="Оглавление статьи" class="select-none">
    <button
      type="button"
      class="w-full flex items-center justify-start gap-4 text-xl md:text-cardhead leading-none font-medium"
      :aria-expanded="openToc"
      @click="openToc = !openToc"
    >
      <span>{{ title }}</span>
      <img
        src="/icons/arrow-right-pag.svg"
        alt=""
        class="w-4 md:w-6 h-4 md:h-6 transition-transform duration-200 mt-1"
        :class="openToc ? '-rotate-90' : 'rotate-90'"
      />
    </button>

    <ul v-show="openToc" class="mt-6 md:mt-8 space-y-3 md:space-y-4 list-disc pl-4 md:pl-6">
      <!-- показываем только h2; h3 внутри скрыты до раскрытия конкретного h2 -->
      <li v-for="(h2, idx) in (showAllH2 ? groups : groups.slice(0, props.limit))" :key="h2.id"
          class="marker:text-primary marker:font-semibold md:marker:text-2xl">

        <!-- строка H2 -->
        <div class="flex flex-col sm:flex-row items-start gap-0.5 sm:gap-2">
          <a
            href="#"
            class="text-sm md:text-xl text-primary hover:border-b hover:border-primary transition-colors duration-300"
            @click.prevent="scrollToId(h2.id)"
          >
            {{ h2.text }}
          </a>

          <!-- переключатель раскрытия H3 у конкретного H2 (только если есть дети) -->
          <button
            v-if="h2.children.length"
            type="button"
            class="ml-0 sm:ml-1 my-auto text-xs md:text-sm text-primary/70 hover:text-primary underline underline-offset-2"
            @click="expandedH2[h2.id] = !expandedH2[h2.id]"
            :aria-expanded="expandedH2[h2.id]"
          >
            {{ expandedH2[h2.id] ? 'Скрыть подразделы' : 'Показать подразделы' }}
          </button>
        </div>

        <!-- список H3 (показываем только когда раскрыт конкретный H2) -->
        <ul v-if="h2.children.length && expandedH2[h2.id]" class="mt-2 space-y-2 list-disc pl-4">
          <li v-for="h3 in h2.children" :key="h3.id" class="ml-2 marker:text-primary">
            <a
              href="#"
              class="text-xs md:text-base text-primary hover:border-b hover:border-primary"
              @click.prevent="scrollToId(h3.id)"
            >
              {{ h3.text }}
            </a>
          </li>
        </ul>
      </li>
    </ul>

    <!-- кнопка «Показать ещё» для h2 сверх лимита -->
    <div v-if="!showAllH2 && groups.length > props.limit" class="mt-4">
      <button
        type="button"
        class="text-sm md:text-base text-primary underline underline-offset-2"
        @click="showAllH2 = true"
      >
        Показать ещё
      </button>
    </div>
  </nav>
</template>

<style scoped>
.yl-highlight { outline: 2px solid rgba(59,130,246,.35); transition: outline-color .8s ease; }
</style>
