'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, Image as ImageIcon, Info, MessageCircle, Sparkles } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { BottomSheet, Button, GoogleIcon, showToast } from '@/components/ui'
import { StepFooter } from '@/components/screens/onboarding/OnboardingShared'
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
}

const OAUTH_META: Record<OAuthProvider, OAuthMeta> = {
  google: { label: '구글', variant: 'google' },
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

function formatBirthDigits(digits: string) {
  const y = digits.slice(0, 4)
  const m = digits.slice(4, 6)
  const d = digits.slice(6, 8)
  let out = y
  if (digits.length > 4) out += `. ${m}`
  if (digits.length > 6) out += `. ${d}`
  if (digits.length >= 8) out += '.'
  return out
}

function isoFromBirthDigits(digits: string) {
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`
}

function isValidBirthDigits(digits: string) {
  if (digits.length !== 8) return false
  const year = Number(digits.slice(0, 4))
  const month = Number(digits.slice(4, 6))
  const day = Number(digits.slice(6, 8))
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false
  return date.getTime() <= Date.now()
}

const BIRTH_TIME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '모름' },
  { value: '23:00', label: '23:00 ~ 01:00' },
  { value: '01:00', label: '01:00 ~ 03:00' },
  { value: '03:00', label: '03:00 ~ 05:00' },
  { value: '05:00', label: '05:00 ~ 07:00' },
  { value: '07:00', label: '07:00 ~ 09:00' },
  { value: '09:00', label: '09:00 ~ 11:00' },
  { value: '11:00', label: '11:00 ~ 13:00' },
  { value: '13:00', label: '13:00 ~ 15:00' },
  { value: '15:00', label: '15:00 ~ 17:00' },
  { value: '17:00', label: '17:00 ~ 19:00' },
  { value: '19:00', label: '19:00 ~ 21:00' },
  { value: '21:00', label: '21:00 ~ 23:00' },
]

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function Step1Login({
  onModeChange,
  onBackHandlerChange,
}: {
  onModeChange?: (mode: Mode) => void
  onBackHandlerChange?: (handler: (() => void) | null) => void
} = {}) {
  const store = useFeloreStore()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [view, setView] = useState<LoginView>('main')
  const [oauthProvider, setOauthProvider] = useState<OAuthProvider | null>(null)
  const [oauthStep, setOauthStep] = useState<OAuthStep>('pending')
  const [showTermsSheet, setShowTermsSheet] = useState(false)

  useEffect(() => {
    onModeChange?.(mode)
  }, [mode, onModeChange])

  // 전화번호 가입 폼
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [email, setEmail] = useState('')
  const [signupSmsSent, setSignupSmsSent] = useState(false)
  const [signupCode, setSignupCode] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

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

  const phoneInvalid = phone.length > 0 && !isValidPhone(phone)
  const passwordShort = password.length > 0 && password.length < 8
  const passwordMismatch = passwordConfirm.length > 0 && passwordConfirm !== password
  const emailInvalid = email.length > 0 && !isValidEmail(email)
  const canPhoneSubmit =
    phoneVerified &&
    password.length >= 8 &&
    passwordConfirm === password &&
    (email === '' || isValidEmail(email))
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

  // 헤더 뒤로가기 버튼 — 현재 뷰에 맞는 핸들러를 ref에 최신 상태로 유지하고,
  // 상위(OnboardingScreen)에는 참조가 변하지 않는 wrapper만 전달해 불필요한 재렌더를 막는다.
  const backHandlerRef = useRef<(() => void) | null>(null)
  backHandlerRef.current =
    view === 'oauth' && oauthProvider && oauthStep === 'pending' ? handleBackToMain :
    view === 'phone' && mode === 'signup' && !phoneVerified ? handleBackToMain :
    view === 'phone' && mode === 'signup' && phoneVerified ? () => setPhoneVerified(false) :
    view === 'phone' && mode === 'login' ? handleBackToMain :
    view === 'reset' && resetMethod === 'choose' ? handleBackToPhoneLogin :
    view === 'reset' && resetMethod === 'sms' && resetStage === 'verify' ? () => setResetMethod('choose') :
    view === 'reset' && resetMethod === 'sms' && resetStage === 'newPassword' ? () => setResetStage('verify') :
    view === 'reset' && resetMethod === 'email' && !resetEmailSent ? () => setResetMethod('choose') :
    (mode === 'login' || mode === 'signup') && view === 'main' ? handleBackToChoose :
    null

  const handleHeaderBack = useCallback(() => {
    backHandlerRef.current?.()
  }, [])

  const hasHeaderBack = backHandlerRef.current !== null
  useEffect(() => {
    onBackHandlerChange?.(hasHeaderBack ? handleHeaderBack : null)
  }, [hasHeaderBack, handleHeaderBack, onBackHandlerChange])

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
          <span className="inline-flex w-full items-center justify-center gap-2">
            <GoogleIcon /> {meta.label}로 {mode === 'login' ? '로그인' : '연결하기'}
          </span>
        </Button>
      </div>
    )
  }

  // --- 전화번호 가입 뷰 ---
  if (view === 'phone' && mode === 'signup') {
    if (!phoneVerified) {
      return (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
          <div className="mb-6">
            <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
              전화번호로 회원가입
            </div>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-[var(--color-text-strong)] mb-1 block">
                전화번호<span className="text-[var(--color-state-danger-text)]">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  disabled={signupSmsSent}
                  autoComplete="tel"
                  className={`flex-1 border rounded-full px-4 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] disabled:opacity-50 ${
                    phoneInvalid ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
                  }`}
                />
                {/* [임시] SMS 발송 API 미연동 */}
                <Button
                  size="sm"
                  fullWidth={false}
                  className="w-28 flex-shrink-0"
                  disabled={!isValidPhone(phone) || signupSmsSent}
                  onClick={() => setSignupSmsSent(true)}
                >
                  {signupSmsSent ? '발송됨' : '인증번호 발송'}
                </Button>
              </div>
              {phoneInvalid && (
                <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">올바른 전화번호 형식을 입력해주세요.</p>
              )}
              {signupSmsSent && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={signupCode}
                    onChange={(e) => setSignupCode(e.target.value)}
                    placeholder="인증번호 6자리"
                    maxLength={6}
                    className="flex-1 border border-[var(--color-border-default)] rounded-full px-4 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none"
                  />
                  {/* [임시] 인증번호 확인 API 미연동 */}
                  <Button
                    size="sm"
                    fullWidth={false}
                    className="w-28 flex-shrink-0"
                    disabled={signupCode.length < 6}
                    onClick={() => setPhoneVerified(true)}
                  >
                    확인
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            전화번호로 회원가입
          </div>
          <p className="meta-text mt-2">{phone} 인증 완료 · 로그인에 사용할 비밀번호를 설정해주세요.</p>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs text-[var(--color-text-strong)] mb-1 block">
              비밀번호<span className="text-[var(--color-state-danger-text)]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상 입력해주세요"
                autoComplete="new-password"
                className={`w-full border rounded-full pl-4 pr-11 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                  passwordShort ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {passwordShort && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호는 8자 이상이어야 해요</p>
            )}
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-strong)] mb-1 block">
              비밀번호 확인<span className="text-[var(--color-state-danger-text)]">*</span>
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="한 번 더 입력해주세요"
                autoComplete="new-password"
                className={`w-full border rounded-full pl-4 pr-11 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                  passwordMismatch ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPasswordConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">비밀번호가 일치하지 않아요</p>
            )}
          </div>
          <div>
            <label className="text-xs text-[var(--color-text-strong)] mb-1 block">이메일</label>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mb-1.5">전화번호 변경 시 계정 복구용</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              autoComplete="email"
              className={`w-full border rounded-full px-4 py-2.5 text-sm bg-white text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-dark)] ${
                emailInvalid ? 'border-[var(--color-state-danger-text)]' : 'border-[var(--color-border-default)]'
              }`}
            />
            {emailInvalid && (
              <p className="mt-1 text-[11px] text-[var(--color-state-danger-text)]">올바른 이메일 형식을 입력해주세요.</p>
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

  // --- 회원가입 메인 뷰 ---
  if (mode === 'signup') {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
        <div className="mb-6">
          <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">
            처음 오셨군요!
          </div>
          <p className="meta-text mt-1">가입 방법을 선택해주세요.</p>
        </div>
        <div className="space-y-3">
          <Button variant="google" onClick={() => handleOAuthSelect('google')}>
            <span className="inline-flex w-full items-center justify-center gap-2">
              <GoogleIcon /> 구글로 시작하기
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
          <span className="text-[11px] text-[var(--color-text-tertiary)]">또는</span>
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        </div>
        <Button variant="outline" onClick={() => setView('phone')} style={{ borderRadius: 20 }}>전화번호로 회원가입</Button>
      </div>
    )
  }

  // --- 초기 선택 뷰 ---
  return (
    <>
      <div className="flex flex-1 flex-col min-h-0 px-5">
        <div className="flex flex-col items-center pt-16 text-center">
          <div className="text-4xl font-black tracking-tight">FELORE</div>
          <div className="meta-text mt-3">가장 나다운 네트워킹의 시작, 펠로어</div>
        </div>
        <div className="flex-1" />
        <div className="space-y-3 pb-6">
          <Button onClick={() => setShowTermsSheet(true)} style={{ borderRadius: 9999 }}>회원가입</Button>
          <Button variant="outline" onClick={() => setMode('login')} style={{ borderRadius: 9999 }}>이미 계정이 있어요</Button>
        </div>
      </div>
      <TermsAgreementSheet
        open={showTermsSheet}
        onClose={() => setShowTermsSheet(false)}
        onAgree={() => { setShowTermsSheet(false); setMode('signup') }}
      />
      <BottomSheet open={mode === 'login'} onClose={handleBackToChoose}>
        <div className="px-5 pb-6">
          <div className="mb-6 text-xl font-black leading-tight text-[var(--color-text-strong)]">
            로그인 방법을 선택해주세요
          </div>
          <div className="space-y-3">
            <Button variant="google" onClick={() => handleOAuthSelect('google')}>
              <span className="inline-flex w-full items-center justify-center gap-2">
                <GoogleIcon /> 구글로 로그인
              </span>
            </Button>
            <Button variant="outline" onClick={() => setView('phone')} style={{ borderRadius: 20 }}>전화번호로 로그인</Button>
          </div>
          <div className="mt-4 text-center meta-text">
            계정이 기억나지 않나요?{' '}
            {/* [임시] 계정 찾기 플로우 미구현 */}
            <button type="button" onClick={() => showToast('준비 중인 기능이에요')} className="font-semibold text-[var(--color-text-primary)] underline">
              계정 찾기
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

function TermsCheckRow({ badge, label, checked, onToggle, onDetail }: {
  badge?: string
  label: string
  checked: boolean
  onToggle: () => void
  onDetail?: () => void
}) {
  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <button
        type="button"
        onClick={onToggle}
        className="w-5 h-5 rounded-[6px] flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ backgroundColor: checked ? 'var(--color-accent-dark)' : 'transparent' }}
      >
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path
            d="M1 5L4.2 8L11 1"
            stroke={checked ? '#fff' : 'var(--color-border-default)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span className="flex-1 text-sm text-[var(--color-text-primary)]">
        {badge && <span className="font-bold">{badge} </span>}
        {label}
      </span>
      {onDetail && (
        <button type="button" onClick={onDetail} className="text-[var(--color-text-tertiary)]">
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

function TermsAgreementSheet({
  open,
  onClose,
  onAgree,
}: {
  open: boolean
  onClose: () => void
  onAgree: () => void
}) {
  const store = useFeloreStore()
  const allAgreed = store.agreedTerms && store.agreedPrivacy && store.agreedMarketing
  const canProceed = store.agreedTerms && store.agreedPrivacy

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="text-lg font-black text-[var(--color-text-strong)] mb-4">
          이용약관에 동의해주세요
        </div>

        <div className="pb-4 mb-2 border-b border-[var(--color-border-default)]">
          <TermsCheckRow
            label="전체 동의"
            checked={allAgreed}
            onToggle={() => store.toggleAllAgreed()}
          />
        </div>

        <TermsCheckRow
          badge="필수"
          label="이용약관"
          checked={store.agreedTerms}
          onToggle={() => store.setAgreedTerms(!store.agreedTerms)}
          onDetail={() => showToast('준비 중인 페이지예요')}
        />
        <TermsCheckRow
          badge="필수"
          label="개인정보 수집 및 이용"
          checked={store.agreedPrivacy}
          onToggle={() => store.setAgreedPrivacy(!store.agreedPrivacy)}
          onDetail={() => showToast('준비 중인 페이지예요')}
        />
        <TermsCheckRow
          badge="선택"
          label="마케팅 정보 수신 동의"
          checked={store.agreedMarketing}
          onToggle={() => store.setAgreedMarketing(!store.agreedMarketing)}
        />
        <div className="flex items-center gap-3 mt-1 mb-6 pl-8 text-[11px] text-[var(--color-text-tertiary)]">
          <span>✓ 앱 푸시</span>
          <span>✓ 문자</span>
          <span>✓ 이메일</span>
        </div>

        <Button disabled={!canProceed} onClick={onAgree}>다음</Button>
      </div>
    </BottomSheet>
  )
}

type VerifyTab = 'kakao' | 'sms'

export function Step2Verify() {
  const store = useFeloreStore()
  const [tab, setTab] = useState<VerifyTab>('kakao')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [smsSent, setSmsSent] = useState(false)
  const [smsVerified, setSmsVerified] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const phoneInvalid = phone.length > 0 && !isValidPhone(phone)

  const handleVerified = () => {
    store.setVerified(true)
    store.nextStep()
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
    store.setVerified(true)
    setSmsVerified(true)
    showToast('인증이 완료됐어요')
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto px-5 py-6">
      <div className="mb-6">
        <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">본인인증</div>
        <p className="meta-text mt-2">인증하면 프로필에 인증 뱃지가 표시돼요</p>
      </div>

      {/* 탭 */}
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
          {/* [임시] 카카오 본인인증 API 미연동 */}
          <Button variant="kakao" onClick={handleVerified}>
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
            smsVerified ? (
              <div className="flex items-center gap-1.5 px-1 text-[13px] font-semibold" style={{ color: 'var(--color-state-success-text)' }}>
                <CheckCircle2 size={16} />
                인증 완료
              </div>
            ) : (
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
            )
          )}
        </div>
      )}

      <div className="flex-1" />
      <Button
        disabled={!smsVerified}
        onClick={() => store.nextStep()}
        className={tab === 'kakao' ? 'invisible' : ''}
      >
        다음
      </Button>
      {/* 본인인증은 필수가 아니므로 항상 클릭 가능한 텍스트 버튼으로 건너뛰기를 제공 */}
      <button
        type="button"
        onClick={() => store.nextStep()}
        className="mt-2 w-full text-center text-sm text-[var(--color-text-secondary)]"
      >
        건너뛰기
      </button>
    </div>
  )
}

function CheckboxDot({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: checked ? '#25313D' : '#F5F6F7' }}
    >
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.2 5.7L8 1" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

const CALENDAR_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const CALENDAR_MIN_YEAR = new Date().getFullYear() - 99

function BirthDateCalendar({
  digits,
  time,
  onSelect,
  onSelectTime,
  onClose,
}: {
  digits: string
  time: string
  onSelect: (digits: string) => void
  onSelectTime: (time: string) => void
  onClose: () => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewDate, setViewDate] = useState(() =>
    digits.length === 8
      ? new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, 1)
      : new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [viewMode, setViewMode] = useState<'days' | 'years'>('days')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const selectedDay =
    digits.length === 8 && Number(digits.slice(0, 4)) === year && Number(digits.slice(4, 6)) === month + 1
      ? Number(digits.slice(6, 8))
      : null

  const cells: Array<number | null> = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const yearOptions = Array.from(
    { length: today.getFullYear() - CALENDAR_MIN_YEAR + 1 },
    (_, i) => today.getFullYear() - i
  )

  const handlePick = (day: number) => {
    const picked = new Date(year, month, day)
    if (picked.getTime() > today.getTime()) return
    onSelect(`${year}${String(month + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`)
    onClose()
  }

  const handlePickYear = (y: number) => {
    setViewDate(new Date(y, month, 1))
    setViewMode('days')
  }

  return (
    <div
      ref={containerRef}
      className="glass-card absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-2xl p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMode((prev) => (prev === 'days' ? 'years' : 'days'))}
          className="flex items-center gap-1 text-[15px] font-bold text-[#0D0D0D]"
        >
          {viewMode === 'days' ? `${year}년 ${month + 1}월` : '연도 선택'}
          <ChevronDown size={14} className={viewMode === 'years' ? 'rotate-180' : ''} />
        </button>
        {viewMode === 'days' && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="text-[#0D0D0D]">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="text-[#0D0D0D]">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'years' ? (
        <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
          {yearOptions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handlePickYear(y)}
              className="flex h-9 items-center justify-center rounded-full text-sm"
              style={{ backgroundColor: y === year ? '#25313D' : 'transparent', color: y === year ? '#FFFFFF' : '#0D0D0D' }}
            >
              {y}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-1 grid grid-cols-7">
            {CALENDAR_WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-center text-[11px] font-medium text-[#A8B1BD]">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} />
              const isFuture = new Date(year, month, day).getTime() > today.getTime()
              const isSelected = selectedDay === day
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
              return (
                <button key={idx} type="button" disabled={isFuture} onClick={() => handlePick(day)} className="flex h-9 items-center justify-center">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm"
                    style={{
                      backgroundColor: isSelected ? '#25313D' : 'transparent',
                      color: isFuture ? '#DEE4EC' : isSelected ? '#FFFFFF' : '#0D0D0D',
                      fontWeight: isToday && !isSelected ? 700 : 400,
                    }}
                  >
                    {day}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#DEE4EC] pt-3">
            <span className="text-sm font-medium text-[#25313D]">시간</span>
            <select
              value={time}
              onChange={(e) => onSelectTime(e.target.value)}
              className="appearance-none rounded-full bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-sm text-[#0D0D0D] outline-none"
            >
              {BIRTH_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}

export function Step2BasicInfo() {
  const store = useFeloreStore()
  const [name, setName] = useState(store.onboardingName)
  const [nickname, setNickname] = useState(store.onboardingNickname)
  const [useActivityName, setUseActivityName] = useState(false)
  const [birthDigits, setBirthDigits] = useState(() => store.onboardingBirthDate.replace(/\D/g, '').slice(0, 8))
  const [birthTime, setBirthTime] = useState(store.onboardingBirthTime)
  const [showAge, setShowAge] = useState(store.onboardingShowAge)
  const [showCalendar, setShowCalendar] = useState(false)

  const nameError = name.length > 20
  const nicknameError = useActivityName && nickname.length > 30
  const birthComplete = birthDigits.length === 8
  const birthValid = !birthComplete || isValidBirthDigits(birthDigits)
  const birthDateError = birthComplete && !birthValid

  const canProceed = name.trim().length > 0 && !nameError && !nicknameError && (birthDigits.length === 0 || (birthComplete && birthValid))

  const handleNext = () => {
    if (!canProceed) return
    const birthDate = birthComplete && birthValid ? isoFromBirthDigits(birthDigits) : ''
    store.setOnboardingNameAndBirth({ name: name.trim(), nickname: useActivityName ? nickname.trim() : '', birthDate, birthTime: birthDate ? birthTime : '', showAge })
    store.nextStep()
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.03em] text-[#0D0D0D]">기본정보 입력</h2>
          <p className="mt-2 text-[15px] font-medium leading-[1.5] tracking-[-0.02em] text-[#475058]">언제든지 설정에서 바꿀 수 있어요</p>
        </div>

        {/* 이름 (필수) */}
        <div className="mb-6">
          <div className="mb-2 flex items-start">
            <span className="text-sm font-semibold text-[#0D0D0D]">이름</span>
            <span className="ml-0.5 mt-0.5 h-[3px] w-[3px] shrink-0 rounded-full bg-[#FF4242]" />
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력해주세요."
            className="w-full truncate rounded-full border bg-white px-4 py-3 text-sm outline-none"
            style={{ borderColor: nameError ? '#FF4242' : '#DEE4EC', color: '#0D0D0D' }}
          />
          {nameError && <p className="mt-1.5 text-xs text-[#FF4242]">20자 이내로 입력해주세요.</p>}

          <button
            type="button"
            onClick={() => {
              setUseActivityName((prev) => !prev)
              if (useActivityName) setNickname('')
            }}
            className="mt-2 flex items-center gap-2"
          >
            <CheckboxDot checked={useActivityName} />
            <span className="text-sm font-medium text-[#25313D]">활동명 사용</span>
          </button>

          {useActivityName && (
            <div className="mt-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 크리에이터K, Alex, 디에디트"
                className="w-full truncate rounded-full border bg-white px-4 py-3 text-sm outline-none"
                style={{ borderColor: nicknameError ? '#FF4242' : '#DEE4EC', color: '#0D0D0D' }}
                autoFocus
              />
              {nicknameError && <p className="mt-1.5 text-xs text-[#FF4242]">30자 이내로 입력해주세요.</p>}
            </div>
          )}

          <p className="mt-2 text-xs leading-relaxed text-[#6C7786]">
            유튜버·크리에이터 등 활동명으로 활동하시는 분들을 위한 선택 기능이에요. 활동명을 설정하면 실명 대신 활동명으로 프로필에 노출돼요.
          </p>
        </div>

        {/* 생년월일 */}
        <div className="mb-6">
          <div className="mb-2">
            <span className="text-sm font-semibold text-[#0D0D0D]">생년월일</span>
          </div>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={formatBirthDigits(birthDigits)}
              onChange={(e) => setBirthDigits(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="YYYY. MM. DD."
              className="w-full truncate rounded-full border bg-white px-4 py-3 pr-11 text-sm outline-none"
              style={{ borderColor: birthDateError ? '#FF4242' : '#DEE4EC', color: '#0D0D0D' }}
            />
            <button
              type="button"
              onClick={() => setShowCalendar((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B1BD]"
            >
              <Calendar size={16} />
            </button>
            {showCalendar && (
              <BirthDateCalendar
                digits={birthDigits}
                time={birthTime}
                onSelect={setBirthDigits}
                onSelectTime={setBirthTime}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>
          {birthDateError && <p className="mt-1.5 text-xs text-[#FF4242]">올바른 날짜 형식을 입력해주세요.</p>}
          {birthTime && !birthDateError && (
            <p className="mt-1.5 text-xs text-[#6C7786]">
              생시 {BIRTH_TIME_OPTIONS.find((opt) => opt.value === birthTime)?.label}
            </p>
          )}

          <button type="button" onClick={() => setShowAge((prev) => !prev)} className="mt-2 flex items-center gap-2">
            <CheckboxDot checked={showAge} />
            <span className="text-sm font-medium text-[#25313D]">나이 공개</span>
          </button>
        </div>
      </div>

      <StepFooter canNext={canProceed} onNext={handleNext} onPrev={() => store.prevStep()} />
    </div>
  )
}


function MainPhotoSlot({ image, onClick }: { image: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[325px] w-[244px] shrink-0 flex-col items-center justify-end overflow-hidden rounded-[24px] px-2.5 py-6"
      style={{ backgroundColor: image ? undefined : '#F5F6F7' }}
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="대표" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 70%, rgba(0,0,0,0.7) 90%)' }} />
        </>
      )}
      <div
        className="absolute left-4 top-4 flex h-5 items-center justify-center rounded-full px-2 text-xs font-bold text-white"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}
      >
        대표
      </div>
      {image ? (
        <span className="relative text-sm font-bold text-white">탭하여 변경</span>
      ) : (
        <div className="relative flex flex-col items-center gap-2">
          <ImageIcon size={24} className="text-[#A8B1BD]" />
          <span className="text-sm font-bold text-[#A8B1BD]">탭하여 추가</span>
        </div>
      )}
    </button>
  )
}

function SubPhotoSlot({ image, radius, onClick }: { image: string; radius: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-1 items-center justify-center overflow-hidden"
      style={{ backgroundColor: image ? undefined : '#F5F6F7', borderRadius: radius }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="서브 사진" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <ImageIcon size={18} className="text-[#A8B1BD]" />
          <span className="text-[10px] font-semibold text-[#A8B1BD]">탭하여 추가</span>
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
  const [bio, setBio] = useState('')

  const handleAiFillBio = () => {
    showToast('AI 자기소개 생성 중...', 'loading')
    setTimeout(() => {
      showToast('AI 자기소개 생성이 완료됐어요')
    }, 1200)
  }

  const handleMainFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('이미지 파일만 업로드할 수 있어요', 'error')
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
      showToast('이미지 파일만 업로드할 수 있어요', 'error')
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
    store.goToStep('complete')
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.03em] text-[#0D0D0D]">프로필을 채워볼까요?</h2>
          <p className="mt-2 text-[15px] font-medium leading-[1.5] tracking-[-0.02em] text-[#475058]">언제든지 설정에서 바꿀 수 있어요</p>
        </div>

        <input ref={mainPhotoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleMainFileChange} />
        <input ref={subPhotoInputRef} type="file" accept="image/*" className="sr-only" onChange={handleSubFileChange} />

        {/* 프로필 사진 */}
        <div className="mb-9">
          <div className="flex items-start gap-2">
            <MainPhotoSlot image={profileImages[0]} onClick={() => mainPhotoInputRef.current?.click()} />
            <div className="flex flex-1 flex-col gap-2 self-stretch">
              {[16, 8, 16].map((radius, i) => (
                <SubPhotoSlot
                  key={i}
                  image={profileImages[i + 1]}
                  radius={radius}
                  onClick={() => {
                    pendingSubIndexRef.current = i + 1
                    subPhotoInputRef.current?.click()
                  }}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#6C7786]">
            얼굴이 나온 대표 사진 1장, 나만의 분위기를 담은 사진을 추가해보세요
          </p>
        </div>

        {/* 자기소개 */}
        <div>
          <div className="flex h-[19px] items-center justify-between">
            <span className="text-sm font-semibold text-[#0D0D0D]">자기소개</span>
            <button
              type="button"
              onClick={handleAiFillBio}
              className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold text-white"
              style={{ backgroundImage: 'linear-gradient(133deg, #00C8B3 0%, #00ADFF 30%, #0657FF 59%)' }}
            >
              <Sparkles size={12} />
              AI로 채우기
            </button>
          </div>
          <div className="mt-2">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="예: 창업 3년차. 사람을 만나고 연결하는 걸 좋아합니다."
              rows={4}
              className="w-full resize-none rounded-[24px] border bg-white p-3 text-sm outline-none"
              style={{ borderColor: '#DEE4EC', color: '#0D0D0D' }}
            />
            <p className="mt-2 text-right text-xs text-[#6C7786]">{bio.length}/200</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pb-10 pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-full py-4 text-[16px] font-semibold text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          완료
        </button>
        <button type="button" onClick={handleNext} className="text-xs text-[#6C7786] underline">
          건너뛰기
        </button>
      </div>
    </div>
  )
}
