/**
 * 이미 본 케미 리포트 요약 (SCRUM-252)
 *
 * 어드민 케미 테스트 모드가 꺼져 있으면, 리포트를 한 번 본 상대는 프로필의 케미 리포트 칸에
 * 점수와 상단 요약을 보여주고 리포트 보기로 저장된 결과를 다시 연다.
 * 테스트 모드가 켜져 있으면 결과 카드 없이 열 때마다 새로 계산한다.
 *
 * TODO(real API): 서버 캐시 조회(GET /kemi/:targetLinkId/report/cached)로 교체
 */

import { useAdminStore } from '@/store/useAdminStore'
import { KEMI_SHARE_TTL_MS } from '@/components/screens/profile/kemiShare'

export type KemiSavedReport = {
  viewerLinkId: string
  targetUsername: string
  score: number
  archetypeName: string
  grade: string
  verdict: string
  generatedAt: number
}

// [임시] 목업 전용 — 리포트 요약을 이 브라우저 localStorage에만 보관
const STORAGE_KEY = 'felore-kemi-saved-reports'

function keyOf(viewerLinkId: string, targetUsername: string) {
  return `${viewerLinkId}|${targetUsername}`
}

function readAll(): Record<string, KemiSavedReport> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, KemiSavedReport>) : {}
  } catch {
    return {}
  }
}

export function saveKemiReportSummary(report: KemiSavedReport) {
  const all = readAll()
  all[keyOf(report.viewerLinkId, report.targetUsername)] = report
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // 저장 공간 부족 등 — 결과 카드만 안 보이고 리포트는 정상 동작
  }
}

/** 유효기간(생성 후 24시간, SCRUM-159와 동일) 안의 요약만 돌려준다 */
export function loadKemiReportSummary(viewerLinkId: string | undefined, targetUsername: string): KemiSavedReport | null {
  if (!viewerLinkId) return null
  const saved = readAll()[keyOf(viewerLinkId, targetUsername)]
  if (!saved) return null
  return Date.now() - saved.generatedAt < KEMI_SHARE_TTL_MS ? saved : null
}

export function useKemiTestMode() {
  return useAdminStore((s) => s.aiKemiConfig.testMode !== false)
}
