'use client'

/**
 * PublicProfileShell
 *
 * 공개 프로필의 전체 레이아웃 컨테이너.
 * - 상단 nav: 뒤로가기 / URL / 액션 버튼
 * - 고정 헤더 영역: 히어로 카드 → 케미 존 → 탭바
 * - 스크롤 영역: 탭 콘텐츠 (children)
 * - 고정 푸터: 편집(owner) or 연결 요청(visitor) + 연락처
 *
 * owner 판별: store.user.linkId === username && isLoggedIn
 * TODO(auth): 실제 인증 연동 시 서버사이드 세션으로 owner 판별 교체
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Share2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, BottomSheet, TextArea, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { ContactActionButton } from '@/components/screens/profile/PublicProfileSections'
import { ProfileHeroCard } from '@/components/screens/profile/PublicProfileHeroSection'
import { PublicProfileTabBar, type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import { PublicProfileKemiZone, PublicProfileOwnerMatchZone } from '@/components/screens/profile/PublicProfileKemiZone'
import { PublicProfileCompatibilitySheet } from '@/components/screens/profile/PublicProfileCompatibilitySheet'

const DEFAULT_MOOD_OPTIONS = [
  '집중 모드',
  '사색 모드',
  '산책 가고 싶은 날',
  '여유 있는 날',
  '에너지 좋은 날',
  '대화 환영',
] as const

export function PublicProfileShell({
  username,
  activeTab,
  onTabChange,
  onOwnerEdit,
  onOwnerManageConnections,
  children,
}: {
  username: string
  activeTab: PublicProfileTabId
  onTabChange: (tab: PublicProfileTabId) => void
  onOwnerEdit?: () => void
  onOwnerManageConnections?: () => void
  children: ReactNode
}) {
  const router = useRouter()
  const store = useByroStore()
  const profile = getNormalizedPublicProfile({ username, user: store.user })

  // owner mode: 로그인 상태이고 현재 보는 프로필이 본인인 경우
  const isOwnerMode = store.isLoggedIn && store.user?.linkId === username

  const [bioExpanded, setBioExpanded] = useState(false)
  const [bioOverflowing, setBioOverflowing] = useState(false)
  const [moodSheetOpen, setMoodSheetOpen] = useState(false)
  const [pungSheetOpen, setPungSheetOpen] = useState(false)
  const [compatibilityOpen, setCompatibilityOpen] = useState(false)
  const [connectionRequestOpen, setConnectionRequestOpen] = useState(false)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [moodDraft, setMoodDraft] = useState(profile.headerMeta?.mood ?? '')
  const [availabilityDraft, setAvailabilityDraft] = useState(profile.headerMeta?.availability ?? '')
  const bioRef = useRef<HTMLParagraphElement | null>(null)
  const moodOptions = moodDraft && !DEFAULT_MOOD_OPTIONS.includes(moodDraft as (typeof DEFAULT_MOOD_OPTIONS)[number])
    ? [moodDraft, ...DEFAULT_MOOD_OPTIONS]
    : DEFAULT_MOOD_OPTIONS
  const resetHeaderDrafts = () => {
    setMoodDraft(profile.headerMeta?.mood ?? '')
    setAvailabilityDraft(profile.headerMeta?.availability ?? '')
  }

  useEffect(() => {
    setBioExpanded(false)
  }, [profile.bio, username])

  useEffect(() => {
    setMoodDraft(profile.headerMeta?.mood ?? '')
    setAvailabilityDraft(profile.headerMeta?.availability ?? '')
  }, [profile.headerMeta?.mood, profile.headerMeta?.availability, username])

  useEffect(() => {
    const checkOverflow = () => {
      const element = bioRef.current
      if (!element) return
      setBioOverflowing(element.scrollHeight - element.clientHeight > 2)
    }
    if (bioExpanded) return
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [profile.bio, bioExpanded])

  // 관계 탭에서만 "피드백 요청 / 경험 남기기" 버튼 표시 (visitor only)
  const showReputationActions = activeTab === 'reputation' && !isOwnerMode

  const updateHeaderMeta = (next: {
    mood?: string
    availability?: string
  }) => {
    if (!store.user) return
    store.updateUserInfo({
      headerMeta: {
        ...profile.headerMeta,
        residence: profile.headerMeta?.residence ?? store.user.headerMeta?.residence ?? SAMPLE_PROFILE.headerMeta.residence,
        mood: next.mood ?? profile.headerMeta?.mood ?? '',
        availability: next.availability ?? profile.headerMeta?.availability ?? '',
      },
    })
  }

  const handleSaveMood = () => {
    updateHeaderMeta({
      mood: moodDraft.trim(),
      availability: profile.headerMeta?.availability ?? availabilityDraft.trim(),
    })
    setMoodSheetOpen(false)
    showToast('오늘의 기분이 저장됐어요')
  }

  const handleSavePung = () => {
    updateHeaderMeta({
      mood: profile.headerMeta?.mood ?? moodDraft.trim(),
      availability: availabilityDraft.trim(),
    })
    setPungSheetOpen(false)
    showToast('펑이 저장됐어요')
  }

  return (
    <div className="flex h-full flex-col">

      {/* ── 상단 Nav ── */}
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] bg-[var(--color-glass-mid)] px-4 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="mr-2 text-sm text-[var(--color-text-secondary)]"
        >
          ‹
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            Public Profile
          </div>
          <div className="truncate text-xs text-[var(--color-text-secondary)]">
            byro.io/@{profile.linkId}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {store.isLoggedIn ? (
            <button
              onClick={() => router.push('/me')}
              className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] pl-1.5 pr-3 text-[11px] font-semibold text-[var(--color-text-primary)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-dark)] text-[10px] font-black text-white">
                {store.user?.name?.charAt(0) ?? 'M'}
              </span>
              <span>{isOwnerMode ? '내 Byro' : '내 프로필'}</span>
            </button>
          ) : null}

          {/* TODO(share): 실제 공유 링크 생성 연동 */}
          <button
            onClick={() => showToast('공유 링크를 준비 중이에요')}
            className="icon-button"
          >
            <Share2 size={14} color="var(--color-text-tertiary)" />
          </button>
        </div>
      </div>

      {/* ── 고정 헤더 영역 ── */}
      <div className="flex-shrink-0">
        <div className="relative px-5 pt-4 pb-1">
          {/* 인디고 ambient glow — 배경 분위기용 */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-accent-bg-subtle)_0%,transparent_68%)]" />
          <ProfileHeroCard
            profile={profile}
            heroTheme={profile.heroTheme}
            bioExpanded={bioExpanded}
            bioOverflowing={bioOverflowing}
            bioRef={bioRef}
            onToggleBio={() => setBioExpanded((prev) => !prev)}
            isOwnerMode={isOwnerMode}
            onEditMood={isOwnerMode ? () => setMoodSheetOpen(true) : undefined}
            onEditPung={isOwnerMode ? () => setPungSheetOpen(true) : undefined}
          />
        </div>

        {isOwnerMode ? (
          <PublicProfileOwnerMatchZone whoIAm={profile.whoIAm} life={profile.life} />
        ) : (
          <PublicProfileKemiZone
            kemi={profile.kemi}
            isLoggedIn={store.isLoggedIn}
            onCompatibilityOpen={profile.whoIAm ? () => setCompatibilityOpen(true) : undefined}
          />
        )}

        {/* 나 / 라이프 / 관계 탭 */}
        <PublicProfileTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* ── 탭 콘텐츠 스크롤 영역 ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>

      {/* ── 고정 푸터 ── */}
      <div className="flex-shrink-0 border-t border-[var(--color-border-soft)] bg-[var(--color-glass-strong)] px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-md">

        {/* 평판 탭 visitor 전용 액션 — 방문자가 평판을 남길 수 있는 버튼 */}
        {/* TODO(reputation): 피드백 요청 / 경험 남기기 실제 플로우 연결 */}
        {showReputationActions && (
          <div className="mb-4 flex gap-3">
            <button
              onClick={() => showToast('피드백 요청을 보냈어요!')}
              className="flex-1 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              피드백 요청
            </button>
            <button
              onClick={() => showToast('경험 남겨요 구조는 다음 단계에서 연결할 예정입니다.')}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,var(--color-accent-light)_0%,var(--color-accent-dark)_100%)] py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_var(--color-accent-glow)]"
            >
              + 경험 남기기
            </button>
          </div>
        )}

        {/* 메인 CTA — owner: 편집 + 연결 관리 / visitor: 연결 요청 */}
        {isOwnerMode ? (
          <div className="mb-4 flex gap-3">
            <button
              onClick={onOwnerEdit ?? (() => router.push('/me'))}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-accent-dark)] bg-[var(--color-accent-bg-subtle)] py-3 text-[13px] font-semibold text-[var(--color-accent-dark)]"
            >
              <Pencil size={14} />
              편집
            </button>
            <button
              onClick={onOwnerManageConnections ?? (() => showToast('연결 관리를 준비 중이에요'))}
              className="flex flex-1 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              연결 관리
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConnectionRequestOpen(true)}
            className="mb-4 w-full rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
          >
            연결 요청
          </button>
        )}

        {/* 연락처 채널 — 전화 / 이메일 / 카카오 */}
        {/* TODO(contact): 공개 여부 설정에 따라 채널 노출 제어 필요 */}
        <div>
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            Contact
          </div>
          <div className="flex justify-around">
            {profile.contactChannels.map((channel) => (
              <ContactActionButton
                key={channel.id}
                channel={channel}
                onClick={() => {
                  if (!channel.enabled) {
                    showToast('비활성화된 연락 수단이에요')
                    return
                  }
                  if (!channel.href) {
                    showToast('연결 정보를 준비 중이에요')
                    return
                  }
                  window.open(channel.href, channel.href.startsWith('http') ? '_blank' : '_self')
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {!isOwnerMode && profile.whoIAm && (
        <PublicProfileCompatibilitySheet
          open={compatibilityOpen}
          onClose={() => setCompatibilityOpen(false)}
          profileName={profile.name}
          whoIAm={profile.whoIAm}
          life={profile.life}
        />
      )}

      {!isOwnerMode && (
        <BottomSheet open={connectionRequestOpen} onClose={() => { setConnectionRequestOpen(false); setConnectionMessage('') }}>
          <div className="px-5 pb-6">
            <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">
              {profile.name}님께 연결 요청
            </div>
            <p className="mb-5 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              요청이 수락되면 연결된 사람 목록에 추가돼요.
            </p>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              한마디 <span className="font-normal normal-case tracking-normal text-[var(--color-text-tertiary)]">(선택)</span>
            </label>
            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              placeholder="연결을 원하는 이유나 간단한 인사를 남겨보세요."
              maxLength={100}
              rows={3}
              className="mb-1 w-full resize-none rounded-[16px] border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-4 py-3 text-[14px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
            <div className="mb-5 text-right text-[11px] text-[var(--color-text-tertiary)]">
              {connectionMessage.length}/100
            </div>
            <button
              onClick={() => {
                setConnectionRequestOpen(false)
                setConnectionMessage('')
                showToast('연결 요청을 보냈어요')
              }}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              요청 보내기
            </button>
          </div>
        </BottomSheet>
      )}

      <BottomSheet open={moodSheetOpen} onClose={() => { resetHeaderDrafts(); setMoodSheetOpen(false) }}>
        <div className="px-5 pb-6">
          <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">오늘의 기분</div>
          <div className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            지금의 상태를 빠르게 고르는 값입니다. 카드에서는 짧은 배지로 노출됩니다.
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[var(--color-text-secondary)]">선택</label>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((option) => {
                const selected = moodDraft === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMoodDraft(option)}
                    className={[
                      'rounded-full border px-3 py-2 text-xs font-semibold transition-colors',
                      selected
                        ? 'border-[var(--color-accent-dark)] bg-[var(--color-accent-bg)] text-[var(--color-text-primary)]'
                        : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)]',
                    ].join(' ')}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => { resetHeaderDrafts(); setMoodSheetOpen(false) }}>닫기</Button>
            <Button onClick={handleSaveMood}>저장</Button>
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={pungSheetOpen} onClose={() => { resetHeaderDrafts(); setPungSheetOpen(false) }}>
        <div className="px-5 pb-6">
          <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">펑 열기</div>
          <div className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            펑은 지금 가능한 제안이나 한마디를 직접 적는 별도 입력입니다.
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text-secondary)]">내용</label>
              <TextArea
                value={availabilityDraft}
                onChange={setAvailabilityDraft}
                placeholder="예: 오늘 저녁 성수에서 커피챗 가능"
                maxLength={48}
                rows={3}
                dark
              />
              <div className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">
                짧지만 구체적으로 적는 편이 좋습니다. 지금 가능한 시간이나 장소가 있으면 함께 적어주세요.
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">Preview</div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--color-text-primary)]">
                <span>💬</span>
                <span>{availabilityDraft.trim() || '오늘 가능한 제안을 적어보세요'}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => { resetHeaderDrafts(); setPungSheetOpen(false) }}>닫기</Button>
            <Button onClick={handleSavePung}>저장</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
