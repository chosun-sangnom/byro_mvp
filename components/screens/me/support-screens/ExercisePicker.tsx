'use client'

// ─── 운동 종목 DB 가이드 (백엔드 구현 시 참고) ────────────────────────────────
// Table: exercise_items (id, name, category, sort_order)
// GET /api/exercise/items  →  ISR revalidate:3600 권장
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, X } from 'lucide-react'
import { showToast } from '@/components/ui'
import type { LifeMediaItem } from '@/types'

type ExerciseCategory = 'all' | 'run' | 'ball' | 'fitness' | 'martial' | 'water' | 'outdoor' | 'other'

const CATEGORY_TABS: Array<{ id: ExerciseCategory; label: string; emoji: string }> = [
  { id: 'all',     label: '전체',    emoji: ''   },
  { id: 'run',     label: '러닝',    emoji: '🏃' },
  { id: 'ball',    label: '구기',    emoji: '⚽' },
  { id: 'fitness', label: '피트니스', emoji: '🏋️' },
  { id: 'martial', label: '무도',    emoji: '🥊' },
  { id: 'water',   label: '수상',    emoji: '🏊' },
  { id: 'outdoor', label: '아웃도어', emoji: '🏔️' },
  { id: 'other',   label: '기타',    emoji: '🎯' },
]

const CATEGORY_ORDER: Exclude<ExerciseCategory, 'all'>[] = ['run', 'ball', 'fitness', 'martial', 'water', 'outdoor', 'other']

interface ExerciseItem {
  id: string
  name: string
  category: Exclude<ExerciseCategory, 'all'>
}

// TODO(backend): GET /api/exercise/items 호출로 교체
const EXERCISE_DB: ExerciseItem[] = [
  { id: 'running',      name: '러닝',       category: 'run'     },
  { id: 'jogging',      name: '조깅',       category: 'run'     },
  { id: 'walking',      name: '걷기',       category: 'run'     },
  { id: 'marathon',     name: '마라톤',     category: 'run'     },
  { id: 'trail',        name: '트레일러닝', category: 'run'     },
  { id: 'sprinting',    name: '단거리달리기', category: 'run'   },
  { id: 'soccer',       name: '축구',       category: 'ball'    },
  { id: 'futsal',       name: '풋살',       category: 'ball'    },
  { id: 'basketball',   name: '농구',       category: 'ball'    },
  { id: 'baseball',     name: '야구',       category: 'ball'    },
  { id: 'tennis',       name: '테니스',     category: 'ball'    },
  { id: 'badminton',    name: '배드민턴',   category: 'ball'    },
  { id: 'tabletennis',  name: '탁구',       category: 'ball'    },
  { id: 'golf',         name: '골프',       category: 'ball'    },
  { id: 'squash',       name: '스쿼시',     category: 'ball'    },
  { id: 'volleyball',   name: '배구',       category: 'ball'    },
  { id: 'bowling',      name: '볼링',       category: 'ball'    },
  { id: 'rugby',        name: '럭비',       category: 'ball'    },
  { id: 'gym',          name: '헬스',       category: 'fitness' },
  { id: 'crossfit',     name: '크로스핏',   category: 'fitness' },
  { id: 'pilates',      name: '필라테스',   category: 'fitness' },
  { id: 'yoga',         name: '요가',       category: 'fitness' },
  { id: 'cycling',      name: '실내사이클', category: 'fitness' },
  { id: 'stretching',   name: '스트레칭',   category: 'fitness' },
  { id: 'calisthenics', name: '맨몸운동',   category: 'fitness' },
  { id: 'jumping',      name: '줄넘기',     category: 'fitness' },
  { id: 'boxing',       name: '복싱',       category: 'martial' },
  { id: 'taekwondo',    name: '태권도',     category: 'martial' },
  { id: 'judo',         name: '유도',       category: 'martial' },
  { id: 'muay',         name: '무에타이',   category: 'martial' },
  { id: 'bjj',          name: '주짓수',     category: 'martial' },
  { id: 'kendo',        name: '검도',       category: 'martial' },
  { id: 'wrestling',    name: '레슬링',     category: 'martial' },
  { id: 'hapkido',      name: '합기도',     category: 'martial' },
  { id: 'swimming',     name: '수영',       category: 'water'   },
  { id: 'surfing',      name: '서핑',       category: 'water'   },
  { id: 'scuba',        name: '스쿠버다이빙', category: 'water' },
  { id: 'kayak',        name: '카약',       category: 'water'   },
  { id: 'sup',          name: 'SUP',        category: 'water'   },
  { id: 'waterski',     name: '수상스키',   category: 'water'   },
  { id: 'hiking',       name: '등산',       category: 'outdoor' },
  { id: 'climbing',     name: '클라이밍',   category: 'outdoor' },
  { id: 'cycling_out',  name: '자전거',     category: 'outdoor' },
  { id: 'mtb',          name: 'MTB',        category: 'outdoor' },
  { id: 'camping',      name: '캠핑',       category: 'outdoor' },
  { id: 'ski',          name: '스키',       category: 'outdoor' },
  { id: 'snowboard',    name: '스노보드',   category: 'outdoor' },
  { id: 'skating',      name: '스케이팅',   category: 'outdoor' },
  { id: 'paragliding',  name: '패러글라이딩', category: 'outdoor' },
  { id: 'billiards',    name: '당구',       category: 'other'   },
  { id: 'darts',        name: '다트',       category: 'other'   },
  { id: 'horse',        name: '승마',       category: 'other'   },
  { id: 'fencing',      name: '펜싱',       category: 'other'   },
  { id: 'archery',      name: '양궁',       category: 'other'   },
  { id: 'dance',        name: '댄스',       category: 'other'   },
  { id: 'cheerleading', name: '치어리딩',   category: 'other'   },
]

