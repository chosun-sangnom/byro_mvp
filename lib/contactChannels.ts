import type { ContactChannel, MessengerApp } from '@/types'

export function buildContactHref(id: ContactChannel['id'], value: string, messengerApp?: MessengerApp) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'messenger') {
    if (trimmed.startsWith('http')) return trimmed
    if (messengerApp === 'telegram') return `https://t.me/${trimmed.replace(/^@/, '')}`
    if (messengerApp === 'whatsapp') return `https://wa.me/${trimmed.replace(/[^0-9]/g, '')}`
    return `https://open.kakao.com/o/${trimmed}`
  }
  return ''
}

export function contactPlaceholder(id?: ContactChannel['id'], messengerApp?: MessengerApp) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@felore.io'
  if (id === 'messenger') {
    if (messengerApp === 'telegram') return '텔레그램 아이디 (예: felore_official)'
    if (messengerApp === 'whatsapp') return '왓츠앱 번호 (국가번호 포함)'
    return 'openchat 코드 또는 URL'
  }
  return ''
}

export function contactPreview(id?: ContactChannel['id'], value?: string, messengerApp?: MessengerApp) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  return buildContactHref(id, value, messengerApp)
}

export const MESSENGER_APP_LABELS: Record<MessengerApp, string> = {
  kakao: '카카오',
  telegram: '텔레그램',
  whatsapp: '왓츠앱',
}
