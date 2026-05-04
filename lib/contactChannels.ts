import type { ContactChannel } from '@/types'

export function buildContactHref(id: ContactChannel['id'], value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'kakao') return trimmed.startsWith('http') ? trimmed : `https://open.kakao.com/o/${trimmed}`
  return ''
}

export function contactPlaceholder(id?: ContactChannel['id']) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@byro.io'
  if (id === 'kakao') return 'openchat 코드 또는 URL'
  return ''
}

export function contactPreview(id?: ContactChannel['id'], value?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  return buildContactHref(id, value)
}
