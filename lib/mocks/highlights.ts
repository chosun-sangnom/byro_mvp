import type { HighlightCategoryId, HighlightGroupId, HighlightIconId } from '@/types'

// Temporary highlight taxonomy used by onboarding and public profile rendering.
// TODO(real API): Replace with server-driven highlight definitions if categories,
// labels, or certification rules become admin-configurable.

export const HIGHLIGHT_GROUPS: Array<{ id: HighlightGroupId; label: string }> = [
  { id: 'career', label: '커리어' },
  { id: 'achievement', label: '업적' },
  { id: 'lifestyle', label: '기타' },
]

export const HIGHLIGHT_CATEGORIES: Array<{
  id: HighlightCategoryId
  icon: HighlightIconId
  label: string
  group: HighlightGroupId
}> = [
  { id: 'career-role', icon: 'briefcase', label: '경력', group: 'career' },
  { id: 'education-history', icon: 'book-open', label: '학력', group: 'career' },
  { id: 'talk', icon: 'mic', label: '강연 · 강의 · 교육', group: 'career' },
  { id: 'collab', icon: 'handshake', label: '협업 프로젝트', group: 'career' },
  { id: 'award', icon: 'trophy', label: '수상 · 자격증', group: 'achievement' },
  { id: 'publish', icon: 'file-text', label: '출판 · 기고 · 특허', group: 'achievement' },
  { id: 'volunteer', icon: 'globe', label: '봉사 · 기타', group: 'lifestyle' },
]
