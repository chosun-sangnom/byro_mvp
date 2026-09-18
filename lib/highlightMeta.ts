import { HIGHLIGHT_CATEGORIES } from '@/lib/mocks/highlights'
import type { Highlight } from '@/types'

export interface HighlightSection {
  categoryId: Highlight['categoryId']
  label: string
  items: Highlight[]
}

export function buildHighlightSections(manualHighlights: Highlight[]): HighlightSection[] {
  return HIGHLIGHT_CATEGORIES
    .map((category) => ({
      categoryId: category.id,
      label: category.label,
      items: manualHighlights.filter((item) => item.categoryId === category.id),
    }))
    .filter((section) => section.items.length > 0)
}

export function isPrimaryHighlight(highlight: Highlight, overrideId?: string): boolean {
  if (overrideId) return highlight.id === overrideId
  return highlight.metadata?.isPrimary === true
}

export function sortHighlightsByPrimary(items: Highlight[], overrideId?: string): Highlight[] {
  return [...items].sort((a, b) => Number(isPrimaryHighlight(b, overrideId)) - Number(isPrimaryHighlight(a, overrideId)))
}

export function getHighlightMetaParts(highlight: Highlight): string[] {
  const metadata = highlight.metadata ?? {}
  const role = typeof metadata.role === 'string' ? metadata.role.trim() : ''
  const degree = typeof metadata.degree === 'string' ? metadata.degree.trim() : ''
  const status = typeof metadata.status === 'string' ? metadata.status.trim() : ''
  const issuer = typeof metadata.issuer === 'string' ? metadata.issuer.trim() : ''
  const sourceLabel = highlight.sourceLabel?.trim() ?? ''
  const year = highlight.year?.trim() ?? ''

  switch (highlight.categoryId) {
    case 'career-role':
      return [role, status, year].filter(Boolean)
    case 'education-history':
      return [role, degree !== '해당없음' ? degree : '', status, year].filter(Boolean)
    case 'activity':
      return [sourceLabel, year].filter(Boolean)
    case 'achievement':
      return [sourceLabel || issuer, year].filter(Boolean)
    default:
      return [role, degree !== '해당없음' ? degree : '', status, year].filter(Boolean)
  }
}

export function getHighlightDetailFootnote(highlight: Highlight, categoryLabel?: string): string {
  const parts = [categoryLabel, highlight.year?.trim() ?? ''].filter(Boolean)
  return parts.join(' · ')
}

export function getGroupedHighlightSummary(items: Highlight[], categoryLabel?: string): string {
  if (!items.length) return categoryLabel ?? ''

  if (items.length === 1) {
    const single = items[0]
    return [single.title, ...getHighlightMetaParts(single).slice(0, 2)].filter(Boolean).join(' · ')
  }

  const titles = items
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 2)

  const countLabel = `${items.length}개 ${categoryLabel ?? '항목'}`
  return [countLabel, titles.join(', ')].filter(Boolean).join(' · ')
}

export function getGroupedHighlightPreview(items: Highlight[], overrideId?: string) {
  const first = sortHighlightsByPrimary(items, overrideId)[0]
  if (!first) {
    return { title: '', meta: '' }
  }

  const metaParts = getHighlightMetaParts(first)
  const remainder = items.length > 1 ? `외 ${items.length - 1}개` : ''
  const meta = [metaParts.join(' · '), remainder].filter(Boolean).join(' · ')

  return {
    title: first.title,
    meta,
  }
}
