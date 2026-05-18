'use client'

// ─── 미디어 타입별 API 연동 가이드 (백엔드 구현 시 참고) ─────────────────────
//
// ┌─ MOVIE (영화) ─────────────────────────────────────────────────────────────
// │  API: TMDB (The Movie Database) — 무료, 포스터 이미지 포함
// │
// │  [인증] API Key 방식 (회원가입 후 발급, 무료)
// │    https://developer.themoviedb.org/docs/getting-started
// │
// │  [검색 엔드포인트]
// │    GET https://api.themoviedb.org/3/search/movie
// │        ?api_key={TMDB_API_KEY}&query={q}&language=ko-KR&include_adult=false
// │
// │  [응답 필드]
// │    results[].id            → 고유 ID
// │    results[].title         → 한국어 제목 (= LifeMediaItem.label)
// │    results[].original_title → 원제 (= LifeMediaItem.sublabel 보조용)
// │    results[].release_date  → "2023-05-24" (연도만 표시)
// │    results[].poster_path   → "/abc123.jpg"
// │    포스터 URL: https://image.tmdb.org/t/p/w185{poster_path}
// │                                               ^^^^ w92 / w185 / w342 선택 가능
// │
// │  [Next.js API Route]
// │    GET /api/media/movie?q={query}
// │    → { items: Array<{ id, title, subtitle: 감독명, detail: 개봉연도, posterUrl }> }
// └────────────────────────────────────────────────────────────────────────────
//
// ┌─ BOOK (책) ────────────────────────────────────────────────────────────────
// │  API: 카카오 도서 검색 API — 무료, 한국 도서 최적
// │    (대안: Google Books API — 영문 도서 풍부, langRestrict=ko 지원)
// │
// │  [인증] REST API 키 (카카오 개발자 콘솔 발급, 무료)
// │    https://developers.kakao.com/docs/latest/ko/daum-search/dev-guide#search-book
// │
// │  [검색 엔드포인트]
// │    GET https://dapi.kakao.com/v3/search/book?query={q}&sort=accuracy&size=10
// │    Headers: Authorization: KakaoAK {KAKAO_REST_API_KEY}
// │
// │  [응답 필드]
// │    documents[].title       → 책 제목 (= LifeMediaItem.label)
// │    documents[].authors[]   → 저자 배열 → join(', ') (= LifeMediaItem.sublabel)
// │    documents[].thumbnail   → 표지 이미지 URL (= LifeMediaItem.posterUrl)
// │    documents[].publisher   → 출판사
// │    documents[].datetime    → "2022-03-15T00:00:00.000+09:00" → 연도 추출
// │
// │  [Next.js API Route]
// │    GET /api/media/book?q={query}
// │    → { items: Array<{ id, title, subtitle: 저자, detail: 출판사, posterUrl }> }
// └────────────────────────────────────────────────────────────────────────────
//
// ┌─ PLAY (공연 · 연극) ────────────────────────────────────────────────────────
// │  API: KOPIS (공연예술통합전산망) — 공식 무료 API, 문화체육관광부 운영
// │    https://www.kopis.or.kr/por/cs/openapi/openApiUseSend.do
// │
// │  [인증] 서비스키 발급 (회원가입 후 신청, 무료)
// │
// │  [검색 엔드포인트] ※ XML 응답 → 서버에서 파싱 후 JSON 제공 권장
// │    GET https://www.kopis.or.kr/openApi/restful/pblprfr
// │        ?service={KOPIS_SERVICE_KEY}
// │        &stdate={오늘 yyyyMMdd}
// │        &eddate={1년 후 yyyyMMdd}
// │        &cpage=1&rows=10
// │        &shprfnm={query}         ← 공연명 검색
// │        &shcate=AAAA             ← 뮤지컬 / BBBB=연극 / CCCC=클래식 등
// │
// │  [응답 필드] (XML → JSON 변환 후)
// │    db[].mt20id     → 공연 ID
// │    db[].prfnm      → 공연명 (= LifeMediaItem.label)
// │    db[].poster     → 포스터 이미지 URL (= LifeMediaItem.posterUrl)
// │    db[].fcltynm    → 공연장명 (= LifeMediaItem.sublabel)
// │    db[].prfpdfrom  → 시작일 "2024.01.01"
// │    db[].prfpdto    → 종료일
// │
// │  [Next.js API Route]
// │    GET /api/media/play?q={query}
// │    → { items: Array<{ id, title, subtitle: 공연장, detail: 공연기간, posterUrl }> }
// └────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { BookOpen, Clapperboard, Search, Theater, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'

