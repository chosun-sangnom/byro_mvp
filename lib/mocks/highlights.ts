import type { HighlightCategoryId, HighlightGroupId, HighlightIconId } from '@/types'

// Temporary highlight taxonomy used by onboarding and public profile rendering.
// TODO(real API): Replace with server-driven highlight definitions if categories,
// labels, or certification rules become admin-configurable.

export const HIGHLIGHT_GROUPS: Array<{ id: HighlightGroupId; label: string }> = [
  { id: 'career', label: '커리어' },
  { id: 'achievement', label: '업적' },
  { id: 'lifestyle', label: '라이프스타일' },
]

export const HIGHLIGHT_CATEGORIES: Array<{
  id: HighlightCategoryId
  icon: HighlightIconId
  label: string
  group: HighlightGroupId
  certificationOnly?: boolean
}> = [
  { id: 'career-role', icon: 'briefcase', label: '경력', group: 'career' },
  { id: 'education-history', icon: 'book-open', label: '학력', group: 'career' },
  { id: 'career-continuity', icon: 'briefcase', label: '커리어 지속성', group: 'career', certificationOnly: true },
  { id: 'corporate-longevity', icon: 'building2', label: '법인 영속성', group: 'career', certificationOnly: true },
  { id: 'remember-network', icon: 'users', label: '리멤버 네트워크', group: 'career', certificationOnly: true },
  { id: 'talk', icon: 'mic', label: '강연 / 연설', group: 'career' },
  { id: 'collab', icon: 'handshake', label: '협업 프로젝트', group: 'career' },
  { id: 'education', icon: 'book-open', label: '강의 / 교육', group: 'career' },
  { id: 'publish', icon: 'book-open', label: '출판 / 기고', group: 'achievement' },
  { id: 'article-interview', icon: 'file-text', label: '기사 / 인터뷰', group: 'achievement' },
  { id: 'award', icon: 'trophy', label: '수상 / 표창', group: 'achievement' },
  { id: 'patent', icon: 'book-open', label: '특허 / 연구', group: 'achievement' },
  { id: 'license', icon: 'badge-check', label: '자격증 / 수료', group: 'achievement' },
  { id: 'airline-mileage', icon: 'plane', label: '항공 마일리지', group: 'lifestyle', certificationOnly: true },
  { id: 'volunteer', icon: 'globe', label: '봉사 / 사회공헌', group: 'lifestyle' },
  { id: 'other', icon: 'pencil', label: '기타', group: 'lifestyle' },
]
