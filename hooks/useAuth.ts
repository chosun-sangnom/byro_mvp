'use client'

import { useByroStore } from '@/store/useByroStore'

export function useAuth() {
  const isLoggedIn = useByroStore((s) => s.isLoggedIn)
  const user = useByroStore((s) => s.user)
  const login = useByroStore((s) => s.login)
  const logout = useByroStore((s) => s.logout)
  return { isLoggedIn, user, login, logout }
}
