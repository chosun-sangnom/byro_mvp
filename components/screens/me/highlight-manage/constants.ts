import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import type { Highlight } from '@/types'

export type HighlightManageMode = 'list' | 'form' | 'verify'
export type YearPickerTarget = 'career-start' | 'career-end' | 'education-start' | 'education-end' | 'education-year'
export type HighlightManageCategory = (typeof HIGHLIGHT_CATEGORIES)[number]

export interface HighlightCategorySection {
  category: HighlightManageCategory
  /** 메인 항목이 맨 앞에 오도록 정렬된 목록 */
  items: Highlight[]
  primaryId?: string
}
