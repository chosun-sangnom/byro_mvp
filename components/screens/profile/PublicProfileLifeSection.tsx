'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui'
import type { PublicProfileLife } from '@/types'
import { ProfileEmptyAddBlock } from '@/components/screens/profile/ProfileEmptyAddBlock'
import { VibeImage, VibeKindBadge } from '@/components/screens/profile/vibeCardParts'
import { flattenVibe, groupVibeEntries, type VibeEntry } from '@/lib/vibeItems'

// ─── 무드보드 콜라주 ──────────────────────────────────────────────────────────

type GridSlot = { col: string; row: string }
type LayoutPattern = {
  columns: string
  rows: string
  slots: [GridSlot, GridSlot, GridSlot, GridSlot, GridSlot, GridSlot]
}

const LAYOUTS: LayoutPattern[] = [
  {
    // 좌측 tall
    columns: '3fr 2fr 2fr',
    rows: '2fr 3fr 2fr',
    slots: [
      { col: '1', row: '1 / 3' },
      { col: '2 / 4', row: '1' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '2 / 4', row: '3' },
      { col: '1', row: '3' },
    ],
  },
  {
    // 우측 tall
    columns: '2fr 2fr 3fr',
    rows: '2fr 3fr 2fr',
    slots: [
      { col: '3', row: '1 / 3' },
      { col: '1 / 3', row: '1' },
      { col: '1', row: '2' },
      { col: '2', row: '2' },
      { col: '1 / 3', row: '3' },
      { col: '3', row: '3' },
    ],
  },
  {
    // 상단 파노라마
    columns: '1fr 1fr 1fr',
    rows: '4fr 3fr 3fr',
    slots: [
      { col: '1 / 4', row: '1' },
      { col: '1', row: '2' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '1 / 3', row: '3' },
      { col: '3', row: '3' },
    ],
  },
  {
    // 좌측 하단 tall
    columns: '3fr 2fr 2fr',
    rows: '2fr 2fr 3fr',
    slots: [
      { col: '1', row: '2 / 4' },
      { col: '1', row: '1' },
      { col: '2 / 4', row: '1' },
      { col: '2', row: '2' },
      { col: '3', row: '2' },
      { col: '2 / 4', row: '3' },
    ],
  },
]

// 사진 카드를 뺀 종류별 1장씩 랜덤(이미지 있는 카드 우선), 최대 6장
function pickCollageEntries(entries: VibeEntry[]): VibeEntry[] {
  const byKind = new Map<string, VibeEntry[]>()
  for (const entry of entries) {
    if (entry.kind === 'photo') continue
    byKind.set(entry.kind, [...(byKind.get(entry.kind) ?? []), entry])
  }

  const picked: VibeEntry[] = []
  byKind.forEach((list) => {
    const withImage = list.filter((e) => e.imageUrl)
    const pool = withImage.length > 0 ? withImage : list
    picked.push(pool[Math.floor(Math.random() * pool.length)])
  })

  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[picked[i], picked[j]] = [picked[j], picked[i]]
  }
  return picked.slice(0, 6)
}

function CollageCard({ entry, onOpen }: { entry: VibeEntry; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="relative h-full w-full overflow-hidden rounded-xl text-left">
      <div className="absolute inset-0">
        <VibeImage entry={entry} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute left-2 top-2">
        <VibeKindBadge kind={entry.kind} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="truncate text-[12px] font-semibold leading-tight text-white drop-shadow">{entry.label}</p>
        {entry.sublabel && <p className="truncate text-[10px] text-white/70">{entry.sublabel}</p>}
      </div>
    </button>
  )
}

