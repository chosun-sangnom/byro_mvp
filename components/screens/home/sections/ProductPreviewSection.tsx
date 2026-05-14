'use client'

import { motion } from 'framer-motion'
import { useCases } from '@/components/screens/home/content'

export function ProductPreviewSection() {
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
          어떤 상황에서
          <br />
          쓰이나요
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          처음 만나는 상황이라면 어디서든
        </motion.p>

        <div className="space-y-4">
          {useCases.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="surface-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-accent-bg)' }}
                >
                  <item.icon className="w-4 h-4 text-[var(--color-accent-dark)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-strong)]">{item.title}</h3>
              </div>

              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                {item.scenario}
              </p>

              <div
                className="rounded-xl px-4 py-3"
                style={{ backgroundColor: 'var(--color-accent-soft)' }}
              >
                <p className="text-[13px] font-medium text-[var(--color-accent-dark)] leading-relaxed">
                  {item.highlight}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
