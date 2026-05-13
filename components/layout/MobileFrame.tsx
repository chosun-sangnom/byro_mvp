'use client'

import React from 'react'
import { ToastSingleton } from '@/components/ui'

interface MobileFrameProps {
  children: React.ReactNode
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-neutral-300 flex items-center justify-center max-sm:bg-white">
      <div className="
        w-full max-w-[390px] h-[844px] bg-white rounded-[44px]
        overflow-hidden shadow-2xl relative flex flex-col
        max-sm:max-w-none max-sm:h-screen max-sm:rounded-none max-sm:shadow-none
      ">
        {/* 상태바 */}
        <StatusBar />
        {/* 화면 콘텐츠 */}
        <div className="flex-1 overflow-hidden relative">
          <ToastSingleton>
            {children}
          </ToastSingleton>
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="flex justify-between items-center px-6 py-2 text-xs font-bold text-[var(--color-text-strong)] bg-white flex-shrink-0 max-sm:hidden">
      <span>9:41</span>
      <span>●●●</span>
    </div>
  )
}
