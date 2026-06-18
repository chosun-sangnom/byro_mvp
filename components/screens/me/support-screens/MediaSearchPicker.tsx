'use client'

// ─── 미디어 타입별 API 연동 가이드 (백엔드 구현 시 참고) ─────────────────────
//
// ┌─ MOVIE (영화) ─────────────────────────────────────────────────────────────
// │  API: TMDB — GET /3/search/movie?api_key=KEY&query=Q&language=ko-KR
// │  posterUrl: https://image.tmdb.org/t/p/w185{poster_path}
// │  Next.js Route: GET /api/media/movie?q={query}
// └────────────────────────────────────────────────────────────────────────────
//
// ┌─ BOOK (책) ────────────────────────────────────────────────────────────────
// │  API: 알라딘 Open API — 무료 5,000건/일
// │  Next.js Route: GET /api/media/book?q={query}
// └────────────────────────────────────────────────────────────────────────────
//
// ┌─ PLAY (공연 · 연극) ────────────────────────────────────────────────────────
// │  전용 공개 API 없음 → /api/ai-search?type=play 사용 (primary)
// │  참고: KOPIS API 있으나 현재 공연 한정 (과거 작품 검색 어려움)
// └────────────────────────────────────────────────────────────────────────────
//
// TODO(real API): 위 API 연동 후 아래 MOCK_DATA 및 AI 검색을 폴백으로 전환
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { BookOpen, Clapperboard, Loader2, PenLine, Search, Sparkles, Theater, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'
import type { AiSearchItem } from '@/app/api/ai-search/route'

export type MediaType = 'movie' | 'book' | 'play'

const MAX_ITEMS = 5

interface MockMediaItem {
  id: string
  title: string
  subtitle: string
  detail: string
  placeholderColor: string
}

// TODO(real API): 아래 MOCK_DATA를 /api/media/{type}?q={query} 호출로 교체
const MOCK_DATA: Record<MediaType, MockMediaItem[]> = {
  movie: [
    { id: 'm1',  title: '기생충',            subtitle: '봉준호',        detail: '2019', placeholderColor: '#2C3E50' },
    { id: 'm2',  title: '올드보이',           subtitle: '박찬욱',        detail: '2003', placeholderColor: '#922B21' },
    { id: 'm3',  title: '부산행',             subtitle: '연상호',        detail: '2016', placeholderColor: '#1A5276' },
    { id: 'm4',  title: '범죄도시',           subtitle: '강윤성',        detail: '2017', placeholderColor: '#784212' },
    { id: 'm5',  title: '소셜 네트워크',      subtitle: '데이비드 핀처', detail: '2010', placeholderColor: '#1F618D' },
    { id: 'm6',  title: '머니볼',             subtitle: '베넷 밀러',     detail: '2011', placeholderColor: '#1E8449' },
    { id: 'm7',  title: '인터스텔라',         subtitle: '크리스토퍼 놀란', detail: '2014', placeholderColor: '#0D0D0D' },
    { id: 'm8',  title: '어벤져스: 엔드게임', subtitle: '루소 형제',     detail: '2019', placeholderColor: '#7B241C' },
    { id: 'm9',  title: '라라랜드',           subtitle: '다미엔 차젤',   detail: '2016', placeholderColor: '#6C3483' },
    { id: 'm10', title: '이터널 선샤인',      subtitle: '미셸 공드리',   detail: '2004', placeholderColor: '#1A5276' },
    { id: 'm11', title: '빠삐용',             subtitle: '마이클 노어',   detail: '2017', placeholderColor: '#784212' },
    { id: 'm12', title: '콘크리트 유토피아',  subtitle: '엄태화',        detail: '2023', placeholderColor: '#424949' },
  ],
  book: [
    { id: 'b1',  title: '린 스타트업',          subtitle: '에릭 리스',     detail: '한국경제신문', placeholderColor: '#148F77' },
    { id: 'b2',  title: '제로 투 원',           subtitle: '피터 틸',       detail: '한국경제신문', placeholderColor: '#1A5276' },
    { id: 'b3',  title: '하드씽',              subtitle: '벤 호로위츠',   detail: '한국경제신문', placeholderColor: '#922B21' },
    { id: 'b4',  title: '넛지',                subtitle: '리처드 탈러',   detail: '리더스북',     placeholderColor: '#1E8449' },
    { id: 'b5',  title: '생각에 관한 생각',    subtitle: '대니얼 카너먼', detail: '김영사',       placeholderColor: '#6C3483' },
    { id: 'b6',  title: '아토믹 해빗',          subtitle: '제임스 클리어', detail: '비즈니스북스', placeholderColor: '#D35400' },
    { id: 'b7',  title: '픽사 이야기',          subtitle: '에드 캣멀',     detail: '흐름출판',     placeholderColor: '#2E4057' },
    { id: 'b8',  title: '소크라테스 익스프레스', subtitle: '에릭 와이너', detail: '어크로스',     placeholderColor: '#784212' },
    { id: 'b9',  title: '채식주의자',           subtitle: '한강',          detail: '창비',         placeholderColor: '#2C3E50' },
    { id: 'b10', title: '82년생 김지영',        subtitle: '조남주',        detail: '민음사',       placeholderColor: '#7B241C' },
    { id: 'b11', title: '트렌드 코리아 2025',  subtitle: '김난도 외',     detail: '미래의창',     placeholderColor: '#1F618D' },
    { id: 'b12', title: '도파민네이션',          subtitle: '애나 렘키',     detail: '흐름출판',     placeholderColor: '#424949' },
  ],
  play: [
    { id: 'p1',  title: '렛미플라이',          subtitle: '예술의전당',          detail: '2024.03–05',    placeholderColor: '#6C3483' },
    { id: 'p2',  title: '레미제라블',          subtitle: '블루스퀘어',          detail: '2024.01–04',    placeholderColor: '#1A5276' },
    { id: 'p3',  title: '캣츠',               subtitle: '샤롯데씨어터',        detail: '2024.06–08',    placeholderColor: '#1E8449' },
    { id: 'p4',  title: '위키드',              subtitle: '디큐브아트센터',      detail: '2024.05–07',    placeholderColor: '#148F77' },
    { id: 'p5',  title: '오페라의 유령',       subtitle: '블루스퀘어',          detail: '2023.12–24.02', placeholderColor: '#2C3E50' },
    { id: 'p6',  title: '엘리자벳',            subtitle: '샤롯데씨어터',        detail: '2024.09–12',    placeholderColor: '#922B21' },
    { id: 'p7',  title: '드라큘라',            subtitle: '예술의전당',          detail: '2024.04–06',    placeholderColor: '#424949' },
    { id: 'p8',  title: '레드북',              subtitle: '대학로 아트원씨어터', detail: '2024.02–04',    placeholderColor: '#D35400' },
    { id: 'p9',  title: '조씨고아, 복수의 씨앗', subtitle: '명동예술극장',     detail: '2024.03–04',    placeholderColor: '#784212' },
    { id: 'p10', title: '벽 속의 요정',        subtitle: '대학로 드림아트센터', detail: '2024.05–',      placeholderColor: '#6C3483' },
  ],
}

const TYPE_CONFIG: Record<MediaType, { label: string; placeholder: string; subtitlePlaceholder: string; Icon: React.ElementType }> = {
  movie: { label: '영화',        placeholder: '영화 제목 또는 감독 검색...', subtitlePlaceholder: '감독 (선택)',   Icon: Clapperboard },
  book:  { label: '책',          placeholder: '책 제목 또는 저자 검색...',   subtitlePlaceholder: '저자 (선택)',   Icon: BookOpen     },
  play:  { label: '공연 · 연극', placeholder: '공연명 또는 공연장 검색...',  subtitlePlaceholder: '공연장 (선택)', Icon: Theater      },
}

function MediaCover({
  posterUrl,
  placeholderColor,
  Icon,
  size = 44,
}: {
  posterUrl?: string
  placeholderColor: string
  Icon: React.ElementType
  size?: number
}) {
  if (posterUrl) {
    // TODO(real API): API에서 받은 실제 이미지 URL 렌더링
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={posterUrl} alt="커버" className="rounded-lg object-cover flex-shrink-0" style={{ width: size, height: size }} />
  }
  return (
    <div
      className="rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: placeholderColor }}
    >
      <Icon size={size * 0.35} color="rgba(255,255,255,0.65)" />
    </div>
  )
}

function CheckCircle({ isSelected }: { isSelected: boolean }) {
  return (
    <div
      className="h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-colors"
      style={{
        borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
        background: isSelected ? 'var(--color-accent-dark)' : 'transparent',
      }}
    >
      {isSelected && <span className="text-[9px] font-black text-white">✓</span>}
    </div>
  )
}

export function MediaSearchPicker({
  type,
  selected,
  onChange,
}: {
  type: MediaType
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [query, setQuery] = useState('')
  const [aiResults, setAiResults] = useState<AiSearchItem[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showDirect, setShowDirect] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customSubtitle, setCustomSubtitle] = useState('')

  const config = TYPE_CONFIG[type]
  const selectedKeys = new Set(selected.map((s) => s.label))

  // TODO(real API): query 변경 시 debounce(300ms) 후 /api/media/{type}?q={query} 호출로 교체
  const mockResults = query.trim()
    ? MOCK_DATA[type].filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  // AI 검색: 공연은 항상, 나머지는 mock 결과 없을 때
  const shouldFetchAi = query.trim().length > 0 && (type === 'play' || mockResults.length === 0)

  useEffect(() => {
    if (!shouldFetchAi) { setAiResults([]); setAiLoading(false); return }
    setAiLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ai-search?q=${encodeURIComponent(query)}&type=${type}`)
        const data = await res.json()
        const items: AiSearchItem[] = data.items ?? []
        // mock과 중복 제거
        const mockTitles = new Set(mockResults.map((m) => m.title))
        setAiResults(items.filter((i) => !mockTitles.has(i.title)))
      } catch {
        setAiResults([])
      } finally {
        setAiLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, shouldFetchAi])

  const toggleMock = (item: MockMediaItem) => {
    if (selectedKeys.has(item.title)) {
      onChange(selected.filter((s) => s.label !== item.title))
    } else {
      if (selected.length >= MAX_ITEMS) return
      onChange([...selected, { label: item.title, sublabel: item.subtitle }])
    }
  }

  const toggleAi = (item: AiSearchItem) => {
    if (selectedKeys.has(item.title)) {
      onChange(selected.filter((s) => s.label !== item.title))
    } else {
      if (selected.length >= MAX_ITEMS) return
      onChange([...selected, {
        label: item.title,
        sublabel: item.subtitle,
        // TODO(real API): posterUrl: item.posterUrl ?? undefined
      }])
    }
  }

  const addCustom = () => {
    const title = customTitle.trim()
    if (!title || selectedKeys.has(title)) return
    if (selected.length >= MAX_ITEMS) return
    onChange([...selected, { label: title, sublabel: customSubtitle.trim() || undefined }])
    setCustomTitle('')
    setCustomSubtitle('')
  }

  const remove = (label: string) => onChange(selected.filter((s) => s.label !== label))

  const getPlaceholderColor = (label: string) =>
    MOCK_DATA[type].find((m) => m.title === label)?.placeholderColor ?? '#555'

  const isAtLimit = selected.length >= MAX_ITEMS

  return (
    <div>
      {/* 선택된 항목 */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-2">
          {selected.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
            >
              <MediaCover
                posterUrl={item.posterUrl}
                placeholderColor={getPlaceholderColor(item.label)}
                Icon={config.Icon}
                size={36}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                {item.sublabel && (
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>
                )}
              </div>
              <button onClick={() => remove(item.label)} className="flex-shrink-0 p-1">
                <X size={14} className="text-[var(--color-text-tertiary)]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {isAtLimit && (
        <p className="mb-3 text-center text-[12px] text-[var(--color-text-tertiary)]">
          최대 {MAX_ITEMS}개까지 추가할 수 있어요
        </p>
      )}

      {/* 검색창 */}
      {!isAtLimit && (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={config.placeholder}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>

          {/* Mock 검색 결과 */}
          {mockResults.length > 0 && (
            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
              {mockResults.map((item) => {
                const isSelected = selectedKeys.has(item.title)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMock(item)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                  >
                    <MediaCover placeholderColor={item.placeholderColor} Icon={config.Icon} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.subtitle} · {item.detail}</p>
                    </div>
                    <CheckCircle isSelected={isSelected} />
                  </button>
                )
              })}
            </div>
          )}

          {/* AI 검색 결과 */}
          {aiLoading && (
            <div className="mt-3 flex items-center justify-center gap-2 py-3 text-[12px] text-[var(--color-text-tertiary)]">
              <Loader2 size={14} className="animate-spin" />
              AI 검색 중...
            </div>
          )}
          {!aiLoading && aiResults.length > 0 && (
            <div className="mt-2">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <Sparkles size={11} className="text-[var(--color-accent-dark)]" />
                <span className="text-[10px] font-bold tracking-wide text-[var(--color-text-tertiary)]">AI 추천</span>
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
                {aiResults.map((item) => {
                  const isSelected = selectedKeys.has(item.title)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAi(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                    >
                      <MediaCover
                        posterUrl={item.posterUrl ?? undefined}
                        placeholderColor="#3D4451"
                        Icon={config.Icon}
                        size={40}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.subtitle} · {item.detail}</p>
                      </div>
                      <CheckCircle isSelected={isSelected} />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 검색어 있는데 결과 없고 AI도 없을 때 */}
          {query.trim() && mockResults.length === 0 && !aiLoading && aiResults.length === 0 && (
            <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
              검색 결과가 없어요
            </p>
          )}

          {!query.trim() && selected.length === 0 && (
            <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
              {config.label}을 검색해보세요
            </p>
          )}

          {/* 직접 입력 토글 */}
          <button
            onClick={() => setShowDirect((v) => !v)}
            className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-text-tertiary)]"
          >
            <PenLine size={12} />
            직접 입력
          </button>

          {showDirect && (
            <div className="mt-2 space-y-2">
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder={`${config.label} 제목 *`}
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
              <div className="flex gap-2">
                <input
                  value={customSubtitle}
                  onChange={(e) => setCustomSubtitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                  placeholder={config.subtitlePlaceholder}
                  className="flex-1 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
                <button
                  onClick={addCustom}
                  disabled={!customTitle.trim()}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  style={{ background: 'var(--color-accent-dark)' }}
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
