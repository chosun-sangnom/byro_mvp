'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Avatar, NavBar, showToast } from '@/components/ui'
import { RECOMMENDED_ALL } from '@/lib/mocks/feedProfiles'
import { VerifiedBadge } from '@/components/screens/FeedScreen'

const PAGE_SIZE = 10

export default function RecommendedScreen() {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, RECOMMENDED_ALL.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const visibleProfiles = RECOMMENDED_ALL.slice(0, visibleCount)

  const handleProfileClick = (linkId: string | null) => {
    if (!linkId) {
      showToast('아직 준비 중인 프로필이에요')
      return
    }
    router.push(`/${linkId}`)
  }

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="추천 프로필" onBack={() => router.back()} />

      <div className="flex flex-col px-4 py-4">
        {visibleProfiles.map((p, i) => (
          <button
            key={`${p.linkId ?? p.name}-${i}`}
            onClick={() => handleProfileClick(p.linkId)}
            className="w-full flex items-center gap-2.5 py-2.5 text-left"
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

        {visibleCount < RECOMMENDED_ALL.length && (
          <div ref={loadMoreRef} className="py-4 text-center">
            <span className="micro-text">불러오는 중…</span>
          </div>
        )}
      </div>
    </div>
  )
}
