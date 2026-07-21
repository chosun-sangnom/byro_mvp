'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'

export function AdminGuard({ children }: { children: ReactNode }) {
  const adminUser = useAdminStore((s) => s.adminUser)
  const hasHydrated = useAdminStore((s) => s.hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && !adminUser) router.replace('/admin/login')
  }, [hasHydrated, adminUser, router])

  if (!hasHydrated || !adminUser) return null
  return <>{children}</>
}
