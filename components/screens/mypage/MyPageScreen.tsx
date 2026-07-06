'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { ChevronRight, Link, Lock, Pencil, BookmarkCheck, CreditCard, Eye, Check, CheckCircle2 } from 'lucide-react'
import { Avatar, NavBar, BottomSheet, showToast } from '@/components/ui'

const CUSTOM_LINK_ID_REGEX = /^[a-z0-9_]{2,20}$/

type Screen = 'main' | 'billing' | 'upgrade' | 'payment' | 'success'
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

export default function MyPageScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const store = useByroStore()
  const user = store.user

  const isPaid = user?.isPaidUser ?? false
  const currentLinkId = user?.linkId ?? ''
  const randomLinkId = user?.randomLinkId ?? user?.linkId ?? ''
  const tabVisibility = store.tabVisibility ?? { who: 'public', vibe: 'public', network: 'public' }

  const screenParam = searchParams.get('screen')
  const validScreens: Screen[] = ['main', 'billing', 'upgrade', 'payment', 'success']
  const initialScreen = validScreens.includes(screenParam as Screen) ? (screenParam as Screen) : 'main'

  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly')
  const [cancelSheetOpen, setCancelSheetOpen] = useState(false)
  const [linkIdSheetOpen, setLinkIdSheetOpen] = useState(false)
  const [customLinkInput, setCustomLinkInput] = useState(user?.customLinkId ?? '')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')

  const handleSaveCustomLinkId = () => {
    const trimmed = customLinkInput.trim().toLowerCase()
    if (trimmed && !CUSTOM_LINK_ID_REGEX.test(trimmed)) {
      showToast('영문 소문자·숫자·_만 사용할 수 있어요 (2~20자)')
      return
    }
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
      showToast('카드 정보를 모두 입력해주세요')
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
              <span className="text-[11px] font-black text-[var(--color-accent-dark)] tracking-wide">BYRO PRO</span>
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

  // ── 유료결제 서브스크린 ──────────────────────────────────────────
  if (screen === 'billing') {
    return (
      <div className="flex h-full flex-col bg-[var(--color-bg-page)]">
        <NavBar title="유료 결제" onBack={() => setScreen('main')} />

        <div className="flex-1 overflow-y-auto">
          {/* 플랜 상태 카드 */}
          <div className="mx-4 mt-5 rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] px-5 py-5">
            {isPaid ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-accent-dark)]">PRO</span>
                  <p className="text-[15px] font-black text-[var(--color-text-primary)]">프리미엄 이용 중</p>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">내 링크 커스터마이징 등 PRO 기능을 이용할 수 있어요.</p>
                <button
                  onClick={() => setCancelSheetOpen(true)}
                  className="w-full rounded-full py-3 text-[13px] font-semibold border border-[var(--color-border-soft)] text-[var(--color-text-tertiary)]"
                >
                  구독 해제
                </button>
              </>
            ) : (
              <>
                <p className="text-[15px] font-black text-[var(--color-text-primary)] mb-1">무료 플랜</p>
                <p className="text-[12px] text-[var(--color-text-secondary)] mb-4">PRO로 업그레이드하면 내 링크 커스터마이징 등 프리미엄 기능을 쓸 수 있어요.</p>
                <button
                  onClick={() => setScreen('upgrade')}
                  className="w-full rounded-full py-3 text-[13px] font-semibold text-white whitespace-nowrap"
                  style={{ backgroundColor: 'var(--color-accent-dark)' }}
                >
                  PRO 업그레이드
                </button>
              </>
            )}
          </div>

          {/* 내 링크 항목 */}
          <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
            <button
              onClick={() => isPaid ? setLinkIdSheetOpen(true) : showToast('유료 플랜에서 사용할 수 있는 기능이에요')}
              className="flex w-full items-center gap-3.5 px-4 py-4 text-left active:bg-[var(--color-bg-muted)] transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-bg-muted)' }}
              >
                <Link size={16} className="text-[var(--color-text-secondary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">내 링크</p>
                  {!isPaid && <Lock size={11} className="text-[var(--color-text-tertiary)]" />}
                  {isPaid && (
                    <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-dark)]">PRO</span>
                  )}
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">byro.io/{currentLinkId}</p>
                {!isPaid && (
                  <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5">유료 플랜으로 나만의 링크를 설정할 수 있어요</p>
                )}
              </div>
              <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-50" />
            </button>
          </div>
        </div>

        {/* 구독 해제 확인 BottomSheet */}
        <BottomSheet open={cancelSheetOpen} onClose={() => setCancelSheetOpen(false)}>
          <div className="px-5 pb-8">
            <p className="text-[18px] font-black text-[var(--color-text-primary)] mb-1">구독을 해제할까요?</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
              구독 해제 시 즉시 무료 플랜으로 전환돼요. 커스텀 링크는 기본 링크로 복원되고, PRO 기능을 더 이상 이용할 수 없어요.
            </p>
            <button
              onClick={() => {
                store.setPaidUser(false)
                store.setCustomLinkId(null)
                setCustomLinkInput('')
                setCancelSheetOpen(false)
                showToast('구독이 해제됐어요')
              }}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold mb-2"
              style={{ backgroundColor: 'var(--color-state-danger-text)', color: '#fff' }}
            >
              구독 해제
            </button>
            <button
              onClick={() => setCancelSheetOpen(false)}
              className="w-full py-3 text-[13px] font-medium text-[var(--color-text-tertiary)]"
            >
              취소
            </button>
          </div>
        </BottomSheet>

        {/* 내 링크 편집 BottomSheet */}
        <BottomSheet open={linkIdSheetOpen} onClose={() => setLinkIdSheetOpen(false)}>
          <div className="px-5 pb-6">
            <p className="text-[18px] font-black text-[var(--color-text-strong)] mb-1">내 링크 설정</p>
            <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
              나만의 링크를 설정하면 <span className="font-semibold">byro.io/내이름</span> 형태로 프로필을 공유할 수 있어요. 유료 이용 종료 시 기본 링크로 자동 복원돼요.
            </p>

            <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-[0.08em]">기본 링크 (변경 불가)</p>
            <div className="flex items-center gap-1.5 mb-4 px-4 py-2.5 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)]">
              <span className="text-[13px] text-[var(--color-text-tertiary)]">byro.io/</span>
              <span className="text-[13px] font-semibold text-[var(--color-text-tertiary)]">{randomLinkId}</span>
            </div>

            <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] mb-1.5 uppercase tracking-[0.08em]">커스텀 링크</p>
            <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] mb-1.5">
              <span className="text-[13px] text-[var(--color-text-tertiary)] flex-shrink-0">byro.io/</span>
              <input
                type="text"
                value={customLinkInput}
                onChange={(e) => setCustomLinkInput(e.target.value.toLowerCase())}
                placeholder="예: gangminjun"
                maxLength={20}
                className="flex-1 bg-transparent text-[13px] font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] placeholder:font-normal"
              />
            </div>
            <p className="text-[11px] text-[var(--color-text-tertiary)] mb-5">영문 소문자·숫자·_만 사용, 2~20자</p>

            <button
              onClick={handleSaveCustomLinkId}
              className="w-full rounded-full py-3.5 text-[14px] font-semibold text-white whitespace-nowrap"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              저장
            </button>
            {user?.customLinkId && (
              <button
                onClick={() => { store.setCustomLinkId(null); setCustomLinkInput(''); setLinkIdSheetOpen(false); showToast('기본 링크로 복원했어요') }}
                className="w-full mt-2 py-3 text-[13px] font-medium text-[var(--color-text-tertiary)]"
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
      title: '내 바이로',
      items: [
        {
          id: 'edit',
          icon: Pencil,
          label: '바이로 편집',
          description: '프로필·하이라이트·라이프스타일',
          href: '/me?edit=true',
        },
        {
          id: 'visibility',
          icon: Eye,
          label: '공개 설정',
          description: visibilitySummary,
          href: '/me?section=visibility&returnTo=%2Fmypage',
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
          id: 'billing',
          icon: CreditCard,
          label: '유료 결제',
          description: isPaid ? 'PRO · 프리미엄 기능 이용 중' : '내 링크 커스터마이징 · 프리미엄 기능',
          onClick: () => setScreen('billing'),
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="마이페이지" onBack={() => router.back()} />

      {/* 프로필 카드 */}
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

      {/* 메뉴 섹션 */}
      <div className="flex flex-col gap-5 px-4 mt-4 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] px-1 mb-2">
              {section.title}
            </p>
            <div className="rounded-2xl overflow-hidden border border-[var(--color-border-soft)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border-soft)]">
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
                    className="flex items-center gap-3.5 w-full px-4 py-4 text-left active:bg-[var(--color-bg-muted)] transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-bg-muted)' }}
                    >
                      <Icon size={16} className="text-[var(--color-text-secondary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                      {item.description && (
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[var(--color-text-tertiary)] flex-shrink-0 opacity-50" />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
