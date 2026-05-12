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
import { Button, BottomSheet, showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { ContactActionButton, ProfileHeroCard } from '@/components/screens/profile/PublicProfileSections'
import { PublicProfileTabBar, type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import { PublicProfileKemiZone } from '@/components/screens/profile/PublicProfileKemiZone'

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
  const [metaSheetOpen, setMetaSheetOpen] = useState(false)
  const [moodDraft, setMoodDraft] = useState(profile.headerMeta?.mood ?? '')
  const [availabilityDraft, setAvailabilityDraft] = useState(profile.headerMeta?.availability ?? '')
  const bioRef = useRef<HTMLParagraphElement | null>(null)

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

  const handleSaveHeaderMeta = () => {
    if (!store.user) return
    store.updateUserInfo({
      headerMeta: {
        ...profile.headerMeta,
        residence: profile.headerMeta?.residence ?? store.user.headerMeta?.residence ?? SAMPLE_PROFILE.headerMeta.residence,
        mood: moodDraft.trim(),
        availability: availabilityDraft.trim(),
      },
    })
    setMetaSheetOpen(false)
    showToast('오늘의 기분과 펑이 저장됐어요')
  }

  return (
    <div className="flex h-full flex-col">

      {/* ── 상단 Nav ── */}
      <div className="flex h-12 flex-shrink-0 items-center border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.78)] px-4 backdrop-blur-md">
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
              className="inline-flex h-8 items-center gap-2 rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.04)] pl-1.5 pr-3 text-[11px] font-semibold text-[var(--color-text-primary)]"
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
            <Share2 size={14} color="#B5AEA3" />
          </button>
        </div>
      </div>

      {/* ── 고정 헤더 영역 ── */}
      <div className="flex-shrink-0">
        <div className="relative px-5 pt-4 pb-1">
          {/* 인디고 ambient glow — 배경 분위기용 */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(75,108,245,0.14)_0%,transparent_68%)]" />
          <ProfileHeroCard
            profile={profile}
            heroTheme={profile.heroTheme}
            bioExpanded={bioExpanded}
            bioOverflowing={bioOverflowing}
            bioRef={bioRef}
            onToggleBio={() => setBioExpanded((prev) => !prev)}
            isOwnerMode={isOwnerMode}
            onEditHeaderMeta={isOwnerMode ? () => setMetaSheetOpen(true) : undefined}
          />
        </div>

        {/* 케미 존 — 로그인 시 viewer 기준 공통점 표시, 비로그인 시 blur 처리 */}
        <PublicProfileKemiZone kemi={profile.kemi} isLoggedIn={store.isLoggedIn} />

        {/* 나 / 라이프 / 관계 탭 */}
        <PublicProfileTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* ── 탭 콘텐츠 스크롤 영역 ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>

      {/* ── 고정 푸터 ── */}
      <div className="flex-shrink-0 border-t border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.9)] px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-md">

        {/* 평판 탭 visitor 전용 액션 — 방문자가 평판을 남길 수 있는 버튼 */}
        {/* TODO(reputation): 피드백 요청 / 경험 남기기 실제 플로우 연결 */}
        {showReputationActions && (
          <div className="mb-4 flex gap-3">
            <button
              onClick={() => showToast('피드백 요청을 보냈어요!')}
              className="flex-1 rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              피드백 요청
            </button>
            <button
              onClick={() => showToast('경험 남겨요 구조는 다음 단계에서 연결할 예정입니다.')}
              className="flex-1 rounded-full bg-[linear-gradient(135deg,#6D8BFF_0%,#4E63FF_100%)] py-3 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(78,99,255,0.28)]"
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
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--color-accent-dark)] bg-[rgba(75,108,245,0.08)] py-3 text-[13px] font-semibold text-[var(--color-accent-dark)]"
            >
              <Pencil size={14} />
              편집
            </button>
            <button
              onClick={onOwnerManageConnections ?? (() => showToast('연결 관리를 준비 중이에요'))}
              className="flex flex-1 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
            >
              연결 관리
            </button>
          </div>
        ) : (
          <button
            onClick={() => showToast('연결 요청을 보냈어요!')}
            className="mb-4 w-full rounded-full border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.02)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
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

      <BottomSheet open={metaSheetOpen} onClose={() => setMetaSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">오늘의 기분 · 펑 수정</div>
          <div className="mb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            프로필 카드에서 바로 보이는 상태값이라, 짧고 가볍게 적는 편이 좋습니다.
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text-secondary)]">오늘의 기분</label>
              <input
                value={moodDraft}
                onChange={(event) => setMoodDraft(event.target.value)}
                placeholder="예: 집중 모드"
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--color-text-secondary)]">펑</label>
              <input
                value={availabilityDraft}
                onChange={(event) => setAvailabilityDraft(event.target.value)}
                placeholder="예: 오늘 저녁 커피챗 가능"
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={() => setMetaSheetOpen(false)}>닫기</Button>
            <Button onClick={handleSaveHeaderMeta}>저장</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
