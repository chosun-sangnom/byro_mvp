'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X } from 'lucide-react'
import { showToast } from '@/components/ui'
import { SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE } from '@/lib/mocks/publicProfiles'
import { ALL_VIRTUAL_PROFILES } from '@/lib/mocks/virtualProfiles'

// [임시] 목업 검색 대상 — API 연동 후 서버 검색으로 교체
const SEARCHABLE_PROFILES = [SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE]

// [임시] 동명이인 시연용 가입자 김영석
const EXTRA_MOCK_MEMBERS: SearchResult[] = [
  { linkId: 'kimyoungseok-bonanza-po', name: '김영석', title: 'Product Owner · 보난자팩토리', school: '', avatarColor: '#5B8FA8', connectionStatus: 'connected' },
  { linkId: 'kimyoungseok-coinone', name: '김영석', title: '마케팅 팀장 · 코인원', school: '', avatarColor: '#7B6F9A' },
]

// [임시] 목업 가상 프로필 — 실제 구현 시 크롤링 결과로 교체
const VIRTUAL_PROFILES = ALL_VIRTUAL_PROFILES

// [임시] 김영석 검색 시 추천되는 키워드 Chip — 실제 구현 시 Supabase full-text + 인기 키워드 기반으로 교체
const SUGGESTED_CHIPS: Record<string, string[]> = {
  '김영석': ['보난자팩토리', '코인원', '대표', '가상자산'],
}

type SearchResult = {
  linkId: string
  name: string
  title: string
  school: string
  avatarColor?: string
  avatarImage?: string
  connectionStatus?: 'connected' | 'none'
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
  const text = `${profile.name} ${profile.title} ${profile.school}`.toLowerCase()
  return q.split(',').map((k) => k.trim()).filter(Boolean).every((k) => text.includes(k.toLowerCase()))
}

function matchesVirtualQuery(profile: VirtualSearchResult, q: string) {
  const text = `${profile.name} ${profile.title} ${profile.tags.join(' ')}`.toLowerCase()
  return q.split(',').map((k) => k.trim()).filter(Boolean).every((k) => text.includes(k.toLowerCase()))
}

interface SearchScreenProps {
  onClose?: () => void
}

export default function SearchScreen({ onClose }: SearchScreenProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 쿼리가 바뀌면 chip 선택 초기화
  useEffect(() => {
    setSelectedChips([])
  }, [query])

  const handleClose = () => {
    if (onClose) onClose()
    else router.back()
  }

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    )
  }


  const q = query.trim()
  const suggestedChips = SUGGESTED_CHIPS[q] ?? []

  const matchesChips = (profile: SearchResult | VirtualSearchResult) => {
    const text = 'school' in profile
      ? `${profile.name} ${profile.title} ${profile.school}`.toLowerCase()
      : `${profile.name} ${profile.title} ${(profile as VirtualSearchResult).tags.join(' ')}`.toLowerCase()
    return selectedChips.every((chip) => text.includes(chip.toLowerCase()))
  }

  const baseResults: SearchResult[] = q
    ? SEARCHABLE_PROFILES.filter((p) => matchesQuery(p, q) && matchesChips(p))
    : []
  const extraResults: SearchResult[] = q
    ? EXTRA_MOCK_MEMBERS.filter((p) => matchesQuery(p, q) && matchesChips(p))
    : []
  const results = [...baseResults, ...extraResults]

  const virtualResults: VirtualSearchResult[] = q
    ? VIRTUAL_PROFILES.filter((p) => matchesVirtualQuery(p, q) && matchesChips(p))
    : []

  const hasAnyResults = results.length > 0 || virtualResults.length > 0
  const extraLinkIds = new Set(EXTRA_MOCK_MEMBERS.map((p) => p.linkId))

  return (
    <motion.div
      className="flex flex-col min-h-dvh bg-[var(--color-bg-page)]"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* 검색 바 */}
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

      {/* 키워드 Chip 행 */}
      <AnimatePresence>
        {suggestedChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-[var(--color-border-soft)]">
              {suggestedChips.map((chip) => {
                const active = selectedChips.includes(chip)
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    className="flex-shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium transition-colors"
                    style={
                      active
                        ? { background: 'var(--color-accent-dark)', color: '#fff', border: '1px solid var(--color-accent-dark)' }
                        : { background: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-default)' }
                    }
                  >
                    {chip}
                    {active && <X size={11} strokeWidth={2.5} />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto">
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

              {/* 바이로 회원 섹션 */}
              {results.length > 0 && (
                <div>
                  <div className="px-5 pt-4 pb-1">
                    <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">
                      바이로 회원 {results.length}명
                    </span>
                  </div>
                  <ul>
                    {results.map((p, i) => (
                      <motion.li
                        key={p.linkId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.15 }}
                      >
                        <button
                          onClick={() => {
                            if (extraLinkIds.has(p.linkId)) { showToast('준비 중인 프로필이에요'); return }
                            onClose?.(); router.push(`/${p.linkId}`)
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
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                            <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                          </div>
                          {p.connectionStatus === 'connected' && (
                            <span
                              className="flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{
                                background: 'var(--color-bg-muted)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border-default)',
                              }}
                            >
                              연결됨
                            </span>
                          )}
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 섹션 구분선 */}
              {results.length > 0 && virtualResults.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3 mt-1">
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                  <span className="text-[10px] text-[var(--color-text-tertiary)] whitespace-nowrap">공개 정보 기반</span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>
              )}

              {/* 미가입자 (가상 프로필) 섹션 */}
              {virtualResults.length > 0 && (
                <div>
                  <div className="px-5 pt-1 pb-1">
                    <span className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">미가입자</span>
                  </div>
                  <ul>
                    {virtualResults.map((p, i) => (
                      <motion.li
                        key={p.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.15 }}
                      >
                        <button
                          onClick={() => { onClose?.(); router.push(`/virtual/${p.id}`) }}
                          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                            style={{ backgroundColor: p.avatarColor }}
                          >
                            {p.avatarInitials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                            <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                          </div>
                          <span
                            className="flex-shrink-0 self-start mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              background: 'var(--color-bg-muted)',
                              color: 'var(--color-text-tertiary)',
                              border: '1px solid var(--color-border-soft)',
                            }}
                          >
                            공개정보
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>

                  {/* 스피닝 스켈레톤 — 추가 크롤링 로딩 시뮬레이션 */}
                  <SkeletonCard delay={0} />
                  <SkeletonCard delay={0.08} />
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-5 py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay + 0.3, duration: 0.2 }}
    >
      {/* 스피너 아바타 */}
      <div className="w-10 h-10 rounded-full flex-shrink-0 relative" style={{ background: 'var(--color-bg-muted)' }}>
        <div
          className="absolute inset-0.5 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'var(--color-border-soft)',
            borderTopColor: 'var(--color-text-tertiary)',
          }}
        />
      </div>
      {/* 텍스트 스켈레톤 */}
      <div className="flex-1 space-y-2">
        <div
          className="h-3 rounded-full w-20 animate-pulse"
          style={{ background: 'var(--color-bg-muted)' }}
        />
        <div
          className="h-2.5 rounded-full w-32 animate-pulse"
          style={{ background: 'var(--color-bg-muted)' }}
        />
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
