'use client'

// [임시] /v2(관계 AI 비서 목업)에서 기존 프로필 화면으로 넘어온 흐름인지 기억한다.
// ?from=v2 로 들어오면 세션에 적어 두고, 프로필 안에서 다른 화면으로 옮겨도 유지한다. /v2로 돌아가면 지운다.

import { useEffect, useState } from 'react'

const KEY = 'felore-v2-flow'
/** /v2에서 보던 상태(비회원, 가입 직후, 가져오는 중, 사용 중). 화면을 오가도 유지한다 */
export const MODE_KEY = 'felore-v2-mode'

export type V2Mode = 'guest' | 'new' | 'importing' | 'active'
export type V2Tab = 'today' | 'people' | 'me'
export const V2_MODES: [V2Mode, string][] = [['guest', '비회원'], ['new', '가입 직후'], ['importing', '가져오는 중'], ['active', '사용 중']]

export type V2Flow = { active: boolean; backHref: string; tab: V2Tab; mode: V2Mode }

const OFF: V2Flow = { active: false, backHref: '/v2?tab=me', tab: 'me', mode: 'active' }

export function readV2Mode(): V2Mode {
  try {
    const m = sessionStorage.getItem(MODE_KEY) as V2Mode | null
    if (m && V2_MODES.some(([id]) => id === m)) return m
  } catch {}
  return 'active'
}

export function useV2Flow(): V2Flow {
  const [flow, setFlow] = useState<V2Flow>(OFF)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('from') === 'v2') sessionStorage.setItem(KEY, q.get('person') ?? 'me')
      const saved = sessionStorage.getItem(KEY)
      if (!saved) return
      const mode = readV2Mode()
      setFlow(saved === 'me'
        ? { active: true, backHref: '/v2?tab=me', tab: 'me', mode }
        : { active: true, backHref: `/v2?tab=people&person=${saved}`, tab: 'people', mode })
    } catch {}
  }, [])
  return flow
}

export function clearV2Flow() {
  try { sessionStorage.removeItem(KEY) } catch {}
}
