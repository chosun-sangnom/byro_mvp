'use client'

import { useState } from 'react'
import { Check, Info, MessageCircle } from 'lucide-react'
import { Button, showToast } from '@/components/ui'

type VerifyTab = 'kakao' | 'sms'

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('010')
}

function VerifiedBadgeIcon() {
  return (
    <span
      className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full"
      style={{ background: 'linear-gradient(135deg, #34D399, #0E9F6E)' }}
    >
      <Check size={40} strokeWidth={3} color="#fff" />
    </span>
  )
}

interface IdentityVerificationProps {
  /** 이미 인증 완료된 상태(예: 마이페이지 재방문)면 true — 폼 대신 완료 상태를 바로 보여줌 */
  isVerified: boolean
  description?: string
  /** 인증 완료 화면에서 "확인"을 눌렀을 때 호출 */
  onVerified: () => void
  /** 넘기면 이미 인증된 상태에 "본인인증 취소" 버튼이 노출됨 */
  onCancelVerification?: () => void
}

export function IdentityVerification({
  isVerified,
  description = '인증하면 프로필에 인증 뱃지가 표시돼요',
  onVerified,
  onCancelVerification,
}: IdentityVerificationProps) {
  const [tab, setTab] = useState<VerifyTab>('kakao')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const phoneInvalid = phone.length > 0 && !isValidPhone(phone)

  // [임시] 카카오 본인인증 API 미연동
  const handleKakaoVerify = () => {
    setShowSuccess(true)
  }

  const handleSmsSend = () => {
    if (smsSent) {
      showToast('인증번호를 다시 보냈어요')
      return
    }
    setSmsSent(true)
  }

  // [임시] 인증번호 확인 API 미연동 — 목업 정답 코드 123456과만 비교
  const handleSmsCodeConfirm = () => {
    if (code !== '123456') {
      setCodeError(true)
      return
    }
    setCodeError(false)
    setShowSuccess(true)
  }

  if (isVerified) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <VerifiedBadgeIcon />
        <p className="mt-6 text-[16px] font-bold text-[var(--color-text-strong)]">본인인증이 완료됐어요</p>
        <p className="mt-2 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">이제 프로필에 인증 뱃지가 표시돼요</p>
        {onCancelVerification && (
          <button
            type="button"
            onClick={onCancelVerification}
            className="mt-10 text-sm font-semibold text-[var(--color-text-tertiary)] underline"
          >
            본인인증 취소
          </button>
        )}
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <VerifiedBadgeIcon />
        <p className="mt-6 text-[16px] font-bold text-[var(--color-text-strong)]">본인인증이 완료됐어요</p>
        <p className="mt-2 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">이제 프로필에 인증 뱃지가 표시돼요</p>
        <div className="mt-10 w-full">
          <Button onClick={onVerified}>확인</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{description}</p>

      <div className="mb-5 flex gap-1 rounded-full p-1" style={{ backgroundColor: 'var(--color-bg-soft)' }}>
        {(['kakao', 'sms'] as VerifyTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-[13px] font-bold transition-colors ${tab === t ? 'shadow-sm' : ''}`}
            style={{
              backgroundColor: tab === t ? '#fff' : 'transparent',
              color: tab === t ? 'var(--color-text-strong)' : 'var(--color-text-secondary)',
            }}
          >
            {t === 'kakao' ? '카카오 인증' : 'SMS 인증'}
          </button>
        ))}
      </div>

      {tab === 'kakao' ? (
        <div>
          <div
            className="mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{ backgroundColor: 'var(--color-state-info-bg)' }}
          >
            <Info size={16} style={{ color: 'var(--color-state-info-text)' }} className="flex-shrink-0" />
            <p className="text-[13px] text-[var(--color-text-secondary)]">카카오 본인인증 서비스를 통해 인증해요</p>
          </div>
          <Button variant="kakao" onClick={handleKakaoVerify}>
            <span className="inline-flex w-full items-center justify-center gap-2">
              <MessageCircle size={16} fill="#333" stroke="none" /> 카카오로 본인인증하기
            </span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                className="flex-1 rounded-full border px-4 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none"
                style={{ borderColor: phoneInvalid ? 'var(--color-state-danger-text)' : 'var(--color-border-default)' }}
              />
              {/* [임시] SMS 발송 API 미연동 */}
              <Button
                variant={smsSent ? 'outline' : 'primary'}
                size="sm"
                fullWidth={false}
                className="w-24 flex-shrink-0"
                disabled={smsSent ? false : !isValidPhone(phone)}
                onClick={handleSmsSend}
                style={smsSent ? { borderRadius: 9999, color: 'var(--color-text-strong)' } : undefined}
              >
                {smsSent ? '재발송' : '발송'}
              </Button>
            </div>
            {phoneInvalid && (
              <p className="mt-1 px-1 text-[12px]" style={{ color: 'var(--color-state-danger-text)' }}>올바른 전화번호 형식을 입력해주세요</p>
            )}
          </div>
          {smsSent && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setCodeError(false) }}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                  className="flex-1 rounded-full border px-4 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none"
                  style={{ borderColor: codeError ? 'var(--color-state-danger-text)' : 'var(--color-border-default)' }}
                />
                <Button
                  size="sm"
                  fullWidth={false}
                  className="w-24 flex-shrink-0"
                  disabled={code.length < 6}
                  onClick={handleSmsCodeConfirm}
                >
                  확인
                </Button>
              </div>
              {codeError && (
                <p className="mt-1 px-1 text-[12px]" style={{ color: 'var(--color-state-danger-text)' }}>인증번호가 일치하지 않아요</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
