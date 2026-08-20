'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileOwner } from '@/hooks/useProfileOwner'
import { getPublicProfileByUsername, getProfileAvatar } from '@/lib/mocks/publicProfiles'

const FEEDBACK_PAGE_SIZE = 10

// 실제 프로필 사진이 없는 작성자는 이니셜 아바타로 표시 — 순서대로 이 팔레트를 순환
const AVATAR_BG_PALETTE = ['#F4F2FE', '#EFF9FF', '#F5F6F7']

export default function GuestbookScreen({ username }: { username: string }) {
  const router = useRouter()
  const { isOwner: isOwnProfile, user } = useProfileOwner(username)
  const baseProfile = getPublicProfileByUsername(username)
  const profile = isOwnProfile && user
    ? {
      ...baseProfile,
      name: user.name,
      linkId: user.linkId,
      guestbook: baseProfile.guestbook,
    }
    : baseProfile

  const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const visibleEntries = profile.guestbook.slice(0, visibleCount)
  const hasMoreToLoad = visibleCount < profile.guestbook.length

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + FEEDBACK_PAGE_SIZE, profile.guestbook.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [profile.guestbook.length])

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-12 flex-shrink-0 items-center border-b px-5" style={{ borderColor: '#DEE4EC' }}>
        <button onClick={() => router.back()} className="mr-3 text-xl" style={{ color: '#475058' }}>‹</button>
        <span className="text-[16px] font-bold" style={{ color: '#0D0D0D' }}>{profile.name}님의 피드백</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-6 flex items-center gap-1">
          <span className="text-[22px] font-bold" style={{ color: '#0D0D0D' }}>받은 피드백</span>
          <span className="rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
            {profile.guestbook.length}개
          </span>
        </div>

        {profile.guestbook.length === 0 ? (
          <p className="py-6 text-center text-[13px]" style={{ color: '#A8B1BD' }}>아직 받은 피드백이 없어요</p>
        ) : (
          <div className="space-y-4">
            {visibleEntries.map((entry, i) => {
              const avatar = getProfileAvatar(entry.linkId)
              return (
                <div key={entry.id}>
                  <button
                    onClick={() => router.push(`/${entry.linkId}`)}
                    className="flex w-full items-start gap-2.5 text-left"
                  >
                    {avatar ? (
                      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar} alt={entry.authorName} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                        style={{ background: AVATAR_BG_PALETTE[i % AVATAR_BG_PALETTE.length] }}
                      >
                        <span className="text-[14px] font-bold" style={{ color: '#6C7786' }}>{entry.authorName.charAt(0)}</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{entry.authorName}</span>
                        {avatar && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/images/reputation-verified-badge.svg" alt="" className="h-3 w-3" />
                        )}
                        <span className="ml-1 text-[12px] font-medium" style={{ color: '#6C7786' }}>{entry.date}</span>
                      </div>
                      <p className="mt-1 text-[14px] font-medium" style={{ color: '#475058' }}>{entry.message}</p>
                    </div>
                  </button>
                  {i < visibleEntries.length - 1 && <div className="mt-4 h-px" style={{ background: '#DEE4EC' }} />}
                </div>
              )
            })}
          </div>
        )}
        {hasMoreToLoad && (
          <div ref={loadMoreRef} className="py-4 text-center">
            <span className="text-[11px]" style={{ color: '#A8B1BD' }}>불러오는 중…</span>
          </div>
        )}
      </div>
    </div>
  )
}
