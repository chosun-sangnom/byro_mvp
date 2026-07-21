'use client'

import { Suspense } from 'react'
import UsersScreen from '@/components/admin/users/UsersScreen'

export default function Page() {
  return (
    <Suspense>
      <UsersScreen />
    </Suspense>
  )
}
