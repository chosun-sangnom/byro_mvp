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

type ManageRow = {
  title: string
  meta: string
  onClick: () => void
}

type ManageSection = {
  title: string
  rows: ManageRow[]
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
  const activeContactCount = user.contactChannels?.filter((channel) => channel.enabled && channel.value.trim()).length ?? 0
  const whoIAm = user.whoIAm ?? SAMPLE_PROFILE.whoIAm
  const life: PublicProfileLife = user.life ?? SAMPLE_PROFILE.life
  const sajuProfile = user.sajuProfile ?? SAMPLE_PROFILE.sajuProfile
  const petLabel = life.daily.petName ? `${life.daily.pet} · ${life.daily.petName}` : life.daily.pet
  const activityCount = life.daily.exercise.length + (life.tastes.teams?.length ?? 0)
  const cultureCount = life.tastes.movies.length + life.tastes.music.length + life.tastes.books.length + (life.tastes.plays?.length ?? 0)
  const placeCount = life.tastes.restaurants.length + life.tastes.cafes.length + life.places.travelDestinations.length
  const completionChecks = [
    { label: '프로필 사진', done: Boolean(user.avatarImage) },
    {
      label: '기본정보',
      done: Boolean(
        user.headline?.trim()
        && user.headerMeta?.mood?.trim()
        && sajuProfile?.birthDate
        && sajuProfile.birthPlace.trim()
        && (sajuProfile.isBirthTimeUnknown || sajuProfile.birthTime),
      ),
    },
    { label: '나', done: Boolean(whoIAm.mbti && petLabel) },
    {
      label: '라이프',
      done: activityCount + cultureCount + placeCount > 0,
    },
    { label: '연락 수단', done: activeContactCount > 0 },
    { label: 'SNS 연동', done: connectedSnsCount > 0 },
    { label: '하이라이트', done: allHighlights.length > 0 },
  ]
  const completionPercent = Math.round((completionChecks.filter((item) => item.done).length / completionChecks.length) * 100)
  const remainingItems = completionChecks.filter((item) => !item.done).slice(0, 3)
  const manageSections: ManageSection[] = [
    {
      title: '기본정보',
      rows: [
        {
          title: '기본정보',
          meta: user.headline?.trim() ? '사진, 한줄소개, 생년월일, 생시, 출생지, 오늘의 기분 편집' : '기본정보를 먼저 채워주세요',
          onClick: onEditBasic,
        },
      ],
    },
    {
      title: '나',
      rows: [
        { title: '나', meta: `${whoIAm.mbti} · ${petLabel}`, onClick: onEditWhoIAm },
        { title: '하이라이트', meta: allHighlights.length > 0 ? `${allHighlights.length}개 항목 관리` : '프로필에 보여줄 경험을 추가하세요', onClick: onEditHighlight },
      ],
    },
    {
      title: '라이프',
      rows: [
        {
          title: '라이프',
          meta: `활동 ${activityCount}개 · 문화 ${cultureCount}개 · 장소 ${placeCount}개`,
          onClick: onEditLife,
        },
      ],
    },
    {
      title: '관계',
      rows: [
        { title: '네트워크', meta: `${SAMPLE_PROFILE.rememberHighlight.total}명 리멤버 네트워크`, onClick: onEditNetwork },
        { title: 'SNS 연동', meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동됨` : '유튜브, 틱톡, 인스타그램, 링크드인을 관리하세요', onClick: onEditSNS },
        { title: '평판 키워드', meta: `선택 ${user.selectedKeywords.length}개 · 누적 ${totalReputationCount}회`, onClick: onEditReputation },
        { title: '방명록', meta: `${SAMPLE_PROFILE.guestbook.length}개 메시지 관리`, onClick: onEditGuestbook },
      ],
    },
    {
      title: '연락수단',
      rows: [
        { title: '연락 수단', meta: activeContactCount > 0 ? `${activeContactCount}개 연결됨` : '전화, 이메일, 카카오를 연결하세요', onClick: onEditContact },
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.82)] backdrop-blur-md flex-shrink-0">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black flex-1">Byro 편집</span>
        <button onClick={onLogout} className="text-xs text-[var(--color-text-tertiary)]">로그아웃</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 py-4">
          <div className="settings-shell mb-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Profile Completion</div>
                <div className="mt-2 text-[19px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">프로필 완성도 {completionPercent}%</div>
                <div className="meta-text mt-1">
                  {remainingItems.length > 0
                    ? `${remainingItems.map((item) => item.label).join(', ')} 항목을 채우면 더 좋아져요.`
                    : '기본 프로필 구성이 완료됐어요.'}
                </div>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {completionChecks.filter((item) => item.done).length}/{completionChecks.length}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
              <div className="h-full rounded-full bg-[var(--color-accent-dark)]" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Manage</div>
            <div className="mt-2 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">Byro 편집</div>
            <div className="meta-text mt-1 leading-relaxed">각 항목을 눌러 별도 페이지에서 수정하세요.</div>
          </div>
          <div className="space-y-4">
            {manageSections.map((section) => (
              <div key={section.title}>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
                  {section.title}
                </div>
                <div className="settings-shell overflow-hidden p-2.5">
                  {section.rows.map((row, index) => (
                    <button
                      key={`${section.title}-${row.title}`}
                      onClick={row.onClick}
                      className={`settings-row flex w-full items-center gap-4 px-4 py-3.5 text-left ${index > 0 ? 'mt-2' : ''}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">{row.title}</div>
                        <div className="mt-1 text-[11px] leading-[1.5] text-white/48">{row.meta}</div>
                      </div>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/56">
                        <ChevronRight size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
