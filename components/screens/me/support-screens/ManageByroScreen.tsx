'use client'

import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import type { Highlight, PublicProfileLife, UserState } from '@/types'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

interface ManageByroScreenProps {
  allHighlights: Highlight[]
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
  meta: string
  onClick: () => void
}

export function ManageByroScreen({
  allHighlights,
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
  const whoIAm = user.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const life: PublicProfileLife = user.life ?? SAMPLE_PROFILE.life
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
  const connectedSnsCount =
    Number(SAMPLE_PROFILE.instagramConnected) + Number(SAMPLE_PROFILE.linkedinConnected)
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce(
    (sum, item) => sum + item.count,
    0,
  )
  const visibleReputationCount = SAMPLE_PROFILE.reputationKeywords.filter((item) =>
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
      meta: [user.headline?.trim(), whoIAm.mbti, petLabel].filter(Boolean).join(' · ') || '한줄소개, MBTI, 반려동물',
      onClick: onEditBasic,
    },
    {
      title: '하이라이트',
      meta: allHighlights.length > 0 ? `${allHighlights.length}개 항목` : '경험 추가',
      onClick: onEditHighlight,
    },
    {
      title: '라이프',
      meta: `활동 ${activityCount} · 문화 ${cultureCount} · 장소 ${placeCount}`,
      onClick: onEditLife,
    },
    {
      title: '네트워크',
      meta: `${SAMPLE_PROFILE.rememberHighlight.total}명 리멤버`,
      onClick: onEditNetwork,
    },
    {
      title: '평판',
      meta: `누적 ${totalReputationCount}회 · 상위 ${visibleReputationCount}개 키워드`,
      onClick: onEditReputation,
    },
    {
      title: 'SNS',
      meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동` : '유튜브, 틱톡, 인스타, 링크드인',
      onClick: onEditSNS,
    },
    {
      title: '연락수단',
      meta: activeContactCount > 0 ? `${activeContactCount}개 연결` : '전화, 이메일, 카카오',
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
                <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-tertiary)]">{row.meta}</p>
              </div>
              <ChevronRight size={14} className="ml-3 flex-shrink-0 text-[var(--color-text-tertiary)] opacity-30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
