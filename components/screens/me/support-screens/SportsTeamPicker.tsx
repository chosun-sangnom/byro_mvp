'use client'

// TODO(backend): 팀 목록 API 연동 가이드
//
// 현재는 STATIC_TEAMS 정적 데이터를 사용하고 있음.
// 백엔드 구현 시 아래 구조로 교체:
//
// [API 엔드포인트]
//   GET /api/sports/teams?sport=baseball&q=검색어&page=1
//   Response: { teams: SportTeam[], total: number }
//
// [데이터 소스 제안]
//   - KBO(야구)     : https://www.koreabaseball.com (협의 또는 크롤링)
//   - K리그(축구)   : https://www.kleague.com/api (공개 API 일부 제공)
//   - LCK(e스포츠)  : https://lol.fandom.com/api.php (MediaWiki API, 무료)
//   - 해외 리그     : TheSportsDB https://www.thesportsdb.com/api.php (무료 tier)
//   - NBA/해외농구   : TheSportsDB 또는 balldontlie.io (무료)
//
// [팀 로고]
//   TheSportsDB에서 strTeamBadge 필드로 PNG URL 제공.
//   자체 크롤링 시 팀 공식 사이트 favicon / 엠블럼 URL 저장 권장.
//
// [검색 동작]
//   현재는 클라이언트 필터링. 백엔드 연동 시 debounce(300ms) + API 쿼리로 교체.
//   아래 TODO(backend): useEffect 주석 참고.

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'

type SportCategory = 'all' | 'baseball' | 'soccer' | 'basketball' | 'esports' | 'other'

const SPORT_TABS: Array<{ id: SportCategory; label: string; emoji: string }> = [
  { id: 'all',        label: '전체',     emoji: ''  },
  { id: 'baseball',   label: '야구',     emoji: '⚾' },
  { id: 'soccer',     label: '축구',     emoji: '⚽' },
  { id: 'basketball', label: '농구',     emoji: '🏀' },
  { id: 'esports',    label: 'e스포츠',  emoji: '🎮' },
  { id: 'other',      label: '직접 입력', emoji: '✏️' },
]

interface SportTeam {
  id: string
  name: string
  league: string
  sport: Exclude<SportCategory, 'all' | 'other'>
  // TODO(backend): API 응답에서 logoUrl 추가. TheSportsDB 기준 strTeamBadge 필드.
  // logoUrl?: string
}

// TODO(backend): 아래 STATIC_TEAMS를 API 호출로 교체.
// 초기 렌더 시: GET /api/sports/teams (페이지네이션 없이 전체 또는 popular 상위 N개)
// 검색 시: GET /api/sports/teams?q={query}&sport={category}
const STATIC_TEAMS: SportTeam[] = [
  // ── 야구 KBO ────────────────────────────────
  { id: 'kbo-lg',       name: 'LG 트윈스',          league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-kt',       name: 'KT Wiz',             league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-ssg',      name: 'SSG 랜더스',          league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-doosan',   name: '두산 베어스',          league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-kia',      name: 'KIA 타이거즈',        league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-samsung',  name: '삼성 라이온즈',        league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-lotte',    name: '롯데 자이언츠',        league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-nc',       name: 'NC 다이노스',          league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-hanwha',   name: '한화 이글스',          league: 'KBO',    sport: 'baseball' },
  { id: 'kbo-kiwoom',   name: '키움 히어로즈',        league: 'KBO',    sport: 'baseball' },

  // ── 축구 K리그 ──────────────────────────────
  { id: 'kl-jeonbuk',   name: '전북 현대',            league: 'K리그1', sport: 'soccer' },
  { id: 'kl-ulsan',     name: '울산 HD',              league: 'K리그1', sport: 'soccer' },
  { id: 'kl-seoul',     name: 'FC 서울',              league: 'K리그1', sport: 'soccer' },
  { id: 'kl-pohang',    name: '포항 스틸러스',         league: 'K리그1', sport: 'soccer' },
  { id: 'kl-incheon',   name: '인천 유나이티드',       league: 'K리그1', sport: 'soccer' },

  // ── 축구 해외 ───────────────────────────────
  { id: 'epl-spurs',    name: '토트넘 홋스퍼',         league: 'EPL',    sport: 'soccer' },
  { id: 'epl-city',     name: '맨체스터 시티',         league: 'EPL',    sport: 'soccer' },
  { id: 'epl-utd',      name: '맨체스터 유나이티드',   league: 'EPL',    sport: 'soccer' },
  { id: 'epl-lfc',      name: '리버풀',               league: 'EPL',    sport: 'soccer' },
  { id: 'epl-arsenal',  name: '아스날',               league: 'EPL',    sport: 'soccer' },
  { id: 'epl-chelsea',  name: '첼시',                 league: 'EPL',    sport: 'soccer' },
  { id: 'liga-barca',   name: 'FC 바르셀로나',         league: 'La Liga',sport: 'soccer' },
  { id: 'liga-real',    name: '레알 마드리드',         league: 'La Liga',sport: 'soccer' },
  { id: 'bund-munich',  name: '바이에른 뮌헨',         league: 'Bundesliga', sport: 'soccer' },

  // ── 농구 KBL ────────────────────────────────
  { id: 'kbl-ss',       name: '서울 삼성',             league: 'KBL',    sport: 'basketball' },
  { id: 'kbl-sk',       name: '서울 SK',               league: 'KBL',    sport: 'basketball' },
  { id: 'kbl-db',       name: '원주 DB',               league: 'KBL',    sport: 'basketball' },
  { id: 'kbl-hd',       name: '울산 현대모비스',       league: 'KBL',    sport: 'basketball' },
  { id: 'kbl-sono',     name: '고양 소노',             league: 'KBL',    sport: 'basketball' },

  // ── 농구 NBA ────────────────────────────────
  { id: 'nba-gsw',      name: '골든스테이트 워리어스', league: 'NBA',    sport: 'basketball' },
  { id: 'nba-lal',      name: 'LA 레이커스',           league: 'NBA',    sport: 'basketball' },
  { id: 'nba-chi',      name: '시카고 불스',           league: 'NBA',    sport: 'basketball' },
  { id: 'nba-bos',      name: '보스턴 셀틱스',         league: 'NBA',    sport: 'basketball' },

  // ── e스포츠 LCK ─────────────────────────────
  { id: 'lck-t1',       name: 'T1',                   league: 'LCK',    sport: 'esports' },
  { id: 'lck-geng',     name: 'Gen.G',                league: 'LCK',    sport: 'esports' },
  { id: 'lck-hle',      name: '한화생명 e스포츠',      league: 'LCK',    sport: 'esports' },
  { id: 'lck-kt',       name: 'KT 롤스터',             league: 'LCK',    sport: 'esports' },
  { id: 'lck-drx',      name: 'DRX',                  league: 'LCK',    sport: 'esports' },
  { id: 'lck-ns',       name: '농심 레드포스',         league: 'LCK',    sport: 'esports' },
  { id: 'lck-dk',       name: 'Dplus KIA',            league: 'LCK',    sport: 'esports' },
  // TODO(backend): LCK 외 LCS, LEC, VCT 등 다른 e스포츠 리그 팀도 API로 추가
]

