'use client'

import { motion } from 'framer-motion'
import { targetUsers } from '@/components/screens/home/content'

export function TargetUserSection() {
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
          새로운 사람을
          <br />
          자주 만난다면
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[var(--color-text-secondary)] text-center mb-12"
        >
          첫 만남이 결과로 이어지는 사람에게 특히 잘 맞습니다
        </motion.p>

        <div className="grid grid-cols-2 gap-3">
          {targetUsers.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-[var(--color-bg-page)] rounded-xl p-5 border border-[var(--color-border-soft)]"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--color-accent-bg)] flex items-center justify-center mb-3">
                <item.icon className="w-4 h-4 text-[var(--color-accent-dark)]" />
              </div>
              <div className="text-[13px] font-semibold text-[var(--color-text-strong)] mb-1">{item.label}</div>
              <div className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">{item.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
