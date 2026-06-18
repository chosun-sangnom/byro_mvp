'use client'

// ─── 카카오 로컬 API 연동 가이드 (백엔드 구현 시 참고) ─────────────────────────
//
// GET https://dapi.kakao.com/v2/local/search/keyword.json
//   Headers: Authorization: KakaoAK {KAKAO_REST_API_KEY}
//   Params: query, category_group_code: FD6(음식점) | CE7(카페), size, page
//
//   documents[].place_name        → 장소명 (LifeMediaItem.label)
//   documents[].road_address_name → 도로명 주소 (LifeMediaItem.sublabel)
//
// Next.js Route: GET /api/places/search?q={query}&type=restaurant|cafe
// ※ KAKAO_REST_API_KEY → .env.local (클라이언트 직접 호출 불가, API Route로 프록시)
// ※ 무료 300,000건/일, 검색 결과 캐싱 권장 (TTL 30분)
//
// TODO(real API): 연동 후 아래 MOCK_PLACES 및 AI 검색을 폴백으로 전환
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import { Loader2, MapPin, PenLine, Search, Sparkles, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'
import type { AiSearchItem } from '@/app/api/ai-search/route'

export type PlaceType = 'restaurant' | 'cafe'

const MAX_ITEMS = 5

interface MockPlace {
  id: string
  name: string
  address: string
  category: string
  type: PlaceType
}

// TODO(real API): 아래 MOCK_PLACES를 /api/places/search 호출로 교체
const MOCK_PLACES: MockPlace[] = [
  // ── 맛집 ────────────────────────────────────────────────────────────────────
  { id: 'r-uukmien',     name: '성수 우육미엔',    address: '서울 성동구 성수이로',  category: '중식 > 면류',     type: 'restaurant' },
  { id: 'r-ddeum',       name: '뜸들이다',          address: '서울 강남구 압구정로',  category: '한식 > 한정식',   type: 'restaurant' },
  { id: 'r-euljimildae', name: '을밀대',            address: '서울 중구 을지로',      category: '한식 > 냉면',     type: 'restaurant' },
  { id: 'r-mimiok',      name: '미미옥',            address: '서울 종로구 세종대로',  category: '한식 > 설렁탕',   type: 'restaurant' },
  { id: 'r-palsin',      name: '팔선',              address: '서울 종로구 삼청동',    category: '중식 > 북경요리', type: 'restaurant' },
  { id: 'r-sushiya',     name: '스시야',            address: '서울 용산구 한남동',    category: '일식 > 스시',     type: 'restaurant' },
  { id: 'r-ramen',       name: '오레노라멘',        address: '서울 마포구 연남동',    category: '일식 > 라멘',     type: 'restaurant' },
  { id: 'r-laferme',     name: '라페름',            address: '서울 강남구 신사동',    category: '양식 > 프렌치',   type: 'restaurant' },
  { id: 'r-hongeo',      name: '망원 홍어삼합',     address: '서울 마포구 망원동',    category: '한식 > 해산물',   type: 'restaurant' },
  { id: 'r-suyeon',      name: '수연산방',          address: '서울 성북구 성북동',    category: '한식 > 찻집',     type: 'restaurant' },
  { id: 'r-bread05',     name: '브레드05',          address: '서울 강남구 논현동',    category: '베이커리',         type: 'restaurant' },
  { id: 'r-gaon',        name: '가온',              address: '서울 강남구 청담동',    category: '한식 > 한정식',   type: 'restaurant' },
  // ── 카페 ────────────────────────────────────────────────────────────────────
  { id: 'c-onion',       name: '어니언 성수',       address: '서울 성동구 아차산로',  category: '카페',             type: 'cafe' },
  { id: 'c-fritz',       name: '프릳츠 원서점',     address: '서울 종로구 원서동',    category: '카페',             type: 'cafe' },
  { id: 'c-center',      name: '센터커피 성수',     address: '서울 성동구 성수이로',  category: '카페',             type: 'cafe' },
  { id: 'c-bluebottle',  name: '블루보틀 삼청',     address: '서울 종로구 삼청동',    category: '카페',             type: 'cafe' },
  { id: 'c-layered',     name: '레이어드 한남',     address: '서울 용산구 한남동',    category: '카페',             type: 'cafe' },
  { id: 'c-collectiveb', name: '콜렉티브비 연남',   address: '서울 마포구 연남동',    category: '카페',             type: 'cafe' },
  { id: 'c-diedit',      name: '디에디트 성수',     address: '서울 성동구 성수동',    category: '카페',             type: 'cafe' },
  { id: 'c-counters',    name: '카운터스 망원',     address: '서울 마포구 망원동',    category: '카페',             type: 'cafe' },
  { id: 'c-aroundfolly', name: '어라운드폴리',      address: '서울 마포구 서교동',    category: '카페',             type: 'cafe' },
  { id: 'c-inthelab',    name: '인더랩',            address: '서울 용산구 이태원동',  category: '카페',             type: 'cafe' },
]

const TYPE_CONFIG: Record<PlaceType, { placeholder: string; emptyHint: string; namePlaceholder: string; addrPlaceholder: string }> = {
  restaurant: {
    placeholder: '맛집 이름 또는 동네 검색...',
    emptyHint: '좋아하는 맛집을 검색해보세요',
    namePlaceholder: '식당 이름 *',
    addrPlaceholder: '동네 또는 주소 (선택)',
  },
  cafe: {
    placeholder: '카페 이름 또는 동네 검색...',
    emptyHint: '자주 가는 카페를 검색해보세요',
    namePlaceholder: '카페 이름 *',
    addrPlaceholder: '동네 또는 주소 (선택)',
  },
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

export function PlacePicker({
  type,
  selected,
  onChange,
}: {
  type: PlaceType
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [query, setQuery] = useState('')
  const [aiResults, setAiResults] = useState<AiSearchItem[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showDirect, setShowDirect] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customAddr, setCustomAddr] = useState('')

  const cfg = TYPE_CONFIG[type]
  const selectedNames = new Set(selected.map((s) => s.label))
  const isAtLimit = selected.length >= MAX_ITEMS

  // TODO(real API): query 변경 시 debounce(300ms) 후 /api/places/search?q={query}&type={type} 호출로 교체
  const mockResults = query.trim()
    ? MOCK_PLACES.filter(
        (p) =>
          p.type === type &&
          (p.name.includes(query) || p.address.includes(query) || p.category.includes(query)),
      )
    : []

  useEffect(() => {
    if (!query.trim() || mockResults.length > 0) { setAiResults([]); setAiLoading(false); return }
    setAiLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ai-search?q=${encodeURIComponent(query)}&type=${type}`)
        const data = await res.json()
        setAiResults(data.items ?? [])
      } catch {
        setAiResults([])
      } finally {
        setAiLoading(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type, mockResults.length])

  const toggleMock = (place: MockPlace) => {
    if (selectedNames.has(place.name)) {
      onChange(selected.filter((s) => s.label !== place.name))
    } else {
      if (isAtLimit) return
      onChange([...selected, { label: place.name, sublabel: place.address }])
    }
  }

  const toggleAi = (item: AiSearchItem) => {
    if (selectedNames.has(item.title)) {
      onChange(selected.filter((s) => s.label !== item.title))
    } else {
      if (isAtLimit) return
      onChange([...selected, { label: item.title, sublabel: item.subtitle }])
    }
  }

  const addCustom = () => {
    const name = customName.trim()
    if (!name || selectedNames.has(name) || isAtLimit) return
    onChange([...selected, { label: name, sublabel: customAddr.trim() || undefined }])
    setCustomName('')
    setCustomAddr('')
  }

  return (
    <div>
      {/* 선택된 장소 */}
      {selected.length > 0 && (
        <div className="mb-3 space-y-2">
          {selected.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
            >
              <MapPin size={14} className="flex-shrink-0 text-[var(--color-accent-dark)]" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                {item.sublabel && <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>}
              </div>
              <button onClick={() => onChange(selected.filter((s) => s.label !== item.label))} className="flex-shrink-0 p-1">
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

      {!isAtLimit && (
        <>
          {/* 검색창 */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={cfg.placeholder}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </div>

          {/* Mock 결과 */}
          {mockResults.length > 0 && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
              {mockResults.map((place) => {
                const isSelected = selectedNames.has(place.name)
                return (
                  <button
                    key={place.id}
                    onClick={() => toggleMock(place)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                  >
                    <MapPin size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)]" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{place.name}</p>
                      <p className="text-[11px] text-[var(--color-text-tertiary)]">{place.address} · {place.category}</p>
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
              <div className="max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
                {aiResults.map((item) => {
                  const isSelected = selectedNames.has(item.title)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAi(item)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
                    >
                      <MapPin size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)]" />
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

          {query.trim() && mockResults.length === 0 && !aiLoading && aiResults.length === 0 && (
            <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">
              검색 결과가 없어요
            </p>
          )}
          {!query.trim() && selected.length === 0 && (
            <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">{cfg.emptyHint}</p>
          )}

          {/* 직접 입력 */}
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
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                placeholder={cfg.namePlaceholder}
                className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
              />
              <div className="flex gap-2">
                <input
                  value={customAddr}
                  onChange={(e) => setCustomAddr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
                  placeholder={cfg.addrPlaceholder}
                  className="flex-1 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
                <button
                  onClick={addCustom}
                  disabled={!customName.trim()}
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
