'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BadgeCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  ShieldAlert,
  Sliders,
  Sparkles,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useAdminStore } from '@/store/useAdminStore'

const NAV = [
  { href: '/admin/dashboard', label: '대시보드', code: 'DASH', icon: LayoutDashboard },
  { href: '/admin/analytics', label: '애널리틱스', code: 'ANLY', icon: BarChart3 },
  { href: '/admin/users', label: '회원 관리', code: 'USER', icon: Users },
  { href: '/admin/reports', label: '신고·제재', code: 'RPRT', icon: ShieldAlert },
  { href: '/admin/verification', label: '인증 검토', code: 'VRFY', icon: BadgeCheck },
  { href: '/admin/billing', label: '결제 관리', code: 'BILL', icon: CreditCard },
  { href: '/admin/cs', label: '문의', code: 'CS', icon: MessageCircle },
  { href: '/admin/ai', label: 'AI 관리', code: 'AI', icon: Sparkles },
  { href: '/admin/settings', label: '권한·감사', code: 'ADMN', icon: Sliders },
] as const

const ROLE_LABEL: Record<string, string> = { viewer: '뷰어', operator: '운영', admin: '관리자', owner: '소유자' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const adminUser = useAdminStore((s) => s.adminUser)
  const logout = useAdminStore((s) => s.logout)
  const reportsPending = useAdminStore((s) => s.reports.filter((r) => r.status === 'pending').length)
  const verificationsPending = useAdminStore((s) => s.verifications.filter((v) => v.status === 'pending').length)
  const ticketsUnanswered = useAdminStore((s) => s.tickets.filter((t) => t.status !== '완료').length)
  const joinRequestsPending = useAdminStore((s) => s.joinRequests.filter((r) => r.status === 'pending').length)

  const badgeFor = (code: string) => {
    if (code === 'RPRT') return reportsPending
    if (code === 'VRFY') return verificationsPending
    if (code === 'CS') return ticketsUnanswered
    if (code === 'ADMN') return joinRequestsPending
    return 0
  }

  return (
    <div className="min-h-dvh flex" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      <aside
        className="sticky top-0 flex h-dvh w-[240px] shrink-0 flex-col border-r px-4 py-5"
        style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-default)' }}
      >
        <div className="mb-6 px-1">
          <div className="text-[18px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            Byro 백오피스
          </div>
          <div className="mt-0.5 text-[11px] font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>
            운영자 전용
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href)
            const badge = badgeFor(item.code)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-accent-bg)' : 'transparent',
                  color: active ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                }}
              >
                <Icon size={17} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[11px] font-bold"
                    style={{ backgroundColor: 'var(--color-state-danger-bg)', color: 'var(--color-state-danger-text)' }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--color-border-soft)' }}>
          <div className="flex items-center gap-2.5 px-1">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold"
              style={{ backgroundColor: 'var(--color-bg-muted)', color: 'var(--color-text-secondary)' }}
            >
              {adminUser?.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {adminUser?.name}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
                {adminUser ? ROLE_LABEL[adminUser.role] : ''}
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                router.replace('/admin/login')
              }}
              className="icon-button"
              aria-label="로그아웃"
            >
              <LogOut size={16} color="var(--color-text-secondary)" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-[1080px]">{children}</div>
      </main>
    </div>
  )
}
