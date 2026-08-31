export const WEEKLY_PRODUCT_SLUGS = [
  'meta-napitok-daigo-evolution-mg10',
  'metabiotik-daigo',
  'daigo-jointic',
] as const

export type WeeklyProductSlug =
  (typeof WEEKLY_PRODUCT_SLUGS)[number]

const WEEKLY_PRODUCT_SLUG_SET =
  new Set<string>(WEEKLY_PRODUCT_SLUGS)

export function isWeeklyProductSlug(
  slug: unknown,
): slug is WeeklyProductSlug {
  return WEEKLY_PRODUCT_SLUG_SET.has(
    String(slug || '').trim(),
  )
}

export function getWeeklyProductSort(
  slug: unknown,
): number {
  const index = WEEKLY_PRODUCT_SLUGS.indexOf(
    String(slug || '') as WeeklyProductSlug,
  )

  return index < 0
    ? Number.MAX_SAFE_INTEGER
    : index
}