import { ARTICLE_CARDS } from '~/content/articles-json/articles.cards'
import { ARTICLE_FILTERS } from '~/constants/articleFilters'
import type { FilterGroup } from '~/types/filter'

function toValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean)
  if (value == null || value === '') return []
  return String(value).split(',').map(v => v.trim()).filter(Boolean)
}

export function getArticleFilterGroups(): FilterGroup[] {
  return ARTICLE_FILTERS
    .map((group) => {
      const used = new Set<string>()
      for (const article of ARTICLE_CARDS as any[]) {
        for (const value of toValues(article?.properties?.[group.slug])) used.add(value)
      }

      return {
        ...group,
        options: group.options.filter((option) => used.has(option.value)),
      }
    })
    .filter((group) => group.options.length > 0)
}
