export interface FilterOption {
  label: string
  value: string
}

export interface FilterGroup {
  label: string
  slug: string
  options: FilterOption[]
}

export interface Filters {
  [property: string]: FilterOption[]
}

// types/filter.ts
export interface FilterOption {
  label: string
  value: string
  count?: number
}
