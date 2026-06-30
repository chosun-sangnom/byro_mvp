'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Avatar, ToastSingleton, showToast } from '@/components/ui'
import AppHeader from '@/components/layout/AppHeader'
import { useByroStore } from '@/store/useByroStore'
import { getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { UserState, Highlight } from '@/types'

type FeedProfile = {
  linkId: string | null
  name: string
  title: string
  avatarImage?: string
  avatarColor?: string
}

const NEW_PROFILES: FeedProfile[] = [
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg', avatarColor: '#D8C4B2' },
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg', avatarColor: '#D4CABF' },
  { linkId: null, name: '박서연', title: 'UX 디자이너', avatarColor: '#9BADD0' },
  { linkId: null, name: '최유진', title: 'AI 연구원', avatarColor: '#8BA89B' },
  { linkId: null, name: '한다은', title: '투자심사역', avatarColor: '#C4A8C0' },
]

const ACTIVE_PROFILES: FeedProfile[] = [
  { linkId: 'gangminjun', name: '강민준', title: 'Product Owner', avatarImage: '/images/mj1.jpg', avatarColor: '#DCC5B6' },
  { linkId: 'jiminlee', name: '이지민', title: '스타트업 마케터', avatarImage: '/images/jimin-profile-5x4.jpg', avatarColor: '#D8C4B2' },
  { linkId: null, name: '홍준표', title: 'VC 파트너', avatarColor: '#A8B8A0' },
  { linkId: null, name: '백승우', title: 'PM', avatarColor: '#C4B89A' },
]

const RECOMMENDED_PROFILES: FeedProfile[] = [
  { linkId: 'mk', name: '강명구', title: 'Byth CEO', avatarImage: '/images/MK_img.jpeg', avatarColor: '#D4CABF' },
  { linkId: 'gangminjun', name: '강민준', title: 'B2B SaaS Product Owner · 스타트업 공동창업자', avatarImage: '/images/mj1.jpg', avatarColor: '#DCC5B6' },
  { linkId: null, name: '김영선', title: 'CMO · 패션 이커머스', avatarColor: '#C4A89A' },
  { linkId: null, name: '이준혁', title: '변호사 · 스타트업 전문', avatarColor: '#9AACC4' },
]

function calcCompleteness(user: UserState | null, highlights: Highlight[]): number {
  if (!user) return 0
  let score = 0
  if (user.avatarImage) score += 15
  if (user.title?.trim()) score += 15
  if (user.bio?.trim()) score += 20
  if (highlights.length > 0) score += 25
  if (user.whoIAm?.mbti?.trim()) score += 10
  if (user.life?.daily?.exercise?.length || user.life?.tastes?.movies?.length) score += 10
  if (user.contactChannels?.some((c) => c.enabled)) score += 5
  return Math.min(score, 100)
}

function MyProfileCard() {
  const router = useRouter()
  const { user, highlights, isLoggedIn } = useByroStore()

  if (!isLoggedIn || !user) return null

  const pct = calcCompleteness(user, highlights)
  const isDone = pct >= 100

  return (
    <div className="mx-4 mt-4 mb-1 rounded-[20px] overflow-hidden bg-[#0F0F10]">
      <div className="px-4 pt-4 pb-3">
        {/* 상단: 아바타 + 이름/직함 + 버튼 */}
        <div className="flex items-center gap-3">
          <Avatar
            src={user.avatarImage}
            name={user.name}
            color={user.avatarColor ?? 'var(--color-accent-dark)'}
            size={52}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-black text-white truncate">{user.name}</p>
            <p className="text-[12px] text-white/50 truncate mt-0.5">{user.title}</p>
          </div>
          <button
            onClick={() => router.push('/me')}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[#0F0F10] bg-white"
          >
            내 바이로 보기
          </button>
        </div>

        {/* 완성도 바 */}
        <div className="mt-4">
          <div className="relative h-2 rounded-full bg-white/10 overflow-visible">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: isDone ? '#22c55e' : 'var(--color-accent-light)',
              }}
            />
            {/* % 뱃지 */}
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[10px] font-black text-white"
              style={{
                left: `${Math.min(pct, 96)}%`,
                backgroundColor: isDone ? '#22c55e' : 'var(--color-accent-dark)',
              }}
            >
              {pct}%
            </span>
          </div>
          {!isDone && (
            <p className="mt-3 text-[11px] text-white/40 text-center">
              프로필을 완성하면 더 많은 사람들이 나를 발견할 수 있어요!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FeedScreen() {
  const router = useRouter()
  const { savedProfiles, isLoggedIn } = useByroStore()

  const handleProfileClick = (linkId: string | null) => {
    if (!linkId) {
      showToast('아직 준비 중인 프로필이에요')
      return
    }
    router.push(`/${linkId}`)
  }

  return (
    <ToastSingleton>
      <div className="relative mx-auto w-full max-w-[430px] min-h-dvh flex flex-col bg-[var(--color-bg-page)]">

        <AppHeader />

        {/* Feed */}
        <div className="flex-1 overflow-y-auto">

          {/* 내 프로필 카드 */}
          <MyProfileCard />

          {/* 아카이브한 사람들 */}
          {isLoggedIn && savedProfiles.length > 0 && (
            <section className="pt-5 pb-4">
              <div className="flex items-center justify-between px-5 mb-3">
                <h2 className="text-[15px] font-black text-[var(--color-text-strong)]">저장한 프로필</h2>
                <button
                  onClick={() => router.push('/archive')}
                  className="text-[12px] font-semibold text-[var(--color-accent-dark)]"
                >
                  전체보기
                </button>
              </div>
              <div className="flex gap-4 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {savedProfiles.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileClick(p.linkId)}
                    className="flex-shrink-0 flex flex-col items-center gap-2"
                    style={{ width: 64 }}
                  >
                    <Avatar
                      src={getProfileAvatar(p.linkId)}
                      name={p.name}
                      size={52}
                    />
                    <div className="text-center w-full">
                      <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{p.title.split(' · ')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {(isLoggedIn && savedProfiles.length > 0) && (
            <div className="h-px mx-5 bg-[var(--color-border-soft)]" />
          )}

          {/* 새로 가입했어요 */}
          <section className="pt-5 pb-4">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-3">새로 가입했어요</h2>
            <div className="flex gap-4 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {NEW_PROFILES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleProfileClick(p.linkId)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  style={{ width: 72 }}
                >
                  <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={60} />
                  <div className="text-center w-full">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{p.title.split(' · ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px mx-5 bg-[var(--color-border-soft)]" />

          {/* 활발하게 활동 중 */}
          <section className="pt-5 pb-4">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-3">활발하게 활동 중</h2>
            <div className="flex gap-4 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {ACTIVE_PROFILES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleProfileClick(p.linkId)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                  style={{ width: 72 }}
                >
                  <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={60} />
                  <div className="text-center w-full">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">{p.title.split(' · ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px mx-5 bg-[var(--color-border-soft)]" />

          {/* 추천 프로필 */}
          <section className="pt-5 pb-8">
            <h2 className="px-5 text-[15px] font-black text-[var(--color-text-strong)] mb-1">추천 프로필</h2>
            {RECOMMENDED_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.avatarColor} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              </button>
            ))}
          </section>

          {/* 랜딩 페이지 링크 */}
          <div className="px-5 pb-10 pt-2 border-t border-[var(--color-border-soft)]">
            <button
              onClick={() => router.push('/landing')}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              <span>Byro 서비스 소개 보기</span>
              <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </div>
    </ToastSingleton>
  )
}
