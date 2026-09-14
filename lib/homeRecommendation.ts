import {
  BAEKHYUNJIN_PROFILE,
  CHOISUNYOUNG_PROFILE,
  HANSANGHOON_PROFILE,
  JIMIN_PROFILE,
  JUNGWONHO_PROFILE,
  KWONMINSEOK_PROFILE,
  LEEJUNHYUK_PROFILE,
  LIMJIYEON_PROFILE,
  MK_PROFILE,
  OHYERIM_PROFILE,
  PARKSOJIN_PROFILE,
  SAMPLE_PROFILE,
  YOONJISOO_PROFILE,
} from '@/lib/mocks/publicProfiles'
import { flattenVibe } from '@/lib/vibeItems'
import type { Highlight, PublicProfile, UserState } from '@/types'

// [임시] SCRUM-125 홈 "오늘의 추천" 목업 — 규칙 기반 클라이언트 계산.
// TODO(real API): GET /feed/recommended/today 로 교체. 서버는 저장한 사람·7일 내 본 사람도 제외하고,
// 오늘의 추천·넘긴 기록을 사용자별로 저장한다.

export const DAILY_SKIP_LIMIT = 5
const SKIP_EXCLUDE_DAYS = 7

const W_SCHOOL = 3
const W_WORK = 5
const W_VIBE = 5

export type RecommendationSignal = 'school' | 'work' | 'vibe' | 'active'

export interface RecommendationChip {
  signal: RecommendationSignal
  label: string
}

export interface TodayRecommendation {
  profile: PublicProfile
  sentence: string
  chips: RecommendationChip[]
  /** 매칭이 없어 활동량 기준으로 대체된 추천 */
  isFallback: boolean
}

type Candidate = PublicProfile

// 목업 카탈로그 — 활동량 순서 (앞일수록 최근 받은 피드백·방명록·프로필 수정이 많음)
const CANDIDATES_BY_ACTIVITY = [
  SAMPLE_PROFILE,
  JIMIN_PROFILE,
  MK_PROFILE,
  PARKSOJIN_PROFILE,
  CHOISUNYOUNG_PROFILE,
  YOONJISOO_PROFILE,
  KWONMINSEOK_PROFILE,
  LIMJIYEON_PROFILE,
  HANSANGHOON_PROFILE,
  OHYERIM_PROFILE,
  JUNGWONHO_PROFILE,
  LEEJUNHYUK_PROFILE,
  BAEKHYUNJIN_PROFILE,
] as unknown as Candidate[]

function normalizeSchool(school?: string): string {
  return String(school ?? '')
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/대학교|대학|university|univ\.?/g, '')
    .trim()
}

function schoolDisplay(school?: string): string {
  return String(school ?? '').split(/\s+/)[0]
}

const STOP_TOKENS = new Set(['스타트업', '대표', '팀', '리드', '시니어', '주니어', '공동창업자', '독립'])

function workTokens(title?: string, highlights?: Highlight[]): Set<string> {
  const roles = (highlights ?? [])
    .filter((h) => h.categoryId === 'career-role')
    .map((h) => String((h.metadata as { role?: string } | undefined)?.role ?? ''))
  return new Set(
    [title ?? '', ...roles]
      .join(' ')
      .split(/[\s·,/|()]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !STOP_TOKENS.has(t)),
  )
}

function vibeLabels(life: PublicProfile['life']): string[] {
  return flattenVibe(life)
    .filter((e) => e.kind !== 'photo' && e.label)
    .map((e) => e.label!)
}

function viewerHasSignals(viewer: Pick<UserState, 'school' | 'title'>, highlights: Highlight[], labels: string[]) {
  return Boolean(normalizeSchool(viewer.school)) || workTokens(viewer.title, highlights).size > 0 || labels.length > 0
}

/** 매칭에 쓸 내 정보(학교·직무·바이브)가 하나라도 있는지 — 없으면 채우기 넛지 노출 */
export function hasMatchableInfo(viewer: Pick<UserState, 'school' | 'title' | 'life'> & { highlights: Highlight[] }): boolean {
  return viewerHasSignals(viewer, viewer.highlights, vibeLabels(viewer.life))
}

function feedbackCount(profile: Candidate): number {
  return (profile.reputationKeywords ?? []).reduce((sum, k) => sum + k.count, 0)
}

function activeRecommendation(profile: Candidate): TodayRecommendation {
  const chips: RecommendationChip[] = []
  const count = feedbackCount(profile)
  if (count > 0) chips.push({ signal: 'active', label: `받은 피드백 ${count}개` })
  if (profile.isVerified) chips.push({ signal: 'active', label: '본인 인증' })
  chips.push({ signal: 'active', label: '최근 프로필 업데이트' })
  return {
    profile,
    sentence: `${profile.name}님은 요즘 가장 활발하게 활동 중이에요`,
    chips: chips.slice(0, 3),
    isFallback: true,
  }
}

