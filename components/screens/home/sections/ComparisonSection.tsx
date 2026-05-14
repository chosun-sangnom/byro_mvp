'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
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
          className="text-3xl tracking-tight text-center mb-3 text-[var(--color-text-strong)]"
        >
          다른 도구들과
          <br />
          무엇이 다른가요
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          그 사람을 알 수 있는 맥락을 제공하는 도구는 없었습니다
        </motion.p>

        <div className="space-y-3">
          {comparisons.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className={`relative rounded-2xl p-5 border ${item.isHighlight ? 'border-2' : 'border'}`}
              style={
                item.isHighlight
                  ? { borderColor: 'var(--color-accent-brand-soft)', backgroundColor: 'var(--color-bg-page)' }
                  : { borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-page)' }
              }
            >
              {item.isHighlight && (
                <div className="absolute -top-3 left-5">
                  <div className="bg-[var(--color-accent-dark)] text-white text-[10px] px-3 py-1 rounded-full shadow-md">
                    Byro만의 차이
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${item.isHighlight ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-primary)]'}`}>
                      {item.name}
                    </span>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-snug mb-2">
                    {item.description}
                  </p>
                  {item.missing && (
                    <div className="flex items-center gap-1.5">
                      <X className="w-3 h-3 text-[var(--color-text-tertiary)] flex-shrink-0" />
                      <span className="text-[12px] text-[var(--color-text-tertiary)]">{item.missing}</span>
                    </div>
                  )}
                  {item.highlight && (
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-[var(--color-accent-dark)] flex-shrink-0" />
                      <span className="text-[12px] font-medium text-[var(--color-accent-dark)]">{item.highlight}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
