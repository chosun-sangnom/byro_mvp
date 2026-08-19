'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFeloreStore } from '@/store/useFeloreStore'
import {
  ChevronRight, Pencil, BookmarkCheck, CreditCard, Eye, Check, CheckCircle2, BadgeCheck,
  Globe, FileText, HelpCircle,
} from 'lucide-react'
import { Avatar, NavBar, BottomSheet, showToast } from '@/components/ui'
import { IdentityVerification } from '@/components/auth/IdentityVerification'

const CUSTOM_LINK_ID_REGEX = /^[a-z0-9_]{2,20}$/

type Screen = 'main' | 'billing' | 'upgrade' | 'payment' | 'success' | 'verify'
type BillingCycle = 'monthly' | 'yearly'

const MONTHLY_PRICE = 7990
const YEARLY_MONTHLY_PRICE = Math.round(MONTHLY_PRICE * 12 * 0.8 / 12)
const YEARLY_TOTAL = YEARLY_MONTHLY_PRICE * 12

const FEATURES: { label: string; free: string; pro: string }[] = [
  { label: '하이라이트 블록', free: '최대 3개', pro: '무제한' },
  { label: '바이브탭 항목', free: '탭당 5개', pro: '무제한' },
  { label: '내 링크 커스터마이징', free: '—', pro: '✓' },
  { label: '케미 체크', free: '하루 1회', pro: '하루 100회' },
  { label: '피드백 요청', free: '하루 1회', pro: '무제한' },
  { label: '방문자 통계', free: '숫자만', pro: '상세 분석' },
]

type MenuItem = {
  id: string
  icon: React.ElementType
  label: string
  description?: string
  href?: string
  onClick?: () => void
}

type Section = {
  title: string
  items: MenuItem[]
}

