'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import { getGroupedHighlightPreview, getHighlightDetailFootnote, getHighlightMetaParts, sortHighlightsByPrimary } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'


function VerifiedBadgeGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="verified-badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3A6" />
          <stop offset="100%" stopColor="#0EA968" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function VerifiedBadge({ size, shape = 'circle' }: { size: number; shape?: 'circle' | 'shield' }) {
  const Icon = shape === 'shield' ? ShieldCheck : BadgeCheck
  return (
    <Icon
      size={size}
      className="shrink-0"
      fill="url(#verified-badge-gradient)"
      stroke="white"
      strokeWidth={2}
    />
  )
}

type HighlightGroupEntry = { kind: 'manual-group'; categoryId: string; items: Highlight[] }

type HighlightGroupSection = {
  id: string
  label: string
  items: HighlightGroupEntry[]
}

export function ProfileHighlightsSection({
  groupedHighlights,
  username,
  primaryHighlightOverrides,
  getHighlightOpen,
  onToggleHighlight,
}: {
  groupedHighlights: HighlightGroupSection[]
  username: string
  primaryHighlightOverrides: Record<string, string>
  getHighlightOpen: (key: string) => boolean
  onToggleHighlight: (key: string) => void
}) {
  if (groupedHighlights.length === 0) return null

  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.06}>
      <VerifiedBadgeGradientDefs />
      <SectionTitle title="하이라이트" />
      <div className="space-y-5">
        {groupedHighlights.map((group) => (
          <div key={group.id}>
            <div className="mb-2 text-[15px] font-bold text-[#0D0D0D]">{group.label}</div>
            <div className="divide-y divide-[var(--color-border-soft)]">
              {group.items.map((entry) => {
            const category = HIGHLIGHT_CATEGORIES.find((item) => item.id === entry.categoryId)
            const groupToggleKey = `group_${entry.categoryId}_${username}`
            const isGroupOpen = getHighlightOpen(groupToggleKey)
            const overrideId = primaryHighlightOverrides[entry.categoryId]
            const preview = getGroupedHighlightPreview(entry.items, overrideId)
            const sortedItems = sortHighlightsByPrimary(entry.items, overrideId)
            const primaryItem = sortedItems[0]
            const primaryHasExtra = Boolean(primaryItem?.description?.trim() || primaryItem?.linkUrl || primaryItem?.verified)
            const canExpand = entry.items.length > 1 || primaryHasExtra
            // 대표 항목의 제목·메타는 헤더에 이미 보이므로, 펼침 목록에서는 부가정보(인증뱃지/설명/링크)가 있을 때만 남긴다
            const expandedItems = sortedItems.filter((hl) => (
              hl.id !== primaryItem?.id || hl.verified || Boolean(hl.description?.trim()) || Boolean(hl.linkUrl)
            ))

            const headerRow = (
              <>
                <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center text-[var(--color-text-secondary)]">
                  <HighlightIcon id={(entry.items[0]?.icon ?? 'briefcase') as HighlightIconId} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                    {category?.label ?? '직접 입력'}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{preview.title}</div>
                    {entry.items.some((h) => h.verified) && !isGroupOpen && (
                      <VerifiedBadge size={20} shape={entry.categoryId === 'career-role' ? 'shield' : 'circle'} />
                    )}
                  </div>
                  {preview.meta && (
                    <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{preview.meta}</div>
                  )}
                </div>
              </>
            )

            return (
              <div key={`${entry.categoryId}-${group.id}`}>
                {canExpand ? (
                  <button
                    onClick={() => onToggleHighlight(groupToggleKey)}
                    className="flex w-full items-center gap-3.5 py-3.5 text-left"
                  >
                    {headerRow}
                    {isGroupOpen ? <ChevronUp size={14} color="var(--color-text-tertiary)" /> : <ChevronDown size={14} color="var(--color-text-tertiary)" />}
                  </button>
                ) : (
                  <div className="flex w-full items-center gap-3.5 py-3.5 text-left">
                    {headerRow}
                  </div>
                )}
                {canExpand && (
                  <AnimatePresence initial={false}>
                    {isGroupOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-14">
                          <div className="divide-y divide-[var(--color-border-soft)]">
                            {expandedItems.map((hl) => {
                              const metaParts = getHighlightMetaParts(hl)
                              const isPrimaryRow = hl.id === primaryItem?.id
                              return (
                                <div key={hl.id} className="py-3 first:pt-0 last:pb-0">
                                  {isPrimaryRow ? (
                                    hl.verified && (
                                      <div className="flex items-center gap-1.5">
                                        <VerifiedBadge size={20} shape={hl.categoryId === 'career-role' ? 'shield' : 'circle'} />
                                        <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-dark)' }}>
                                          {hl.categoryId === 'career-role' ? '검증됨' : '확인됨'}
                                        </span>
                                      </div>
                                    )
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1.5">
                                        <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{hl.title}</div>
                                        {hl.verified && (
                                          <span className="flex items-center gap-1">
                                            <VerifiedBadge size={20} shape={hl.categoryId === 'career-role' ? 'shield' : 'circle'} />
                                            <span className="text-[13px] font-bold" style={{ color: 'var(--color-accent-dark)' }}>
                                              {hl.categoryId === 'career-role' ? '검증됨' : '확인됨'}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                      {metaParts.length > 0 && (
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                          {metaParts.map((part, partIndex) => (
                                            <span
                                              key={`${hl.id}-meta-${partIndex}`}
                                              className={`text-[12px] ${partIndex === 0 ? 'font-medium text-[var(--color-text-secondary)]' : 'text-[var(--color-text-tertiary)]'}`}
                                            >
                                              {part}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </>
                                  )}
                                  {(hl.description?.trim() || hl.linkUrl) && (
                                    <div className={isPrimaryRow && !hl.verified ? 'space-y-2' : 'mt-2 space-y-2'}>
                                      {hl.description?.trim() && (
                                        <p className="text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                                          {hl.description}
                                        </p>
                                      )}
                                      {hl.linkUrl && (
                                        <a
                                          href={hl.linkUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block overflow-hidden rounded-[10px] border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]"
                                        >
                                          <div className="flex min-h-[64px]">
                                            {hl.thumbnailUrl ? (
                                              <div className="h-auto w-[68px] flex-shrink-0 overflow-hidden bg-[var(--color-bg-soft)]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={hl.thumbnailUrl} alt={hl.title} className="h-full w-full object-cover" />
                                              </div>
                                            ) : (
                                              <div className="flex w-[68px] flex-shrink-0 items-center justify-center bg-[var(--color-bg-soft)] px-3 text-center">
                                                <div className="text-[11px] font-semibold text-[var(--color-text-tertiary)]">{hl.sourceLabel ?? 'Link'}</div>
                                              </div>
                                            )}
                                            <div className="flex min-w-0 flex-1 items-center px-3 py-2.5">
                                              <div className="min-w-0">
                                                <div className="text-[11px] text-[var(--color-text-tertiary)]">{hl.sourceLabel ?? '외부 링크'}</div>
                                                <div className="mt-0.5 line-clamp-2 text-[12px] font-semibold leading-snug text-[var(--color-text-primary)]">{hl.title}</div>
                                              </div>
                                            </div>
                                          </div>
                                        </a>
                                      )}
                                      <div className="micro-text">{getHighlightDetailFootnote(hl, category?.label)}</div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )
              })}
            </div>
          </div>
        ))}
      </div>
    </AnimatedSection>
  )
}

