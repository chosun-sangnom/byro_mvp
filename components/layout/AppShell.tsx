'use client'

import React from 'react'
import { ToastSingleton } from '@/components/ui'
import AppHeader from '@/components/layout/AppHeader'
import BottomTabBar from '@/components/layout/BottomTabBar'

interface AppShellProps {
  children: React.ReactNode
  showHeader?: boolean
  showTabBar?: boolean
}

export default function AppShell({ children, showHeader = false, showTabBar = false }: AppShellProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[var(--color-bg-page)]">
      <div className="mx-auto w-full max-w-[430px] px-3 sm:px-5">
        <div className="relative flex min-h-dvh w-full flex-col bg-[var(--color-bg-page)]">
          {showHeader && <AppHeader />}
          <ToastSingleton>
            <div className={showTabBar ? 'pb-24' : undefined}>
              {children}
            </div>
          </ToastSingleton>
          {showTabBar && <BottomTabBar />}
        </div>
      </div>
    </div>
  )
}
