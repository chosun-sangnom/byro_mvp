'use client'

import { motion } from 'framer-motion'
import { highlightCards } from '@/components/screens/home/content'

export function HighlightSection() {
  return (
    <section
      className="py-20"
      style={{
        background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-bg-soft) 70%, transparent), var(--color-bg-page))',
      }}
    >
      <div className="max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-3xl tracking-tight mb-3 text-[var(--color-text-strong)]">
            자기소개보다 먼저 보이는
            <br />
            검증 하이라이트
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            말보다 신뢰를 남기는 정보만 골라 보여줍니다
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative mt-10"
      >
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide">
          {highlightCards.map((highlight, index) => (
            <motion.div
              key={highlight.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="surface-card rounded-2xl p-6 shadow-lg h-full">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${highlight.gradient} flex items-center justify-center mb-4 shadow-md`}
                >
                  <highlight.icon className="w-6 h-6 text-white" />
                </div>

                <div className="text-xs text-[var(--color-text-tertiary)] mb-2 uppercase tracking-wide">
                  {highlight.label}
                </div>

                <div className="text-base text-[var(--color-text-strong)] leading-relaxed">
                  {highlight.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-center gap-1.5 mt-6">
        {highlightCards.map((item) => (
          <div
            key={item.label}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--color-text-tertiary)' }}
          />
        ))}
      </div>
    </section>
  )
}
