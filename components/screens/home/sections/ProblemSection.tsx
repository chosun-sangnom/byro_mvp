'use client'

import { motion } from 'framer-motion'
import { problems } from '@/components/screens/home/content'

export function ProblemSection() {
  return (
    <section
      className="px-6 py-20"
      style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-soft) 70%, transparent)' }}
    >
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          명함은 연락처를 보여주지만,
          <br />
          나를 증명해주지는 않습니다
        </motion.h2>

        <div className="space-y-4">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface-card rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-bg-muted)' }}
                >
                  <problem.icon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base mb-1.5 text-[var(--color-text-strong)]">{problem.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