function Collage({ entries, layout, onOpen }: { entries: VibeEntry[]; layout: LayoutPattern; onOpen: (e: VibeEntry) => void }) {
  if (entries.length === 0) return null
  return (
    <div className="px-4 pb-2 pt-4">
      <div
        className="grid w-full gap-1.5"
        style={{ aspectRatio: '1/1', gridTemplateColumns: layout.columns, gridTemplateRows: layout.rows }}
      >
        {entries.map((entry, i) => (
          <div key={entry.key} style={{ gridColumn: layout.slots[i].col, gridRow: layout.slots[i].row }}>
            <CollageCard entry={entry} onOpen={() => onOpen(entry)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 카드 그리드 ──────────────────────────────────────────────────────────────

function GridCard({ entry, showBadge, onOpen }: { entry: VibeEntry; showBadge: boolean; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex flex-col text-left">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] bg-[var(--color-bg-muted)]">
        <VibeImage entry={entry} iconSize={28} />
        {showBadge && (
          <div className="absolute left-2 top-2">
            <VibeKindBadge kind={entry.kind} />
          </div>
        )}
      </div>
      {entry.label && (
        <p className="mt-2 truncate text-[13px] font-semibold text-[#0D0D0D]">{entry.label}</p>
      )}
      {entry.sublabel && <p className="truncate text-[11px] text-[#A8B1BD]">{entry.sublabel}</p>}
      {entry.caption && (
        <p className={['text-[12px] leading-[1.5] text-[#475058]', entry.label ? 'mt-1 line-clamp-2' : 'mt-2 line-clamp-3'].join(' ')}>
          {entry.caption}
        </p>
      )}
    </button>
  )
}

function DetailSheet({ entry, onClose }: { entry: VibeEntry | null; onClose: () => void }) {
  return (
    <BottomSheet open={entry !== null} onClose={onClose}>
      {entry && (
        <div className="px-5 pb-6">
          {entry.kind === 'photo' || entry.kind === 'pet' ? (
            <div className="overflow-hidden rounded-[16px] bg-[#F5F6F7]">
              {entry.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.imageUrl} alt={entry.label ?? ''} className="max-h-[50vh] w-full object-contain" />
              ) : (
                <div className="aspect-[4/3]">
                  <VibeImage entry={entry} iconSize={40} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px]">
                <VibeImage entry={entry} iconSize={24} />
              </div>
              <div className="min-w-0 flex-1">
                <VibeKindBadge kind={entry.kind} />
                <p className="mt-1.5 truncate text-[16px] font-bold text-[#0D0D0D]">{entry.label}</p>
                {entry.sublabel && <p className="truncate text-[12px] text-[#6C7786]">{entry.sublabel}</p>}
              </div>
            </div>
          )}
          {(entry.kind === 'photo' || entry.kind === 'pet') && entry.label && (
            <p className="mt-4 text-[16px] font-bold text-[#0D0D0D]">
              {entry.label}
              {entry.sublabel && <span className="ml-1.5 text-[13px] font-medium text-[#6C7786]">{entry.sublabel}</span>}
            </p>
          )}
          {entry.caption ? (
            <p className="mt-4 whitespace-pre-wrap text-[14px] leading-[1.7] text-[#25313D]">{entry.caption}</p>
          ) : (
            <p className="mt-4 text-[13px] text-[#A8B1BD]">아직 남긴 설명이 없어요</p>
          )}
        </div>
      )}
    </BottomSheet>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PublicProfileLifeSection({
  life,
  isOwner,
  onAdd,
}: {
  life?: PublicProfileLife
  isOwner?: boolean
  onAdd?: () => void
}) {
  const entries = flattenVibe(life)
  const [opened, setOpened] = useState<VibeEntry | null>(null)
  const [collage] = useState(() => ({
    entries: pickCollageEntries(entries),
    layout: LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)],
  }))

  if (entries.length === 0) {
    if (!(isOwner && onAdd)) return null
    return (
      <div className="pb-32">
        <div className="px-5 pb-3 pt-6">
          <span className="text-[18px] font-bold text-[#0D0D0D]">무드보드</span>
        </div>
        <div className="px-5">
          <ProfileEmptyAddBlock label="바이브가" onAdd={onAdd} />
        </div>
      </div>
    )
  }

  const sections = groupVibeEntries(entries).filter((section) => section.entries.length > 0)

  return (
    <div className="pb-32 pt-2">
      <div className="px-5 pb-1 pt-6">
        <span className="text-[18px] font-bold text-[#0D0D0D]">무드보드</span>
      </div>
      <Collage entries={collage.entries} layout={collage.layout} onOpen={setOpened} />

      {sections.map((section) => (
        <section key={section.id} className="pt-8">
          <div className="flex items-baseline gap-1.5 px-5 pb-3">
            <h3 className="text-[18px] font-bold text-[#0D0D0D]">{section.label}</h3>
            <span className="text-[14px] font-semibold text-[#A8B1BD]">{section.entries.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-5">
            {section.entries.map((entry) => (
              <GridCard key={entry.key} entry={entry} showBadge={section.mixedKinds} onOpen={() => setOpened(entry)} />
            ))}
          </div>
        </section>
      ))}

      <DetailSheet entry={opened} onClose={() => setOpened(null)} />
    </div>
  )
}
