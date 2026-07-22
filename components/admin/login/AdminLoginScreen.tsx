'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { Button } from '@/components/ui'

const ROLE_LABEL: Record<string, string> = {
  manager: '매니저 · 가입 승인·오너 위임 제외 전체 운영',
  owner: '오너 · 전체 권한 + 가입 승인 + 위임',
}

export default function AdminLoginScreen() {
  const router = useRouter()
  const operators = useAdminStore((s) => s.operators)
  const login = useAdminStore((s) => s.login)
  const submitJoinRequest = useAdminStore((s) => s.submitJoinRequest)

  const [mode, setMode] = useState<'login' | 'request' | 'requested'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')

  // [임시] 실제 로그인 전 목업 — 계정 목록 클릭만으로 세션 발급
  const handleSelect = (operatorId: string) => {
    const operator = operators.find((o) => o.id === operatorId)
    if (!operator) return
    login(operator)
    router.replace('/admin/dashboard')
  }

  const handleSubmitRequest = () => {
    if (!name.trim() || !email.trim()) return
    submitJoinRequest(name.trim(), email.trim(), reason.trim() || undefined)
    setMode('requested')
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

        {mode === 'login' && (
          <>
            <div className="space-y-2">
              {operators.map((operator) => (
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

            <button
              onClick={() => setMode('request')}
              className="mt-4 w-full text-center text-[12.5px] font-semibold underline active:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              운영자 계정이 없으신가요? 가입 신청
            </button>

            <p className="mt-5 text-[11px]" style={{ color: 'var(--color-text-tertiary)' }}>
              [임시] 목업 단계 — 비밀번호 없이 역할별 계정을 선택해 로그인합니다.
            </p>
          </>
        )}

        {mode === 'request' && (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="w-full rounded-xl border px-3.5 py-2.5 text-[14px] outline-none"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
              type="email"
              className="w-full rounded-xl border px-3.5 py-2.5 text-[14px] outline-none"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="신청 사유 (선택)"
              rows={2}
              className="w-full rounded-xl border px-3.5 py-2.5 text-[14px] outline-none"
              style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' }}
            />
            <Button variant="primary" size="md" disabled={!name.trim() || !email.trim()} onClick={handleSubmitRequest} className="w-full">
              가입 신청
            </Button>
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-[12.5px] font-semibold underline active:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              로그인으로 돌아가기
            </button>
          </div>
        )}

        {mode === 'requested' && (
          <div className="space-y-4 py-2 text-center">
            <div className="text-[14px] font-bold" style={{ color: 'var(--color-text-primary)' }}>
              가입 신청이 접수되었습니다
            </div>
            <p className="text-[12.5px]" style={{ color: 'var(--color-text-tertiary)' }}>
              오너 승인 후 운영자 계정으로 로그인할 수 있습니다.
            </p>
            <Button variant="outline" size="md" onClick={() => setMode('login')} className="w-full">
              로그인으로 돌아가기
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
