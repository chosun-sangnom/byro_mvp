'use client'

// ─── 운동 종목 DB 가이드 (백엔드 구현 시 참고) ────────────────────────────────
//
// 현재는 EXERCISE_DB 정적 데이터 사용.
// 종목 추가/수정이 필요할 경우 백엔드 DB로 관리하면 앱 재배포 없이 변경 가능.
//
// [권장 DB 구조]
//   Table: exercise_items
//     id          TEXT PRIMARY KEY   -- 'run', 'golf' 등
//     name        TEXT               -- '러닝', '골프'
//     category    TEXT               -- 'run' | 'ball' | 'fitness' | 'martial' | 'water' | 'outdoor' | 'other'
//     emoji       TEXT               -- 선택적 이모지
//     sort_order  INT                -- 카테고리 내 정렬 순서
//
// [API 엔드포인트]
//   GET /api/exercise/items           → 전체 목록 (앱 초기 로드 시 1회 fetch + 클라이언트 캐시)
//   GET /api/exercise/items?category=ball → 카테고리 필터
//   ※ 변경이 드물므로 ISR(revalidate: 3600) 또는 클라이언트 SWR로 캐싱 권장
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { X } from 'lucide-react'
import type { LifeMediaItem } from '@/types'

type ExerciseCategory = 'all' | 'run' | 'ball' | 'fitness' | 'martial' | 'water' | 'outdoor' | 'other'

const CATEGORY_TABS: Array<{ id: ExerciseCategory; label: string; emoji: string }> = [
  { id: 'all',     label: '전체',    emoji: ''  },
  { id: 'run',     label: '러닝',    emoji: '🏃' },
  { id: 'ball',    label: '구기',    emoji: '⚽' },
  { id: 'fitness', label: '피트니스', emoji: '🏋️' },
  { id: 'martial', label: '무도',    emoji: '🥊' },
  { id: 'water',   label: '수상',    emoji: '🏊' },
  { id: 'outdoor', label: '아웃도어', emoji: '🏔️' },
  { id: 'other',   label: '기타',    emoji: '🎯' },
]

interface ExerciseItem {
  id: string
  name: string
  category: Exclude<ExerciseCategory, 'all'>
}

// TODO(backend): 아래 EXERCISE_DB를 GET /api/exercise/items 호출로 교체
const EXERCISE_DB: ExerciseItem[] = [
  // ── 러닝 ────────────────────────────────────────────────────────────────────
  { id: 'running',      name: '러닝',       category: 'run'     },
  { id: 'jogging',      name: '조깅',       category: 'run'     },
  { id: 'walking',      name: '걷기',       category: 'run'     },
  { id: 'marathon',     name: '마라톤',     category: 'run'     },
  { id: 'trail',        name: '트레일러닝', category: 'run'     },
  { id: 'sprinting',    name: '단거리달리기', category: 'run'   },

  // ── 구기 ────────────────────────────────────────────────────────────────────
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

  // ── 피트니스 ────────────────────────────────────────────────────────────────
  { id: 'gym',          name: '헬스',       category: 'fitness' },
  { id: 'crossfit',     name: '크로스핏',   category: 'fitness' },
  { id: 'pilates',      name: '필라테스',   category: 'fitness' },
  { id: 'yoga',         name: '요가',       category: 'fitness' },
  { id: 'cycling',      name: '실내사이클', category: 'fitness' },
  { id: 'stretching',   name: '스트레칭',   category: 'fitness' },
  { id: 'calisthenics', name: '맨몸운동',   category: 'fitness' },
  { id: 'jumping',      name: '줄넘기',     category: 'fitness' },

  // ── 무도 ────────────────────────────────────────────────────────────────────
  { id: 'boxing',       name: '복싱',       category: 'martial' },
  { id: 'taekwondo',    name: '태권도',     category: 'martial' },
  { id: 'judo',         name: '유도',       category: 'martial' },
  { id: 'muay',         name: '무에타이',   category: 'martial' },
  { id: 'bjj',          name: '주짓수',     category: 'martial' },
  { id: 'kendo',        name: '검도',       category: 'martial' },
  { id: 'wrestling',    name: '레슬링',     category: 'martial' },
  { id: 'hapkido',      name: '합기도',     category: 'martial' },

  // ── 수상 ────────────────────────────────────────────────────────────────────
  { id: 'swimming',     name: '수영',       category: 'water'   },
  { id: 'surfing',      name: '서핑',       category: 'water'   },
  { id: 'scuba',        name: '스쿠버다이빙', category: 'water' },
  { id: 'kayak',        name: '카약',       category: 'water'   },
  { id: 'sup',          name: 'SUP',        category: 'water'   },
  { id: 'waterski',     name: '수상스키',   category: 'water'   },

  // ── 아웃도어 ────────────────────────────────────────────────────────────────
  { id: 'hiking',       name: '등산',       category: 'outdoor' },
  { id: 'climbing',     name: '클라이밍',   category: 'outdoor' },
  { id: 'cycling_out',  name: '자전거',     category: 'outdoor' },
  { id: 'mtb',          name: 'MTB',        category: 'outdoor' },
  { id: 'camping',      name: '캠핑',       category: 'outdoor' },
  { id: 'ski',          name: '스키',       category: 'outdoor' },
  { id: 'snowboard',    name: '스노보드',   category: 'outdoor' },
  { id: 'skating',      name: '스케이팅',   category: 'outdoor' },
  { id: 'paragliding',  name: '패러글라이딩', category: 'outdoor' },

  // ── 기타 ────────────────────────────────────────────────────────────────────
  { id: 'billiards',    name: '당구',       category: 'other'   },
  { id: 'darts',        name: '다트',       category: 'other'   },
  { id: 'horse',        name: '승마',       category: 'other'   },
  { id: 'fencing',      name: '펜싱',       category: 'other'   },
  { id: 'archery',      name: '양궁',       category: 'other'   },
  { id: 'dance',        name: '댄스',       category: 'other'   },
  { id: 'cheerleading', name: '치어리딩',   category: 'other'   },
]

export function ExercisePicker({
  selected,
  onChange,
}: {
  selected: LifeMediaItem[]
  onChange: (items: LifeMediaItem[]) => void
}) {
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('all')
  const [customInput, setCustomInput] = useState('')

  const filtered = activeCategory === 'all'
    ? EXERCISE_DB
    : EXERCISE_DB.filter((e) => e.category === activeCategory)

  const selectedNames = new Set(selected.map((s) => s.label))

  const toggle = (item: ExerciseItem) => {
    if (selectedNames.has(item.name)) {
      onChange(selected.filter((s) => s.label !== item.name))
    } else {
      onChange([...selected, { label: item.name }])
    }
  }

  const addCustom = () => {
    const name = customInput.trim()
    if (!name || selectedNames.has(name)) return
    onChange([...selected, { label: name }])
    setCustomInput('')
  }

  return (
    <div>
      {/* 선택된 운동 칩 */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: 'var(--color-accent-dark)' }}
            >
              {item.label}
              <button onClick={() => onChange(selected.filter((s) => s.label !== item.label))}>
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

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

      {/* 종목 그리드 — 리스트보다 컴팩트하게 */}
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
    </div>
  )
}
