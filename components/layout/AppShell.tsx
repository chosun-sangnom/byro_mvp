'use client'

import React from 'react'
import { ToastSingleton } from '@/components/ui'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-white sm:bg-[#F3F3F1]">
      <div className="mx-auto w-full max-w-[480px] sm:px-4 sm:py-6">
        <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-white sm:min-h-[100dvh] sm:rounded-[32px] sm:border sm:border-[#E7E7E7] sm:shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <ToastSingleton>
            {children}
          </ToastSingleton>
        </div>
      </div>
    </div>
  )
}
