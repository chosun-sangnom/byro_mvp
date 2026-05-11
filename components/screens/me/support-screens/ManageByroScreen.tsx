'use client'

import { ChevronRight } from 'lucide-react'
import type { Highlight, PublicProfileLife, UserState } from '@/types'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

interface ManageByroScreenProps {
  allHighlights: Highlight[]
  connectedSnsCount: number
  totalReputationCount: number
  onLogout: () => void
  onBack: () => void
  onEditBasic: () => void
  onEditWhoIAm: () => void
  onEditLife: () => void
  onEditHighlight: () => void
  onEditSNS: () => void
  onEditNetwork: () => void
  onEditReputation: () => void
  onEditContact: () => void
  onEditGuestbook: () => void
  user: UserState
}

interface EditRow {
  title: string
  meta: string
  onClick: () => void
}

export function ManageByroScreen({
  allHighlights,
  connectedSnsCount,
  totalReputationCount,
  onLogout,
  onBack,
  onEditBasic,
  onEditWhoIAm,
  onEditLife,
  onEditHighlight,
  onEditSNS,
  onEditNetwork,
  onEditReputation,
  onEditContact,
  onEditGuestbook,
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

  const rows: EditRow[] = [
    {
      title: '기본정보',
      meta: user.headline?.trim() ?? '한줄소개, 기분, 생년월일',
      onClick: onEditBasic,
    },
    {
      title: '나',
      meta: [whoIAm.mbti, petLabel].filter(Boolean).join(' · ') || 'MBTI, 반려동물',
      onClick: onEditWhoIAm,
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
      title: 'SNS',
      meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동` : '유튜브, 틱톡, 인스타, 링크드인',
      onClick: onEditSNS,
    },
    {
      title: '평판 키워드',
      meta: `${user.selectedKeywords.length}개 선택 · 누적 ${totalReputationCount}회`,
      onClick: onEditReputation,
    },
    {
      title: '연락수단',
      meta: activeContactCount > 0 ? `${activeContactCount}개 연결` : '전화, 이메일, 카카오',
      onClick: onEditContact,
    },
    {
      title: '방명록',
      meta: `${SAMPLE_PROFILE.guestbook.length}개 메시지`,
      onClick: onEditGuestbook,
    },
    {
      title: '연결 관리',
      meta: `${SAMPLE_PROFILE.rememberHighlight.total}명 리멤버 네트워크`,
      onClick: onEditNetwork,
    },
  ]

  return (
    <div className="flex h-full flex-col">

      {/* Nav */}
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.82)] px-5 backdrop-blur-md">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="flex-1 text-[15px] font-bold text-[var(--color-text-primary)]">편집</span>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* 프로필 미니 카드 */}
        <div className="flex items-center gap-4 px-5 py-6">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-dark)] text-[22px] font-bold text-white">
            {user.name?.charAt(0) ?? 'M'}
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[var(--color-text-primary)]">{user.name}</p>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">byro.io/@{user.linkId}</p>
            {user.headline?.trim() && (
              <p className="mt-1 truncate text-[13px] text-[var(--color-text-secondary)]">
                {user.headline}
              </p>
            )}
          </div>
        </div>

        {/* 편집 항목 리스트 */}
        <div className="mx-5 overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
          {rows.map((row, i) => (
            <button
              key={row.title}
              onClick={row.onClick}
              className={[
                'flex w-full items-center justify-between px-4 py-4 text-left transition-colors active:bg-white/[0.03]',
                i < rows.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  {row.title}
                </p>
                <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-tertiary)]">
                  {row.meta}
                </p>
              </div>
              <ChevronRight size={15} className="ml-3 flex-shrink-0 text-[var(--color-text-tertiary)]" />
            </button>
          ))}
        </div>

        {/* 로그아웃 */}
        <div className="px-5 py-8">
          <button
            onClick={onLogout}
            className="w-full text-center text-[13px] text-[var(--color-text-tertiary)]"
          >
            로그아웃
          </button>
        </div>

      </div>
    </div>
  )
}
