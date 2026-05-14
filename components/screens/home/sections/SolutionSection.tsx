'use client'

import { motion } from 'framer-motion'
import { solutionSteps } from '@/components/screens/home/content'

export function SolutionSection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-3 text-[var(--color-text-strong)]"
        >
          Byro가 해결합니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          첫 만남에 필요한 정보를 한 곳에 모읍니다
        </motion.p>

        <div className="space-y-5">
          {solutionSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="absolute -left-3 top-5 w-7 h-7 rounded-full bg-[var(--color-accent-dark)] flex items-center justify-center text-white text-xs shadow-lg z-10">
                {index + 1}
              </div>

              {index < solutionSteps.length - 1 && (
                <div className="absolute left-0.5 top-12 w-0.5 h-8 bg-gradient-to-b from-[var(--color-accent-border)] to-transparent" />
              )}

              <div className="surface-card rounded-2xl p-5 pl-9">
                <div className="flex items-center gap-2.5 mb-2">
                  <step.icon className="w-4 h-4 text-[var(--color-accent-dark)] flex-shrink-0" />
                  <h3 className="text-[15px] font-semibold text-[var(--color-text-strong)]">{step.title}</h3>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
