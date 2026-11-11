'use client'

// [임시] /v2(관계 AI 비서 목업)에서 기존 프로필 화면으로 넘어온 흐름인지 기억한다.
// ?from=v2 로 들어오면 세션에 적어 두고, 프로필 안에서 다른 화면으로 옮겨도 유지한다. /v2로 돌아가면 지운다.

import { useEffect, useState } from 'react'

const KEY = 'felore-v2-flow'

export type V2Flow = { active: boolean; backHref: string; backLabel: string }

const OFF: V2Flow = { active: false, backHref: '/v2', backLabel: '' }

export function useV2Flow(): V2Flow {
  const [flow, setFlow] = useState<V2Flow>(OFF)
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get('from') === 'v2') sessionStorage.setItem(KEY, q.get('person') ?? 'me')
      const saved = sessionStorage.getItem(KEY)
      if (!saved) return
      setFlow(saved === 'me'
        ? { active: true, backHref: '/v2?tab=me', backLabel: '마이페이지' }
        : { active: true, backHref: `/v2?tab=people&person=${saved}`, backLabel: '내 사람들' })
    } catch {}
  }, [])
  return flow
}

export function clearV2Flow() {
  try { sessionStorage.removeItem(KEY) } catch {}
}