export function SportsTeamPicker({
  selected,
  onChange,
}: {
  selected: LifeMediaItem[]
  onChange: (teams: LifeMediaItem[]) => void
}) {
  const [activeCategory, setActiveCategory] = useState<SportCategory>('all')
  const [query, setQuery] = useState('')
  const [customInput, setCustomInput] = useState('')

  // TODO(backend): 아래 클라이언트 필터를 API 검색으로 교체.
  // const [apiResults, setApiResults] = useState<SportTeam[]>([])
  // useEffect(() => {
  //   const timer = setTimeout(async () => {
  //     const sport = activeCategory === 'all' ? '' : activeCategory
  //     const res = await fetch(`/api/sports/teams?sport=${sport}&q=${encodeURIComponent(query)}`)
  //     const data = await res.json()
  //     setApiResults(data.teams)
  //   }, 300) // debounce 300ms
  //   return () => clearTimeout(timer)
  // }, [query, activeCategory])
  const filteredTeams = STATIC_TEAMS.filter((team) => {
    const matchCategory = activeCategory === 'all' || team.sport === activeCategory
    const matchQuery =
      !query ||
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.league.toLowerCase().includes(query.toLowerCase())
    return matchCategory && matchQuery
  })

  const selectedNames = new Set(selected.map((s) => s.label))

  const toggleTeam = (team: SportTeam) => {
    if (selectedNames.has(team.name)) {
      onChange(selected.filter((s) => s.label !== team.name))
    } else {
      onChange([...selected, { label: team.name, sublabel: team.league }])
    }
  }

  const removeSelected = (name: string) => onChange(selected.filter((s) => s.label !== name))

  const addCustom = () => {
    const name = customInput.trim()
    if (!name || selectedNames.has(name)) return
    onChange([...selected, { label: name }])
    setCustomInput('')
  }

  const showCustomInput = activeCategory === 'other' || (query.length > 0 && filteredTeams.length === 0)

  return (
    <div>
      {/* 선택된 팀 칩 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((team) => (
            <span
              key={team.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              {team.label}
              <button onClick={() => removeSelected(team.label)}>
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 종목 카테고리 탭 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {SPORT_TABS.map((tab) => {
          const active = activeCategory === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveCategory(tab.id); setQuery('') }}
              className="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors"
              style={{
                background: active ? 'var(--color-accent-dark)' : 'var(--color-bg-muted)',
                color: active ? '#fff' : 'var(--color-text-secondary)',
              }}
            >
              {tab.emoji ? `${tab.emoji} ${tab.label}` : tab.label}
            </button>
          )
        })}
      </div>

      {/* 검색창 — '직접 입력' 탭에서는 숨김 */}
      {activeCategory !== 'other' && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="팀 이름 또는 리그 검색..."
            // TODO(backend): onChange를 debounce API 호출로 교체
            className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>
      )}

      {/* 팀 목록 */}
      {activeCategory !== 'other' && !showCustomInput && (
        <div className="max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
          {filteredTeams.length === 0 ? (
            <p className="py-4 text-center text-sm text-[var(--color-text-tertiary)]">
              검색 결과가 없어요 — 아래에서 직접 입력해보세요
            </p>
          ) : (
            filteredTeams.map((team) => {
              const isSelected = selectedNames.has(team.name)
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                >
                  {/* TODO(backend): 백엔드 연동 후 team.logoUrl 있으면 아래 img 태그로 교체:
                      <img src={team.logoUrl} alt={team.name} className="w-8 h-8 rounded-full object-contain" /> */}
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[11px] font-bold text-[var(--color-text-tertiary)]">
                    {team.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{team.name}</div>
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">{team.league}</div>
                  </div>
                  <div
                    className="h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                      background: isSelected ? 'var(--color-accent-dark)' : 'transparent',
                    }}
                  >
                    {isSelected && <span className="text-[9px] font-black text-white">✓</span>}
                  </div>
                </button>
              )
            })
          )}
        </div>
      )}

      {/* 직접 입력 (기타 탭 or 검색 결과 없을 때) */}
      {showCustomInput && (
        <div className="flex gap-2">
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            placeholder="예: 수원 삼성, 팀 리퀴드..."
            className="flex-1 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--color-accent-dark)' }}
          >
            추가
          </button>
        </div>
      )}
    </div>
  )
}
