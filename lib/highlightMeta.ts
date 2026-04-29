import type { Highlight } from '@/types'

export function getHighlightMetaParts(highlight: Highlight): string[] {
  const metadata = highlight.metadata ?? {}
  const role = typeof metadata.role === 'string' ? metadata.role.trim() : ''
  const degree = typeof metadata.degree === 'string' ? metadata.degree.trim() : ''
  const status = typeof metadata.status === 'string' ? metadata.status.trim() : ''
  const issuer = typeof metadata.issuer === 'string' ? metadata.issuer.trim() : ''
  const expiryYear = typeof metadata.expiryYear === 'string' ? metadata.expiryYear.trim() : ''
  const registrationNumber = typeof metadata.registrationNumber === 'string' ? metadata.registrationNumber.trim() : ''
  const sourceLabel = highlight.sourceLabel?.trim() ?? ''
  const year = highlight.year?.trim() ?? ''

  switch (highlight.categoryId) {
    case 'career-role':
      return [role, status, year].filter(Boolean)
    case 'education-history':
      return [role, degree !== '해당없음' ? degree : '', status, year].filter(Boolean)
    case 'publish':
    case 'article-interview':
      return [sourceLabel, year].filter(Boolean)
    case 'award':
      return [issuer, year].filter(Boolean)
    case 'patent':
      return [year, registrationNumber ? `등록번호 ${registrationNumber}` : ''].filter(Boolean)
    case 'license':
      return [issuer, year, expiryYear ? `만료 ${expiryYear}` : ''].filter(Boolean)
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
