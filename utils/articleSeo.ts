import type { ArticleDetail } from '~/types/articles'

const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&laquo;': '«',
  '&raquo;': '»',
  '&mdash;': '—',
  '&ndash;': '–',
}

export function articleText(value?: string | null): string {
  if (!value) return ''

  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(nbsp|amp|quot|#39|apos|laquo|raquo|mdash|ndash);/gi, entity => ENTITY_MAP[entity.toLowerCase()] ?? ' ')
    .replace(/&#(\d+);/g, (_, code) => {
      const num = Number(code)
      return Number.isFinite(num) ? String.fromCharCode(num) : ' '
    })
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateSeoText(value: string, maxLength = 165): string {
  const text = articleText(value)
  if (text.length <= maxLength) return text

  const slice = text.slice(0, maxLength + 1)
  const breakAt = slice.lastIndexOf(' ')
  const end = breakAt >= Math.floor(maxLength * 0.72) ? breakAt : maxLength
  return `${slice.slice(0, end).replace(/[\s,;:–—-]+$/u, '').trim()}…`
}

export function getArticleSeoDescription(article?: Partial<ArticleDetail> | null): string {
  if (!article) return 'Статьи о здоровье, микробиоте, питании и продуктах Daigo.'

  const source =
    article.description ||
    article.preview ||
    article.contentTop ||
    article.contentBottom ||
    article.title ||
    ''

  const description = truncateSeoText(source, 165)
  if (description.length >= 50) return description

  const fallback = articleText([article.title, article.preview].filter(Boolean).join('. '))
  return truncateSeoText(fallback || 'Статьи о здоровье, микробиоте, питании и продуктах Daigo.', 165)
}
