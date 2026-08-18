'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, CheckCircle2 } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button, CheckRow, TextArea, showToast } from '@/components/ui'
import { StepFooter, StepIntro } from '@/components/screens/onboarding/OnboardingShared'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

export type Mode = 'choose' | 'signup' | 'login'
type LoginView = 'main' | 'oauth' | 'phone' | 'reset'
type OAuthProvider = 'google'
type OAuthStep = 'pending' | 'done'
type ResetMethod = 'choose' | 'sms' | 'email'
type ResetStage = 'verify' | 'newPassword' | 'done'

interface OAuthMeta {
  label: string
  variant: 'google'
  prefix: string
}

const OAUTH_META: Record<OAuthProvider, OAuthMeta> = {
  google: { label: '구글', variant: 'google', prefix: 'G  ' },
}

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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-[13px] text-[var(--color-text-tertiary)] mb-6 -ml-0.5 self-start"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export function Step1Login({ onModeChange }: { onModeChange?: (mode: Mode) => void } = {}) {
  const store = useFeloreStore()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [view, setView] = useState<LoginView>('main')
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(null)
  const [oauthStep, setOauthStep] = useState<OAuthStep>('pending')

  useEffect(() => {
    onModeChange?.(mode)
  }, [mode, onModeChange])

  // 전화번호 가입 폼
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [signupSmsSent, setSignupSmsSent] = useState(false)
  const [signupCode, setSignupCode] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)

  // 전화번호 로그인 폼
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 비밀번호 찾기
  const [resetMethod, setResetMethod] = useState<ResetMethod>('choose')
  const [resetStage, setResetStage] = useState<ResetStage>('verify')
  const [resetPhone, setResetPhone] = useState('')
  const [resetSmsSent, setResetSmsSent] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const passwordShort = password.length > 0 && password.length < 8
  const emailInvalid = email.length > 0 && !isValidEmail(email)
  const canPhoneSubmit = phoneVerified && password.length >= 8 && (email === '' || isValidEmail(email))
  const loginPasswordShort = loginPassword.length > 0 && loginPassword.length < 8
  const canLoginSubmit = isValidPhone(loginPhone) && loginPassword.length >= 8
  const newPasswordShort = newPassword.length > 0 && newPassword.length < 8
  const newPasswordMismatch = newPasswordConfirm.length > 0 && newPasswordConfirm !== newPassword
  const canResetPassword = newPassword.length >= 8 && newPassword === newPasswordConfirm

  const handleBackToPhoneLogin = () => {
    setView('phone')
    setResetMethod('choose')
    setResetStage('verify')
    setResetPhone('')
    setResetSmsSent(false)
    setResetCode('')
    setResetEmail('')
    setResetEmailSent(false)
    setNewPassword('')
    setNewPasswordConfirm('')
  }

  const handleOAuthSelect = (provider: OAuthProvider) => {
    setOauthProvider(provider)
    setOauthStep('pending')
    setView('oauth')
  }

  const handleBackToMain = () => {
    setView('main')
    setOauthProvider(null)
    setOauthStep('pending')
    setSignupSmsSent(false)
    setSignupCode('')
    setPhoneVerified(false)
  }

  const handleBackToChoose = () => {
    setMode('choose')
    setView('main')
    setOauthProvider(null)
    setOauthStep('pending')
    setSignupSmsSent(false)
    setSignupCode('')
    setPhoneVerified(false)
  }

  // [임시] 로그인 완료 처리
  const handleLoginComplete = () => {
    store.login()
    router.push(`/${SAMPLE_PROFILE.linkId}`)
  }

  // --- OAuth 뷰 ---
  if (view === 'oauth' && oauthProvider) {
    const meta = OAUTH_META[oauthProvider]

    if (oauthStep === 'done') {
      if (mode === 'login') {
        return (
          <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--color-state-success-bg)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--color-state-success-text)' }} />
              </div>
              <div className="text-xl font-black text-[var(--color-text-strong)] mb-2">
                {meta.label} 로그인 완료
              </div>
              <p className="meta-text leading-relaxed">펠로어에 오신 걸 환영해요!</p>
            </div>
            {/* [임시] 실제 로그인 API 미연동 */}
            <Button onClick={handleLoginComplete}>내 FELORE 보기</Button>
          </div>
        )
      }

      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: 'var(--color-state-success-bg)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-state-success-text)' }} />
            </div>
            <div className="text-xl font-black text-[var(--color-text-strong)] mb-2">
              {meta.label} 연결 완료
            </div>
            <p className="meta-text leading-relaxed">이제 프로필을 만들어볼게요.</p>
          </div>
          <Button onClick={() => store.nextStep()}>계속하기</Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <BackButton onClick={handleBackToMain} />
        <div className="mb-8">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight mb-2">
            {meta.label} 계정으로<br />{mode === 'login' ? '로그인' : '시작하기'}
          </div>
          <p className="meta-text leading-relaxed">
            {meta.label} 계정을 펠로어에 연결합니다.<br />
            아래 버튼을 누르면 {meta.label} 인증을 진행해요.
          </p>
        </div>
        {/* [임시] 실제 OAuth 리다이렉트 미연동 — 버튼 클릭으로 완료 시뮬레이션 */}
        <Button variant={meta.variant} onClick={() => setOauthStep('done')}>
          {meta.prefix}{meta.label}로 {mode === 'login' ? '로그인' : '연결하기'}
        </Button>
      </div>
    )
  }

  // --- 전화번호 가입 뷰 ---
  if (view === 'phone' && mode === 'signup') {
    if (!phoneVerified) {
      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <BackButton onClick={handleBackToMain} />
          <div className="mb-6">
            <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
              전화번호로<br />회원가입
            </div>
            <p className="meta-text mt-2">본인 명의 전화번호로 인증번호를 받아요.</p>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                disabled={signupSmsSent}
                autoComplete="tel"
                className="flex-1 border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] disabled:opacity-50"
              />
              {/* [임시] SMS 발송 API 미연동 */}
              <button
                type="button"
                disabled={!isValidPhone(phone) || signupSmsSent}
                onClick={() => setSignupSmsSent(true)}
                className="flex-shrink-0 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
              >
                {signupSmsSent ? '발송됨' : '발송'}
              </button>
            </div>
            {signupSmsSent && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={signupCode}
                  onChange={(e) => setSignupCode(e.target.value)}
                  placeholder="인증번호 6자리"
                  maxLength={6}
                  className="flex-1 border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
                />
                {/* [임시] 인증번호 확인 API 미연동 */}
                <button
                  type="button"
                  disabled={signupCode.length < 6}
                  onClick={() => setPhoneVerified(true)}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
                >
                  확인
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <BackButton onClick={() => setPhoneVerified(false)} />
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            전화번호로<br />회원가입
          </div>
          <p className="meta-text mt-2">{phone} 인증 완료 · 로그인에 사용할 비밀번호를 설정해주세요.</p>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">비밀번호 *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력해주세요"
              autoComplete="new-password"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                passwordShort ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
              }`}
            />
            {passwordShort && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호는 8자 이상이어야 해요</p>
            )}
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">
              이메일 <span className="text-[10px]">(선택 · 비밀번호 재설정용)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                emailInvalid ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
              }`}
            />
            {emailInvalid && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">올바른 이메일 형식을 입력해주세요</p>
            )}
          </div>
        </div>
        {/* [임시] 펠로어 전화번호 회원가입 API 미연동 */}
        <Button onClick={() => { if (canPhoneSubmit) store.nextStep() }} disabled={!canPhoneSubmit}>
          가입하기
        </Button>
      </div>
    )
  }

  // --- 전화번호 로그인 뷰 ---
  if (view === 'phone' && mode === 'login') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <BackButton onClick={handleBackToMain} />
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            전화번호로<br />로그인
          </div>
        </div>
        <div className="space-y-3 mb-2">
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">전화번호</label>
            <input
              type="tel"
              value={loginPhone}
              onChange={(e) => setLoginPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              autoComplete="tel"
              className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)]"
            />
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">비밀번호</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                loginPasswordShort ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
              }`}
            />
            {loginPasswordShort && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호는 8자 이상이어야 해요</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setView('reset')}
          className="self-start mb-6 text-[12px] text-[var(--color-text-tertiary)] underline underline-offset-2"
        >
          비밀번호를 잊으셨나요?
        </button>
        {/* [임시] 펠로어 전화번호 로그인 API 미연동 */}
        <Button onClick={() => { if (canLoginSubmit) handleLoginComplete() }} disabled={!canLoginSubmit}>
          로그인
        </Button>
      </div>
    )
  }

  // --- 비밀번호 찾기 뷰 ---
  if (view === 'reset') {
    if (resetMethod === 'choose') {
      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <BackButton onClick={handleBackToPhoneLogin} />
          <div className="mb-6">
            <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
              비밀번호<br />재설정
            </div>
            <p className="meta-text mt-2">본인 확인 방법을 선택해주세요.</p>
          </div>
          <div className="space-y-3">
            <Button variant="outline" onClick={() => { setResetMethod('sms'); setResetStage('verify') }}>
              전화번호 인증번호로 재설정
            </Button>
            <Button variant="outline" onClick={() => { setResetMethod('email'); setResetStage('verify') }}>
              가입 시 등록한 이메일로 재설정
            </Button>
          </div>
        </div>
      )
    }

    if (resetMethod === 'sms') {
      if (resetStage === 'verify') {
        return (
          <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
            <BackButton onClick={() => setResetMethod('choose')} />
            <div className="mb-6">
              <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
                전화번호<br />인증
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  disabled={resetSmsSent}
                  autoComplete="tel"
                  className="flex-1 border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] disabled:opacity-50"
                />
                {/* [임시] SMS 발송 API 미연동 */}
                <button
                  type="button"
                  disabled={!isValidPhone(resetPhone) || resetSmsSent}
                  onClick={() => setResetSmsSent(true)}
                  className="flex-shrink-0 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
                >
                  {resetSmsSent ? '발송됨' : '발송'}
                </button>
              </div>
              {resetSmsSent && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    className="flex-1 border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
                  />
                  {/* [임시] 인증번호 확인 API 미연동 */}
                  <button
                    type="button"
                    disabled={resetCode.length < 6}
                    onClick={() => setResetStage('newPassword')}
                    className="flex-shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
                  >
                    확인
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }
      if (resetStage === 'done') {
        return (
          <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--color-state-success-bg)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--color-state-success-text)' }} />
              </div>
              <div className="text-xl font-black text-[var(--color-text-strong)] mb-2">
                비밀번호가 변경됐어요
              </div>
              <p className="meta-text leading-relaxed">새 비밀번호로 다시 로그인해주세요.</p>
            </div>
            <Button onClick={handleBackToPhoneLogin}>로그인으로 돌아가기</Button>
          </div>
        )
      }

      // resetStage === 'newPassword'
      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <BackButton onClick={() => setResetStage('verify')} />
          <div className="mb-6">
            <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
              새 비밀번호<br />설정
            </div>
            <p className="meta-text mt-2">인증이 완료됐어요. 새 비밀번호를 입력해주세요.</p>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상 입력해주세요"
                autoComplete="new-password"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                  newPasswordShort ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
                }`}
              />
              {newPasswordShort && (
                <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호는 8자 이상이어야 해요</p>
              )}
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">새 비밀번호 확인</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="한 번 더 입력해주세요"
                autoComplete="new-password"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                  newPasswordMismatch ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
                }`}
              />
              {newPasswordMismatch && (
                <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호가 일치하지 않아요</p>
              )}
            </div>
          </div>
          {/* [임시] 비밀번호 재설정 API 미연동 */}
          <Button onClick={() => { if (canResetPassword) setResetStage('done') }} disabled={!canResetPassword}>
            비밀번호 변경하기
          </Button>
        </div>
      )
    }

    // resetMethod === 'email'
    if (!resetEmailSent) {
      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <BackButton onClick={() => setResetMethod('choose')} />
          <div className="mb-6">
            <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
              이메일로<br />재설정
            </div>
            <p className="meta-text mt-2">가입 시 등록한 복구용 이메일을 입력해주세요.</p>
          </div>
          <div className="mb-6">
            <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이메일</label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)]"
            />
          </div>
          {/* [임시] 재설정 이메일 발송 API 미연동 */}
          <Button onClick={() => { if (isValidEmail(resetEmail)) setResetEmailSent(true) }} disabled={!isValidEmail(resetEmail)}>
            재설정 링크 보내기
          </Button>
        </div>
      )
    }

    // 이메일 발송 완료
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'var(--color-state-success-bg)' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-state-success-text)' }} />
          </div>
          <div className="text-xl font-black text-[var(--color-text-strong)] mb-2">
            재설정 링크를 보냈어요
          </div>
          <p className="meta-text leading-relaxed">{resetEmail}로 비밀번호 재설정 링크를 보냈어요.<br />메일함을 확인해주세요.</p>
        </div>
        <Button onClick={handleBackToPhoneLogin}>로그인으로 돌아가기</Button>
      </div>
    )
  }

  // --- 로그인 메인 뷰 ---
  if (mode === 'login') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <BackButton onClick={handleBackToChoose} />
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            다시 오셨군요!
          </div>
          <p className="meta-text mt-1">연결했던 계정으로 로그인하세요.</p>
        </div>
        <div className="space-y-3">
          <Button variant="google" onClick={() => handleOAuthSelect('google')}>G  구글로 로그인</Button>
        </div>
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
          <span className="text-[11px] text-[var(--color-text-tertiary)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        </div>
        <Button variant="outline" onClick={() => setView('phone')}>전화번호로 로그인</Button>
      </div>
    )
  }

  // --- 회원가입 메인 뷰 ---
  if (mode === 'signup') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <BackButton onClick={handleBackToChoose} />
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            처음 오셨군요!
          </div>
          <p className="meta-text mt-1">가입 방법을 선택해주세요.</p>
        </div>
        <div className="space-y-3">
          <Button variant="google" onClick={() => handleOAuthSelect('google')}>G  구글로 시작하기</Button>
        </div>
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
          <span className="text-[11px] text-[var(--color-text-tertiary)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        </div>
        <Button variant="outline" onClick={() => setView('phone')}>전화번호로 회원가입</Button>
      </div>
    )
  }

  // --- 초기 선택 뷰 ---
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      <div className="surface-card rounded-[32px] px-5 py-6 text-center mb-6">
        <div className="micro-text uppercase tracking-[0.18em] mb-2">Branding Profile</div>
        <div className="text-3xl font-black mb-2">FELORE</div>
        <div className="meta-text mt-3 leading-relaxed">
          진짜 나를 보여주는 프로필.
          <br />
          만난 사람에게 바로 공유할 수 있어요.
        </div>
      </div>
      <div className="space-y-3">
        <Button onClick={() => setMode('signup')} style={{ backgroundColor: '#0D0D0D', boxShadow: 'none' }}>회원가입</Button>
        <Button variant="outline" onClick={() => setMode('login')}>이미 계정이 있어요</Button>
      </div>
    </div>
  )
}

export function StepTermsAgreement() {
  const store = useFeloreStore()
  const allAgreed = store.agreedTerms && store.agreedPrivacy && store.agreedMarketing
  const canProceed = store.agreedTerms && store.agreedPrivacy

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      <div className="mb-8">
        <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
          본인인증 하기 전
          <br />
          <span style={{ color: 'var(--color-accent-dark)' }}>이용약관 동의</span>해 주세요
        </div>
      </div>

      <div className="pb-4 mb-2 border-b border-[var(--color-border-default)]">
        <CheckRow
          label="전체 동의"
          checked={allAgreed}
          onToggle={() => store.toggleAllAgreed()}
        />
      </div>

      <CheckRow
        label="이용약관 (필수)"
        checked={store.agreedTerms}
        onToggle={() => store.setAgreedTerms(!store.agreedTerms)}
        onDetail={() => showToast('준비 중인 페이지예요')}
      />
      <CheckRow
        label="개인정보 수집 및 이용 (필수)"
        checked={store.agreedPrivacy}
        onToggle={() => store.setAgreedPrivacy(!store.agreedPrivacy)}
        onDetail={() => showToast('준비 중인 페이지예요')}
      />
      <CheckRow
        label="마케팅 정보 수신 동의 (선택)"
        checked={store.agreedMarketing}
        onToggle={() => store.setAgreedMarketing(!store.agreedMarketing)}
        onDetail={() => showToast('준비 중인 페이지예요')}
      />
      <div className="flex items-center gap-3 mt-1 mb-8 pl-8 text-[11px] text-[var(--color-text-tertiary)]">
        <span>✓ 앱 푸시</span>
        <span>✓ 문자</span>
        <span>✓ 이메일</span>
      </div>

      <div className="flex-1" />
      <Button disabled={!canProceed} onClick={() => store.nextStep()}>인증하기</Button>
    </div>
  )
}

type VerifyTab = 'kakao' | 'sms'

export function Step2Verify() {
  const store = useFeloreStore()
  const [tab, setTab] = useState<VerifyTab>('kakao')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [smsSent, setSmsSent] = useState(false)

  const handleVerified = () => {
    store.setVerified(true)
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Security"
        title={'본인인증을\n진행해요'}
        description={'인증하면 프로필에 인증 뱃지가 표시돼요. 필수는 아니에요.'}
      />

      {/* 탭 */}
      <div className="flex border-b mb-5" style={{ borderColor: 'var(--color-border-default)' }}>
        {(['kakao', 'sms'] as VerifyTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-[12px] font-bold transition-colors"
            style={{
              color: tab === t ? 'var(--color-accent-dark)' : 'var(--color-text-tertiary)',
              borderBottom: tab === t ? '2px solid var(--color-accent-dark)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t === 'kakao' ? '카카오 인증' : 'SMS 인증'}
          </button>
        ))}
      </div>

      {tab === 'kakao' ? (
        <div>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
            카카오페이 인증 또는 카카오 본인인증 서비스를 통해 인증해요.
          </p>
          {/* [임시] 카카오 본인인증 API 미연동 */}
          <Button variant="kakao" onClick={handleVerified}>카카오로 본인인증하기</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              disabled={smsSent}
              className="flex-1 border border-[var(--color-border-default)] rounded-xl px-3 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none disabled:opacity-50"
            />
            {/* [임시] SMS 발송 API 미연동 */}
            <button
              type="button"
              disabled={!isValidPhone(phone) || smsSent}
              onClick={() => setSmsSent(true)}
              className="flex-shrink-0 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
            >
              {smsSent ? '발송됨' : '발송'}
            </button>
          </div>
          {smsSent && (
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="인증번호 6자리"
                maxLength={6}
                className="flex-1 border border-[var(--color-border-default)] rounded-xl px-3 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
              />
              {/* [임시] 인증번호 확인 API 미연동 */}
              <button
                type="button"
                disabled={code.length < 6}
                onClick={handleVerified}
                className="flex-shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-bold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-accent-dark)', color: '#fff' }}
              >
                확인
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1" />
      <button
        onClick={() => store.nextStep()}
        className="mt-6 text-center text-[12px] font-medium text-[var(--color-text-tertiary)] underline underline-offset-2"
      >
        건너뛰기
      </button>
    </div>
  )
}

export function Step2BasicInfo() {
  const store = useFeloreStore()
  const [name, setName] = useState(store.onboardingName)
  const [nickname, setNickname] = useState(store.onboardingNickname)
  const [useActivityName, setUseActivityName] = useState(false)
  const [birthDate, setBirthDate] = useState(store.onboardingBirthDate)
  const [showAge, setShowAge] = useState(store.onboardingShowAge)
  const todayDateString = new Date().toISOString().slice(0, 10)

  const canProceed = name.trim().length > 0

  const handleNext = () => {
    if (!canProceed) return
    store.setOnboardingNameAndBirth({ name: name.trim(), nickname: useActivityName ? nickname.trim() : '', birthDate, showAge })
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Profile"
        title={'이름을\n알려주세요'}
        description={'나중에 기본정보 편집에서 바꿀 수 있어요.'}
      />

      {/* 이름 (필수) */}
      <div className="mb-4">
        <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">이름 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="실명을 입력해주세요"
          maxLength={20}
          className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)]"
        />
      </div>

      {/* 활동명 (선택) */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => {
            setUseActivityName((prev) => !prev)
            if (useActivityName) setNickname('')
          }}
          className="flex items-center gap-2 mb-3"
        >
          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${useActivityName ? 'border-[var(--color-accent-dark)] bg-[var(--color-accent-dark)]' : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)]'}`}>
            {useActivityName && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-[13px] font-medium text-[var(--color-text-primary)]">활동명 사용</span>
        </button>

        {useActivityName && (
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="예: 크리에이터K, Alex, 디에디트"
            maxLength={30}
            className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)]"
            autoFocus
          />
        )}

        <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
          유튜버·크리에이터 등 활동명으로 활동하시는 분들을 위한 선택 기능이에요. 활동명을 설정하면 실명 대신 활동명으로 프로필에 노출돼요.
        </p>
      </div>

      {/* 생년월일 */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-[var(--color-text-tertiary)]">생년월일 (선택)</label>
          <button
            type="button"
            onClick={() => setShowAge((prev) => !prev)}
            className="flex items-center gap-1.5"
          >
            <div className={`relative w-7 h-4 rounded-full transition-colors ${showAge ? 'bg-[var(--color-accent-dark)]' : 'bg-[var(--color-border-default)]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${showAge ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">나이 공개</span>
          </button>
        </div>
        <input
          type="date"
          value={birthDate}
          max={todayDateString}
          onChange={(e) => setBirthDate(e.target.value > todayDateString ? todayDateString : e.target.value)}
          className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-2.5 text-sm bg-[var(--color-bg-soft)] text-[var(--color-text-primary)] outline-none"
        />
      </div>

      <StepFooter canNext={canProceed} onNext={handleNext} onPrev={() => store.prevStep()} />
    </div>
  )
}


const MBTI_DIMS = [
  { options: ['E', 'I'] as const, labels: ['외향', '내향'] },
  { options: ['N', 'S'] as const, labels: ['직관', '감각'] },
  { options: ['T', 'F'] as const, labels: ['사고', '감정'] },
  { options: ['J', 'P'] as const, labels: ['판단', '인식'] },
]

function OnboardingPhotoSlot({
  image,
  label,
  compact = false,
  onClick,
}: {
  image: string
  label: string
  compact?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-full w-full overflow-hidden rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)]"
    >
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={label} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-active:scale-[1.02]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.10)_100%)]" />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--color-text-tertiary)]">
          <Camera size={compact ? 18 : 22} />
          <span className="text-[11px] font-semibold">{label}</span>
        </div>
      )}
      <div className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/92 backdrop-blur-sm">
        {label}
      </div>
      {image && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.42)_100%)] px-3 py-2 text-[11px] font-semibold text-white/92">
          눌러서 변경
        </div>
      )}
    </button>
  )
}

export function Step4Profile() {
  const store = useFeloreStore()
  const mainPhotoInputRef = useRef<HTMLInputElement>(null)
  const subPhotoInputRef = useRef<HTMLInputElement>(null)
  const pendingSubIndexRef = useRef<number | null>(null)
  const [profileImages, setProfileImages] = useState(['', '', '', ''])
  const [mbti, setMbti] = useState('')
  const [bio, setBio] = useState('')

  const handleMainFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setProfileImages((prev) => {
        const next = [...prev]
        next[0] = reader.result as string
        return next
      })
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleSubFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const targetIndex = pendingSubIndexRef.current
    if (!file || targetIndex === null) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요')
      event.target.value = ''
      pendingSubIndexRef.current = null
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setProfileImages((prev) => {
        const next = [...prev]
        next[targetIndex] = reader.result as string
        return next
      })
    }
    reader.readAsDataURL(file)
    event.target.value = ''
    pendingSubIndexRef.current = null
  }

  const handleNext = () => {
    store.completeOnboarding()
    const filledImages = profileImages.filter(Boolean)
    if (filledImages.length > 0) store.updateUserInfo({ avatarImage: profileImages[0], profileImages: filledImages })
    if (bio.trim()) store.updateUserInfo({ bio: bio.trim() })
    if (mbti.length === 4) store.updateUserWhoIAm({ ...SAMPLE_PROFILE.whoIAm, mbti })
    store.goToStep('complete')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Profile"
        title={'프로필을\n채워볼까요?'}
        description={'나중에 편집에서 언제든 바꿀 수 있어요.'}
      />

      {/* 프로필 사진 */}
      <input ref={mainPhotoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleMainFileChange} />
      <input ref={subPhotoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleSubFileChange} />
      <div className="mb-5">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-2">
          얼굴이 나온 대표 사진 1장과 분위기를 보여주는 서브 사진 3장을 넣어주세요.
        </div>
        <div className="grid h-[300px] grid-cols-[minmax(0,1fr)_86px] items-stretch gap-3">
          <OnboardingPhotoSlot
            image={profileImages[0]}
            label="메인"
            onClick={() => mainPhotoInputRef.current?.click()}
          />
          <div className="grid h-full grid-rows-3 gap-3">
            {[1, 2, 3].map((index) => (
              <OnboardingPhotoSlot
                key={index}
                image={profileImages[index]}
                label={`서브 ${index}`}
                compact
                onClick={() => {
                  pendingSubIndexRef.current = index
                  subPhotoInputRef.current?.click()
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MBTI */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--color-text-tertiary)]">MBTI</label>
          {mbti && <span className="text-sm font-bold text-[var(--color-text-primary)]">{mbti}</span>}
        </div>
        <div className="space-y-2">
          {MBTI_DIMS.map((dim, dimIndex) => {
            const selectedLetter = mbti[dimIndex] ?? ''
            return (
              <div key={dimIndex} className="flex overflow-hidden rounded-xl border border-[var(--color-border-default)]">
                {dim.options.map((letter, optIndex) => {
                  const isSelected = selectedLetter === letter
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => {
                        const parts = (mbti || '    ').split('')
                        parts[dimIndex] = letter
                        setMbti(parts.join('').trimEnd())
                      }}
                      className="flex-1 py-2.5 px-4 text-left transition-colors"
                      style={{
                        background: isSelected ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                        borderRight: optIndex === 0 ? '1px solid var(--color-border-default)' : undefined,
                      }}
                    >
                      <span className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-[var(--color-text-secondary)]'}`}>{letter}</span>
                      <span className={`ml-1.5 text-[11px] ${isSelected ? 'text-white/80' : 'text-[var(--color-text-tertiary)]'}`}>{dim.labels[optIndex]}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* 자기소개 */}
      <div className="mb-5">
        <label className="text-xs text-[var(--color-text-tertiary)] mb-1 block">자기소개</label>
        <TextArea
          value={bio}
          onChange={setBio}
          placeholder="예: 창업 3년차. 사람을 만나고 연결하는 걸 좋아합니다."
          rows={3}
          maxLength={200}
        />
      </div>

      <StepFooter
        canNext
        onNext={handleNext}
        onPrev={() => store.prevStep()}
        onSkip={handleNext}
        skipLabel="건너뛰기"
      />
    </div>
  )
}
