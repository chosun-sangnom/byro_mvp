'use client'

// ─── 여행지 DB 가이드 (백엔드 구현 시 참고) ──────────────────────────────────
// Table: city_items (id, name, region, sort_order)
// GET /api/travel/cities  →  ISR revalidate:86400 권장
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, X } from 'lucide-react'
import { showToast } from '@/components/ui'
import type { LifeMediaItem } from '@/types'

type TravelRegion = 'all' | 'korea' | 'asia' | 'europe' | 'americas' | 'oceania'

const REGION_TABS: Array<{ id: TravelRegion; label: string; emoji: string }> = [
  { id: 'all',      label: '전체',      emoji: ''   },
  { id: 'korea',    label: '국내',      emoji: '🇰🇷' },
  { id: 'asia',     label: '아시아',    emoji: '🌏' },
  { id: 'europe',   label: '유럽',      emoji: '🏰' },
  { id: 'americas', label: '미주',      emoji: '🗽' },
  { id: 'oceania',  label: '오세아니아', emoji: '🦘' },
]

const REGION_ORDER: Exclude<TravelRegion, 'all'>[] = ['korea', 'asia', 'europe', 'americas', 'oceania']

interface CityItem {
  id: string
  name: string
  region: Exclude<TravelRegion, 'all'>
}

// ─── 도시별 기본 이미지 (Unsplash CDN) ───────────────────────────────────────
// TODO(real API): 백엔드 연동 시 DB에서 이미지 URL 관리
const BASE = 'https://images.unsplash.com/photo-'
const Q = '?w=200&h=200&q=75&fit=crop&auto=format'

