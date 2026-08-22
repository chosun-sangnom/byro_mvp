import type { PublicProfile } from '@/types'

/**
 * 미니 아바타 옆 표시용 한 줄 설명.
 * 우선순위: 회사명+직함(title) → 학교 → 하이라이트(등록 순서상 첫 항목) → 이름만
 * bio(자기소개)는 절대 참고하지 않는다 (SCRUM-76).
 */
export function getProfileMiniSubtitle(
  profile: Pick<PublicProfile, 'name' | 'title' | 'school' | 'manualHighlights'>,
): string {
  if (profile.title?.trim()) return profile.title
  if (profile.school?.trim()) return profile.school
  const firstHighlight = profile.manualHighlights?.[0]
  if (firstHighlight?.title?.trim()) return firstHighlight.title
  return profile.name
}
