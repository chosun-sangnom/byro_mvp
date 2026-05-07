'use client'

import { motion } from 'framer-motion'
import { Stars } from 'lucide-react'
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
        <div className="mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-[11px] font-semibold shadow-sm"
            style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
          >
            <Stars size={12} style={{ color: 'var(--color-accent-brand)' }} />
            Live it, Prove It
          </div>
          <h1 className="mt-6 text-2xl tracking-tight text-[var(--color-text-strong)]">Byro</h1>
        </div>

        <h2 className="text-5xl tracking-tight mb-4 text-[var(--color-text-strong)]">
          Live it, Prove It
        </h2>

        <p className="text-xl mb-6 text-[var(--color-text-primary)]">
          설명하기 전에, 먼저 증명되는 프로필
        </p>

        <p className="text-sm leading-relaxed mb-10 text-[var(--color-text-secondary)] max-w-sm mx-auto">
          하나의 링크로 정체성, 검증된 하이라이트, 평판, SNS, 자기소개를 정리해 오프라인 비즈니스 네트워킹에 활용할 수 있는 프로필 서비스
        </p>

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
          {!isLoggedIn && (
            <div className="text-xs text-[var(--color-text-tertiary)]">
              샘플 프로필은 실제 기능이 아니라 플로우 검증용 화면이에요.
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div
            className="rounded-[2rem] p-4 shadow-2xl max-w-[320px] mx-auto"
            style={{
              background: 'linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-soft))',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div className="surface-card rounded-[1.5rem] p-6 shadow-inner">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                <div className="flex-1 text-left">
                  <div className="text-sm text-[var(--color-text-strong)]">김지원</div>
                  <div className="text-xs text-[var(--color-text-secondary)]">Product Designer</div>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-primary)] mb-4 text-left leading-relaxed">
                사용자 경험과 비즈니스 임팩트를 연결하는 디자이너입니다
              </p>

              <div className="space-y-2 mb-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 text-left">
                  <div className="text-[10px] text-indigo-600 mb-1">커리어 지속성</div>
                  <div className="text-xs text-[var(--color-text-primary)]">평균 대비 128% 장기 재직</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 text-left">
                  <div className="text-[10px] text-blue-600 mb-1">글로벌 활동</div>
                  <div className="text-xs text-[var(--color-text-primary)]">국제 프로젝트 다수 참여</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                >
                  신뢰할 수 있는
                </span>
                <span
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                >
                  통찰력 있는
                </span>
                <span
                  className="text-[10px] px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                >
                  전문적인
                </span>
              </div>

              <div className="rounded-xl p-3 text-left" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                <p className="text-[10px] text-[var(--color-text-secondary)] italic">&quot;함께 일하고 싶은 사람이에요&quot;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
