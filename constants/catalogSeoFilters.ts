export const CATALOG_SEO_FILTER_KEYS = ['napravlennost', 'pomogaet-pri'] as const
export type CatalogSeoFilterKey = (typeof CATALOG_SEO_FILTER_KEYS)[number]

export const CATALOG_SEO_FILTER_VALUES: Record<CatalogSeoFilterKey, readonly string[]> = {
  napravlennost: [
    'kishechnik-i-immunitet',
    'mozg-i-nervnaya-sistema',
    'kozha-i-volosy',
    'kosti-i-myshtsy',
    'zuby-i-desna',
  ],
  'pomogaet-pri': [
    'allergiya',
    'pishchevaya-neperenosimost',
    'kishechnaya-neprokhodimost-zapor',
    'emotsionalnaya-peregruzka',
    'demenciya',
    'siboreya',
    'stomatit',
    'yazva',
    'gastrit',
    'vypadenie-volos',
    'akne',
    'disbakterioz',
    'alcegeymer',
    'posttrenirovochnye-mysh-boli',
    'nevralgiya-mysh-boli',
    'helicobacter-pylori',
    'meteorism',
    'karies',
    'neyrodermit',
    'atopicheskij-dermatit',
    'psoriaz',
    'sukhaya-kozha',
    'utomlyaemost',
    'pokhmelie',
    'vosstanovlenie-mikroflory',
  ],
}

const VALUE_TO_KEY = new Map<string, CatalogSeoFilterKey>()
for (const key of CATALOG_SEO_FILTER_KEYS) {
  for (const value of CATALOG_SEO_FILTER_VALUES[key]) VALUE_TO_KEY.set(value, key)
}

export function getCatalogSeoFilterKey(value: string): CatalogSeoFilterKey | null {
  return VALUE_TO_KEY.get(String(value || '').trim()) || null
}

export function isCatalogSeoFilterValue(key: string, value: string): boolean {
  return CATALOG_SEO_FILTER_KEYS.includes(key as CatalogSeoFilterKey)
    && CATALOG_SEO_FILTER_VALUES[key as CatalogSeoFilterKey].includes(String(value || '').trim())
}

export const CATALOG_SEO_ROUTE_VALUES = CATALOG_SEO_FILTER_KEYS
  .flatMap((key) => [...CATALOG_SEO_FILTER_VALUES[key]])

function escapeRouteRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const CATALOG_SEO_ROUTE_PATTERN = CATALOG_SEO_ROUTE_VALUES
  .map(escapeRouteRegex)
  .join('|')
