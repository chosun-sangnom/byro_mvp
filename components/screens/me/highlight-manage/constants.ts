import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'

export type HighlightManageMode = 'list' | 'group' | 'form' | 'verify'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export interface HighlightCategoryCardEntry {
  category: HighlightManageCategory
  title: string
  meta: string
  countLabel: string
}

export interface HighlightCategorySection {
  category: HighlightManageCategory
  card: HighlightCategoryCardEntry | null
}
