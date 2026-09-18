import type { HighlightCategoryId, HighlightIconId } from '@/types'

// Temporary highlight taxonomy used by onboarding and public profile rendering.
// TODO(real API): Replace with server-driven highlight definitions if categories,
// labels, or certification rules become admin-configurable.

export const HIGHLIGHT_CATEGORIES: Array<{
  id: HighlightCategoryId
  icon: HighlightIconId
  label: string
  examples: string
}> = [
  { id: 'career-role', icon: 'briefcase', label: '경력', examples: '' },
  { id: 'education-history', icon: 'book-open', label: '학력', examples: '' },
  { id: 'activity', icon: 'mic', label: '활동', examples: '인터뷰 · 기사 · 강연 · 방송 · 기고 · 커뮤니티 · 봉사' },
  { id: 'achievement', icon: 'trophy', label: '성과', examples: '수상 · 자격증 · 출판 · 특허' },
]
