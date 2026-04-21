'use client'

import React from 'react'
import { ToastSingleton } from '@/components/ui'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-white sm:bg-[#F3F3F1] sm:px-4 sm:py-6">
      <div className="mx-auto w-[calc(100%-24px)] max-w-[430px]">
        <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white sm:min-h-[calc(100dvh-48px)] sm:rounded-[32px] sm:border sm:border-[#E7E7E7] sm:shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <ToastSingleton>
            {children}
          </ToastSingleton>
        </div>
      </div>
    </div>
  )
}
