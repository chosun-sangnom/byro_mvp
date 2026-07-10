'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { useProfileOwner } from '@/hooks/useProfileOwner'
import { getPublicProfileByUsername } from '@/lib/mocks/publicProfiles'
import type { Experience, PublicProfile } from '@/types'

export default function FeedbackScreen({ username }: { username: string }) {
  const router = useRouter()
  const store = useByroStore()
  const { isOwner: isOwnProfile } = useProfileOwner(username)
  const baseProfile = getPublicProfileByUsername(username)
  const profile = isOwnProfile && store.user
    ? { ...baseProfile, name: store.user.name, linkId: store.user.linkId }
    : baseProfile

  const submittedExps = store.submittedExperiences[profile.linkId] ?? []
  const allExperiences: Experience[] = [...submittedExps, ...((profile as PublicProfile).experiences ?? [])]

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
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Experience</div>
          <div className="text-[14px] font-bold text-[var(--color-text-strong)]">{profile.name}님의 경험</div>
        </div>
        <div className="ml-auto rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
          {allExperiences.length}개
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allExperiences.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[13px] text-[var(--color-text-tertiary)]">아직 남겨진 경험이 없어요</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border-soft)] px-5">
            {allExperiences.map((exp) => (
              <div key={exp.id} className="py-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[12px] font-bold text-[var(--color-text-secondary)]">
                      {exp.isAnonymous ? 'B' : (exp.authorName?.charAt(0) ?? '?')}
                    </div>
                    <span className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {exp.isAnonymous ? 'Byro사용자' : (exp.authorName ?? 'Byro사용자')}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)]">{exp.date}</span>
                </div>
                {exp.message && (
                  <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{exp.message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