const CITY_IMAGES: Record<string, string> = {
  // 국내
  '서울':       `${BASE}1517154421773-0529f29ea451${Q}`,
  '부산':       `${BASE}1578662996442-48f60103fc96${Q}`,
  '제주':       `${BASE}1600100397608-4e6c697e1d58${Q}`,
  '경주':       `${BASE}1600100397608-4e6c697e1d58${Q}`, // 한국 일반
  '강릉':       `${BASE}1504214208698-7d9b51b61be6${Q}`, // 동해 바다
  '여수':       `${BASE}1524492412937-b28074a5d7da${Q}`, // 항구 야경
  '전주':       `${BASE}1517154421773-0529f29ea451${Q}`, // 한국 일반
  '속초':       `${BASE}1504214208698-7d9b51b61be6${Q}`, // 동해 바다
  '통영':       `${BASE}1578662996442-48f60103fc96${Q}`, // 한국 항구
  '거제':       `${BASE}1578662996442-48f60103fc96${Q}`, // 한국 섬

  // 아시아 — 일본
  '도쿄':       `${BASE}1540959733332-eab4deabeeaf${Q}`,
  '오사카':     `${BASE}1589824823514-5b5d73b4eb24${Q}`,
  '교토':       `${BASE}1493976040374-85c8e12f0c0e${Q}`,
  '삿포로':     `${BASE}1584624491862-1f0de7eeee56${Q}`,
  '후쿠오카':   `${BASE}1540959733332-eab4deabeeaf${Q}`, // 일본 일반
  // 동남아
  '방콕':       `${BASE}1563492065599-3520f775eeed${Q}`,
  '발리':       `${BASE}1537996194471-e657df975ab4${Q}`,
  '싱가포르':   `${BASE}1524492412937-b28074a5d7da${Q}`,
  '홍콩':       `${BASE}1576788369575-4d2cd05e25b1${Q}`,
  '타이페이':   `${BASE}1528360983277-13d401cdc186${Q}`,
  '하노이':     `${BASE}1555921015-5532091f6026${Q}`,
  '다낭':       `${BASE}1559592413-7cec4d0cae2b${Q}`,
  '나트랑':     `${BASE}1505852679233-d9fd70aff56d${Q}`, // 해변
  '세부':       `${BASE}1505852679233-d9fd70aff56d${Q}`, // 열대 해변
  // 중국
  '상하이':     `${BASE}1538428494232-9c0d8a3ab403${Q}`,
  '베이징':     `${BASE}1508804185872-d7badad00f7d${Q}`,
  '청두':       `${BASE}1538428494232-9c0d8a3ab403${Q}`, // 중국 일반
  '마카오':     `${BASE}1576788369575-4d2cd05e25b1${Q}`, // 야경
  // 중동
  '두바이':     `${BASE}1512453979798-5ea266f8880c${Q}`,
  '이스탄불':   `${BASE}1524231757912-21f4fe3a7200${Q}`,

  // 유럽
  '파리':       `${BASE}1549144511-f099e773c147${Q}`,
  '런던':       `${BASE}1543832923-44667a44c804${Q}`,
  '로마':       `${BASE}1552832230-c0197dd311b5${Q}`,
  '바르셀로나': `${BASE}1539037116277-4db20889f2d4${Q}`,
  '암스테르담': `${BASE}1534351590666-13e3e96b5702${Q}`,
  '프라하':     `${BASE}1541849546-216549ae216d${Q}`,
  '빈':         `${BASE}1516550893923-42d28e5677af${Q}`,
  '취리히':     `${BASE}1506905925346-21bda4d32df4${Q}`, // 산 배경
  '베네치아':   `${BASE}1534113414509-0eec2bfb493f${Q}`,
  '피렌체':     `${BASE}1552832230-c0197dd311b5${Q}`,    // 이탈리아 일반
  '마드리드':   `${BASE}1539037116277-4db20889f2d4${Q}`, // 스페인 일반
  '리스본':     `${BASE}1555881400-74d7acaacd8b${Q}`,
  '산토리니':   `${BASE}1570077188670-e3a8d69ac5ff${Q}`,
  '코펜하겐':   `${BASE}1513622470522-26c3c8a854bc${Q}`,
  '스톡홀름':   `${BASE}1508193638397-1c4234db14d8${Q}`,
  '헬싱키':     `${BASE}1508193638397-1c4234db14d8${Q}`, // 북유럽 일반

  // 미주
  '뉴욕':       `${BASE}1496442226666-8d4d0e62e6e9${Q}`,
  '로스앤젤레스': `${BASE}1534430480872-3498386e7856${Q}`,
  '샌프란시스코': `${BASE}1501594907352-04cda38ebc29${Q}`,
  '라스베이거스': `${BASE}1605833556294-ea5c7a74f57d${Q}`,
  '하와이':     `${BASE}1505852679233-d9fd70aff56d${Q}`,
  '시카고':     `${BASE}1494522855154-9297ac14b55f${Q}`,
  '마이애미':   `${BASE}1533106497176-45ae19e68ba2${Q}`,
  '밴쿠버':     `${BASE}1501016757720-5a7b9d6b4eb6${Q}`,
  '토론토':     `${BASE}1517935706615-2717063c2225${Q}`,
  '칸쿤':       `${BASE}1532592937548-c5d4f5c0f77b${Q}`,
  '보스턴':     `${BASE}1494522855154-9297ac14b55f${Q}`, // 미국 도시 일반

  // 오세아니아
  '시드니':     `${BASE}1524820197278-540916411146${Q}`,
  '멜버른':     `${BASE}1545044846-351ba102b6d5${Q}`,
  '골드코스트': `${BASE}1505852679233-d9fd70aff56d${Q}`, // 해변
  '오클랜드':   `${BASE}1524820197278-540916411146${Q}`, // 오세아니아 일반
  '퀸스타운':   `${BASE}1506905925346-21bda4d32df4${Q}`, // 산악 경관
}

// 지역 기본 fallback (도시 이미지 없을 때)
const REGION_IMAGES: Record<Exclude<TravelRegion, 'all'>, string> = {
  korea:    `${BASE}1517154421773-0529f29ea451${Q}`,
  asia:     `${BASE}1540959733332-eab4deabeeaf${Q}`,
  europe:   `${BASE}1549144511-f099e773c147${Q}`,
  americas: `${BASE}1496442226666-8d4d0e62e6e9${Q}`,
  oceania:  `${BASE}1524820197278-540916411146${Q}`,
}

const getCityImage = (name: string, region: Exclude<TravelRegion, 'all'>): string =>
  CITY_IMAGES[name] ?? REGION_IMAGES[region]

