'use client'

import { motion } from 'framer-motion'

export function HighlightSection() {
  return (
    <section
      className="px-6 py-20"
      style={{
        background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-bg-soft) 70%, transparent), var(--color-bg-page))',
      }}
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold mb-4"
            style={{ borderColor: 'var(--color-accent-border-soft)', color: 'var(--color-accent-dark)', backgroundColor: 'var(--color-accent-soft)' }}
          >
            Wow Moment
          </div>
          <h2 className="text-3xl tracking-tight mb-3 text-[var(--color-text-strong)]">
            열어보는 순간<br />할 말이 생긴다
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            공통점 기반 대화 소재를 즉시 제공합니다
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1">Kemi Glow</div>
            <h3 className="text-lg text-[var(--color-text-strong)] mb-2">공통점이 시각적으로 강조된다</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              상대방의 프로필을 열면, 나와 겹치는 항목이 자동으로 하이라이트된다. 같은 대학 출신, 같은 구 거주, MBTI까지.
            </p>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
              <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3 italic">
                행사에서 명함을 받았다. 나중에 Byro 링크를 열었더니 —
              </div>
              <div className="space-y-2">
                {[
                  '같은 대학 출신',
                  '현재 거주지도 같은 구',
                  'MBTI도 동일',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                    style={{ backgroundColor: 'var(--color-accent-soft)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-dark)]" />
                    <span className="text-[12px] font-medium text-[var(--color-accent-dark)]">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-3">
                카톡을 보낼 이유가 생긴다. &quot;저 혹시 연대 나오셨어요?&quot; 한 줄이면 된다.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1">Kemi Report</div>
            <h3 className="text-lg text-[var(--color-text-strong)] mb-2">공통점을 묶어 해석해준다</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              단순 나열이 아니라 전체 맥락을 기반으로 해석을 제공한다. 미팅 전에 리포트를 보고 들어가면 첫 마디부터 달라진다.
            </p>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
              <div className="text-[11px] font-semibold text-[var(--color-text-secondary)] mb-2">Kemi Report</div>
              <div className="space-y-1.5 mb-3">
                {[
                  '같은 업종 · 비슷한 연차',
                  '둘 다 강남 거주',
                  'MBTI 궁합 좋음',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)]">
                    <div className="w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
                    {item}
                  </div>
                ))}
              </div>
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ backgroundColor: 'var(--color-accent-soft)' }}
              >
                <p className="text-[12px] font-medium text-[var(--color-accent-dark)] leading-relaxed">
                  &quot;비슷한 시기에 비슷한 환경에서 일해온 사람, 대화가 잘 통할 가능성 높음&quot;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
