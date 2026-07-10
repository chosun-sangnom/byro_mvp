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
  onBack: () => void
  onEditBasic: () => void
  onEditWhoIAm: () => void
  onEditHighlight: () => void
  onEditLife: () => void
  onEditNetwork: () => void
  onEditReputation: () => void
  onEditSNS: () => void
  onEditContact: () => void
  user: UserState
  // [임시] 목업 초기화 — CRUD 연동 전 디자인 검토용. 실제 API 연동 후 제거 예정.
  onResetMockData: () => void
}

interface EditRow {
  title: string
  hint: string
  nudge: string
  meta?: string
  onClick: () => void
}

export function ManageByroScreen({
  allHighlights,
  profile,
  instagramConnected,
  linkedinConnected,
  onBack,
  onEditBasic,
  onEditWhoIAm,
  onEditHighlight,
  onEditLife,
  onEditNetwork,
  onEditReputation,
  onEditSNS,
  onEditContact,
  user,
  onResetMockData,
}: ManageByroScreenProps) {
  const whoIAm = (profile.whoIAm ?? user.whoIAm) as PublicProfileWhoIAm
  const life = (profile.life ?? user.life) as PublicProfileLife
  const activityCount = life.daily.exercise.length
  const cultureCount =
    life.tastes.movies.length +
    life.tastes.music.length +
    life.tastes.books.length +
    (life.tastes.plays?.length ?? 0)
  const placeCount =
    life.tastes.restaurants.length +
    life.tastes.cafes.length
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
    { label: '기본정보', done: Boolean(whoIAm.mbti) },
    { label: '하이라이트', done: allHighlights.length > 0 },

    { label: '바이브', done: activityCount + cultureCount + placeCount > 0 },
    { label: 'SNS', done: connectedSnsCount > 0 },
    { label: '연락수단', done: activeContactCount > 0 },
  ]
  const doneCount = completionChecks.filter((c) => c.done).length
  const completionPercent = Math.round((doneCount / completionChecks.length) * 100)
  const firstMissing = completionChecks.find((c) => !c.done)

  const sections: { title: string; rows: EditRow[] }[] = [
    {
      title: '프로필',
      rows: [
        {
          title: '프로필카드 편집',
          hint: '프로필사진 · 자기소개 · 생년월일',
          nudge: '얼굴 사진과 자기소개가 있으면 첫인상이 훨씬 기억에 남아요',
          meta: user.headline?.trim() || undefined,
          onClick: onEditBasic,
        },
        {
          title: '연락수단',
          hint: '전화 · 이메일 · 카카오 · 링크',
          nudge: '연락 수단이 없으면 만남으로 이어지기 어려워요',
          meta: activeContactCount > 0 ? `${activeContactCount}개 연결` : undefined,
          onClick: onEditContact,
        },
      ],
    },
    {
      title: 'WHO 탭',
      rows: [
        {
          title: '기본정보',
          hint: 'MBTI · 성향',
          nudge: 'MBTI와 성향이 있으면 케미 리포트가 더 정확해져요',
          meta: [whoIAm.mbti, whoIAm.personality ? '성향 있음' : undefined].filter(Boolean).join(' · ') || undefined,
          onClick: onEditWhoIAm,
        },
        {
          title: '하이라이트',
          hint: '경력 · 학력 · 수상 · 자격증 등',
          nudge: '경력과 학력을 채우면 만나기 전부터 신뢰가 생겨요',
          meta: allHighlights.length > 0 ? `${allHighlights.length}개 항목` : undefined,
          onClick: onEditHighlight,
        },
        {
          title: 'SNS',
          hint: '유튜브 · 틱톡 · 인스타 · 링크드인',
          nudge: '인스타·링크드인 연동으로 나다움이 더 드러나요',
          meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동` : undefined,
          onClick: onEditSNS,
        },
      ],
    },
    {
      title: 'VIBE 탭',
      rows: [
        {
          title: '바이브',
          hint: '반려동물 · 운동 · 플레이스 · 문화',
          nudge: '취향이 겹치면 어색한 첫 대화가 자연스러워져요',
          meta: activityCount + cultureCount + placeCount > 0
            ? `활동 ${activityCount} · 문화 ${cultureCount} · 장소 ${placeCount}`
            : undefined,
          onClick: onEditLife,
        },
      ],
    },
    {
      title: 'NETWORK 탭',
      rows: [
        {
          title: '네트워크',
          hint: '리멤버 명함 기반 자동 집계',
          nudge: '공통 인맥이 보이면 연결 고리가 생겨요',
          meta: `${profile.rememberHighlight.total}명 리멤버`,
          onClick: onEditNetwork,
        },
        {
          title: '평판',
          hint: '경험 키워드 · 방명록',
          nudge: '다른 사람이 남긴 키워드가 나를 증명해줘요',
          meta: totalReputationCount > 0 ? `누적 ${totalReputationCount}회 · 상위 ${visibleReputationCount}개 키워드` : undefined,
          onClick: onEditReputation,
        },
      ],
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="편집" onBack={onBack} />

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

        <div className="flex flex-col gap-5 mx-5 mt-4">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                {section.title}
              </p>
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
                {section.rows.map((row, i) => (
                  <button
                    key={row.title}
                    onClick={row.onClick}
                    className={[
                      'flex w-full items-center justify-between px-5 py-4 text-left transition-colors active:bg-white/[0.03]',
                      i < section.rows.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
                    ].join(' ')}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{row.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-tertiary)]">{row.hint}</p>
                      {row.meta ? (
                        <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-accent-dark)]">{row.meta}</p>
                      ) : (
                        <p className="mt-1 truncate text-[11px] text-[var(--color-text-secondary)]">💡 {row.nudge}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="ml-3 flex-shrink-0 text-[var(--color-text-tertiary)] opacity-30" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* [임시] 목업 초기화 버튼 — CRUD 연동 전 디자인 검토용. 실제 API 연동 후 제거 예정. */}
        <div className="mx-5 mt-2 mb-8">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] opacity-50">DEV ONLY</p>
          <button
            onClick={onResetMockData}
            className="w-full rounded-2xl border border-dashed border-[var(--color-border-soft)] py-3.5 text-[13px] font-semibold text-[var(--color-text-tertiary)] opacity-60 active:opacity-40"
          >
            목업 데이터로 초기화
          </button>
        </div>
      </div>
    </div>
  )
}
