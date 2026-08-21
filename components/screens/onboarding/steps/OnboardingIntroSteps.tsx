'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, CheckCircle2, ChevronRight, Eye, EyeOff, Image as ImageIcon, Sparkles, X } from 'lucide-react'
import { IdentityVerification } from '@/components/auth/IdentityVerification'
import { useFeloreStore } from '@/store/useFeloreStore'
import {
  BIRTH_TIME_OPTIONS,
  BirthDateCalendar,
  BottomSheet,
  Button,
  CheckboxDot,
  formatBirthDigits,
  GoogleIcon,
  isValidBirthDigits,
  isoFromBirthDigits,
  showToast,
} from '@/components/ui'
import { StepFooter } from '@/components/screens/onboarding/OnboardingShared'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'
import {
  DEFAULT_CROP_FRAME,
  clampCropFrameRect,
  getCropImageLayout,
  getDefaultCropFrame,
  getMaxCropFrameWidth,
  getResizedCropFrame,
  renderCroppedImage,
} from '@/lib/imageCropUtils'

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
            <Button onClick={handleLoginComplete}>내 Felore 보기</Button>
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
          <div className="text-4xl font-black tracking-tight">Felore</div>
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

export function Step2Verify() {
  const store = useFeloreStore()

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto px-5 py-6">
      <div className="mb-6">
        <div className="text-xl font-black text-[var(--color-text-strong)] leading-tight">본인인증</div>
      </div>

      <IdentityVerification
        isVerified={false}
        onVerified={() => {
          store.setVerified(true)
          store.nextStep()
        }}
      />

      <div className="flex-1" />
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


function MainPhotoSlot({ image, onClick, onRemove }: { image: string; onClick: () => void; onRemove: () => void }) {
  return (
    <div className="relative h-[325px] w-[244px] shrink-0">
      <button
        type="button"
        onClick={onClick}
        className="relative flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-[24px] px-2.5 py-6"
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
      {image && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          aria-label="대표 사진 삭제"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function SubPhotoSlot({
  image,
  radius,
  disabled,
  onClick,
  onRemove,
}: {
  image: string
  radius: number
  disabled?: boolean
  onClick: () => void
  onRemove: () => void
}) {
  return (
    <div className="relative flex-1 overflow-hidden" style={{ borderRadius: radius }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="relative flex h-full w-full items-center justify-center overflow-hidden disabled:cursor-not-allowed"
        style={{ backgroundColor: image ? undefined : '#F5F6F7', opacity: disabled ? 0.5 : 1 }}
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
      {image && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          aria-label="서브 사진 삭제"
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

export function Step4Profile() {
  const store = useFeloreStore()
  const mainPhotoInputRef = useRef<HTMLInputElement>(null)
  const subPhotoInputRef = useRef<HTMLInputElement>(null)
  const pendingSubIndexRef = useRef<number | null>(null)
  const [profileImages, setProfileImages] = useState(['', '', '', ''])
  const [bio, setBio] = useState('')

  const [cropSource, setCropSource] = useState('')
  const [cropOpen, setCropOpen] = useState(false)
  const [cropFrame, setCropFrame] = useState({ x: 44, y: 74, width: DEFAULT_CROP_FRAME.width, height: DEFAULT_CROP_FRAME.height })
  const [defaultCropFrame, setDefaultCropFrame] = useState(cropFrame)
  const [cropNaturalSize, setCropNaturalSize] = useState({ width: 1, height: 1 })
  const [cropStage, setCropStage] = useState({ width: 344, height: 468 })
  const dragStartRef = useRef<{ x: number; y: number; frameX: number; frameY: number } | null>(null)
  const resizeStartRef = useRef<{
    x: number
    y: number
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    frame: { x: number; y: number; width: number; height: number }
  } | null>(null)
  const cropImageLayout = getCropImageLayout(cropNaturalSize.width, cropNaturalSize.height, cropStage)

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
    reader.onerror = () => showToast('사진을 불러오지 못했어요', 'error')
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image()
        img.onerror = () => showToast('사진을 불러오지 못했어요', 'error')
        img.onload = () => {
          if (!img.width || !img.height) {
            showToast('사진을 불러오지 못했어요', 'error')
            return
          }
          setCropNaturalSize({ width: img.width, height: img.height })
          const maxStageWidth = Math.min(344, window.innerWidth - 80)
          const stage = { width: maxStageWidth, height: maxStageWidth * (468 / 344) }
          setCropStage(stage)
          const initialLayout = getCropImageLayout(img.width, img.height, stage)
          const initialFrame = getDefaultCropFrame(initialLayout)
          setCropSource(reader.result as string)
          setCropFrame(initialFrame)
          setDefaultCropFrame(initialFrame)
          setCropOpen(true)
        }
        img.src = reader.result
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      frameX: cropFrame.x,
      frameY: cropFrame.y,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // 일부 모바일 브라우저에서 pointerId가 이미 무효화된 경우 무시
    }
  }

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    try {
      if (resizeStartRef.current) {
        const deltaX = event.clientX - resizeStartRef.current.x
        const deltaY = event.clientY - resizeStartRef.current.y
        setCropFrame(getResizedCropFrame(resizeStartRef.current.frame, resizeStartRef.current.corner, deltaX, deltaY, cropImageLayout))
        return
      }

      if (dragStartRef.current) {
        const { x: startX, y: startY, frameX, frameY } = dragStartRef.current
        const deltaX = event.clientX - startX
        const deltaY = event.clientY - startY
        setCropFrame((prev) => clampCropFrameRect({
          ...prev,
          x: frameX + deltaX,
          y: frameY + deltaY,
        }, cropImageLayout))
      }
    } catch {
      handleCropPointerEnd()
    }
  }

  const handleCropPointerEnd = () => {
    dragStartRef.current = null
    resizeStartRef.current = null
  }

  const handleFrameResizeStart = (
    event: PointerEvent<HTMLButtonElement>,
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
  ) => {
    resizeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      corner,
      frame: cropFrame,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // 일부 모바일 브라우저에서 pointerId가 이미 무효화된 경우 무시
    }
    event.stopPropagation()
  }

  const isCropFrameDefault = cropFrame.x === defaultCropFrame.x
    && cropFrame.y === defaultCropFrame.y
    && cropFrame.width === defaultCropFrame.width
    && cropFrame.height === defaultCropFrame.height

  const handleResetCrop = () => setCropFrame(defaultCropFrame)

  const handleApplyCrop = async () => {
    if (!cropSource) return
    try {
      const cropped = await renderCroppedImage(cropSource, cropNaturalSize, cropImageLayout, cropFrame)
      setProfileImages((prev) => {
        const next = [...prev]
        next[0] = cropped
        return next
      })
      setCropOpen(false)
      showToast('사진이 적용됐어요')
    } catch {
      showToast('사진을 적용하지 못했어요. 다시 시도해주세요', 'error')
    }
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

  const canComplete = bio.trim().length > 0 || profileImages.some(Boolean)

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
            <MainPhotoSlot
              image={profileImages[0]}
              onClick={() => mainPhotoInputRef.current?.click()}
              onRemove={() => setProfileImages((prev) => {
                const next = [...prev]
                next[0] = ''
                return next
              })}
            />
            <div className="flex flex-1 flex-col gap-2 self-stretch">
              {[16, 8, 16].map((radius, i) => (
                <SubPhotoSlot
                  key={i}
                  image={profileImages[i + 1]}
                  radius={radius}
                  disabled={!profileImages[i] && !profileImages[i + 1]}
                  onClick={() => {
                    pendingSubIndexRef.current = i + 1
                    subPhotoInputRef.current?.click()
                  }}
                  onRemove={() => setProfileImages((prev) => {
                    const next = [...prev]
                    next[i + 1] = ''
                    return next
                  })}
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
          disabled={!canComplete}
          className="w-full rounded-full py-4 text-[16px] font-semibold text-white disabled:cursor-not-allowed"
          style={{ backgroundColor: canComplete ? '#0D0D0D' : 'rgba(0,0,0,0.5)' }}
        >
          완료
        </button>
        <button type="button" onClick={handleNext} className="text-xs text-[#6C7786] underline">
          건너뛰기
        </button>
      </div>

      {cropOpen && (
        <div
          className="fixed inset-0 z-50 bg-black text-white select-none"
          style={{
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            touchAction: 'none',
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <button onClick={() => setCropOpen(false)} className="text-[15px] font-medium text-white/86">취소</button>
              <button
                onClick={handleResetCrop}
                disabled={isCropFrameDefault}
                className="text-[13px] font-semibold text-white disabled:text-white/30"
              >
                재설정
              </button>
              <button onClick={handleApplyCrop} className="rounded-full bg-white px-4 py-1.5 text-[14px] font-bold text-black">
                완료
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center px-5">
              <div
                className="relative overflow-hidden touch-none select-none"
                style={{ width: `${cropStage.width}px`, height: `${cropStage.height}px` }}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerEnd}
                onPointerCancel={handleCropPointerEnd}
                onPointerLeave={handleCropPointerEnd}
              >
                {cropSource && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cropSource}
                    alt="자르기 미리보기"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    className="absolute max-w-none object-cover"
                    style={{
                      width: `${cropImageLayout.width}px`,
                      height: `${cropImageLayout.height}px`,
                      left: `${cropImageLayout.left}px`,
                      top: `${cropImageLayout.top}px`,
                      WebkitUserDrag: 'none',
                    } as React.CSSProperties}
                  />
                )}

                <div
                  className="absolute overflow-hidden pointer-events-none"
                  style={{
                    left: `${cropImageLayout.left}px`,
                    top: `${cropImageLayout.top}px`,
                    width: `${cropImageLayout.width}px`,
                    height: `${cropImageLayout.height}px`,
                  }}
                >
                  <div
                    className="absolute border border-white/16"
                    style={{
                      left: `${cropFrame.x - cropImageLayout.left}px`,
                      top: `${cropFrame.y - cropImageLayout.top}px`,
                      width: `${cropFrame.width}px`,
                      height: `${cropFrame.height}px`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
                    }}
                  />
                </div>

                <div
                  className="absolute cursor-move"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y}px`,
                    width: `${cropFrame.width}px`,
                    height: `${cropFrame.height}px`,
                  }}
                  onPointerDown={handleCropPointerDown}
                >
                  {/* 3x3 격자 가이드 */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/3 top-0 h-full w-px bg-white/30" />
                    <div className="absolute left-2/3 top-0 h-full w-px bg-white/30" />
                    <div className="absolute top-1/3 left-0 h-px w-full bg-white/30" />
                    <div className="absolute top-2/3 left-0 h-px w-full bg-white/30" />
                  </div>

                  {/* 코너 핸들 */}
                  <div className="absolute left-0 top-0 h-5 w-5 border-l-[3px] border-t-[3px] border-white/92" />
                  <div className="absolute right-0 top-0 h-5 w-5 border-r-[3px] border-t-[3px] border-white/92" />
                  <div className="absolute left-0 bottom-0 h-5 w-5 border-l-[3px] border-b-[3px] border-white/92" />
                  <div className="absolute right-0 bottom-0 h-5 w-5 border-r-[3px] border-b-[3px] border-white/92" />

                  {/* 엣지 틱 마크 */}
                  <div className="pointer-events-none absolute left-1/2 top-0 h-[3px] w-5 -translate-x-1/2 bg-white/92" />
                  <div className="pointer-events-none absolute bottom-0 left-1/2 h-[3px] w-5 -translate-x-1/2 bg-white/92" />
                  <div className="pointer-events-none absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-white/92" />
                  <div className="pointer-events-none absolute right-0 top-1/2 h-5 w-[3px] -translate-y-1/2 bg-white/92" />

                  <div
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-full border-[1.5px] border-white/85"
                    style={{
                      width: `${Math.min(getMaxCropFrameWidth(cropImageLayout) - 48, cropFrame.width - 48)}px`,
                      height: `${Math.min(getMaxCropFrameWidth(cropImageLayout) - 48, cropFrame.width - 48)}px`,
                      top: `${Math.max(28, cropFrame.height * 0.18)}px`,
                    }}
                  />
                </div>

                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'top-left')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y}px`,
                  }}
                  aria-label="프레임 좌상단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'top-right')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x + cropFrame.width}px`,
                    top: `${cropFrame.y}px`,
                  }}
                  aria-label="프레임 우상단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'bottom-left')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x}px`,
                    top: `${cropFrame.y + cropFrame.height}px`,
                  }}
                  aria-label="프레임 좌하단 조절"
                />
                <button
                  onPointerDown={(event) => handleFrameResizeStart(event, 'bottom-right')}
                  className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-transparent"
                  style={{
                    left: `${cropFrame.x + cropFrame.width}px`,
                    top: `${cropFrame.y + cropFrame.height}px`,
                  }}
                  aria-label="프레임 우하단 조절"
                />
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="text-[11px] text-white/68 text-center mb-4">
                프레임을 드래그해 위치를 잡고, 코너 핸들로 잘릴 범위를 조절하세요. 정원형 가이드는 방명록 프로필 사진으로 보이는 영역입니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
