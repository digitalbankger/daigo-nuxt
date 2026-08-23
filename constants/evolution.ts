export const EVOLUTION_CANONICAL_SLUG = 'meta-napitok-daigo-evolution-mg10'
export const EVOLUTION_LEGACY_SLUG = 'evolution-mg'

export function isEvolutionProductSlug(value: unknown): boolean {
  const slug = String(value || '').trim().toLowerCase()
  if (!slug) return false

  return slug.includes('evolution')
}
