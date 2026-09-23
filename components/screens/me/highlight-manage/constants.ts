import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'

export type HighlightManageMode = 'list' | 'picker' | 'group' | 'form' | 'verify'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export interface HighlightCategoryPreviewItem {
  id: string
  title: string
  meta: string
  isPrimary: boolean
}

export interface HighlightCategorySection {
  category: HighlightManageCategory
  totalCount: number
  previewItems: HighlightCategoryPreviewItem[]
}