export default function SettingsScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const store = useFeloreStore()
  const user = store.user
  const isLoggedIn = store.isLoggedIn

  const isPaid = user?.isPaidUser ?? false
  const currentLinkId = user?.linkId ?? ''
  const randomLinkId = user?.randomLinkId ?? user?.linkId ?? ''
  const tabVisibility = store.tabVisibility ?? { who: 'public', vibe: 'public', network: 'public' }

  const screenParam = searchParams.get('screen')
  const validScreens: Screen[] = ['main', 'billing', 'upgrade', 'payment', 'success', 'verify']
  const requestedScreen = validScreens.includes(screenParam as Screen) ? (screenParam as Screen) : 'main'
  // 게스트는 로그인 전용 서브화면에 딥링크로 못 들어가게 막음
  const initialScreen = (!isLoggedIn && requestedScreen !== 'main') ? 'main' : requestedScreen

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false)
  const [linkIdSheetOpen, setLinkIdSheetOpen] = useState(false)
  const [customLinkInput, setCustomLinkInput] = useState(user?.customLinkId ?? '')
  const [customLinkError, setCustomLinkError] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')

  const handleSaveCustomLinkId = () => {
    const trimmed = customLinkInput.trim().toLowerCase()
    if (trimmed && !CUSTOM_LINK_ID_REGEX.test(trimmed)) {
      setCustomLinkError(true)
      return
    }
    setCustomLinkError(false)
    store.setCustomLinkId(trimmed || null)
    setLinkIdSheetOpen(false)
    showToast(trimmed ? '링크가 변경됐어요!' : '기본 링크로 복원했어요')
  }

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const handlePay = () => {
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName.trim()) {
      showToast('카드 정보를 모두 입력해주세요', 'error')
      return
    }
    store.setPaidUser(true)
    setScreen('success')
  }

  const VISIBILITY_LABEL: Record<string, string> = { public: '전체공개', private: '비공개' }
  const visibilitySummary = `WHO ${VISIBILITY_LABEL[tabVisibility.who]} · VIBE ${VISIBILITY_LABEL[tabVisibility.vibe]} · NETWORK ${VISIBILITY_LABEL[tabVisibility.network]}`

  // ── 업그레이드 화면 ──────────────────────────────────────────────
  if (screen === 'upgrade') {
    const price = billingCycle === 'monthly' ? MONTHLY_PRICE : YEARLY_MONTHLY_PRICE
    return (
      <div className="flex h-full flex-col bg-[var(--color-bg-page)]">
        <NavBar title="PRO 업그레이드" onBack={() => setScreen('billing')} />

        <div className="flex-1 overflow-y-auto pb-32">
          {/* 헤더 */}
          <div className="px-5 pt-6 pb-5 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 mb-3">
              <span className="text-[11px] font-black text-[var(--color-accent-dark)] tracking-wide">FELORE PRO</span>
            </div>
            <p className="text-[22px] font-black text-[var(--color-text-primary)] leading-tight">
              더 넓게, 더 자유롭게
            </p>
            <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5">
              제한 없이 나를 표현하는 프리미엄 플랜
            </p>
          </div>

          {/* 결제 주기 토글 */}
          <div className="mx-5 mb-5">
            <div className="flex rounded-2xl p-1 gap-1" style={{ backgroundColor: 'var(--color-bg-muted)' }}>
              {(['monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  className={[
                    'flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all',
                    billingCycle === cycle
                      ? 'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-sm'
                      : 'text-[var(--color-text-tertiary)]',
                  ].join(' ')}
                >
                  {cycle === 'monthly' ? '월간' : (
                    <span className="flex items-center justify-center gap-1.5">
                      연간
                      <span className="rounded-full bg-[var(--color-accent-dark)] px-1.5 py-0.5 text-[10px] font-bold text-white">20% 할인</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 가격 카드 */}
          <div className="mx-5 mb-5 rounded-2xl border-2 border-[var(--color-accent-dark)] bg-[var(--color-bg-surface)] px-5 py-5">
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[32px] font-black text-[var(--color-text-primary)] leading-none">
                {price.toLocaleString()}원
              </span>
              <span className="text-[13px] text-[var(--color-text-secondary)] mb-1">/월</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-[12px] text-[var(--color-text-tertiary)]">
                연 {YEARLY_TOTAL.toLocaleString()}원 청구 · 월간 대비 20% 절약
              </p>
            )}
          </div>

          {/* 기능 비교 */}
          <div className="mx-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] overflow-hidden">
            <div className="grid grid-cols-3 border-b border-[var(--color-border-soft)]">
              <div className="py-3 px-4 text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide">기능</div>
              <div className="py-3 text-center text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wide">무료</div>
              <div className="py-3 text-center text-[11px] font-black text-[var(--color-accent-dark)] uppercase tracking-wide">PRO</div>
            </div>
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={[
                  'grid grid-cols-3 items-center',
                  i < FEATURES.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
                ].join(' ')}
              >
                <div className="py-3.5 px-4 text-[12px] text-[var(--color-text-primary)] font-medium">{f.label}</div>
                <div className="py-3.5 text-center text-[12px] text-[var(--color-text-tertiary)]">{f.free}</div>
                <div className="py-3.5 text-center text-[12px] font-semibold text-[var(--color-accent-dark)]">{f.pro}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 CTA */}
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4 bg-[var(--color-bg-page)] border-t border-[var(--color-border-soft)]">
          <button
            onClick={() => setScreen('payment')}
            className="w-full rounded-full py-4 text-[15px] font-black text-white"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            월 {price.toLocaleString()}원으로 시작하기
          </button>
          <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-2.5">
            언제든지 구독 취소 가능 · 환불 정책 적용
          </p>
        </div>
      </div>
    )
  }

  // ── 결제 화면 ──────────────────────────────────────────────────
  if (screen === 'payment') {
    const price = billingCycle === 'monthly' ? MONTHLY_PRICE : YEARLY_TOTAL
    const label = billingCycle === 'monthly' ? '월간 PRO' : '연간 PRO'
    return (
      <div className="flex h-full flex-col bg-[var(--color-bg-page)]">
        <NavBar title="결제" onBack={() => setScreen('upgrade')} />

        <div className="flex-1 overflow-y-auto pb-32">
          {/* 결제 요약 */}
          <div className="mx-5 mt-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-black text-[var(--color-text-primary)]">{label}</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
                  {billingCycle === 'monthly' ? '매월 자동 갱신' : '1년 단위 자동 갱신'}
                </p>
              </div>
              <p className="text-[18px] font-black text-[var(--color-accent-dark)]">
                {price.toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 카드 입력 폼 */}
          <div className="mx-5 mt-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--color-text-tertiary)] mb-3">카드 정보</p>

            <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] overflow-hidden divide-y divide-[var(--color-border-soft)]">
              {/* 카드 번호 */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wide">카드 번호</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-transparent text-[15px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal tracking-wider"
                />
              </div>

              {/* 유효기간 + CVC */}
              <div className="flex divide-x divide-[var(--color-border-soft)]">
                <div className="flex-1 px-4 py-3.5">
                  <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wide">유효기간</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full bg-transparent text-[15px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal"
                  />
                </div>
                <div className="flex-1 px-4 py-3.5">
                  <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wide">CVC</p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="000"
                    className="w-full bg-transparent text-[15px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal"
                  />
                </div>
              </div>

              {/* 카드 소유자명 */}
              <div className="px-4 py-3.5">
                <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-wide">카드 소유자명</p>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  placeholder="HONG GILDONG"
                  className="w-full bg-transparent text-[15px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal tracking-wider"
                />
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-text-tertiary)] mt-3 leading-relaxed">
              카드 정보는 암호화되어 안전하게 처리됩니다. 실제 결제가 발생하지 않는 목업 화면이에요.
            </p>
          </div>
        </div>

        {/* 하단 결제 버튼 */}
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-4 bg-[var(--color-bg-page)] border-t border-[var(--color-border-soft)]">
          <button
            onClick={handlePay}
            className="w-full rounded-full py-4 text-[15px] font-black text-white"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            {price.toLocaleString()}원 결제하기
          </button>
        </div>
      </div>
    )
  }

  // ── 결제 완료 화면 ──────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[var(--color-bg-page)] px-6 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'var(--color-accent-soft)' }}
        >
          <CheckCircle2 size={40} className="text-[var(--color-accent-dark)]" />
        </div>
        <p className="text-[24px] font-black text-[var(--color-text-primary)] leading-tight mb-2">
          PRO 업그레이드 완료!
        </p>
        <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed mb-8">
          이제 모든 PRO 기능을 제한 없이 이용할 수 있어요.
        </p>

        <div className="w-full rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-5 py-4 mb-8">
          {FEATURES.map((f, i) => (
            <div
              key={f.label}
              className={[
                'flex items-center gap-3 py-2.5',
                i < FEATURES.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-accent-soft)' }}
              >
                <Check size={11} className="text-[var(--color-accent-dark)]" />
              </div>
              <p className="text-[13px] text-[var(--color-text-primary)] text-left">
                <span className="font-semibold">{f.label}</span>
                <span className="text-[var(--color-text-secondary)]"> {f.pro}</span>
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setScreen('billing')}
          className="w-full rounded-full py-4 text-[15px] font-black text-white"
          style={{ backgroundColor: 'var(--color-accent-dark)' }}
        >
          확인
        </button>
      </div>
    )
  }

  // ── 본인인증 서브스크린 ──────────────────────────────────────────
  if (screen === 'verify') {
    return (
      <div className="flex h-full flex-col bg-[var(--color-bg-page)]">
        <NavBar title="본인인증" onBack={() => setScreen('main')} />

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <IdentityVerification
            isVerified={user?.isVerified ?? false}
            onVerified={() => {
              store.updateUserInfo({ isVerified: true })
              setScreen('main')
            }}
            onCancelVerification={() => {
              store.updateUserInfo({ isVerified: false })
              showToast('본인인증이 취소됐어요')
            }}
          />
        </div>
      </div>
    )
  }

  // ── 유료결제 서브스크린 ──────────────────────────────────────────
  if (screen === 'billing') {
    return (
      <div className="flex h-full flex-col bg-white">
        <NavBar title="" onBack={() => setScreen('main')} onClose={() => setScreen('main')} divider={false} />

        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-8">
          <h1 className="text-[22px] font-bold text-[#0D0D0D]">유료 결제</h1>

          {/* 플랜 상태 카드 */}
          <div className="mt-6 rounded-[24px] border border-[#DEE4EC] p-4 flex flex-col gap-5">
            {isPaid ? (
              <>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="rounded-[6px] px-1.5 py-0.5 text-[12px] font-bold text-white"
                      style={{ background: 'linear-gradient(112deg, rgba(0,173,255,0.2) 0%, #00ADFF 30%, #0657FF 59%)' }}
                    >
                      PRO
                    </span>
                    <p className="text-[16px] font-bold text-[#0D0D0D]">프리미엄 이용 중</p>
                  </div>
                  <p className="text-[14px] font-medium text-[#475058]">커스텀 링크 등 PRO 기능을 자유롭게 이용할 수 있어요.</p>
                </div>
                <button
                  onClick={() => setCancelSheetOpen(true)}
                  className="w-full rounded-full border border-[#DEE4EC] bg-white py-3 text-[14px] font-bold text-[#6C7786]"
                >
                  구독 해제
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-[16px] font-bold text-[#0D0D0D]">무료 플랜</p>
                  <p className="text-[14px] font-medium text-[#475058]">PRO로 업그레이드하면 커스텀 링크 등 프리미엄 기능을 자유롭게 이용할 수 있어요.</p>
                </div>
                <button
                  onClick={() => setScreen('upgrade')}
                  className="w-full rounded-full bg-black py-3 text-[14px] font-bold text-white"
                >
                  PRO 업그레이드
                </button>
              </>
            )}
          </div>

          {/* 나만의 링크 항목 */}
          <div className="mt-4 rounded-[24px] border border-[#DEE4EC] p-4 flex flex-col gap-3">
            <button
              onClick={() => isPaid ? setLinkIdSheetOpen(true) : showToast('유료 플랜에서만 사용할 수 있는 기능이에요.', 'error')}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/payment/link-icon.svg" alt="" className="w-10 h-10 flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1">
                    <p className="text-[14px] font-semibold text-[#0D0D0D]">나만의 링크</p>
                    {isPaid ? (
                      <span className="rounded-[4px] bg-[#F0F5FF] px-1 py-0.5 text-[8px] font-bold text-[#25313D]">PRO</span>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/payment/lock-badge.svg" alt="" className="w-3 h-3" />
                    )}
                  </div>
                  <p className="text-[12px] font-medium text-[#6C7786]">felore.io/{currentLinkId}</p>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/payment/chevron-right.svg" alt="" className="w-6 h-6 flex-shrink-0" />
            </button>

            {!isPaid && (
              <div className="flex items-center gap-1 rounded-[8px] bg-[#F0F5FF] pl-3 pr-4 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/payment/money.svg" alt="" className="w-4 h-4 flex-shrink-0" />
                <p className="text-[12px] font-medium text-[#25313D]">유료 플랜으로 나만의 링크를 설정할 수 있어요</p>
              </div>
            )}
          </div>
        </div>

        {/* 구독 해제 확인 BottomSheet */}
        <BottomSheet open={cancelSheetOpen} onClose={() => setCancelSheetOpen(false)}>
          <div className="flex flex-col gap-6 px-4 pb-6 pt-3">
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="h-1 w-11 rounded-full bg-[#DEE4EC]" />
              <div className="flex flex-col gap-2 w-full">
                <p className="text-[18px] font-bold text-[#0D0D0D]">구독을 해제할까요?</p>
                <p className="text-[14px] font-medium leading-[1.5] text-[#475058]">
                  구독 해제 시 즉시 무료 플랜으로 전환돼요. 커스텀 링크는 기본 링크로 복원되고, PRO 기능을 더 이상 이용할 수 없어요.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4 w-full">
              <button
                onClick={() => {
                  store.setPaidUser(false)
                  store.setCustomLinkId(null)
                  setCustomLinkInput('')
                  setCustomLinkError(false)
                  setCancelSheetOpen(false)
                  showToast('구독이 해제됐어요')
                }}
                className="w-full h-12 rounded-full bg-[#FF4242] text-[16px] font-semibold text-white"
              >
                구독 해제
              </button>
              <button
                onClick={() => setCancelSheetOpen(false)}
                className="text-[14px] font-bold text-[#6C7786]"
              >
                취소
              </button>
            </div>
          </div>
        </BottomSheet>

        {/* 커스텀 링크 설정 BottomSheet */}
        <BottomSheet
          open={linkIdSheetOpen}
          onClose={() => { setLinkIdSheetOpen(false); setCustomLinkError(false) }}
        >
          <div className="flex flex-col gap-6 px-4 pb-6 pt-3">
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="h-1 w-11 rounded-full bg-[#DEE4EC]" />
              <div className="flex flex-col gap-2 w-full">
                <p className="text-[18px] font-bold text-[#0D0D0D]">커스텀 링크 설정</p>
                <p className="text-[14px] font-medium leading-[1.5] text-[#475058]">
                  나만의 링크를 설정하면 felore.io/내이름 형태로 프로필을 공유할 수 있어요. 유료 이용 종료 시 기본 링크로 자동 복원돼요.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">
                기본 링크<span className="text-[#6C7786]">(변경 불가)</span>
              </p>
              <div className="flex items-center gap-2.5 rounded-full border border-[#DEE4EC] bg-[#F5F6F7] px-4 py-3">
                <span className="text-[14px] font-medium text-[#A8B1BD]">felore.io/{randomLinkId}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">커스텀 링크</p>
              <div
                className={[
                  'flex items-center gap-2.5 rounded-full border bg-white px-4 py-3',
                  customLinkError ? 'border-[#FF4242]' : 'border-[#DEE4EC]',
                ].join(' ')}
              >
                <span className="text-[14px] font-medium text-[#A8B1BD] flex-shrink-0">felore.io/</span>
                <input
                  type="text"
                  value={customLinkInput}
                  onChange={(e) => { setCustomLinkInput(e.target.value.toLowerCase()); setCustomLinkError(false) }}
                  placeholder="예: gangminjun"
                  maxLength={20}
                  className="flex-1 min-w-0 bg-transparent text-[14px] font-medium text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
                />
              </div>
              {customLinkError && (
                <p className="text-[12px] font-medium text-[#FF4242]">올바른 커스텀 링크 형식을 입력해주세요.</p>
              )}
              <p className="text-[12px] font-medium text-[#6C7786]">영문 소문자, 숫자, _만 사용, 2~20자</p>
            </div>

            <div className="flex items-start gap-2 w-full">
              <button
                onClick={() => { setLinkIdSheetOpen(false); setCustomLinkError(false) }}
                className="flex-1 rounded-full border border-[#DEE4EC] px-6 py-3 text-[14px] font-bold text-[#25313D]"
              >
                취소
              </button>
              <button
                onClick={handleSaveCustomLinkId}
                className="flex-1 rounded-full bg-black px-6 py-3 text-[14px] font-bold text-white"
              >
                저장
              </button>
            </div>
            {user?.customLinkId && (
              <button
                onClick={() => { store.setCustomLinkId(null); setCustomLinkInput(''); setCustomLinkError(false); setLinkIdSheetOpen(false); showToast('기본 링크로 복원했어요') }}
                className="-mt-2 w-full text-center text-[13px] font-medium text-[#A8B1BD]"
              >
                기본 링크로 복원
              </button>
            )}
          </div>
        </BottomSheet>
      </div>
    )
  }

  // ── 메인 화면 ────────────────────────────────────────────────────
  const sections: Section[] = [
    {
      title: '내 펠로어',
      items: [
        {
          id: 'edit',
          icon: Pencil,
          label: '펠로어 편집',
          description: '프로필·하이라이트·라이프스타일',
          href: '/me?edit=true&returnTo=%2Fsettings',
        },
        {
          id: 'visibility',
          icon: Eye,
          label: '공개 설정',
          description: visibilitySummary,
          href: '/me?section=visibility&returnTo=%2Fsettings',
        },
        {
          id: 'archive',
          icon: BookmarkCheck,
          label: '저장한 프로필',
          description: '저장한 프로필 · 최근 본',
          href: '/archive',
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'verify',
          icon: BadgeCheck,
          label: '본인인증',
          description: user?.isVerified ? '인증 완료 · 프로필에 뱃지가 표시돼요' : '미인증 · 인증하면 프로필에 뱃지가 표시돼요',
          onClick: () => setScreen('verify'),
        },
        {
          id: 'billing',
          icon: CreditCard,
          label: '유료 결제',
          description: isPaid ? 'PRO · 프리미엄 기능 이용 중' : '내 링크 커스터마이징 · 프리미엄 기능',
          onClick: () => setScreen('billing'),
        },
      ],
    },
  ]

  const appSection: Section = {
    title: '앱 설정',
    items: [
      { id: 'lang', icon: Globe, label: '언어', description: '한국어', href: '/settings/language' },
      { id: 'account', icon: FileText, label: '약관 및 계정', href: '/settings/account' },
      { id: 'inquiry', icon: HelpCircle, label: '문의하기', description: '궁금한 점이나 불편한 점을 남겨주세요', href: '/settings/inquiry' },
    ],
  }

  const renderSection = (section: Section) => (
    <div key={section.title} className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] px-5 mb-1">
        {section.title}
      </p>
      <div className="flex flex-col">
        {section.items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) { item.onClick(); return }
                if (!item.href) { showToast('준비 중이에요'); return }
                router.push(item.href)
              }}
              className="flex items-center gap-3.5 w-full px-5 py-4 text-left border-b border-[var(--color-border-soft)] active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <Icon size={20} className="text-[var(--color-text-secondary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                {item.description && (
                  <p className="text-[12px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{item.description}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-60" />
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="설정" onBack={() => router.back()} />

      {isLoggedIn ? (
        <button
          onClick={() => router.push('/me')}
          className="flex items-center gap-4 mx-4 mt-6 mb-2 px-4 py-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-soft)] w-[calc(100%-2rem)] text-left active:opacity-80 transition-opacity"
        >
          <Avatar src={user?.avatarImage} name={user?.name ?? ''} color={user?.avatarColor ?? 'var(--color-accent-dark)'} size={56} />
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-black text-[var(--color-text-primary)] truncate">{user?.name}</p>
            <p className="text-[12px] text-[var(--color-accent-dark)] mt-0.5 font-medium">내 프로필 보기 →</p>
          </div>
        </button>
      ) : (
        <div className="mx-4 mt-6 mb-2 px-4 py-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-soft)] w-[calc(100%-2rem)]">
          <p className="text-[15px] font-black text-[var(--color-text-primary)] mb-1">게스트로 둘러보는 중이에요</p>
          <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed mb-4">
            로그인하면 내 펠로어를 만들고, 프로필을 저장하고, 인증 뱃지도 받을 수 있어요.
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="w-full rounded-full py-3 text-[13px] font-semibold text-white"
            style={{ backgroundColor: 'var(--color-accent-dark)' }}
          >
            로그인 / 회원가입
          </button>
        </div>
      )}

      <div className="flex flex-col mt-4 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {isLoggedIn && sections.map(renderSection)}

        {renderSection(appSection)}

        <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-2">버전 정보 · v1.0.0</p>

        {isLoggedIn && (
          <button
            onClick={() => { store.logout(); router.push('/') }}
            className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-3 underline underline-offset-2"
          >
            로그아웃
          </button>
        )}
      </div>
    </div>
  )
}
