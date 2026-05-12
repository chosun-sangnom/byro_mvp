'use client'

import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">받은 평판</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Summary</div>
          <div className="mt-1 text-[18px] font-black text-[var(--color-text-primary)]">받은 평판은 직접 고르지 않아요</div>
          <div className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            다른 사람이 남긴 선택을 집계해서 보여줍니다. 프로필 주인이 미리 설정하는 값은 없고,
            실제로 받은 평판만 관계 탭에 노출됩니다.
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              누적 {totalReputationCount}회
            </span>
            {topKeywords.map((item) => (
              <span key={item.keyword} className="chip-metric">
                {item.keyword} <span className="ml-1 font-black text-[var(--color-text-strong)]">{item.count}</span>
              </span>
            ))}
          </div>
        </div>

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
                          ? 'border-[var(--color-accent-dark)] bg-[rgba(75,108,245,0.12)] text-[var(--color-text-primary)]'
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
    </div>
  )
}
