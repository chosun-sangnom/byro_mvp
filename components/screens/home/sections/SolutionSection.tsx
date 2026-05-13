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
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          Byro는 흩어진 신호를
          <br />
          하나의 신뢰 프로필로 정리합니다
        </motion.h2>

        <div className="space-y-6">
          {solutionSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="absolute -left-3 top-0 w-8 h-8 rounded-full bg-[var(--color-accent-dark)] flex items-center justify-center text-white text-sm shadow-lg">
                {index + 1}
              </div>

              <div className="surface-card rounded-2xl p-6 pl-10">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-bg)] flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-[var(--color-accent-dark)]" />
                  </div>
                  <h3 className="text-lg pt-2 text-[var(--color-text-strong)]">{step.title}</h3>
                </div>

                <ul className="space-y-2 ml-1">
                  {step.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
                      <span className="text-[var(--color-accent-dark)] mt-1">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {index < solutionSteps.length - 1 && (
                <div className="absolute left-1 top-full w-0.5 h-6 bg-gradient-to-b from-[var(--color-accent-border)] to-transparent -mt-2" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