const CITY_DB: CityItem[] = [
  { id: 'seoul',      name: '서울',       region: 'korea'    },
  { id: 'busan',      name: '부산',       region: 'korea'    },
  { id: 'jeju',       name: '제주',       region: 'korea'    },
  { id: 'gyeongju',   name: '경주',       region: 'korea'    },
  { id: 'gangneung',  name: '강릉',       region: 'korea'    },
  { id: 'yeosu',      name: '여수',       region: 'korea'    },
  { id: 'jeonju',     name: '전주',       region: 'korea'    },
  { id: 'sokcho',     name: '속초',       region: 'korea'    },
  { id: 'tongyeong',  name: '통영',       region: 'korea'    },
  { id: 'geoje',      name: '거제',       region: 'korea'    },
  { id: 'tokyo',      name: '도쿄',       region: 'asia'     },
  { id: 'osaka',      name: '오사카',     region: 'asia'     },
  { id: 'kyoto',      name: '교토',       region: 'asia'     },
  { id: 'sapporo',    name: '삿포로',     region: 'asia'     },
  { id: 'fukuoka',    name: '후쿠오카',   region: 'asia'     },
  { id: 'bangkok',    name: '방콕',       region: 'asia'     },
  { id: 'bali',       name: '발리',       region: 'asia'     },
  { id: 'singapore',  name: '싱가포르',   region: 'asia'     },
  { id: 'hongkong',   name: '홍콩',       region: 'asia'     },
  { id: 'taipei',     name: '타이페이',   region: 'asia'     },
  { id: 'hanoi',      name: '하노이',     region: 'asia'     },
  { id: 'danang',     name: '다낭',       region: 'asia'     },
  { id: 'nhatrang',   name: '나트랑',     region: 'asia'     },
  { id: 'cebu',       name: '세부',       region: 'asia'     },
  { id: 'shanghai',   name: '상하이',     region: 'asia'     },
  { id: 'beijing',    name: '베이징',     region: 'asia'     },
  { id: 'chengdu',    name: '청두',       region: 'asia'     },
  { id: 'macau',      name: '마카오',     region: 'asia'     },
  { id: 'dubai',      name: '두바이',     region: 'asia'     },
  { id: 'istanbul',   name: '이스탄불',   region: 'asia'     },
  { id: 'paris',      name: '파리',       region: 'europe'   },
  { id: 'london',     name: '런던',       region: 'europe'   },
  { id: 'rome',       name: '로마',       region: 'europe'   },
  { id: 'barcelona',  name: '바르셀로나', region: 'europe'   },
  { id: 'amsterdam',  name: '암스테르담', region: 'europe'   },
  { id: 'prague',     name: '프라하',     region: 'europe'   },
  { id: 'vienna',     name: '빈',         region: 'europe'   },
  { id: 'zurich',     name: '취리히',     region: 'europe'   },
  { id: 'venice',     name: '베네치아',   region: 'europe'   },
  { id: 'florence',   name: '피렌체',     region: 'europe'   },
  { id: 'madrid',     name: '마드리드',   region: 'europe'   },
  { id: 'lisbon',     name: '리스본',     region: 'europe'   },
  { id: 'santorini',  name: '산토리니',   region: 'europe'   },
  { id: 'copenhagen', name: '코펜하겐',   region: 'europe'   },
  { id: 'stockholm',  name: '스톡홀름',   region: 'europe'   },
  { id: 'helsinki',   name: '헬싱키',     region: 'europe'   },
  { id: 'newyork',    name: '뉴욕',       region: 'americas' },
  { id: 'la',         name: '로스앤젤레스', region: 'americas' },
  { id: 'sf',         name: '샌프란시스코', region: 'americas' },
  { id: 'lasvegas',   name: '라스베이거스', region: 'americas' },
  { id: 'hawaii',     name: '하와이',     region: 'americas' },
  { id: 'chicago',    name: '시카고',     region: 'americas' },
  { id: 'miami',      name: '마이애미',   region: 'americas' },
  { id: 'vancouver',  name: '밴쿠버',     region: 'americas' },
  { id: 'toronto',    name: '토론토',     region: 'americas' },
  { id: 'cancun',     name: '칸쿤',       region: 'americas' },
  { id: 'boston',     name: '보스턴',     region: 'americas' },
  { id: 'sydney',     name: '시드니',     region: 'oceania'  },
  { id: 'melbourne',  name: '멜버른',     region: 'oceania'  },
  { id: 'goldcoast',  name: '골드코스트', region: 'oceania'  },
  { id: 'auckland',   name: '오클랜드',   region: 'oceania'  },
  { id: 'queenstown', name: '퀸스타운',   region: 'oceania'  },
]

const MAX_ITEMS = 5

function CityPhotoButton({
  item,
  defaultImageUrl,
  onCameraClick,
}: {
  item: LifeMediaItem
  defaultImageUrl: string
  onCameraClick: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const displayUrl = item.posterUrl ?? (!imgFailed ? defaultImageUrl : undefined)
  const isUserPhoto = !!item.posterUrl

  return (
    <button
      onClick={onCameraClick}
      className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center"
    >
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={displayUrl}
          alt={item.label}
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <Camera size={15} className="text-[var(--color-text-tertiary)]" />
      )}
      {/* 카메라 뱃지: 기본 이미지일 때만 표시 */}
      {!isUserPhoto && displayUrl && (
        <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md bg-black/50">
          <Camera size={8} className="text-white" />
        </div>
      )}
    </button>
  )
}

