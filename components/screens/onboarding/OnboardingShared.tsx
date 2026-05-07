import type { ReactNode } from 'react'
import { Button } from '@/components/ui'

export function StepIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="surface-card px-5 py-5 mb-5 rounded-[30px]">
      {eyebrow && (
        <div className="mb-3 inline-flex rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          {eyebrow}
        </div>
      )}
      <h2 className="text-[24px] font-black leading-tight mb-2 tracking-[-0.03em]">{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">{description}</p>
    </div>
  )
}

export function SelectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
  tone = 'default',
  onClick,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  badge?: string
  children?: ReactNode
  tone?: 'default' | 'accent'
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-[26px] border px-4 py-4',
        tone === 'accent'
          ? 'border-[rgba(212,170,84,0.4)] bg-[rgba(212,170,84,0.08)]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5 text-[var(--color-text-secondary)]">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="text-sm font-black text-[var(--color-text-strong)]">{title}</div>
            {badge && (
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-[var(--color-bg-muted)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)]">
                {badge}
              </span>
            )}
          </div>
          <div className="meta-text leading-relaxed">{subtitle}</div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </button>
  )
}

export function StepFooter({
  canNext,
  onNext,
  onPrev,
  onSkip,
  nextLabel = '다음',
  prevLabel = '이전',
  skipLabel = '건너뛰기',
}: {
  canNext: boolean
  onNext: () => void
  onPrev?: () => void
  onSkip?: () => void
  nextLabel?: string
  prevLabel?: string
  skipLabel?: string
}) {
  return (
    <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.85)] backdrop-blur-md space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>{prevLabel}</Button>
        <Button onClick={onNext} disabled={!canNext}>{nextLabel}</Button>
      </div>
      {onSkip && (
        <button className="w-full text-center text-sm text-[var(--color-text-secondary)]" onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </div>
  )
}
