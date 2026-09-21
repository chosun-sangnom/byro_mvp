import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import type { Highlight } from '@/types'

export type HighlightManageMode = 'list' | 'form' | 'verify'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export interface HighlightCategorySection {
  category: HighlightManageCategory
  items: Highlight[]
}
