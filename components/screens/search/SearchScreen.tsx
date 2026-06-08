'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'
import { SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE } from '@/lib/mocks/publicProfiles'

// [임시] 목업 검색 대상 — API 연동 후 서버 검색으로 교체
const SEARCHABLE_PROFILES = [SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE]

type SearchResult = {
  linkId: string
  name: string
  title: string
  school: string
  avatarColor?: string
  avatarImage?: string
}

function matchesQuery(profile: SearchResult, q: string) {
  const lower = q.toLowerCase()
  return (
    profile.name.toLowerCase().includes(lower) ||
    profile.title.toLowerCase().includes(lower) ||
    profile.school.toLowerCase().includes(lower)
  )
}

export default function SearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results: SearchResult[] = query.trim()
    ? SEARCHABLE_PROFILES.filter((p) => matchesQuery(p, query.trim()))
    : []

  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-page)]">
      {/* 상단 검색 바 */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button
          onClick={() => router.back()}
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
        {query.trim() === '' ? (
          <EmptyPrompt />
        ) : results.length === 0 ? (
          <NoResults query={query} />
        ) : (
          <ResultList results={results} onSelect={(id) => router.push(`/${id}`)} />
        )}
      </div>
    </div>
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
        '{query}'에 대한 결과가 없어요
      </p>
      <p className="text-[13px] text-[var(--color-text-secondary)]">
        다른 이름이나 직함으로 검색해보세요
      </p>
    </div>
  )
}

function ResultList({
  results,
  onSelect,
}: {
  results: SearchResult[]
  onSelect: (linkId: string) => void
}) {
  return (
    <ul className="py-2">
      {results.map((p) => (
        <li key={p.linkId}>
          <button
            onClick={() => onSelect(p.linkId)}
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
        </li>
      ))}
    </ul>
  )
}