export type MediaType = 'movie' | 'book' | 'play'

interface MockMediaItem {
  id: string
  title: string
  subtitle: string  // 감독 / 저자 / 공연장
  detail: string    // 개봉연도 / 출판사 / 공연기간
  placeholderColor: string
  // TODO(backend): posterUrl: string  — API 응답의 이미지 URL로 교체
}

// TODO(backend): 아래 MOCK_DATA를 /api/media/{type}?q={query} 호출로 교체
const MOCK_DATA: Record<MediaType, MockMediaItem[]> = {
  movie: [
    { id: 'm1',  title: '기생충',          subtitle: '봉준호',     detail: '2019', placeholderColor: '#2C3E50' },
    { id: 'm2',  title: '올드보이',         subtitle: '박찬욱',     detail: '2003', placeholderColor: '#922B21' },
    { id: 'm3',  title: '부산행',           subtitle: '연상호',     detail: '2016', placeholderColor: '#1A5276' },
    { id: 'm4',  title: '범죄도시',         subtitle: '강윤성',     detail: '2017', placeholderColor: '#784212' },
    { id: 'm5',  title: '소셜 네트워크',    subtitle: '데이비드 핀처', detail: '2010', placeholderColor: '#1F618D' },
    { id: 'm6',  title: '머니볼',           subtitle: '베넷 밀러',  detail: '2011', placeholderColor: '#1E8449' },
    { id: 'm7',  title: '인터스텔라',       subtitle: '크리스토퍼 놀란', detail: '2014', placeholderColor: '#0D0D0D' },
    { id: 'm8',  title: '어벤져스: 엔드게임', subtitle: '루소 형제', detail: '2019', placeholderColor: '#7B241C' },
    { id: 'm9',  title: '라라랜드',         subtitle: '다미엔 차젤', detail: '2016', placeholderColor: '#6C3483' },
    { id: 'm10', title: '이터널 선샤인',    subtitle: '미셸 공드리', detail: '2004', placeholderColor: '#1A5276' },
    { id: 'm11', title: '빠삐용',           subtitle: '마이클 노어', detail: '2017', placeholderColor: '#784212' },
    { id: 'm12', title: '콘크리트 유토피아', subtitle: '엄태화',    detail: '2023', placeholderColor: '#424949' },
  ],
  book: [
    { id: 'b1',  title: '린 스타트업',       subtitle: '에릭 리스',    detail: '한국경제신문', placeholderColor: '#148F77' },
    { id: 'b2',  title: '제로 투 원',         subtitle: '피터 틸',     detail: '한국경제신문', placeholderColor: '#1A5276' },
    { id: 'b3',  title: '하드씽',            subtitle: '벤 호로위츠',  detail: '한국경제신문', placeholderColor: '#922B21' },
    { id: 'b4',  title: '넛지',              subtitle: '리처드 탈러',  detail: '리더스북',    placeholderColor: '#1E8449' },
    { id: 'b5',  title: '생각에 관한 생각',   subtitle: '대니얼 카너먼', detail: '김영사',     placeholderColor: '#6C3483' },
    { id: 'b6',  title: '아토믹 해빗',        subtitle: '제임스 클리어', detail: '비즈니스북스', placeholderColor: '#D35400' },
    { id: 'b7',  title: '픽사 이야기',        subtitle: '에드 캣멀',   detail: '흐름출판',    placeholderColor: '#2E4057' },
    { id: 'b8',  title: '소크라테스 익스프레스', subtitle: '에릭 와이너', detail: '어크로스',   placeholderColor: '#784212' },
    { id: 'b9',  title: '채식주의자',         subtitle: '한강',        detail: '창비',        placeholderColor: '#2C3E50' },
    { id: 'b10', title: '82년생 김지영',       subtitle: '조남주',      detail: '민음사',      placeholderColor: '#7B241C' },
    { id: 'b11', title: '트렌드 코리아 2025', subtitle: '김난도 외',   detail: '미래의창',    placeholderColor: '#1F618D' },
    { id: 'b12', title: '도파민네이션',        subtitle: '애나 렘키',   detail: '흐름출판',    placeholderColor: '#424949' },
  ],
  play: [
    { id: 'p1',  title: '렛미플라이',     subtitle: '예술의전당',     detail: '2024.03–05', placeholderColor: '#6C3483' },
    { id: 'p2',  title: '레미제라블',     subtitle: '블루스퀘어',     detail: '2024.01–04', placeholderColor: '#1A5276' },
    { id: 'p3',  title: '캣츠',          subtitle: '샤롯데씨어터',   detail: '2024.06–08', placeholderColor: '#1E8449' },
    { id: 'p4',  title: '위키드',         subtitle: '디큐브아트센터', detail: '2024.05–07', placeholderColor: '#148F77' },
    { id: 'p5',  title: '오페라의 유령',  subtitle: '블루스퀘어',     detail: '2023.12–24.02', placeholderColor: '#2C3E50' },
    { id: 'p6',  title: '엘리자벳',       subtitle: '샤롯데씨어터',   detail: '2024.09–12', placeholderColor: '#922B21' },
    { id: 'p7',  title: '드라큘라',       subtitle: '예술의전당',     detail: '2024.04–06', placeholderColor: '#424949' },
    { id: 'p8',  title: '레드북',         subtitle: '대학로 아트원씨어터', detail: '2024.02–04', placeholderColor: '#D35400' },
    { id: 'p9',  title: '조씨고아, 복수의 씨앗', subtitle: '명동예술극장', detail: '2024.03–04', placeholderColor: '#784212' },
    { id: 'p10', title: '벽 속의 요정',   subtitle: '대학로 드림아트센터', detail: '2024.05–', placeholderColor: '#6C3483' },
  ],
}

