'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Bell, BookOpen, Search, Star, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE } from '@/lib/mocks/publicProfiles'

// ── 검색 ──────────────────────────────────────────────────────────────────────

const SEARCHABLE = [SAMPLE_PROFILE, MK_PROFILE, JIMIN_PROFILE]

type SearchResult = { linkId: string; name: string; title: string; school: string; avatarColor?: string; avatarImage?: string }

function matchQuery(p: SearchResult, q: string) {
  const l = q.toLowerCase()
  return p.name.toLowerCase().includes(l) || p.title.toLowerCase().includes(l) || p.school.toLowerCase().includes(l)
}

// ── 알림 ──────────────────────────────────────────────────────────────────────

// [임시] 방명록·피드백 알림 목업 — API 연동 후 교체
const MOCK_NOTIFS = [
  ...SAMPLE_PROFILE.guestbook.slice(0, 2).map((g) => ({ id: `gb-${g.id}`, type: 'guestbook' as const, name: g.authorName, linkId: g.linkId, body: g.message, date: g.date })),
  { id: 'fb-1', type: 'feedback' as const, name: '이지민', linkId: 'jiminlee', body: '전문성이 느껴져요 외 2개', date: '1일 전' },
  { id: 'fb-2', type: 'feedback' as const, name: '강명구', linkId: 'mk', body: '어려울 때 생각나는 사람이에요', date: '3일 전' },
]

const NOTIF_ICON = { connection: <UserPlus size={14} />, guestbook: <BookOpen size={14} />, feedback: <Star size={14} /> }
const NOTIF_LABEL = { connection: '연결 요청', guestbook: '방명록', feedback: '피드백' }
const NOTIF_MSG = { connection: (n: string) => `${n} 님이 연결 요청을 보냈어요`, guestbook: (n: string) => `${n} 님이 방명록을 남겼어요`, feedback: (n: string) => `${n} 님이 피드백을 남겼어요` }

// ── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function AppHeader() {
  const router = useRouter()
  const { user, isLoggedIn, connectionRequests } = useByroStore()
  const [mode, setMode] = useState<'default' | 'search' | 'notif'>('default')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const initials = user?.name ? user.name.slice(0, 2) : 'BY'
  const hasUnread = connectionRequests.length > 0

  // 검색 모드 진입 시 input 포커스
  useEffect(() => {
    if (mode === 'search') inputRef.current?.focus()
  }, [mode])

  const closeSearch = () => { setMode('default'); setQuery('') }

  const connectionNotifs = connectionRequests.map((r) => ({
    id: `conn-${r.id}`, type: 'connection' as const, name: r.name, linkId: r.linkId, body: r.message ?? '', date: r.requestedAt,
  }))
  const allNotifs = [...connectionNotifs, ...MOCK_NOTIFS]

  const results: SearchResult[] = query.trim() ? SEARCHABLE.filter((p) => matchQuery(p, query.trim())) : []

  return (
    <>
      <header className="relative flex items-center h-14 border-b border-[var(--color-border-soft)] bg-[var(--color-bg-page)] flex-shrink-0 px-4">

        {/* ── 검색 모드 ── */}
        {mode === 'search' ? (
          <>
            <button onClick={closeSearch} className="p-1 mr-2 text-[var(--color-text-secondary)]" aria-label="닫기">
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 flex items-center gap-2 px-3 h-9 rounded-xl bg-[var(--color-bg-soft)]">
              <Search size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="이름, 직함, 회사로 검색"
                className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-[var(--color-text-tertiary)]">
                  <X size={14} />
                </button>
              )}
            </div>
          </>
        ) : (
          /* ── 기본 모드 ── */
          <>
            <span className="flex-1 text-[18px] font-black tracking-tight text-[var(--color-text-strong)]">Byro</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setMode('search')} className="p-2 text-[var(--color-text-secondary)]" aria-label="검색">
                <Search size={20} />
              </button>
              <button
                onClick={() => setMode(mode === 'notif' ? 'default' : 'notif')}
                className="relative p-2 text-[var(--color-text-secondary)]"
                aria-label="알림"
              >
                <Bell size={20} />
                {hasUnread && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
              </button>
              {isLoggedIn ? (
                <button onClick={() => router.push('/me')} className="ml-1 w-8 h-8 rounded-full overflow-hidden flex-shrink-0" aria-label="내 바이로">
                  {user?.avatarImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold"
                      style={{ backgroundColor: user?.avatarColor ?? 'var(--color-accent-dark)' }}>
                      {initials}
                    </div>
                  )}
                </button>
              ) : (
                <button onClick={() => router.push('/signup')} className="ml-1 w-8 h-8 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center" aria-label="로그인">
                  <span className="text-[11px] font-bold text-[var(--color-text-tertiary)]">?</span>
                </button>
              )}
            </div>
          </>
        )}
      </header>

      {/* ── 검색 결과 드롭다운 ── */}
      {mode === 'search' && query.trim() && (
        <div className="absolute left-0 right-0 top-14 z-40 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] shadow-lg">
          {results.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-[13px] text-[var(--color-text-secondary)]">&apos;{query}&apos;에 대한 결과가 없어요</p>
            </div>
          ) : (
            <ul className="py-1">
              {results.map((p) => (
                <li key={p.linkId}>
                  <button
                    onClick={() => { closeSearch(); router.push(`/${p.linkId}`) }}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
                      style={{ backgroundColor: p.avatarColor ?? 'var(--color-accent-dark)' }}>
                      {p.avatarImage
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.avatarImage} alt={p.name} className="w-full h-full object-cover" />
                        : p.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-text-primary)] truncate">{p.name}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{p.title}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── 알림 드롭다운 패널 ── */}
      {mode === 'notif' && (
        <>
          {/* 딤 배경 — 탭하면 닫힘 */}
          <div className="absolute inset-0 top-14 z-30" onClick={() => setMode('default')} />
          <div className="absolute left-0 right-0 top-14 z-40 bg-[var(--color-bg-page)] border-b border-[var(--color-border-soft)] shadow-xl max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-soft)]">
              <span className="text-[14px] font-bold text-[var(--color-text-primary)]">알림</span>
              <button onClick={() => setMode('default')} className="p-1 text-[var(--color-text-secondary)]"><X size={16} /></button>
            </div>
            {allNotifs.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-[var(--color-text-secondary)]">새 알림이 없어요</p>
              </div>
            ) : (
              <ul className="py-1">
                {allNotifs.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => { setMode('default'); if (item.type === 'connection') router.push('/archive'); else router.push(`/${item.linkId}`) }}
                      className="w-full flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--color-bg-soft)] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent-dark)] flex-shrink-0 mt-0.5">
                        {NOTIF_ICON[item.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-semibold text-[var(--color-accent-dark)]">{NOTIF_LABEL[item.type]}</span>
                          <span className="text-[11px] text-[var(--color-text-tertiary)]">· {item.date}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{NOTIF_MSG[item.type](item.name)}</p>
                        {item.body && <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">&ldquo;{item.body}&rdquo;</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  )
}