const MAX_ITEMS = 5

export function ExercisePicker({
  selected,
  onChange,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('all')
  const [customInput, setCustomInput] = useState('')
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedNames = new Set(selected.map((s) => s.label))
  const isAtLimit = selected.length >= MAX_ITEMS

  const filtered = activeCategory === 'all'
    ? EXERCISE_DB
    : EXERCISE_DB.filter((e) => e.category === activeCategory)

  const toggle = (item: ExerciseItem) => {
    if (selectedNames.has(item.name)) {
      onChange(selected.filter((s) => s.label !== item.name))
    } else {
      if (isAtLimit) return
      onChange([...selected, { label: item.name }])
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

  // 카테고리별 그룹핑
  const grouped = CATEGORY_ORDER.reduce<Record<string, LifeMediaItem[]>>((acc, cat) => {
    const items = selected.filter((s) => {
      const found = EXERCISE_DB.find((e) => e.name === s.label)
      return found ? found.category === cat : cat === 'other'
    })
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  const getCategoryInfo = (cat: string) =>
    CATEGORY_TABS.find((t) => t.id === cat) ?? { label: '기타', emoji: '🎯' }

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />

      {/* ── 선택된 운동 (카테고리별 그룹) ── */}
      {selected.length > 0 && (
        <div className="mb-4 space-y-4">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => {
            const { label, emoji } = getCategoryInfo(cat)
            return (
              <div key={cat}>
                {/* 카테고리 헤더 */}
                <div className="mb-2 flex items-center gap-1.5">
                  {emoji && <span className="text-[12px]">{emoji}</span>}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>
                {/* 아이템 카드 */}
                <div className="space-y-2">
                  {grouped[cat].map((item) => (
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
          {/* 카테고리 탭 */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const active = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
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

          {/* 종목 그리드 */}
          <div className="flex flex-wrap gap-2">
            {filtered.map((item) => {
              const isSelected = selectedNames.has(item.name)
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item)}
                  className="rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors"
                  style={{
                    borderColor: isSelected ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                    background: isSelected ? 'var(--color-accent-dark)' : 'var(--color-bg-surface)',
                    color: isSelected ? '#fff' : 'var(--color-text-secondary)',
                  }}
                >
                  {item.name}
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