const TYPE_CONFIG: Record<MediaType, { label: string; placeholder: string; Icon: React.ElementType }> = {
  movie: { label: '영화',      placeholder: '영화 제목 또는 감독 검색...', Icon: Clapperboard },
  book:  { label: '책',        placeholder: '책 제목 또는 저자 검색...',   Icon: BookOpen     },
  play:  { label: '공연 · 연극', placeholder: '공연명 또는 공연장 검색...',  Icon: Theater      },
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
    // TODO(backend): API에서 받은 실제 이미지 URL 렌더링
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
  const config = TYPE_CONFIG[type]

  // TODO(backend): query 변경 시 debounce(300ms) 후 API 호출로 교체
  // const [results, setResults] = useState<MockMediaItem[]>([])
  // const [isLoading, setIsLoading] = useState(false)
  // useEffect(() => {
  //   if (!query.trim()) return setResults([])
  //   const timer = setTimeout(async () => {
  //     setIsLoading(true)
  //     const res = await fetch(`/api/media/${type}?q=${encodeURIComponent(query)}`)
  //     const data = await res.json()
  //     setResults(data.items)  // { id, title, subtitle, detail, posterUrl }
  //     setIsLoading(false)
  //   }, 300)
  //   return () => clearTimeout(timer)
  // }, [query, type])
  const results = query.trim()
    ? MOCK_DATA[type].filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()),
      )
    : []

  const selectedKeys = new Set(selected.map((s) => s.label))

  const toggle = (item: MockMediaItem) => {
    if (selectedKeys.has(item.title)) {
      onChange(selected.filter((s) => s.label !== item.title))
    } else {
      onChange([
        ...selected,
        {
          label: item.title,
          sublabel: item.subtitle,
          // TODO(backend): posterUrl: item.posterUrl  (API 응답값으로 채워짐)
        },
      ])
    }
  }

  const remove = (label: string) => onChange(selected.filter((s) => s.label !== label))

  const getPlaceholderColor = (label: string) =>
    MOCK_DATA[type].find((m) => m.title === label)?.placeholderColor ?? '#555'

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

      {/* 검색창 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={config.placeholder}
          className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
          {results.map((item) => {
            const isSelected = selectedKeys.has(item.title)
            return (
              <button
                key={item.id}
                onClick={() => toggle(item)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
              >
                <MediaCover placeholderColor={item.placeholderColor} Icon={config.Icon} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.subtitle} · {item.detail}</p>
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
          })}
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
          검색 결과가 없어요
        </p>
      )}

      {!query.trim() && selected.length === 0 && (
        <p className="mt-3 text-center text-sm text-[var(--color-text-tertiary)]">
          {config.label}을 검색해보세요
        </p>
      )}
    </div>
  )
}
