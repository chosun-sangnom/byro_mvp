'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Briefcase, Mic, FileText, BookOpen, Sparkles, AlertCircle, ChevronRight } from 'lucide-react'
import { showToast } from '@/components/ui'
import type { VirtualProfile, VirtualHighlight, VirtualHighlightIcon } from '@/lib/mocks/virtualProfiles'
import { LoginModal } from '@/components/screens/profile/LoginModal'

const ICON_MAP: Record<VirtualHighlightIcon, React.ElementType> = {
  trophy: Trophy,
  briefcase: Briefcase,
  mic: Mic,
  'file-text': FileText,
  'book-open': BookOpen,
}

export function VirtualProfilePage({ profile }: { profile: VirtualProfile }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto scrollbar-hide">

        {/* 히어로 */}
        <motion.div
          className={`relative pt-10 pb-7 px-5 bg-gradient-to-b ${profile.heroTheme.cover}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_68%)]" />

          {/* 공개 정보 기반 배지 */}
          <div className="flex justify-center mb-5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
              style={{
                background: 'rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              <AlertCircle size={10} />
              공개 정보 기반
            </span>
          </div>

          {/* 아바타 */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center text-[22px] font-black text-white bg-gradient-to-br ${profile.heroTheme.avatar}`}
              style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.12)' }}
            >
              {profile.avatarInitials}
            </div>
          </div>

          {/* 이름 · 직함 */}
          <div className="text-center">
            <h1 className="text-[24px] font-black tracking-tight text-white mb-1">
              {profile.name}
            </h1>
            <p className="text-[14px] mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {profile.title}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.65)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 출처 안내 바 */}
        <div
          className="px-5 py-2.5 border-b border-[var(--color-border-soft)]"
          style={{ background: 'var(--color-bg-muted)' }}
        >
          <p className="text-[11px] text-[var(--color-text-tertiary)] text-center">
            {profile.sourceLabel} · AI가 구조화한 추정 프로필입니다
          </p>
        </div>

        {/* 하이라이트 */}
        <motion.div
          className="px-5 pt-6 pb-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              하이라이트
            </span>
            <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
          </div>
          <div className="divide-y divide-[var(--color-border-soft)]">
            {profile.highlights.map((hl) => (
              <HighlightItem key={hl.id} highlight={hl} />
            ))}
          </div>
        </motion.div>

        {/* 케미 리포트 미리보기 */}
        <motion.div
          className="px-5 py-4 border-t border-[var(--color-border-soft)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              케미 리포트
            </span>
            <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
            <span className="text-[10px] text-[var(--color-text-tertiary)]">추정 기반</span>
          </div>

          <div
            className="rounded-[20px] px-4 py-4 relative overflow-hidden"
            style={{
              border: '1px solid var(--color-accent-border-soft)',
              background: 'linear-gradient(135deg, var(--color-accent-bg-subtle) 0%, transparent 100%)',
            }}
          >
            <div className="mb-3 flex items-center gap-1.5">
              <Sparkles size={12} style={{ color: 'var(--color-accent-dark)' }} />
              <span
                className="text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: 'var(--color-accent-dark)' }}
              >
                공통 관심사 {profile.kemiPreviewCount}개 추정
              </span>
            </div>

            {/* 블러 처리된 칩 */}
            <div
              className="flex flex-wrap gap-1.5 mb-12 blur-[6px] pointer-events-none select-none"
              aria-hidden
            >
              {['블록체인', '핀테크', '스타트업'].map((item) => (
                <span
                  key={item}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold"
                  style={{
                    background: 'var(--color-accent-bg-subtle)',
                    color: 'var(--color-accent-dark)',
                    border: '1px solid var(--color-accent-border-soft)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* 로그인 유도 오버레이 */}
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <button
                onClick={() => setLoginModalOpen(true)}
                className="rounded-full px-4 py-2 text-[12px] font-bold text-white whitespace-nowrap"
                style={{ backgroundColor: 'var(--color-accent-dark)' }}
              >
                로그인하면 전체 보기 →
              </button>
            </div>
          </div>
        </motion.div>

        {/* 클레임 섹션 */}
        <motion.div
          className="px-5 pt-4 pb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24 }}
        >
          <div
            className="rounded-[20px] px-5 py-5"
            style={{
              border: '1px solid var(--color-border-default)',
              background: 'var(--color-bg-surface)',
            }}
          >
            <p className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1">
              이 프로필의 주인공이신가요?
            </p>
            <p className="text-[12px] leading-[1.65] text-[var(--color-text-secondary)] mb-4">
              공개된 정보를 직접 수정하고<br />바이로 정식 프로필로 관리하세요
            </p>
            <button
              onClick={() => showToast('본인 인증 기능을 준비 중이에요')}
              className="flex items-center justify-between w-full rounded-full px-4 py-3 text-[13px] font-semibold text-[var(--color-text-primary)]"
              style={{ border: '1px solid var(--color-border-default)', background: 'var(--color-bg-muted)' }}
            >
              <span>내 프로필이에요</span>
              <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
            </button>
          </div>
        </motion.div>

        <div className="pb-[calc(env(safe-area-inset-bottom)+16px)]" />
      </div>

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  )
}

function HighlightItem({ highlight }: { highlight: VirtualHighlight }) {
  const Icon = ICON_MAP[highlight.icon]

  return (
    <div className="flex items-start gap-3.5 py-3.5">
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center mt-0.5 text-[var(--color-text-secondary)]">
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          {highlight.sublabel}
          {highlight.year ? ` · ${highlight.year}` : ''}
        </div>
        <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">
          {highlight.label}
        </div>
        {highlight.linkUrl && (
          <a
            href={highlight.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-[11px]"
            style={{ color: 'var(--color-accent-dark)' }}
          >
            {highlight.sourceLabel ?? '기사 보기'} →
          </a>
        )}
      </div>
    </div>
  )
}
