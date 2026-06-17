import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'

export type HighlightManageMode = 'list' | 'picker' | 'group' | 'form'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export interface HighlightCategoryCardEntry {
  kind: 'manual' | 'verified'
  category: HighlightManageCategory
  title: string
  meta: string
  countLabel: string
}

export interface HighlightCategoryCardGroup {
  id: string
  label: string
  items: HighlightCategoryCardEntry[]
}
