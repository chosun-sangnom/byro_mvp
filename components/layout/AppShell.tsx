'use client'

import React from 'react'
import { ToastSingleton } from '@/components/ui'

interface AppShellProps {
  children: React.ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-[430px] px-3 sm:px-5">
        <div className="relative flex min-h-dvh w-full flex-col bg-white">
          <ToastSingleton>
            {children}
          </ToastSingleton>
        </div>
      </div>
    </div>
  )
}