function matchRecommendation(
  profile: Candidate,
  viewer: { school?: string; title?: string; highlights: Highlight[]; labels: string[] },
): { score: number; rec: TodayRecommendation } | null {
  const chips: RecommendationChip[] = []
  const parts: Array<{ signal: RecommendationSignal; weight: number; sentence: string }> = []

  const viewerSchool = normalizeSchool(viewer.school)
  if (viewerSchool && normalizeSchool(profile.school) === viewerSchool) {
    const name = schoolDisplay(profile.school)
    chips.push({ signal: 'school', label: name })
    parts.push({ signal: 'school', weight: W_SCHOOL, sentence: `${profile.name}님과 ${name} 동문이에요` })
  }

  const myWork = workTokens(viewer.title, viewer.highlights)
  const sharedWork = Array.from(workTokens(profile.title, profile.manualHighlights)).filter((t) => myWork.has(t))
  if (sharedWork.length > 0) {
    sharedWork.slice(0, 2).forEach((t) => chips.push({ signal: 'work', label: t }))
    parts.push({
      signal: 'work',
      weight: W_WORK * Math.min(sharedWork.length, 2),
      sentence: `${profile.name}님도 ${sharedWork[0]} 일을 하고 있어요`,
    })
  }

  const myLabels = new Set(viewer.labels)
  const sharedVibe = vibeLabels(profile.life).filter((l) => myLabels.has(l))
  if (sharedVibe.length > 0) {
    sharedVibe.slice(0, 2).forEach((l) => chips.push({ signal: 'vibe', label: l }))
    parts.push({
      signal: 'vibe',
      weight: W_VIBE * Math.min(sharedVibe.length, 3),
      sentence: `${profile.name}님과 ${sharedVibe.slice(0, 2).map((l) => `「${l}」`).join('·')} 취향이 같아요`,
    })
  }

  if (parts.length === 0) return null
  const strongest = [...parts].sort((a, b) => b.weight - a.weight)[0]
  return {
    score: parts.reduce((sum, p) => sum + p.weight, 0),
    rec: { profile, sentence: strongest.sentence, chips: chips.slice(0, 3), isFallback: false },
  }
}

/** 오늘의 추천 후보를 우선순위대로 — 매칭 점수순, 그다음 활동량순 */
export function rankRecommendations(
  viewer: (Pick<UserState, 'linkId' | 'school' | 'title' | 'life'> & { highlights: Highlight[] }) | null,
): TodayRecommendation[] {
  const pool = CANDIDATES_BY_ACTIVITY.filter((p) => p.linkId !== viewer?.linkId)
  if (!viewer) return pool.map(activeRecommendation)

  const labels = vibeLabels(viewer.life)
  if (!viewerHasSignals(viewer, viewer.highlights, labels)) return pool.map(activeRecommendation)

  const matched: Array<{ score: number; order: number; rec: TodayRecommendation }> = []
  const rest: TodayRecommendation[] = []
  pool.forEach((profile, order) => {
    const result = matchRecommendation(profile, { school: viewer.school, title: viewer.title, highlights: viewer.highlights, labels })
    if (result) matched.push({ ...result, order })
    else rest.push(activeRecommendation(profile))
  })
  matched.sort((a, b) => b.score - a.score || a.order - b.order)
  return [...matched.map((m) => m.rec), ...rest]
}

// ─── 하루 고정 + 넘기기 기록 (목업: localStorage) ──────────────────────────────

const STORAGE_KEY = 'felore-today-recommendation'

interface DailyState {
  viewerKey: string
  date: string
  pickLinkId?: string
  skipsUsed: number
  /** linkId → 넘긴 날짜(YYYY-MM-DD) */
  skipped: Record<string, string>
}

export function todayKst(now = new Date()): string {
  return new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / (24 * 60 * 60 * 1000))
}

function loadState(viewerKey: string): DailyState {
  const today = todayKst()
  try {
    const raw = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as DailyState) : null
    if (parsed && parsed.viewerKey === viewerKey) {
      const skipped = Object.fromEntries(
        Object.entries(parsed.skipped ?? {}).filter(([, date]) => daysBetween(date, today) < SKIP_EXCLUDE_DAYS),
      )
      return parsed.date === today
        ? { ...parsed, skipped }
        : { viewerKey, date: today, skipsUsed: 0, skipped }
    }
  } catch {
    // 손상된 값은 무시하고 새로 시작
  }
  return { viewerKey, date: today, skipsUsed: 0, skipped: {} }
}

function saveState(state: DailyState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 저장 실패 시 이번 세션에서만 유지
  }
}

export function resolveTodayRecommendation(
  viewerKey: string,
  ranked: TodayRecommendation[],
): { recommendation: TodayRecommendation | null; skipsLeft: number } {
  const state = loadState(viewerKey)
  const available = ranked.filter((r) => !state.skipped[r.profile.linkId])
  const kept = state.pickLinkId ? available.find((r) => r.profile.linkId === state.pickLinkId) : undefined
  const recommendation = kept ?? available[0] ?? null
  saveState({ ...state, pickLinkId: recommendation?.profile.linkId })
  return { recommendation, skipsLeft: Math.max(0, DAILY_SKIP_LIMIT - state.skipsUsed) }
}

export function skipTodayRecommendation(viewerKey: string, linkId: string) {
  const state = loadState(viewerKey)
  if (state.skipsUsed >= DAILY_SKIP_LIMIT) return
  saveState({
    ...state,
    pickLinkId: undefined,
    skipsUsed: state.skipsUsed + 1,
    skipped: { ...state.skipped, [linkId]: state.date },
  })
}
