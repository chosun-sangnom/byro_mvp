'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { getPublicProfileByUsername, getProfileAvatar } from '@/lib/mocks/publicProfiles'

export default function FeedbackScreen({ username }: { username: string }) {
  const router = useRouter()
  const store = useByroStore()
  const isOwnProfile = store.user?.linkId === username
  const baseProfile = getPublicProfileByUsername(username)
  const profile = isOwnProfile && store.user
    ? { ...baseProfile, name: store.user.name, linkId: store.user.linkId }
    : baseProfile

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div
        className="flex h-12 flex-shrink-0 items-center border-b px-5"
        style={{
          borderColor: 'var(--color-border-soft)',
          backgroundColor: 'var(--color-glass-mid)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button onClick={() => router.back()} className="mr-3 text-xl text-[var(--color-text-secondary)]">‹</button>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Feedback</div>
          <div className="text-[14px] font-bold text-[var(--color-text-strong)]">{profile.name}님의 피드백</div>
        </div>
        <div className="ml-auto rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
          {profile.guestbook.length}개
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {profile.guestbook.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-[var(--color-text-tertiary)]">아직 피드백이 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)] px-5">
            {profile.guestbook.map((entry) => (
              <button
                key={entry.id}
                onClick={() => router.push(`/${entry.linkId}`)}
                className="flex w-full gap-3 py-4 text-left"
              >
                {getProfileAvatar(entry.linkId) ? (
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getProfileAvatar(entry.linkId)}
                      alt={`${entry.authorName} 프로필 사진`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-sm font-bold text-[var(--color-text-secondary)]">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">{entry.authorName}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">{entry.date}</div>
                  </div>
                  <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                    {entry.message}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
