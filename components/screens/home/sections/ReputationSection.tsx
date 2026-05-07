'use client'

import { motion } from 'framer-motion'
import { reputationKeywords, testimonials } from '@/components/screens/home/content'

export function ReputationSection() {
  return (
    <section className="px-6 py-20 bg-gradient-to-b from-white to-gray-50/30">
      <div className="max-w-md mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl tracking-tight text-center mb-4 text-[#111]"
        >
          프로필은 한 번 만들고,
          <br />
          신뢰는 계속 쌓입니다
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm text-[#111]/60 text-center mb-12 leading-relaxed"
        >
          평판 키워드가 누적되고, 방명록과 피드백이 쌓이며,
          <br />
          오프라인 만남의 인상이 기록으로 남습니다
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
        >
          <div className="text-xs text-[#111]/50 uppercase tracking-wide mb-4">평판 키워드</div>
          <div className="flex flex-wrap gap-2">
            {reputationKeywords.map((keyword, index) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full text-sm border border-indigo-100"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-[#111]/70 leading-relaxed mb-4 italic">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
                <div className="text-left">
                  <div className="text-xs text-[#111]">{testimonial.author}</div>
                  <div className="text-[10px] text-[#111]/50">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-pulse" />
            <span className="text-xs text-indigo-700">신뢰 자산이 실시간으로 쌓입니다</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
