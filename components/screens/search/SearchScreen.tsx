'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { showToast } from '@/components/ui'
import { SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE } from '@/lib/mocks/publicProfiles'
import { ALL_VIRTUAL_PROFILES } from '@/lib/mocks/virtualProfiles'

// [임시] 목업 검색 대상 — API 연동 후 서버 검색으로 교체
const SEARCHABLE_PROFILES = [SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE]

// [임시] 동명이인 시연용 가입자 김영석 — 클릭 시 프로필 페이지 없음
const EXTRA_MOCK_MEMBERS: SearchResult[] = [
  { linkId: 'kimyoungseok-bonanza-po', name: '김영석', title: 'Product Owner · 보난자팩토리', school: '', avatarColor: '#5B8FA8' },
  { linkId: 'kimyoungseok-coinone', name: '김영석', title: '마케팅 팀장 · 코인원', school: '', avatarColor: '#7B6F9A' },
]

// [임시] 목업 가상 프로필 — 실제 구현 시 크롤링 결과로 교체
const VIRTUAL_PROFILES = ALL_VIRTUAL_PROFILES

type SearchResult = {
  linkId: string
  name: string
  title: string
  school: string
  avatarColor?: string
  avatarImage?: string
}

type VirtualSearchResult = {
  id: string
  name: string
  title: string
  tags: string[]
  avatarInitials: string
  avatarColor: string
}

function matchesQuery(profile: SearchResult, q: string) {
  const lower = q.toLowerCase()
  return (
    profile.name.toLowerCase().includes(lower) ||
    profile.title.toLowerCase().includes(lower) ||
    profile.school.toLowerCase().includes(lower)
  )
}

function matchesVirtualQuery(profile: VirtualSearchResult, q: string) {
  const lower = q.toLowerCase()
  return (
    profile.name.toLowerCase().includes(lower) ||
    profile.title.toLowerCase().includes(lower) ||
    profile.tags.some((t) => t.toLowerCase().includes(lower))
  )
}

interface SearchScreenProps {
  onClose?: () => void
}

export default function SearchScreen({ onClose }: SearchScreenProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleClose = () => {
    if (onClose) onClose()
    else router.back()
  }

  const q = query.trim()
  const baseResults: SearchResult[] = q
    ? SEARCHABLE_PROFILES.filter((p) => matchesQuery(p, q))
    : []
  const extraResults: SearchResult[] = q
    ? EXTRA_MOCK_MEMBERS.filter((p) => matchesQuery(p, q))
    : []
  const results = [...baseResults, ...extraResults]
  const virtualResults: VirtualSearchResult[] = q
    ? VIRTUAL_PROFILES.filter((p) => matchesVirtualQuery(p, q))
    : []

  const hasAnyResults = results.length > 0 || virtualResults.length > 0

  return (
    <motion.div
      className="flex flex-col min-h-dvh bg-[var(--color-bg-page)]"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* 상단 검색 바 */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button
          onClick={handleClose}
          className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          aria-label="뒤로"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 h-9 rounded-xl bg-[var(--color-bg-soft)]">
          <Search size={15} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름, 직함, 회사로 검색"
            className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
          />
        </div>
      </div>

      {/* 본문 */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {q === '' ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <EmptyPrompt />
            </motion.div>
          ) : !hasAnyResults ? (
            <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <NoResults query={query} />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {results.length > 0 && (
                <ResultList
                  results={results}
                  label={`바이로 회원 ${results.length}명`}
                  extraLinkIds={new Set(EXTRA_MOCK_MEMBERS.map((p) => p.linkId))}
                  onSelect={(id) => { onClose?.(); router.push(`/${id}`) }}
                />
              )}
              {virtualResults.length > 0 && (
                <VirtualResultList
                  results={virtualResults}
                  onSelect={(id) => { onClose?.(); router.push(`/virtual/${id}`) }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function EmptyPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-32 gap-3 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center">
        <Search size={24} className="text-[var(--color-text-tertiary)]" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1">
          바이로에서 사람을 찾아보세요
        </p>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          이름·직함·회사·학교로 검색할 수 있어요
        </p>
      </div>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-32 gap-2 px-6 text-center">
      <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">
        &apos;{query}&apos;에 대한 결과가 없어요
      </p>
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        다른 이름이나 직함으로 검색해보세요
      </p>
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-4 pb-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
    </div>
  )
}

function ResultList({
  results,
  label,
  extraLinkIds,
  onSelect,
}: {
  results: SearchResult[]
  label?: string
  extraLinkIds?: Set<string>
  onSelect: (linkId: string) => void
}) {
  return (
    <div>
      {label && <SectionHeader label={label} />}
      <ul className="pb-2">
        {results.map((p, i) => (
          <motion.li
            key={p.linkId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
          >
            <button
              onClick={() => {
                if (extraLinkIds?.has(p.linkId)) { showToast('준비 중인 프로필이에요'); return }
                onSelect(p.linkId)
              }}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0 overflow-hidden"
                style={{ backgroundColor: p.avatarColor ?? 'var(--color-accent-dark)' }}
              >
                {p.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.avatarImage} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  p.name.slice(0, 2)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">
                  {p.name}
                </p>
                <p className="text-[12px] text-[var(--color-text-secondary)] truncate">
                  {p.title}
                </p>
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function VirtualResultList({
  results,
  onSelect,
}: {
  results: VirtualSearchResult[]
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <SectionHeader label="공개 정보 기반" />
      <ul className="pb-2">
        {results.map((p, i) => (
          <motion.li
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.15 }}
          >
            <button
              onClick={() => onSelect(p.id)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                style={{ backgroundColor: p.avatarColor }}
              >
                {p.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">
                    {p.name}
                  </p>
                  <span
                    className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]"
                    style={{
                      background: 'var(--color-bg-muted)',
                      color: 'var(--color-text-tertiary)',
                      border: '1px solid var(--color-border-soft)',
                    }}
                  >
                    공개정보
                  </span>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] truncate">
                  {p.title}
                </p>
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
