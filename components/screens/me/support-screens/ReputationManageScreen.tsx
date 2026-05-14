'use client'

import { NavBar } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'

export function ReputationManageScreen({
  onBack,
}: {
  onBack: () => void
}) {
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)
  const topKeywords = [...SAMPLE_PROFILE.reputationKeywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const getReputationCount = (keyword: string) =>
    SAMPLE_PROFILE.reputationKeywords.find((item) => item.keyword === keyword)?.count ?? 0

  const guestbook = SAMPLE_PROFILE.guestbook

  return (
    <div className="flex flex-col h-full">
      <NavBar title="평판 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* 상단 서머리 */}
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Summary</div>
          <div className="mt-1 text-[17px] font-black text-[var(--color-text-primary)]">함께한 사람들이 남긴 평판이에요</div>
          <div className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            나와 함께한 사람들이 선택한 키워드와 남긴 한마디가 쌓입니다. 프로필에는 상위 키워드와 최근 피드백이 노출돼요.
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              키워드 누적 {totalReputationCount}회
            </span>
            <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              피드백 {guestbook.length}개
            </span>
            {topKeywords.slice(0, 3).map((item) => (
              <span key={item.keyword} className="chip-metric">
                {item.keyword} <span className="ml-1 font-black text-[var(--color-text-strong)]">{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 받은 평판 키워드 */}
        <div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-text-primary)]">받은 평판</div>
          <div className="space-y-4">
            {REPUTATION_KEYWORD_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">{group.category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.keywords.map((keyword) => {
                    const count = getReputationCount(keyword)
                    return (
                      <div
                        key={keyword}
                        className={[
                          'rounded-full border px-3 py-1.5 text-xs font-semibold',
                          count > 0
                            ? 'border-[var(--color-accent-dark)] bg-[var(--color-accent-bg)] text-[var(--color-text-primary)]'
                            : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)] text-[var(--color-text-tertiary)]',
                        ].join(' ')}
                      >
                        {keyword}
                        <span className="ml-1.5 text-[10px] font-black opacity-80">{count > 0 ? count : '0'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 받은 피드백 */}
        <div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-text-primary)]">받은 피드백</div>
          {guestbook.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border-soft)] px-4 py-6 text-center text-[12px] text-[var(--color-text-tertiary)]">
              아직 받은 피드백이 없어요
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--color-border-soft)] divide-y divide-[var(--color-border-soft)] overflow-hidden">
              {guestbook.map((entry) => {
                const avatar = getProfileAvatar(entry.linkId)
                return (
                  <div key={entry.id} className="flex gap-3 px-4 py-3.5">
                    {avatar ? (
                      <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={avatar} alt={entry.authorName} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-xs font-bold text-[var(--color-text-secondary)]">
                        {entry.authorName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">{entry.authorName}</div>
                        <div className="text-[10px] text-[var(--color-text-tertiary)]">{entry.date}</div>
                      </div>
                      <div className="mt-1 text-[13px] leading-snug text-[var(--color-text-secondary)]">{entry.message}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
