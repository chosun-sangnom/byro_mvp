'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ToastSingleton } from '@/components/ui'
import AppHeader from '@/components/layout/AppHeader'
import { V2ModeBar, V2TabBar } from '@/components/layout/V2Chrome'
import { MODE_KEY, useV2Flow } from '@/lib/v2Flow'

interface AppShellProps {
  children: React.ReactNode
  showHeader?: boolean
}

export default function AppShell({ children, showHeader = false }: AppShellProps) {
  const router = useRouter()
  // [임시] /v2에서 넘어온 흐름이면 같은 상태 줄, 하단 탭, 플로팅 버튼을 그대로 보여준다
  const v2 = useV2Flow()
  const chrome = showHeader && v2.active
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[var(--color-bg-page)]">
      {chrome && (
        <V2ModeBar mode={v2.mode} onChange={(m) => { try { sessionStorage.setItem(MODE_KEY, m) } catch {} router.push('/v2') }} />
      )}
      <div className="mx-auto w-full max-w-[430px] px-3 sm:px-5">
        <div className={`relative flex min-h-dvh w-full flex-col bg-[var(--color-bg-page)] ${chrome ? 'pb-[84px]' : ''}`}>
          {showHeader && <AppHeader />}
          <ToastSingleton>
            {children}
          </ToastSingleton>
        </div>
      </div>
      {chrome && (
        <V2TabBar
          fixed
          active={v2.tab}
          onTab={(t) => router.push(t === v2.tab ? v2.backHref : `/v2?tab=${t}`)}
          onFab={() => router.push(`${v2.backHref}&fab=1`)}
        />
      )}
    </div>
  )
}
