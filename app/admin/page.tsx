'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/store/useAdminStore'

export default function AdminIndexPage() {
  const adminUser = useAdminStore((s) => s.adminUser)
  const router = useRouter()

  useEffect(() => {
    router.replace(adminUser ? '/admin/dashboard' : '/admin/login')
  }, [adminUser, router])

  return null
}
