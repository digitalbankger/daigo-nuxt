import { defineEventHandler } from 'h3'
import { $fetch } from 'ofetch'

type FilterGroup = {
  label: string
  slug: string
  options: Array<{ label: string; value: string }>
}

export default defineEventHandler(async () => {
  const filters = await $fetch<FilterGroup[]>('http://localhost:3000/api/shop/filters')
  const urls: string[] = []

  const targetGroups = [
    'pomogaet-pri',
    'napravlennost',
    'klass-produkta',
    'produkty',
    'dlya-kogo',
    'sostav',
    'forma-vypuska',
    'strana-proizvoditel'
  ]

  const activeGroups = (filters || []).filter(group => targetGroups.includes(group.slug))

  function generateCombinations(
    groups: FilterGroup[],
    index: number = 0,
    current: Record<string, string> = {}
  ): Record<string, string>[] {
    if (index === groups.length) {
      return [current]
    }

    const group = groups[index]
    const result: Record<string, string>[] = []

    for (const option of group.options) {
      result.push(...generateCombinations(groups, index + 1, {
        ...current,
        [group.slug]: option.value
      }))
    }

    return result
  }

  const combinations = generateCombinations(activeGroups)

  for (const combo of combinations) {
    const { count } = await $fetch<{ count: number }>(
      'http://localhost:3000/api/shop/products/count',
      { query: combo }
    )

    if ((count || 0) > 0) {
      const totalPages = Math.min(3, Math.ceil(count / 9))

      for (let page = 1; page <= totalPages; page++) {
        const params = new URLSearchParams({ ...combo, page: page.toString() }).toString()
        const url = `/catalog?${params}`
        urls.push(url)
      }
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url><loc>https://daigo.ru${u}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
  )
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  })
})
