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
          className="text-3xl tracking-tight text-center mb-12 text-[var(--color-text-strong)]"
        >
          사람을 자주 만나는 사람에게
          <br />
          특히 잘 맞습니다
        </motion.h2>

        <div className="grid grid-cols-2 gap-3">
          {targetUsers.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-sm text-[var(--color-text-strong)]">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
