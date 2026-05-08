'use client'

import { Sparkles } from 'lucide-react'
import type { KemiData } from '@/types'

// TODO(AI): When real kemi endpoint is wired up, this component receives
// viewer-relative match data. The aiCopy field should be replaced with a
// streaming LLM response generated server-side from full profile context.

export function PublicProfileKemiZone({
  kemi,
  isLoggedIn,
}: {
  kemi?: KemiData
  isLoggedIn: boolean
}) {
  if (!kemi) return null

  return (
    <div className="px-5 pb-3">
      <div
        className="rounded-[20px] px-4 py-4"
        style={{
          border: '1px solid rgba(75,108,245,0.22)',
          background: 'linear-gradient(135deg, rgba(75,108,245,0.09) 0%, rgba(75,108,245,0.03) 100%)',
        }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center gap-1.5">
          <Sparkles size={12} style={{ color: 'var(--color-accent-dark)' }} />
          <span
            className="text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            {kemi.matchCount}가지 케미
          </span>
        </div>

        {isLoggedIn ? (
          <>
            {/* Match chips with Kemi Glow */}
            <div className="flex flex-wrap gap-1.5">
              {kemi.matchItems.map((item) => (
                <span
                  key={item.label}
                  className="chip-metric"
                  style={{
                    boxShadow:
                      '0 0 0 1px rgba(75,108,245,0.45), 0 0 12px rgba(75,108,245,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  {item.label}
                </span>
              ))}
            </div>

            {/* AI copy — conversation starter */}
            {/* TODO(AI): Stream this from LLM; for now static mock text */}
            <p className="mt-3 text-[13px] leading-[1.65] text-[var(--color-text-secondary)]">
              {kemi.aiCopy}
            </p>

            {/* TODO(premium): Unlock full Kemi Report */}
            <button
              type="button"
              className="mt-3 text-[12px] font-semibold"
              style={{ color: 'var(--color-accent-dark)' }}
              onClick={() => {}}
            >
              케미 리포트 전체 보기 →
            </button>
          </>
        ) : (
          /* Non-logged-in: blurred nudge */
          <div className="relative">
            <div
              className="pointer-events-none flex flex-wrap gap-1.5"
              style={{ filter: 'blur(5px)', opacity: 0.5 }}
            >
              {['●●●●', '●●●', '●●●●●'].map((s, i) => (
                <span key={i} className="chip-metric">{s}</span>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-[12px] font-semibold"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                로그인하면 케미가 보여요
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
