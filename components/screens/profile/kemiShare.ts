/**
 * 케미 리포트 링크 공유 (SCRUM-159)
 *
 * 공유 버튼을 누르면 그 시점의 리포트를 스냅샷으로 저장하고 /k/토큰 주소를 만든다.
 * 리포트와 링크는 리포트 생성 시점부터 24시간 뒤 함께 만료된다.
 * 상대가 "케미 공유에 이름, 사진 노출"을 꺼두었으면 이름은 첫 글자만, 사진은 기본 이미지.
 *
 * TODO(real API): 토큰 발급, 스냅샷 보관, 만료 판정, 마스킹은 서버가 담당.
 */

import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import type { KemiViewer } from '@/components/screens/profile/kemiReport'

type NormalizedPublicProfile = ReturnType<typeof getNormalizedPublicProfile>

export const KEMI_SHARE_TTL_MS = 24 * 60 * 60 * 1000

export type KemiShareSnapshot = {
  token: string
  viewer: KemiViewer & { linkId?: string; avatar?: string }
  targetUsername: string
  targetMasked: boolean
  generatedAt: number
}

// [임시] 목업 전용 — 공유 스냅샷을 이 브라우저 localStorage에만 보관 (다른 기기에서는 열리지 않음)
const STORAGE_KEY = 'felore-kemi-shares'

// [임시] 목업 전용 — 실서비스는 users.kemi_share_identity_opt_in(기본 켜짐). 마스킹 확인용으로 이지민만 끈 상태로 둔다
const OPTED_OUT = new Set(['jiminlee'])

export function isKemiShareOptedOut(username: string) {
  return OPTED_OUT.has(username)
}

export function maskKemiName(name: string) {
  const ch = name.trim().charAt(0)
  return ch ? `${ch}···` : 'Felore 유저'
}

export function maskKemiProfile(profile: NormalizedPublicProfile): NormalizedPublicProfile {
  return { ...profile, name: maskKemiName(profile.name), profileImages: [], avatarImage: undefined }
}

export function kemiShareUrl(token: string) {
  return `${window.location.origin}/k/${token}`
}

function readAll(): Record<string, KemiShareSnapshot> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, KemiShareSnapshot>) : {}
  } catch {
    return {}
  }
}

function newToken() {
  const bytes = new Uint8Array(8)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => (b % 36).toString(36)).join('')
}

export function saveKemiShare(input: Omit<KemiShareSnapshot, 'token'>): string {
  const token = newToken()
  const all = readAll()
  all[token] = { ...input, token }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // 저장 공간 부족 등 — 링크는 만들어지지만 이 브라우저에서 다시 열 수 없음
  }
  return token
}

// [임시] 목업 시연용 고정 토큰 — /k/demo, /k/demo-masked, /k/demo-expired
function demoSnapshot(token: string): KemiShareSnapshot | null {
  const target = token === 'demo-masked' ? 'jiminlee' : token === 'demo' || token === 'demo-expired' ? 'mk' : null
  if (!target) return null
  const viewer = getNormalizedPublicProfile({ username: 'gangminjun' })
  const hoursAgo = token === 'demo-expired' ? 25 : 2
  return {
    token,
    viewer: {
      linkId: 'gangminjun',
      name: viewer.name,
      title: viewer.title ?? '',
      whoIAm: viewer.whoIAm,
      life: viewer.life,
      avatar: viewer.profileImages?.[0] ?? viewer.avatarImage,
    },
    targetUsername: target,
    targetMasked: isKemiShareOptedOut(target),
    generatedAt: Date.now() - hoursAgo * 60 * 60 * 1000,
  }
}

export function loadKemiShare(token: string): KemiShareSnapshot | null {
  return readAll()[token] ?? demoSnapshot(token)
}

export function kemiShareExpiresAt(snapshot: KemiShareSnapshot) {
  return snapshot.generatedAt + KEMI_SHARE_TTL_MS
}
