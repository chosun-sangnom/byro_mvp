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
            Byro가<br />세 가지를 바꿔요
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            명함이 해결 못 했던 문제들을 정면으로 풀어요
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* 01 — 입체적인 프로필 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1">Profile</div>
            <h3 className="text-lg text-[var(--color-text-strong)] mb-2">명함보다 훨씬 많은 걸 보여줘요</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              이름과 직함 뒤에 가려진 것들 — 커리어, 취향, 라이프스타일까지 한 페이지에 담아요. 링크 하나로 나를 설명할 수 있어요.
            </p>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black text-base">강</div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--color-text-strong)]">강민준</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">Product Manager · 5년차</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['스타트업', 'ENFJ', '재즈 좋아해요', '강남 거주', '얼리어답터'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                    style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-default)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 02 — 평판 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1">Reputation</div>
            <h3 className="text-lg text-[var(--color-text-strong)] mb-2">말 말고 기록으로 증명해요</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              함께한 사람들이 남긴 평판 키워드가 프로필에 쌓여요. 믿을 만한 사람인지, 대화해보기 전에 확인할 수 있어요.
            </p>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
              <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3 italic">
                함께 일한 4명이 남긴 키워드 —
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '믿고 맡길 수 있어요', count: 3 },
                  { label: '일 처리가 빠르고 깔끔해요', count: 2 },
                  { label: '전문성이 느껴져요', count: 2 },
                  { label: '주변에 소개하고 싶어요', count: 1 },
                ].map(({ label, count }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1"
                    style={{ backgroundColor: 'var(--color-accent-soft)' }}
                  >
                    <span className="text-[11px] font-medium text-[var(--color-accent-dark)]">{label}</span>
                    <span className="text-[10px] font-bold text-[var(--color-accent-dark)] opacity-60">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 03 — 공통점 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="surface-card rounded-2xl p-6"
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-accent-dark)] mb-1">Chemistry</div>
            <h3 className="text-lg text-[var(--color-text-strong)] mb-2">열어보는 순간 공통점이 보여요</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              상대 Byro를 열면 나와 겹치는 항목이 자동으로 표시돼요. 어색한 첫 마디 없이 바로 통하는 얘기부터 시작할 수 있어요.
            </p>

            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
              <div className="text-[11px] text-[var(--color-text-tertiary)] mb-3 italic">
                행사에서 명함을 받았다. Byro 링크를 열었더니 —
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
                카톡을 보낼 이유가 생겼다. &quot;저 혹시 연대 나오셨어요?&quot; 한 줄이면 됐다.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
