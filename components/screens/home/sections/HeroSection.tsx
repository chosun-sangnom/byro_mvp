'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui'

type HeroSectionProps = {
  isLoggedIn: boolean
  primaryLabel: string
  secondaryLabel: string
  onPrimary: () => void
  onSecondary: () => void
  onSampleProfile: () => void
}

export function HeroSection({
  isLoggedIn,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onSampleProfile,
}: HeroSectionProps) {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold shadow-sm mb-6"
            style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
          >
            사람과의 만남에서 맥락이 먼저다
          </div>

          <h1 className="text-[42px] leading-[1.15] tracking-tight text-[var(--color-text-strong)] mb-4">
            프로필 하나로<br />첫 만남이 달라진다
          </h1>

          <p className="text-base leading-relaxed text-[var(--color-text-secondary)] max-w-sm mx-auto">
            커리어, 라이프스타일, 평판을 한 링크에 담아—<br />
            열어보는 순간 할 말이 생깁니다
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-12">
          <Button
            onClick={onPrimary}
            className="w-full h-12 text-white rounded-2xl shadow-lg"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            {primaryLabel}
          </Button>
          <Button
            variant="outline"
            onClick={onSecondary}
            className="w-full h-12 border-2 rounded-2xl"
          >
            {secondaryLabel}
          </Button>
          {!isLoggedIn && (
            <button
              onClick={onSampleProfile}
              className="text-sm font-medium text-[var(--color-text-secondary)]"
            >
              샘플 프로필 보기
            </button>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div
            className="rounded-[2rem] p-4 shadow-2xl max-w-[320px] mx-auto"
            style={{
              background: 'linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-soft))',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div className="surface-card rounded-[1.5rem] p-5 shadow-inner">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-3">
                Kemi Glow
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent-dark)]" />
                  <div className="text-xs text-[var(--color-text-strong)]">나</div>
                </div>
                <div className="flex-1 h-px bg-[var(--color-border-soft)]" />
                <div className="text-[10px] text-[var(--color-accent-dark)] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
                  공통점 3개
                </div>
                <div className="flex-1 h-px bg-[var(--color-border-soft)]" />
                <div className="flex items-center gap-1.5">
                  <div className="text-xs text-[var(--color-text-strong)]">상대</div>
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-muted)]" />
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: '출신 학교', value: '연세대학교' },
                  { label: '거주지', value: '마포구' },
                  { label: 'MBTI', value: 'ENTJ' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl px-3 py-2"
                    style={{ backgroundColor: 'var(--color-accent-soft)' }}
                  >
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">{item.label}</span>
                    <span className="text-[12px] font-semibold text-[var(--color-accent-dark)]">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  &quot;저 혹시 연대 나오셨어요?&quot; — 한 줄이면 된다
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
