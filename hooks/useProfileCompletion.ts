'use client'

import { useFeloreStore } from '@/store/useFeloreStore'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import type { PublicProfileLife } from '@/types'

// 완성도 체크 항목 — components/screens/me/support-screens/ManageFeloreScreen.tsx의
// 완성도 계산과 동일한 기준을 사용 (기본정보/하이라이트/바이브/SNS/연락수단)
export function useProfileCompletion() {
  const user = useFeloreStore((s) => s.user)
  const highlights = useFeloreStore((s) => s.highlights)
  const highlightsInitialized = useFeloreStore((s) => s.highlightsInitialized)
  const instagramConnected = useFeloreStore((s) => s.instagramConnected)
  const linkedinConnected = useFeloreStore((s) => s.linkedinConnected)

  if (!user) return null

  const profile = getNormalizedPublicProfile({ username: user.linkId, user, ownerHighlights: highlights })
  const allHighlights = highlightsInitialized ? highlights : [...profile.manualHighlights, ...highlights]
  const whoIAm = profile.whoIAm ?? user.whoIAm
  const life = (profile.life ?? user.life) as PublicProfileLife

  const activityCount = life.daily.exercise.length
  const cultureCount =
    life.tastes.movies.length + life.tastes.music.length + life.tastes.books.length + (life.tastes.plays?.length ?? 0)
  const placeCount = life.tastes.restaurants.length + life.tastes.cafes.length
  const activeContactCount = user.contactChannels?.filter((ch) => ch.enabled && ch.value.trim()).length ?? 0
  const connectedSnsCount = Number(instagramConnected) + Number(linkedinConnected)

  const checks = [
    Boolean(whoIAm?.mbti),
    allHighlights.length > 0,
    activityCount + cultureCount + placeCount > 0,
    connectedSnsCount > 0,
    activeContactCount > 0,
  ]
  const doneCount = checks.filter(Boolean).length
  const percent = Math.round((doneCount / checks.length) * 100)

  return { percent, doneCount, total: checks.length }
}
