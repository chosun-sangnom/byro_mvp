import type { ContactChannel, MessengerApp } from '@/types'
import { DEFAULT_COUNTRY_CODE } from '@/lib/countryCodes'

export function buildContactHref(id: ContactChannel['id'], value: string, messengerApp?: MessengerApp, countryCode?: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'messenger') {
    if (messengerApp === 'whatsapp') {
      const codeDigits = (countryCode ?? DEFAULT_COUNTRY_CODE).replace(/[^0-9]/g, '')
      return `https://wa.me/${codeDigits}${trimmed.replace(/[^0-9]/g, '')}`
    }
    if (trimmed.startsWith('http')) return trimmed
    if (messengerApp === 'telegram') return `https://t.me/${trimmed.replace(/^@/, '')}`
    return `https://open.kakao.com/o/${trimmed}`
  }
  return ''
}

export function contactPlaceholder(id?: ContactChannel['id'], messengerApp?: MessengerApp) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@felore.io'
  if (id === 'messenger') {
    if (messengerApp === 'telegram') return '텔레그램 아이디 (예: felore_official)'
    if (messengerApp === 'whatsapp') return '10-1234-5678'
    return 'openchat 코드 또는 URL'
  }
  return ''
}

export function contactPreview(id?: ContactChannel['id'], value?: string, messengerApp?: MessengerApp, countryCode?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  if (id === 'messenger' && messengerApp === 'whatsapp') {
    return `${countryCode ?? DEFAULT_COUNTRY_CODE} ${value.trim()} · ${buildContactHref(id, value, messengerApp, countryCode)}`
  }
  return buildContactHref(id, value, messengerApp, countryCode)
}

export function contactChannelValueDisplay(channel: ContactChannel) {
  if (channel.id === 'messenger' && channel.messengerApp === 'whatsapp' && channel.countryCode && channel.value.trim()) {
    return `${channel.countryCode} ${channel.value}`
  }
  return channel.value
}

export const MESSENGER_APP_LABELS: Record<MessengerApp, string> = {
  kakao: '카카오',
  telegram: '텔레그램',
  whatsapp: '왓츠앱',
}
