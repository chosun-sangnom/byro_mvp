'use client'

import type { ProfileHeaderMeta } from '@/types'

export function PublicProfileHeaderMeta({
  meta,
}: {
  meta?: ProfileHeaderMeta
}) {
  if (!meta) return null

  const items = [
    { label: '거주', value: meta.residence },
    { label: '기분', value: meta.mood },
    { label: '펑', value: meta.availability },
  ].filter((item) => item.value)

  if (items.length === 0) return null

  return (
    <div className="px-5 pt-3">
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.label} className="chip-metric">
            <span className="text-[var(--color-text-tertiary)]">{item.label}</span>
            <span className="text-[var(--color-text-strong)]">{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
