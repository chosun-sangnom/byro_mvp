'use client'

import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'

export function GuestbookManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const entries = SAMPLE_PROFILE.guestbook.filter((entry) => !store.deletedGuestbookIds.includes(entry.id))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">방명록 관리</span>
        <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">{entries.length}개</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? (
          <div className="text-center text-sm text-[var(--color-text-tertiary)] mt-16">받은 방명록이 없어요</div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 rounded-[18px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-3 py-3">
                {getProfileAvatar(entry.linkId) ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[var(--color-bg-muted)] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getProfileAvatar(entry.linkId)} alt={entry.authorName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] flex-shrink-0">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-[var(--color-text-strong)]">{entry.authorName}</div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)]">{entry.date}</div>
                  </div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">{entry.message}</div>
                </div>
                <button
                  onClick={() => { store.deleteGuestbookEntry(entry.id); showToast('방명록을 삭제했어요') }}
                  className="flex-shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-state-danger-text)] transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
