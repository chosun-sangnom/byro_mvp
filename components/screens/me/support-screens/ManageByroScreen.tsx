'use client'

import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import type { Highlight, PublicProfile, PublicProfileLife, PublicProfileWhoIAm, UserState } from '@/types'

interface ManageByroScreenProps {
  allHighlights: Highlight[]
  profile: PublicProfile
  instagramConnected: boolean
  linkedinConnected: boolean
  onLogout: () => void
  onBack: () => void
  onEditBasic: () => void
  onEditHighlight: () => void
  onEditLife: () => void
  onEditNetwork: () => void
  onEditReputation: () => void
  onEditSNS: () => void
  onEditContact: () => void
  user: UserState
}

interface EditRow {
  title: string
  hint: string
  meta?: string
  onClick: () => void
}

export function ManageByroScreen({
  allHighlights,
  profile,
  instagramConnected,
  linkedinConnected,
  onLogout,
  onBack,
  onEditBasic,
  onEditHighlight,
  onEditLife,
  onEditNetwork,
  onEditReputation,
  onEditSNS,
  onEditContact,
  user,
}: ManageByroScreenProps) {
  const whoIAm = (profile.whoIAm ?? user.whoIAm) as PublicProfileWhoIAm
  const life = (profile.life ?? user.life) as PublicProfileLife
  const petLabel = life.daily.petName
    ? `${life.daily.pet} · ${life.daily.petName}`
    : life.daily.pet
  const activityCount = life.daily.exercise.length + (life.tastes.teams?.length ?? 0)
  const cultureCount =
    life.tastes.movies.length +
    life.tastes.music.length +
    life.tastes.books.length +
    (life.tastes.plays?.length ?? 0)
  const placeCount =
    life.tastes.restaurants.length +
    life.tastes.cafes.length +
    life.places.travelDestinations.length
  const activeContactCount =
    user.contactChannels?.filter((ch) => ch.enabled && ch.value.trim()).length ?? 0
  const connectedSnsCount = Number(instagramConnected) + Number(linkedinConnected)
  const reputationKeywords = profile.reputationKeywords ?? []
  const totalReputationCount = reputationKeywords.reduce(
    (sum, item) => sum + item.count,
    0,
  )
  const visibleReputationCount = reputationKeywords.filter((item) =>
    REPUTATION_KEYWORD_GROUPS.some((group) => group.keywords.includes(item.keyword)),
  ).length

  const completionChecks = [
    { label: '기본정보', done: Boolean(user.headline?.trim() && whoIAm.mbti) },
    { label: '하이라이트', done: allHighlights.length > 0 },
    { label: '라이프', done: activityCount + cultureCount + placeCount > 0 },
    { label: 'SNS', done: connectedSnsCount > 0 },
    { label: '연락수단', done: activeContactCount > 0 },
  ]
  const doneCount = completionChecks.filter((c) => c.done).length
  const completionPercent = Math.round((doneCount / completionChecks.length) * 100)
  const firstMissing = completionChecks.find((c) => !c.done)

  const rows: EditRow[] = [
    {
      title: '기본정보',
      hint: '프로필사진 · MBTI · 자기소개',
      meta: [user.headline?.trim(), whoIAm.mbti, petLabel].filter(Boolean).join(' · ') || undefined,
      onClick: onEditBasic,
    },
    {
      title: '하이라이트',
      hint: '경력 · 학력 · 수상 · 자격증 등',
      meta: allHighlights.length > 0 ? `${allHighlights.length}개 항목` : undefined,
      onClick: onEditHighlight,
    },
    {
      title: '라이프',
      hint: '반려동물 · 운동 · 음식 · 카페 · 여행지 · 문화',
      meta: activityCount + cultureCount + placeCount > 0
        ? `활동 ${activityCount} · 문화 ${cultureCount} · 장소 ${placeCount}`
        : undefined,
      onClick: onEditLife,
    },
    {
      title: '네트워크',
      hint: '리멤버 명함 기반 자동 집계',
      meta: `${profile.rememberHighlight.total}명 리멤버`,
      onClick: onEditNetwork,
    },
    {
      title: '평판',
      hint: '경험 키워드 · 방명록',
      meta: totalReputationCount > 0 ? `누적 ${totalReputationCount}회 · 상위 ${visibleReputationCount}개 키워드` : undefined,
      onClick: onEditReputation,
    },
    {
      title: 'SNS',
      hint: '유튜브 · 틱톡 · 인스타 · 링크드인',
      meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동` : undefined,
      onClick: onEditSNS,
    },
    {
      title: '연락수단',
      hint: '전화 · 이메일 · 카카오 · 링크',
      meta: activeContactCount > 0 ? `${activeContactCount}개 연결` : undefined,
      onClick: onEditContact,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="편집" onBack={onBack} right={<button onClick={onLogout} className="text-xs text-[var(--color-text-tertiary)]">로그아웃</button>} />

      <div className="flex-1 overflow-y-auto">

        {/* 완성도 */}
        <div className="mx-5 mt-5 rounded-2xl border border-[var(--color-border-soft)] px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
              프로필 완성도
            </p>
            <p className="text-[13px] font-bold text-[var(--color-accent-dark)]">
              {completionPercent}%
            </p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent-dark)] transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {firstMissing && (
            <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
              {firstMissing.label} 항목을 채우면 더 좋아져요
            </p>
          )}
        </div>

        <div className="mx-5 mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
          {rows.map((row, i) => (
            <button
              key={row.title}
              onClick={row.onClick}
              className={[
                'flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-white/[0.03]',
                i < rows.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{row.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">{row.hint}</p>
                {row.meta && (
                  <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-accent-dark)]">{row.meta}</p>
                )}
              </div>
              <ChevronRight size={14} className="ml-3 flex-shrink-0 text-[var(--color-text-tertiary)] opacity-30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
