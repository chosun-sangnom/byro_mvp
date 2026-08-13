'use client'

import { useFeloreStore } from '@/store/useFeloreStore'

export function useAuth() {
  const isLoggedIn = useFeloreStore((s) => s.isLoggedIn)
  const user = useFeloreStore((s) => s.user)
  const login = useFeloreStore((s) => s.login)
  const logout = useFeloreStore((s) => s.logout)
  return { isLoggedIn, user, login, logout }
}
