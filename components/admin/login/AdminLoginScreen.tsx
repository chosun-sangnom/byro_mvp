'use client'

import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { ADMIN_OPERATORS } from '@/lib/mocks/adminMocks'

const ROLE_LABEL: Record<string, string> = { viewer: '뷰어 · 조회만', operator: '운영 · 신고/문의/인증 처리', admin: '관리자 · 결제/제재/IP 열람 포함 전체' }

export default function AdminLoginScreen() {
  const router = useRouter()
  const login = useAdminStore((s) => s.login)

  // [임시] 실제 로그인 전 목업 — 계정 목록 클릭만으로 세션 발급
  const handleSelect = (operatorId: string) => {
    const operator = ADMIN_OPERATORS.find((o) => o.id === operatorId)
    if (!operator) return
    login(operator)
    router.replace('/admin/dashboard')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
      <div
        className="w-full max-w-[380px] rounded-3xl border p-7"
        style={{ backgroundColor: '#FFFFFF', borderColor: 'var(--color-border-default)', boxShadow: 'var(--shadow-hero)' }}
      >
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck size={20} color="var(--color-accent-dark)" />
          <div className="text-[19px] font-black" style={{ color: 'var(--color-text-strong)' }}>
            Byro 백오피스
          </div>
        </div>
        <p className="mb-6 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
          운영자 전용 도구입니다. 일반 사용자는 접근할 수 없습니다.
        </p>

        <div className="space-y-2">
          {ADMIN_OPERATORS.map((operator) => (
            <button
              key={operator.id}
              onClick={() => handleSelect(operator.id)}
              className="flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors active:opacity-70"
              style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-surface)' }}
            >
              <div>
                <div className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {operator.name}
                </div>
                <div className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-tertiary)' }}>
                  {ROLE_LABEL[operator.role]}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
          [임시] 목업 단계 — 비밀번호 없이 역할별 계정을 선택해 로그인합니다.
        </p>
      </div>
    </div>
  )
}
