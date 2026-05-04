'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { getPublicProfileByUsername, getProfileAvatar } from '@/lib/mockData'

export default function GuestbookScreen({ username }: { username: string }) {
  const router = useRouter()
  const store = useByroStore()
  const isOwnProfile = store.user?.linkId === username
  const baseProfile = getPublicProfileByUsername(username)
  const profile = isOwnProfile && store.user
    ? {
      ...baseProfile,
      name: store.user.name,
      linkId: store.user.linkId,
      guestbook: baseProfile.guestbook,
    }
    : baseProfile

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="flex items-center px-5 h-12 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border-soft)', backgroundColor: 'rgba(16,17,20,0.78)', backdropFilter: 'blur(12px)' }}>
        <button onClick={() => router.back()} className="text-sm text-[var(--color-text-secondary)] mr-3">‹</button>
        <div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-[0.18em]">Guestbook</div>
          <div className="text-[14px] font-bold text-[var(--color-text-strong)]">{profile.name}님의 방명록</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-[12px] text-[var(--color-text-tertiary)] mb-4">총 {profile.guestbook.length}개의 메시지가 쌓여 있어요.</div>
        <div className="divide-y divide-[var(--color-border-soft)]">
          {profile.guestbook.map((entry) => (
            <button
              key={entry.id}
              onClick={() => router.push(`/${entry.linkId}`)}
              className="flex w-full gap-3 py-4 text-left"
            >
              {getProfileAvatar(entry.linkId) ? (
                <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getProfileAvatar(entry.linkId)} alt={`${entry.authorName} 프로필 사진`} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-sm font-bold text-[var(--color-text-secondary)] flex-shrink-0">
                  {entry.authorName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{entry.authorName}</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{entry.date}</div>
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{entry.message}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
