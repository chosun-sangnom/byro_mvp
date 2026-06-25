'use client'

import { useByroStore } from '@/store/useByroStore'

export function useProfileOwner(username: string) {
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const user = useByroStore((s) => s.user)
  const isOwner = isLoggedIn && user?.linkId === username
  return { isOwner, isLoggedIn, user }
}
