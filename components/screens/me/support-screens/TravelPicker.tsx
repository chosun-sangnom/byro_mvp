'use client'

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

      <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4">
        내가 다녀온 여행지를 추가해요.
      </p>

      {/* ── 선택된 여행지 (지역별 그룹) ── */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-4">
          {groupOrder.map((region) => {
            const { label, emoji } = getRegionInfo(region)
            return (
              <div key={region}>
                {/* 지역 헤더 */}
                <div className="mb-2 flex items-center gap-1.5">
                  {emoji && <span className="text-[12px]">{emoji}</span>}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>
                {/* 아이템 카드 */}
                <div className="space-y-2">
                  {grouped[region].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
                    >
                      {/* 사진 업로드 버튼 */}
                      <button
                        onClick={() => handleCameraClick(item.label)}
                        className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center"
                      >
                        {item.posterUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={item.posterUrl} alt={item.label} className="h-full w-full object-cover" />
                          : <Camera size={15} className="text-[var(--color-text-tertiary)]" />
                        }
                      </button>
                      <p className="flex-1 text-[13px] font-semibold text-[var(--color-text-primary)]">
                        {item.label}
                      </p>
                      <button onClick={() => remove(item.label)} className="flex-shrink-0 p-1">
                        <X size={14} className="text-[var(--color-text-tertiary)]" />
                      </button>
                    </div>
                  ))}
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
