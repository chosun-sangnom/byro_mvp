'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ChevronRight, Flame, PartyPopper, ThumbsUp, UserRound } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, showToast } from '@/components/ui'
import { LoginModal } from '@/components/screens/profile/LoginModal'
import { NEW_PROFILES, ACTIVE_PROFILES, RECOMMENDED_PREVIEW } from '@/lib/mocks/feedProfiles'

export function VerifiedBadge() {
  return <BadgeCheck size={12} className="shrink-0 fill-[#3B82F6] text-white" strokeWidth={2.5} />
}

function AccountCard() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <>
      <div className="mx-4 mt-4 surface-card flex items-center gap-3 rounded-[22px] px-4 py-4">
        {isLoggedIn && user ? (
          <>
            <Avatar src={user.avatarImage} name={user.name} color={user.avatarColor} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-[15px] font-bold text-[var(--color-text-primary)] truncate">{user.name}</p>
                {user.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{user.title}</p>
            </div>
            <Button variant="outline" size="sm" fullWidth={false} onClick={() => router.push('/me')}>
              내 프로필 보기
            </Button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center flex-shrink-0">
              <UserRound size={22} className="text-[var(--color-text-tertiary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[var(--color-text-primary)]">로그인이 필요해요</p>
              <p className="text-[12px] text-[var(--color-text-secondary)]">로그인하고 펠로어를 더 이용해보세요</p>
            </div>
            <Button variant="primary" size="sm" fullWidth={false} onClick={() => setLoginModalOpen(true)}>
              로그인하기
            </Button>
          </>
        )}
      </div>
      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  )
}

export default function FeedScreen() {
  const router = useRouter()

  const handleProfileClick = (linkId: string | null) => {
    if (!linkId) {
      showToast('아직 준비 중인 프로필이에요')
      return
    }
    router.push(`/${linkId}`)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <AccountCard />
      <div className="flex flex-col gap-10 px-4 pt-6 pb-2">

        {/* 새로 가입했어요 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <PartyPopper size={18} className="text-[#0088FF]" />
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#0088FF]">새로 가입했어요</h2>
          </div>
          <div className="flex gap-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {NEW_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="flex-shrink-0 flex flex-col items-center gap-2.5"
                style={{ width: 74 }}
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.fallbackColor} textColor={p.fallbackTextColor} size={56} />
                <div className="text-center w-full">
                  <div className="flex items-center justify-center gap-0.5">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] whitespace-nowrap">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] whitespace-nowrap">{p.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 추천 프로필 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ThumbsUp size={18} className="text-[#6155F5]" />
              <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#6155F5]">추천 프로필</h2>
            </div>
            <button
              onClick={() => router.push('/recommended')}
              className="text-[12px] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              더보기
            </button>
          </div>
          <div className="flex flex-col gap-5">
            {RECOMMENDED_PREVIEW.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="w-full flex items-center gap-2.5 text-left"
              >
                <Avatar src={p.avatarImage} name={p.name} color={p.fallbackColor} textColor={p.fallbackTextColor} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-0.5">
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* 활발하게 활동중 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <Flame size={18} className="text-[#FF523E]" />
            <h2 className="text-[17px] font-black tracking-[-0.03em] text-[#FF523E]">활발하게 활동중</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {ACTIVE_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileClick(p.linkId)}
                className="flex-shrink-0 flex flex-col items-start gap-2 text-left"
                style={{ width: 104 }}
              >
                {p.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatarImage}
                    alt={p.name}
                    className="w-full aspect-[3/4] rounded-2xl object-cover"
                  />
                ) : (
                  <div
                    className="w-full aspect-[3/4] rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: p.fallbackColor }}
                  >
                    <span
                      className="text-[16px] font-semibold"
                      style={{ color: p.fallbackTextColor ?? '#fff' }}
                    >
                      {p.name}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-0.5">
                    <p className="text-[12px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                    {p.avatarImage && <VerifiedBadge />}
                  </div>
                  <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </div>

      {/* 랜딩 페이지 링크 */}
      <div className="px-4 pb-10 pt-2 border-t border-[var(--color-border-soft)]">
        <button
          onClick={() => router.push('/landing')}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          <span>FELORE 서비스 소개 보기</span>
          <ChevronRight size={14} />
        </button>
      </div>

    </div>
  )
}