export function TravelPicker({
  selected,
  onChange,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [activeRegion, setActiveRegion] = useState<TravelRegion>('all')
  const [customInput, setCustomInput] = useState('')
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedNames = new Set(selected.map((s) => s.label))
  const isAtLimit = selected.length >= MAX_ITEMS

  const filtered = activeRegion === 'all'
    ? CITY_DB
    : CITY_DB.filter((c) => c.region === activeRegion)

  const toggle = (city: CityItem) => {
    if (selectedNames.has(city.name)) {
      onChange(selected.filter((s) => s.label !== city.name))
    } else {
      if (isAtLimit) return
      onChange([...selected, { label: city.name }])
    }
  }

  const addCustom = () => {
    const name = customInput.trim()
    if (!name || selectedNames.has(name) || isAtLimit) return
    onChange([...selected, { label: name }])
    setCustomInput('')
  }

  const remove = (label: string) => onChange(selected.filter((s) => s.label !== label))

  const handleCameraClick = (label: string) => {
    setEditingLabel(label)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingLabel) return
    if (!file.type.startsWith('image/')) { showToast('이미지 파일만 업로드할 수 있어요'); return }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(selected.map((item) =>
          item.label === editingLabel ? { ...item, posterUrl: reader.result as string } : item
        ))
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
    setEditingLabel(null)
  }

  // 지역별 그룹핑 (CITY_DB에 없는 항목은 '기타'로)
  const grouped = selected.reduce<Record<string, LifeMediaItem[]>>((acc, item) => {
    const city = CITY_DB.find((c) => c.name === item.label)
    const region = city?.region ?? 'other'
    if (!acc[region]) acc[region] = []
    acc[region].push(item)
    return acc
  }, {})

  const getRegionInfo = (region: string) =>
    REGION_TABS.find((t) => t.id === region) ?? { label: '기타', emoji: '✏️' }

  const groupOrder = [...REGION_ORDER, 'other'].filter((r) => grouped[r])

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

      {/* ── 선택된 여행지 (지역별 그룹) ── */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-4">
          {/* 헬퍼 텍스트 */}
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            <Camera size={11} />
            기본 이미지를 눌러 내 여행 사진으로 바꿀 수 있어요
          </p>

          {groupOrder.map((region) => {
            const { label, emoji } = getRegionInfo(region)
            return (
              <div key={region}>
                <div className="mb-2 flex items-center gap-1.5">
                  {emoji && <span className="text-[12px]">{emoji}</span>}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>
                <div className="space-y-2">
                  {grouped[region].map((item) => {
                    const cityItem = CITY_DB.find((c) => c.name === item.label)
                    const defaultImg = cityItem
                      ? getCityImage(item.label, cityItem.region)
                      : REGION_IMAGES['korea']
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
                      >
                        <CityPhotoButton
                          item={item}
                          defaultImageUrl={defaultImg}
                          onCameraClick={() => handleCameraClick(item.label)}
                        />
                        <p className="flex-1 text-[13px] font-semibold text-[var(--color-text-primary)]">
                          {item.label}
                        </p>
                        <button onClick={() => remove(item.label)} className="flex-shrink-0 p-1">
                          <X size={14} className="text-[var(--color-text-tertiary)]" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isAtLimit && (
        <p className="mb-3 text-center text-[12px] text-[var(--color-text-tertiary)]">
          최대 {MAX_ITEMS}개까지 추가할 수 있어요
        </p>
      )}

      {!isAtLimit && (
        <>
          {/* 지역 탭 */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {REGION_TABS.map((tab) => {
              const active = activeRegion === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveRegion(tab.id)}
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

          {/* 도시 그리드 */}
          <div className="flex flex-wrap gap-2">
            {filtered.map((city) => {
              const isSelected = selectedNames.has(city.name)
              return (
                <button
                  key={city.id}
                  onClick={() => toggle(city)}
                  className="rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                    background: isSelected ? 'var(--color-accent-dark)' : 'var(--color-bg-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {city.name}
                </button>
              )
            })}
          </div>

          {/* 직접 입력 */}
          <div className="flex gap-2 mt-4">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
              placeholder="목록에 없으면 직접 입력..."
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
        </>
      )}
    </div>
  )
}
