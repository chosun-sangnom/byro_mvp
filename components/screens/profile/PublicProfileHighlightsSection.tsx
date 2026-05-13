'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, ChevronDown, ChevronUp } from 'lucide-react'
import { AirlineMileageSummary } from '@/components/highlights/AirlineMileageSummary'
import { CareerContinuityChart } from '@/components/highlights/CareerContinuityChart'
import { CorporateLongevityTimeline } from '@/components/highlights/CorporateLongevityTimeline'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import { RememberNetworkGraph } from '@/components/highlights/RememberNetworkGraph'
import { AnimatedSection, SectionTitle } from '@/components/screens/profile/PublicProfileSections'
import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import { getGroupedHighlightPreview, getHighlightDetailFootnote, getHighlightMetaParts } from '@/lib/highlightMeta'
import type { Highlight, HighlightIconId } from '@/types'


type HighlightGroupEntry =
  | { kind: 'verified'; item: Highlight }
  | { kind: 'manual-group'; categoryId: string; items: Highlight[] }

type HighlightGroupSection = {
  id: string
  label: string
  items: HighlightGroupEntry[]
}

export function ProfileHighlightsSection({
  profile,
  corporateHighlight,
  airlineHighlight,
  airlineBadgeLabel,
  groupedHighlights,
  username,
  primaryHighlightOverrides,
  getHighlightOpen,
  onToggleHighlight,
}: {
  profile: {
    careerHighlight: { avgYears: number; vsIndustryPercent: number }
    rememberHighlight: { total: number; industries: { name: string; ratio: number }[] }
  }
  corporateHighlight: {
    companyCount: number
    summary: string
    companies: Array<{ name: string; startYear: number; endYear: number | null; years: number; status: string }>
  }
  airlineHighlight: {
    tierSummary: string
    airlines: Array<{ name: string; tier: string }>
  }
  airlineBadgeLabel: string | null
  groupedHighlights: HighlightGroupSection[]
  username: string
  primaryHighlightOverrides: Record<string, string>
  getHighlightOpen: (key: string) => boolean
  onToggleHighlight: (key: string) => void
}) {
  return (
    <AnimatedSection className="px-5 pt-6 pb-2" delay={0.06}>
      <SectionTitle title="하이라이트" />
      <div className="divide-y divide-[var(--color-border-soft)]">
        {groupedHighlights.flatMap((group) =>
          group.items.map((entry) => {
            if (entry.kind === 'verified') {
              const hl = entry.item
              const toggleKey = `${hl.id}_${username}`
              const isOpen = getHighlightOpen(toggleKey)
              return (
                <div key={hl.id}>
                  <button
                    onClick={() => onToggleHighlight(toggleKey)}
                    className="flex w-full items-center gap-3.5 py-3.5 text-left"
                  >
                    <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center text-[var(--color-text-secondary)]">
                      <HighlightIcon id={hl.icon as HighlightIconId} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-1">
                        <span className="text-[11px] text-[var(--color-text-tertiary)]">{hl.title}</span>
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-[var(--color-state-success-text)]">
                          <BadgeCheck size={9} />
                        </span>
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{hl.subtitle}</div>
                      {hl.categoryId === 'career-continuity' && (
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">업계 평균 대비 +{profile.careerHighlight.vsIndustryPercent}%</div>
                      )}
                      {hl.categoryId === 'corporate-longevity' && (
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{corporateHighlight.companyCount}개 법인 · 폐업 이력 없음</div>
                      )}
                      {hl.categoryId === 'remember-network' && (
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">총 {profile.rememberHighlight.total}명 네트워크</div>
                      )}
                      {hl.categoryId === 'airline-mileage' && airlineBadgeLabel && (
                        <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">{airlineBadgeLabel}</div>
                      )}
                    </div>
                    {isOpen ? <ChevronUp size={14} color="var(--color-text-tertiary)" /> : <ChevronDown size={14} color="var(--color-text-tertiary)" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-4 pl-8">
                          {hl.categoryId === 'career-continuity' && (
                            <CareerContinuityChart
                              avgYears={profile.careerHighlight.avgYears}
                              vsIndustryPercent={profile.careerHighlight.vsIndustryPercent}
                            />
                          )}
                          {hl.categoryId === 'remember-network' && (
                            <RememberNetworkGraph
                              total={profile.rememberHighlight.total}
                              industries={profile.rememberHighlight.industries}
                            />
                          )}
                          {hl.categoryId === 'corporate-longevity' && (
                            <CorporateLongevityTimeline
                              summary={corporateHighlight.summary}
                              companies={corporateHighlight.companies}
                            />
                          )}
                          {hl.categoryId === 'airline-mileage' && (
                            <AirlineMileageSummary
                              badgeLabel={airlineBadgeLabel}
                              tierSummary={airlineHighlight.tierSummary}
                              airlines={airlineHighlight.airlines}
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            const category = HIGHLIGHT_CATEGORIES.find((item) => item.id === entry.categoryId)
            const groupToggleKey = `group_${entry.categoryId}_${username}`
            const isGroupOpen = getHighlightOpen(groupToggleKey)
            const preview = getGroupedHighlightPreview(entry.items, primaryHighlightOverrides[entry.categoryId])

            return (
              <div key={`${entry.categoryId}-${group.id}`}>
                <button
                  onClick={() => onToggleHighlight(groupToggleKey)}
                  className="flex w-full items-center gap-3.5 py-3.5 text-left"
                >
                  <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center text-[var(--color-text-secondary)]">
                    <HighlightIcon id={(entry.items[0]?.icon ?? 'briefcase') as HighlightIconId} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-[11px] text-[var(--color-text-tertiary)]">{category?.label ?? '직접 입력'}</div>
                    <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{preview.title}</div>
                    {preview.meta && (
                      <div className="mt-0.5 text-[12px] text-[var(--color-text-tertiary)]">{preview.meta}</div>
                    )}
                  </div>
                  {isGroupOpen ? <ChevronUp size={14} color="var(--color-text-tertiary)" /> : <ChevronDown size={14} color="var(--color-text-tertiary)" />}
                </button>
                <AnimatePresence initial={false}>
                  {isGroupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 pl-8">
                        <div className="divide-y divide-[var(--color-border-soft)]">
                          {entry.items.map((hl) => {
                            const metaParts = getHighlightMetaParts(hl)
                            return (
                              <div key={hl.id} className="py-3 first:pt-0 last:pb-0">
                                <div className="text-[14px] font-semibold text-[var(--color-text-primary)]">{hl.title}</div>
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
                                {(hl.description?.trim() || hl.linkUrl) && (
                                  <div className="mt-2 space-y-2">
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
              </div>
            )
          }),
        )}
      </div>
    </AnimatedSection>
  )
}

