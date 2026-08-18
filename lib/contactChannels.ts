import type { ContactChannel, MessengerApp } from '@/types'
import { DEFAULT_COUNTRY_CODE } from '@/lib/countryCodes'

export function messengerUsesCountryCode(messengerApp?: MessengerApp) {
  return messengerApp === 'telegram' || messengerApp === 'whatsapp'
}

export function buildContactHref(id: ContactChannel['id'], value: string, messengerApp?: MessengerApp, countryCode?: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'messenger') {
    if (messengerUsesCountryCode(messengerApp)) {
      const codeDigits = (countryCode ?? DEFAULT_COUNTRY_CODE).replace(/[^0-9]/g, '')
      const digits = trimmed.replace(/[^0-9]/g, '')
      return messengerApp === 'telegram' ? `https://t.me/+${codeDigits}${digits}` : `https://wa.me/${codeDigits}${digits}`
    }
    return `https://open.kakao.com/me/${trimmed}`
  }
  return ''
}

export function contactPlaceholder(id?: ContactChannel['id'], messengerApp?: MessengerApp) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@felore.io'
  if (id === 'messenger') {
    if (messengerUsesCountryCode(messengerApp)) return '10-1234-5678'
    return '카카오 아이디'
  }
  return ''
}

export function contactPreview(id?: ContactChannel['id'], value?: string, messengerApp?: MessengerApp, countryCode?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  if (id === 'messenger' && messengerUsesCountryCode(messengerApp)) {
    return `${countryCode ?? DEFAULT_COUNTRY_CODE} ${value.trim()} · ${buildContactHref(id, value, messengerApp, countryCode)}`
  }
  return buildContactHref(id, value, messengerApp, countryCode)
}

export function contactChannelValueDisplay(channel: ContactChannel) {
  if (channel.id === 'messenger' && messengerUsesCountryCode(channel.messengerApp) && channel.countryCode && channel.value.trim()) {
    return `${channel.countryCode} ${channel.value}`
  }
  return channel.value
}

export const MESSENGER_APP_LABELS: Record<MessengerApp, string> = {
  kakao: '카카오',
  telegram: '텔레그램',
  whatsapp: '왓츠앱',
}
