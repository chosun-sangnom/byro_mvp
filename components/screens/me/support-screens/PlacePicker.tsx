'use client'

// ─── 카카오 로컬 API 연동 가이드 (백엔드 구현 시 참고) ─────────────────────────
//
// [인증] REST API 키 (서버 사이드 전용)
//   발급: https://developers.kakao.com → 내 애플리케이션 → 앱 키 → REST API 키
//   ※ .env.local에 KAKAO_REST_API_KEY 저장 (클라이언트 직접 노출 금지)
//   ※ CORS 이슈로 클라이언트에서 직접 호출 불가 → Next.js API Route로 프록시
//
// [검색 엔드포인트]
//   GET https://dapi.kakao.com/v2/local/search/keyword.json
//   Headers: Authorization: KakaoAK {KAKAO_REST_API_KEY}
//   Params:
//     query               - 검색어 (장소명, 주소 등)
//     category_group_code - FD6(음식점) | CE7(카페)
//     size                - 결과 수 (기본 15, 최대 45)
//     page                - 페이지 번호
//
// [응답에서 추출할 필드]
//   documents[].place_name         → 장소명 (= LifeMediaItem.label)
//   documents[].road_address_name  → 도로명 주소 (= LifeMediaItem.sublabel)
//   documents[].address_name       → 지번 주소 (road_address_name 없을 때 fallback)
//   documents[].category_name      → 카테고리 체인 (예: "음식점 > 한식 > 냉면")
//   documents[].place_url          → 카카오맵 상세 URL (선택 사항)
//
// [Next.js API Route 예시]
//   GET /api/places/search?q={query}&type=restaurant|cafe
//   → { places: Array<{ id, name, address, category }> }
//
// [주의사항]
//   - 카카오 로컬 API 무료 (일 300,000건 제한)
//   - 검색 결과 캐싱 권장 (동일 쿼리 TTL 30분)
// ──────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'

export type PlaceType = 'restaurant' | 'cafe'

interface MockPlace {
  id: string
  name: string
  address: string
  category: string
  type: PlaceType
}

// TODO(backend): 아래 MOCK_PLACES를 /api/places/search 호출로 교체
// query 변경 시 debounce(300ms) 후 API 호출, category_group_code는 type에 따라 FD6 / CE7 사용
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

const TYPE_CONFIG: Record<PlaceType, { placeholder: string; emptyHint: string }> = {
  restaurant: { placeholder: '맛집 이름 또는 동네 검색...', emptyHint: '좋아하는 맛집을 검색해보세요' },
  cafe:       { placeholder: '카페 이름 또는 동네 검색...', emptyHint: '자주 가는 카페를 검색해보세요' },
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

  const selectedNames = new Set(selected.map((s) => s.label))

  // TODO(backend): query 변경 시 debounce(300ms) 후 /api/places/search?q={query}&type={type} 호출
  const results = query.trim()
    ? MOCK_PLACES.filter(
        (p) =>
          p.type === type &&
          (p.name.includes(query) || p.address.includes(query) || p.category.includes(query)),
      )
    : []

  const toggle = (place: MockPlace) => {
    if (selectedNames.has(place.name)) {
      onChange(selected.filter((s) => s.label !== place.name))
    } else {
      onChange([...selected, { label: place.name, sublabel: place.address }])
    }
  }

  const cfg = TYPE_CONFIG[type]

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
                {item.sublabel && (
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.sublabel}</p>
                )}
              </div>
              <button onClick={() => onChange(selected.filter((s) => s.label !== item.label))} className="flex-shrink-0 p-1">
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
          placeholder={cfg.placeholder}
          className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
        />
      </div>

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-[var(--color-border-default)] divide-y divide-[var(--color-border-soft)]">
          {results.map((place) => {
            const isSelected = selectedNames.has(place.name)
            return (
              <button
                key={place.id}
                onClick={() => toggle(place)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[var(--color-bg-muted)]"
              >
                <MapPin size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)]" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-[var(--color-text-primary)]">{place.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{place.address} · {place.category}</p>
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
        <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">
          검색 결과가 없어요
          {/* TODO(backend): 실제 카카오 API 연동 후 이 케이스 대폭 감소 */}
        </p>
      )}

      {!query.trim() && selected.length === 0 && (
        <p className="mt-2 text-center text-sm text-[var(--color-text-tertiary)]">{cfg.emptyHint}</p>
      )}
    </div>
  )
}
