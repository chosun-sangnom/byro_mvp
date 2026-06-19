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

// ─── 운동별 기본 이미지 (Unsplash CDN) ───────────────────────────────────────
// TODO(real API): 백엔드 연동 시 DB에서 이미지 URL 관리
const BASE = 'https://images.unsplash.com/photo-'
const Q = '?w=200&h=200&q=75&fit=crop&auto=format'

// 카테고리 기본 이미지 (항목별 이미지 없을 때 fallback)
const CATEGORY_IMAGES: Record<Exclude<ExerciseCategory, 'all'>, string> = {
  run:     `${BASE}1571008887538-b36bb32f4571${Q}`,  // 러닝
  ball:    `${BASE}1553778263-73a83bab9b0c${Q}`,      // 축구
  fitness: `${BASE}1534438327276-14e5300c3a48${Q}`,   // 헬스장
  martial: `${BASE}1544717305-2782549b5136${Q}`,      // 복싱
  water:   `${BASE}1530549387789-4c1017266635${Q}`,   // 수영
  outdoor: `${BASE}1551632811-561732d1e306${Q}`,      // 등산
  other:   `${BASE}1546519638-68e109498ffc${Q}`,      // 농구장(일반)
}

// 항목별 특화 이미지
const EXERCISE_IMAGES: Record<string, string> = {
  '러닝':       `${BASE}1571008887538-b36bb32f4571${Q}`,
  '조깅':       `${BASE}1571008887538-b36bb32f4571${Q}`,
  '걷기':       `${BASE}1476480862126-209bfaa8edc8${Q}`,
  '마라톤':     `${BASE}1513593771513-7b58b6c4af38${Q}`,
  '트레일러닝': `${BASE}1455156218388-5e61287f7f6d${Q}`,
  '축구':       `${BASE}1553778263-73a83bab9b0c${Q}`,
  '농구':       `${BASE}1546519638-68e109498ffc${Q}`,
  '야구':       `${BASE}1566577739112-5180d4bf9390${Q}`,
  '테니스':     `${BASE}1554068865-24ceec41ef66${Q}`,
  '골프':       `${BASE}1535131749006-b7f58c99034b${Q}`,
  '배구':       `${BASE}1612872087720-bb876e2e67d1${Q}`,
  '볼링':       `${BASE}1545809074-59472b3f5ecc${Q}`,
  '헬스':       `${BASE}1534438327276-14e5300c3a48${Q}`,
  '크로스핏':   `${BASE}1541534401786-2077eed87a74${Q}`,
  '필라테스':   `${BASE}1518611012118-696072aa579a${Q}`,
  '요가':       `${BASE}1544367567-0f2fcb009e0b${Q}`,
  '실내사이클': `${BASE}1571019613454-1cb2f99b2d8b${Q}`,
  '맨몸운동':   `${BASE}1543351611-58f69d7c1781${Q}`,
  '복싱':       `${BASE}1544717305-2782549b5136${Q}`,
  '태권도':     `${BASE}1555597673-b21d5c935865${Q}`,
  '주짓수':     `${BASE}1533536347418-0614b89b0347${Q}`,
  '검도':       `${BASE}1577563908411-5077b6dc7624${Q}`,
  '수영':       `${BASE}1530549387789-4c1017266635${Q}`,
  '서핑':       `${BASE}1505118380757-91f5f5632de0${Q}`,
  '스쿠버다이빙': `${BASE}1583212292454-1d6aa0bde093${Q}`,
  '카약':       `${BASE}1476611338391-6f395a0dd82e${Q}`,
  '등산':       `${BASE}1551632811-561732d1e306${Q}`,
  '클라이밍':   `${BASE}1522163182402-834f871fd851${Q}`,
  '자전거':     `${BASE}1558618666-fcd25c85cd64${Q}`,
  'MTB':        `${BASE}1544191696-102dbeb3b1cd${Q}`,
  '캠핑':       `${BASE}1504280390367-361c6d9f38f4${Q}`,
  '스키':       `${BASE}1551698618-1dfe5d97d256${Q}`,
  '스노보드':   `${BASE}1565992441121-4367ef2f6826${Q}`,
  '패러글라이딩': `${BASE}1506905925346-21bda4d32df4${Q}`,
  '당구':       `${BASE}1587223962930-cb7f31384c19${Q}`,
  '다트':       `${BASE}1509036236416-66d2c4b7e55f${Q}`,
  '승마':       `${BASE}1553284965-83fd3e82fa5a${Q}`,
  '댄스':       `${BASE}1504609813442-a8924e83f76e${Q}`,
}

const getExerciseImage = (name: string, category: Exclude<ExerciseCategory, 'all'>): string =>
  EXERCISE_IMAGES[name] ?? CATEGORY_IMAGES[category]

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

function ExercisePhotoButton({
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

export function ExercisePicker({
  selected,
  onChange,
  maxItems,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
  maxItems?: number
}) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('all')
  const [customInput, setCustomInput] = useState('')
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const limit = maxItems ?? 5
  const selectedNames = new Set(selected.map((s) => s.label))
  const isAtLimit = selected.length >= limit

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
          {/* 헬퍼 텍스트 */}
          <p className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            <Camera size={11} />
            기본 이미지를 눌러 내 모습으로 바꿀 수 있어요
          </p>

          {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => {
            const { label, emoji } = getCategoryInfo(cat)
            return (
              <div key={cat}>
                <div className="mb-2 flex items-center gap-1.5">
                  {emoji && <span className="text-[12px]">{emoji}</span>}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                    {label}
                  </span>
                  <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                </div>
                <div className="space-y-2">
                  {grouped[cat].map((item) => {
                    const dbItem = EXERCISE_DB.find((e) => e.name === item.label)
                    const defaultImg = dbItem
                      ? getExerciseImage(item.label, dbItem.category)
                      : CATEGORY_IMAGES['other']
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2"
                      >
                        <ExercisePhotoButton
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
          최대 {limit}개까지 추가할 수 있어요
        </p>
      )}

      {!isAtLimit && (
        <>
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
