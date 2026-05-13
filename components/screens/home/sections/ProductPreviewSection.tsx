'use client'

import { motion } from 'framer-motion'
import { uiElements } from '@/components/screens/home/content'

export function ProductPreviewSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          실제로는 이렇게 보입니다
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div
            className="rounded-[2rem] p-4 shadow-2xl max-w-[360px] mx-auto"
            style={{
              background: 'linear-gradient(135deg, var(--color-bg-surface), var(--color-bg-soft))',
              border: '1px solid var(--color-border-default)',
            }}
          >
            <div className="surface-card rounded-[1.5rem] p-6 shadow-inner">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-dark)]" />
                  <div className="flex-1 text-left">
                    <div className="text-base text-[var(--color-text-strong)] mb-0.5">이서연</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Growth Product Manager</div>
                  </div>
                </div>

                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                  <p className="text-xs text-[var(--color-text-primary)] leading-relaxed">
                    데이터 기반 성장 전략을 설계하고 실행합니다. B2B SaaS 프로덕트 경험 4년차
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2">Highlights</div>
                  <div className="bg-[var(--color-accent-soft)] rounded-xl p-3">
                    <div className="text-[10px] text-[var(--color-accent-dark)] mb-1">리멤버 네트워크</div>
                    <div className="text-xs text-[var(--color-text-primary)]">스타트업 중심 인맥 구조</div>
                  </div>
                  <div className="bg-[var(--color-state-info-bg)] rounded-xl p-3">
                    <div className="text-[10px] text-[var(--color-state-info-text)] mb-1">강연 경험</div>
                    <div className="text-xs text-[var(--color-text-primary)]">Startup Conference 2025</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                  <div className="flex-1 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                  >
                    전략적인
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                  >
                    데이터 기반
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-primary)' }}
                  >
                    실행력 있는
                  </span>
                </div>

                <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-text-tertiary)' }} />
                    <div className="flex-1">
                      <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed italic">
                        &quot;문제를 빠르게 파악하고 해결하는 능력이 인상적이었습니다&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {uiElements.map((element, index) => (
            <motion.div
              key={element.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="surface-card rounded-xl p-4 shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center mb-3">
                <element.icon className="w-4 h-4 text-[var(--color-accent-dark)]" />
              </div>
              <div className="text-xs text-[var(--color-text-strong)] mb-1">{element.title}</div>
              <div className="text-[10px] text-[var(--color-text-tertiary)] leading-relaxed">
                {element.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
