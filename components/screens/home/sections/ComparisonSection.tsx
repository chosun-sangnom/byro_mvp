'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, X } from 'lucide-react'
import { comparisons } from '@/components/screens/home/content'

export function ComparisonSection() {
  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-soft) 45%, transparent)' }}
    >
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-4 text-[var(--color-text-strong)]"
        >
          간단함과 전문성,
          <br />
          그 사이의 완벽한 균형
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          오프라인 네트워킹에 최적화된 신뢰 프로필
        </motion.p>

        <div className="grid grid-cols-3 gap-3">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`${
                item.isHighlight ? 'bg-white border-2 shadow-lg' : 'bg-white border shadow-sm'
              } rounded-2xl p-4 relative`}
              style={
                item.isHighlight
                  ? { borderColor: 'var(--color-accent-brand-soft)' }
                  : { borderColor: 'var(--color-border-default)' }
              }
            >
              {item.isHighlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] px-3 py-1 rounded-full shadow-md">
                    Best
                  </div>
                </div>
              )}

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 mx-auto`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>

              <div className={`text-sm text-center mb-4 ${item.isHighlight ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-primary)]'}`}>
                {item.name}
              </div>

              <div className="space-y-2">
                {item.features.map((feature) => (
                  <div key={feature.text} className="flex items-center gap-1.5">
                    {feature.available ? (
                      <Check className={`w-3 h-3 flex-shrink-0 ${item.isHighlight ? 'text-indigo-600' : 'text-[var(--color-text-tertiary)]'}`} />
                    ) : (
                      <X className="w-3 h-3 flex-shrink-0 text-[var(--color-border-default)]" />
                    )}
                    <span
                      className={`text-[10px] leading-tight ${
                        feature.available
                          ? item.isHighlight
                            ? 'text-[var(--color-text-strong)]'
                            : 'text-[var(--color-text-secondary)]'
                          : 'text-[var(--color-text-tertiary)]'
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs text-indigo-700">신뢰 기반 오프라인 네트워킹의 새로운 기준</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
