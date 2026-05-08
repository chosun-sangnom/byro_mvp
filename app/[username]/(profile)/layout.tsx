'use client'

import type { ReactNode } from 'react'
import AppShell from '@/components/layout/AppShell'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'

export default function PublicProfileLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { username: string }
}) {
  return (
    <AppShell>
      <PublicProfileShell username={params.username}>
        {children}
      </PublicProfileShell>
    </AppShell>
  )
}
