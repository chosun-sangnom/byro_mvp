'use client'

/**
 * PublicProfileShell
 *
 * 공개 프로필의 전체 레이아웃 컨테이너.
 * - 상단 nav: 뒤로가기 / URL / 액션 버튼
 * - 고정 헤더 영역: 히어로 카드 → 케미 존 → 탭바
 * - 스크롤 영역: 탭 콘텐츠 (children)
 * - 고정 푸터: 편집(owner) or 저장 버튼(visitor) + 연락처
 *
 * owner 판별: store.user.linkId === username && isLoggedIn
 * TODO(auth): 실제 인증 연동 시 서버사이드 세션으로 owner 판별 교체
 */

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { BottomSheet, TextArea, showToast } from '@/components/ui'
import { getNormalizedPublicProfile, computeTabAccess } from '@/components/screens/profile/publicProfileData'
import { generatePersona } from '@/lib/personaGen'
import { ContactActionButton } from '@/components/screens/profile/PublicProfileSections'
import { ProfileHeroSection } from '@/components/screens/profile/PublicProfileHeroSection'
import { PublicProfileTabBar, type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import { PublicProfileKemiZone, PublicProfileOwnerMatchZone } from '@/components/screens/profile/PublicProfileKemiZone'
import { PublicProfileCompatibilitySheet } from '@/components/screens/profile/PublicProfileCompatibilitySheet'


export function PublicProfileShell({
  username,
  activeTab,
  onTabChange,
  onOwnerEdit,
  children,
}: {
  username: string
  activeTab: PublicProfileTabId
  onTabChange: (tab: PublicProfileTabId) => void
  onOwnerEdit?: () => void
  children: ReactNode
}) {
  const router = useRouter()
  const store = useByroStore()
  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })

  const isOwnerMode = store.isLoggedIn && store.user?.linkId === username

  // [임시] 오너 모드에서만 페르소나 생성 (목업 데이터 기반)
  const persona = isOwnerMode ? generatePersona(profile) : null

  const isSaved = store.savedProfiles.some((p) => p.linkId === profile.linkId)
  const tabAccessCtx = { isOwner: isOwnerMode, isLoggedIn: store.isLoggedIn }

  const tabAccess = {
    who: computeTabAccess(profile.tabVisibility, 'who', tabAccessCtx),
    life: computeTabAccess(profile.tabVisibility, 'life', tabAccessCtx),
    reputation: computeTabAccess(profile.tabVisibility, 'reputation', tabAccessCtx),
  }

  // 케미 로딩 트리거: 비로그인이거나 오너이면 케미 없음
  const kemiAlreadyComputed = store.kemiComputedProfiles.includes(profile.linkId)
  const shouldComputeKemi = store.isLoggedIn && !isOwnerMode && !!profile.kemi
  const [kemiLoading, setKemiLoading] = useState(shouldComputeKemi && !kemiAlreadyComputed)

  useEffect(() => {
    if (!shouldComputeKemi || kemiAlreadyComputed) return
    const timer = setTimeout(() => {
      store.markKemiComputed(profile.linkId)
      setKemiLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.linkId])

  const [compatibilityOpen, setCompatibilityOpen] = useState(false)
  const [feedbackRequestOpen, setFeedbackRequestOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [bookmarkSheetOpen, setBookmarkSheetOpen] = useState(false)
  const [bookmarkMemo, setBookmarkMemo] = useState('')
  const [unsaveSheetOpen, setUnsaveSheetOpen] = useState(false)

  // 관계 탭에서만 "피드백 요청" 버튼 표시 (visitor only)
  const showReputationActions = activeTab === 'reputation' && !isOwnerMode

  return (
    <div className="flex h-full flex-col">


      {/* ── 고정 헤더 영역 ── */}
      <div className="flex-shrink-0">
        <div className="relative pb-1">
          <ProfileHeroSection
            profile={profile}
            heroTheme={profile.heroTheme}
            personaText={persona?.text}
            personaReasons={persona?.reasons}
            personaImage={persona?.image}
            isOwner={isOwnerMode}
            isBookmarked={store.isLoggedIn && !isOwnerMode ? isSaved : undefined}
            onBookmarkClick={store.isLoggedIn && !isOwnerMode
              ? () => {
                  if (isSaved) {
                    setUnsaveSheetOpen(true)
                  } else {
                    setBookmarkMemo('')
                    setBookmarkSheetOpen(true)
                  }
                }
              : undefined
            }
          />
        </div>

        {isOwnerMode ? (
          <PublicProfileOwnerMatchZone whoIAm={profile.whoIAm} life={profile.life} />
        ) : store.isLoggedIn ? (
          <PublicProfileKemiZone
            kemi={profile.kemi}
            isLoggedIn={store.isLoggedIn}
            isLoading={kemiLoading}
            onCompatibilityOpen={profile.whoIAm ? () => setCompatibilityOpen(true) : undefined}
          />
        ) : null}

        {/* 나 / 라이프 / 관계 탭 */}
        <PublicProfileTabBar activeTab={activeTab} onTabChange={onTabChange} tabAccess={tabAccess} />
      </div>

      {/* ── 탭 콘텐츠 스크롤 영역 ── */}
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>

      {/* ── 고정 푸터 ── */}
      <div className="flex-shrink-0 border-t border-[var(--color-border-soft)] bg-[var(--color-glass-strong)] px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)] backdrop-blur-md">

        {/* 평판 탭 visitor 전용 액션 */}
        {showReputationActions && (
          <button
            onClick={() => setFeedbackRequestOpen(true)}
            className="mb-4 w-full rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] py-3 text-[13px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap"
          >
            피드백 요청
          </button>
        )}

        {/* 메인 CTA */}
        {isOwnerMode ? (
          <div className="mb-4">
            <button
              onClick={onOwnerEdit ?? (() => router.push('/me'))}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--color-accent-dark)] bg-[var(--color-accent-bg-subtle)] py-3 text-[13px] font-semibold text-[var(--color-accent-dark)] whitespace-nowrap"
            >
              <Pencil size={14} />
              편집
            </button>
          </div>
        ) : !store.isLoggedIn ? (
          <button
            onClick={() => router.push('/signup')}
            className="mb-4 w-full rounded-full py-3 text-[13px] font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            로그인하고 저장하기
          </button>
        ) : null}

        {/* 연락처 채널 */}
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

      {/* 저장 시트 */}
      {!isOwnerMode && (
        <BottomSheet open={bookmarkSheetOpen} onClose={() => setBookmarkSheetOpen(false)}>
          <div className="px-5 pb-6">
            <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">
              {profile.name}님 저장
            </div>
            <p className="mb-5 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              아카이브에 저장하고 메모를 남길 수 있어요.
            </p>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              메모 <span className="font-normal normal-case tracking-normal">(선택)</span>
            </label>
            <TextArea
              value={bookmarkMemo}
              onChange={setBookmarkMemo}
              placeholder="어디서 만났는지, 어떤 분인지 메모해두세요."
              maxLength={100}
              rows={3}
              dark
            />
            <div className="mb-5 text-right text-[11px] text-[var(--color-text-tertiary)]">
              {bookmarkMemo.length}/100
            </div>
            <button
              onClick={() => {
                store.saveProfile(profile.linkId, profile.name, profile.title, bookmarkMemo)
                setBookmarkSheetOpen(false)
                showToast(`${profile.name}님을 저장했어요`)
              }}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              저장하기
            </button>
          </div>
        </BottomSheet>
      )}

      {/* 저장 취소 확인 시트 */}
      {!isOwnerMode && (
        <BottomSheet open={unsaveSheetOpen} onClose={() => setUnsaveSheetOpen(false)}>
          <div className="px-5 pb-6">
            <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">
              저장을 취소할까요?
            </div>
            <p className="mb-6 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              {profile.name}님이 아카이브에서 삭제돼요.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  store.unsaveProfile(profile.linkId)
                  setUnsaveSheetOpen(false)
                  showToast(`${profile.name}님을 저장 목록에서 삭제했어요`)
                }}
                className="w-full rounded-full border py-3.5 text-[14px] font-semibold whitespace-nowrap"
                style={{ borderColor: 'rgba(198,40,40,0.28)', color: 'var(--color-state-danger-text)' }}
              >
                저장 취소
              </button>
              <button
                onClick={() => setUnsaveSheetOpen(false)}
                className="w-full rounded-full py-3.5 text-[14px] font-semibold whitespace-nowrap"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                닫기
              </button>
            </div>
          </div>
        </BottomSheet>
      )}

      {!isOwnerMode && profile.whoIAm && (
        <PublicProfileCompatibilitySheet
          open={compatibilityOpen}
          onClose={() => setCompatibilityOpen(false)}
          profileName={profile.name}
          profileAvatar={profile.profileImages?.[0] ?? profile.avatarImage}
          whoIAm={profile.whoIAm}
          life={profile.life}
          kemi={profile.kemi}
        />
      )}

      {!isOwnerMode && (
        <BottomSheet open={feedbackRequestOpen} onClose={() => { setFeedbackRequestOpen(false); setFeedbackMessage('') }}>
          <div className="px-5 pb-6">
            <div className="mb-1 text-[18px] font-black text-[var(--color-text-strong)]">
              {profile.name}님께 피드백 요청
            </div>
            <p className="mb-5 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              {profile.name}님이 나에 대한 경험을 남겨줄 수 있도록 요청해요.
            </p>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              한마디 <span className="font-normal normal-case tracking-normal text-[var(--color-text-tertiary)]">(선택)</span>
            </label>
            <TextArea
              value={feedbackMessage}
              onChange={setFeedbackMessage}
              placeholder="요청 이유나 인사를 남겨보세요."
              maxLength={100}
              rows={3}
              dark
            />
            <div className="mb-5 text-right text-[11px] text-[var(--color-text-tertiary)]">
              {feedbackMessage.length}/100
            </div>
            <button
              onClick={() => {
                setFeedbackRequestOpen(false)
                setFeedbackMessage('')
                showToast('피드백 요청을 보냈어요')
              }}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              요청 보내기
            </button>
          </div>
        </BottomSheet>
      )}

    </div>
  )
}
