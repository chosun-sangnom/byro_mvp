'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AlertCircle, BadgeCheck, CheckCircle2, Mail, MessageCircle, Pencil, Phone, Sparkles, Trash2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import {
  NavBar, StepBar, Button, Chip, CheckRow, BottomSheet, Modal,
  InfoBox, TextArea, AiBounce, YearPickerSheet, showToast,
} from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { ContactChannel, HighlightIconId } from '@/types'
import {
  KEYWORD_GROUPS, HIGHLIGHT_CATEGORIES, HIGHLIGHT_GROUPS, AI_BIO_CANDIDATES,
  INSTAGRAM_PROFILE, LINKEDIN_PROFILE,
} from '@/lib/mockData'

const STEP_NUMS: Record<string, number> = {
  login: 0, verify: 1, linkid: 2, keywords: 3, sns: 4,
  contact: 5, highlight: 6, 'bio-select': 7, 'bio-ai': 8, complete: 9,
}

const CERTIFICATION_HIGHLIGHTS = [
  { categoryId: 'career-continuity', icon: 'briefcase', title: '커리어 지속성', automated: true },
  { categoryId: 'corporate-longevity', icon: 'building2', title: '법인 영속성', automated: true },
  { categoryId: 'remember-network', icon: 'users', title: '리멤버 직업 네트워크', automated: false, docLabel: '리멤버 명함 내보내기 파일' },
  { categoryId: 'airline-mileage', icon: 'plane', title: '항공 마일리지', automated: true },
] as const

export default function OnboardingScreen() {
  const router = useRouter()
  const store = useByroStore()
  const [showExitModal, setShowExitModal] = useState(false)

  const stepNum = STEP_NUMS[store.step] ?? 0

  const handleClose = () => setShowExitModal(true)
  const handleExitConfirm = () => {
    setShowExitModal(false)
    router.push('/')
  }

  const hasBack = stepNum >= 1 && stepNum <= 8

  return (
    <div className="flex flex-col h-full">
      {/* Nav */}
      <NavBar
        onBack={hasBack ? () => store.prevStep() : undefined}
        onClose={handleClose}
      />

      {/* Step indicator (로그인 제외) */}
      {stepNum >= 1 && stepNum <= 8 && (
        <StepBar current={stepNum} total={8} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {store.step === 'login'     && <Step1Login onClose={handleClose} />}
        {store.step === 'verify'    && <Step2Verify />}
        {store.step === 'linkid'    && <Step3LinkId />}
        {store.step === 'keywords'  && <Step4Keywords />}
        {store.step === 'sns'       && <Step5SNS />}
        {store.step === 'contact'   && <Step6Contact />}
        {store.step === 'highlight' && <Step7Highlight />}
        {store.step === 'bio-select' && <Step8Select />}
        {store.step === 'bio-ai'   && <Step8AI />}
        {store.step === 'complete'  && <Step9Complete />}
      </div>

      {/* Exit modal */}
      <Modal open={showExitModal} onClose={() => setShowExitModal(false)}>
        <div className="text-center">
          <div className="text-base font-black mb-2">온보딩을 종료할까요?</div>
          <div className="meta-text mb-5 leading-relaxed">
            지금 나가면 입력한 정보가<br />저장되지 않아요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExitModal(false)}>계속 작성하기</Button>
            <Button variant="danger" onClick={handleExitConfirm}>종료하기</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StepIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="surface-card px-4 py-4 mb-5 rounded-[28px]">
      {eyebrow && <div className="micro-text uppercase tracking-[0.18em] mb-2">{eyebrow}</div>}
      <h2 className="text-[22px] font-black leading-tight mb-2">{title}</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">{description}</p>
    </div>
  )
}

function SelectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
  tone = 'default',
  onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  badge?: string
  children?: React.ReactNode
  tone?: 'default' | 'accent'
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left rounded-[24px] border px-4 py-4 transition-colors',
        tone === 'accent'
          ? 'border-[#E8A000] bg-[#FFF8E6]'
          : 'border-[var(--color-border-default)] bg-[var(--color-bg-surface)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl leading-none mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <div className="text-sm font-black text-[var(--color-text-strong)]">{title}</div>
            {badge && (
              <span className="text-[10px] font-bold rounded-full px-2 py-0.5 bg-white/80 border text-[var(--color-text-secondary)]" style={{ borderColor: 'var(--color-border-default)' }}>
                {badge}
              </span>
            )}
          </div>
          <div className="meta-text leading-relaxed">{subtitle}</div>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </button>
  )
}

function ContactTypeIcon({
  channelId,
  enabled,
}: {
  channelId: ContactChannel['id']
  enabled: boolean
}) {
  const iconMap = {
    phone: Phone,
    email: Mail,
    kakao: MessageCircle,
  }
  const Icon = iconMap[channelId] ?? MessageCircle

  return (
    <div className={[
      'flex h-10 w-10 items-center justify-center rounded-xl',
      enabled ? 'bg-[var(--color-accent-dark)] text-white' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]',
    ].join(' ')}>
      <Icon size={16} />
    </div>
  )
}

function buildContactHref(id: ContactChannel['id'], value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (id === 'phone') return `tel:${trimmed.replace(/[^0-9+]/g, '')}`
  if (id === 'email') return `mailto:${trimmed}`
  if (id === 'kakao') return trimmed.startsWith('http') ? trimmed : `https://open.kakao.com/o/${trimmed}`
  return ''
}

function contactPlaceholder(id?: ContactChannel['id']) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@byro.io'
  if (id === 'kakao') return 'openchat 코드 또는 URL'
  return ''
}

function contactPreview(id?: ContactChannel['id'], value?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  return buildContactHref(id, value)
}

function StepFooter({
  canNext,
  onNext,
  onPrev,
  onSkip,
  nextLabel = '다음',
  prevLabel = '이전',
  skipLabel = '건너뛰기',
}: {
  canNext: boolean
  onNext: () => void
  onPrev?: () => void
  onSkip?: () => void
  nextLabel?: string
  prevLabel?: string
  skipLabel?: string
}) {
  return (
    <div className="px-5 pb-5 pt-3 border-t border-[#EBEBEB] space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={onPrev} disabled={!onPrev}>{prevLabel}</Button>
        <Button onClick={onNext} disabled={!canNext}>{nextLabel}</Button>
      </div>
      {onSkip && (
        <button className="w-full text-center text-sm text-[var(--color-text-secondary)]" onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </div>
  )
}

// ─── Step 1: 소셜 로그인 ────────────────────────────────
function Step1Login({ onClose: _onClose }: { onClose: () => void }) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const store = useByroStore()

  const handleSocial = () => {
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6">
      <div className="surface-card rounded-[32px] px-5 py-6 text-center mb-5">
        <div className="micro-text uppercase tracking-[0.18em] mb-2">Branding Profile</div>
        <div className="text-3xl font-black mb-2">Byro</div>
        <div className="meta-text mt-3 leading-relaxed">
          진짜 나를 보여주는 프로필.
          <br />
          3분이면 만들고, 만난 사람에게 바로 공유할 수 있어요.
        </div>
      </div>
      <div className="space-y-3">
        <Button variant="kakao" onClick={handleSocial}>카카오로 시작하기</Button>
        <Button variant="google" onClick={handleSocial}>G  구글로 시작하기</Button>
        <Button variant="naver" onClick={handleSocial}>N  네이버로 시작하기</Button>
      </div>
      <p className="micro-text text-center mt-6">
        시작하면 이용약관 및 개인정보 처리방침에 동의하게 됩니다
      </p>
    </div>
  )
}

// ─── Step 2: 본인인증 + 약관 ─────────────────────────────
function Step2Verify() {
  const store = useByroStore()
  const { agreedTerms, agreedPrivacy, agreedMarketing } = store
  const allChecked = agreedTerms && agreedPrivacy && agreedMarketing
  const canProceed = agreedTerms && agreedPrivacy

  const handleVerify = () => {
    if (!canProceed) return
    store.nextStep()
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Verification"
        title={'본인 확인이 필요해요'}
        description={'인증한 이름은 프로필에 실명으로 표시돼요.\n인증 후에는 바꾸기 어려워요.'}
      />

      {/* 약관 체크박스 */}
      <div className="surface-card-soft rounded-[24px] p-4 mb-4">
        {/* 전체 동의 */}
        <div className="pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border-default)' }}>
          <CheckRow
            label="전체 동의"
            checked={allChecked}
            onToggle={store.toggleAllAgreed}
          />
        </div>
        <CheckRow
          label="[필수] 서비스 이용약관"
          checked={agreedTerms}
          onToggle={() => store.setAgreedTerms(!agreedTerms)}
          onDetail={() => {}}
        />
        <CheckRow
          label="[필수] 개인정보 처리방침"
          checked={agreedPrivacy}
          onToggle={() => store.setAgreedPrivacy(!agreedPrivacy)}
          onDetail={() => {}}
        />
        <CheckRow
          label="[선택] 마케팅 정보 수신 동의"
          checked={agreedMarketing}
          onToggle={() => store.setAgreedMarketing(!agreedMarketing)}
          onDetail={() => {}}
        />
      </div>

      <div className="space-y-3">
        <Button variant="outline" disabled={!canProceed} onClick={handleVerify}>
          SMS로 인증하기
        </Button>
        <Button variant="kakao" disabled={!canProceed} onClick={handleVerify}>
          카카오로 인증하기
        </Button>
      </div>
      <StepFooter
        canNext={canProceed}
        onNext={handleVerify}
        onPrev={() => store.prevStep()}
      />
    </div>
  )
}

// ─── Step 3: 링크 ID ──────────────────────────────────────
function Step3LinkId() {
  const store = useByroStore()
  const [input, setInput] = useState(store.linkId)
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')

  const LINK_REGEX = /^[a-z0-9_]{2,20}$/

  const handleChange = (v: string) => {
    setInput(v)
    store.setLinkId(v)
    if (v.length === 0) setStatus('idle')
    else if (LINK_REGEX.test(v)) setStatus('valid')
    else setStatus('error')
  }
  const canNext = status === 'valid'
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Link"
        title={'나만의 Byro 링크를\n만들어보세요'}
        description={'한 번 정하면 바꾸기 어려워요.\n공유하기 쉬운 이름을 추천해요.'}
      />
      <InfoBox variant="warn">
        지금은 무료로 만들 수 있어요.
        <br />
        정식 출시 후에는 유료로 전환될 수 있어요.
      </InfoBox>

      <label className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Byro 링크 ID</label>
      <input
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="예: myongkoo"
        className={[
          'w-full border rounded-xl px-4 py-3 text-sm outline-none mb-1',
          status === 'valid' ? 'border-[#1A7A1A]' : status === 'error' ? 'border-[#E53935]' : 'border-[#ddd]',
        ].join(' ')}
      />
      {status === 'valid' && <p className="text-xs text-[var(--color-state-success-text)] mb-3">사용할 수 있는 ID예요</p>}
      {status === 'error' && <p className="text-xs text-[var(--color-state-danger-text)] mb-3">영문 소문자, 숫자, 밑줄(_)만 가능 · 2~20자</p>}
      <p className="meta-text mb-6">· 영문 소문자, 숫자, 밑줄(_) &nbsp;· 2~20자 이내</p>
      {input && status !== 'error' && (
        <div className="surface-card-soft rounded-2xl px-4 py-3 mb-5">
          <div className="micro-text mb-1">미리보기</div>
          <div className="text-sm font-semibold text-[var(--color-text-strong)]">byro.io/@{input}</div>
        </div>
      )}

      <StepFooter
        canNext={canNext}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
      />
    </div>
  )
}

// ─── Step 4: 키워드 선택 ─────────────────────────────────
function Step4Keywords() {
  const store = useByroStore()
  const { selectedKeywords } = store

  const handleToggle = (kw: string) => {
    if (!selectedKeywords.includes(kw) && selectedKeywords.length >= 5) {
      showToast('키워드는 최대 5개까지 선택할 수 있어요')
      return
    }
    store.toggleKeyword(kw)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Keywords"
        title={'나를 표현하는 키워드를\n골라보세요'}
        description={'다른 사람이 나를 표현할 때 쓰는 키워드예요.\n최대 5개까지 고를 수 있어요.'}
      />
        <div className="rounded-lg px-3 py-2 text-xs flex justify-between mb-4" style={{ backgroundColor: 'var(--color-state-info-bg)', border: '1px solid var(--color-state-info-text)', color: 'var(--color-state-info-text)' }}>
          <span>AI 자기소개를 만들 때도 활용돼요</span>
          <span className="font-black">{selectedKeywords.length} / 5</span>
        </div>

        {KEYWORD_GROUPS.map((group, gi) => (
          <div key={gi} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[var(--color-accent-dark)] text-white text-xs font-bold rounded px-1.5 py-0.5">{gi + 1}</span>
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">{group.category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.keywords.map((kw) => (
                <Chip
                  key={kw}
                  label={kw}
                  selected={selectedKeywords.includes(kw)}
                  onClick={() => handleToggle(kw)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <StepFooter
        canNext={selectedKeywords.length > 0}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
        onSkip={() => store.nextStep()}
      />
    </div>
  )
}

// ─── Step 5: SNS 연동 ─────────────────────────────────────
function Step5SNS() {
  const store = useByroStore()

  const handleConnectInstagram = () => {
    window.open(INSTAGRAM_PROFILE.profileUrl, '_blank')
    store.connectInstagram()
    showToast('Instagram 연동이 완료됐어요!')
  }

  const handleConnectLinkedIn = () => {
    window.open(LINKEDIN_PROFILE.profileUrl, '_blank')
    store.connectLinkedIn()
    showToast('LinkedIn 연동이 완료됐어요!')
  }

  const handleDisconnectInstagram = () => {
    store.disconnectInstagram()
    showToast('Instagram 연동이 해제됐어요')
  }

  const handleDisconnectLinkedIn = () => {
    store.disconnectLinkedIn()
    showToast('LinkedIn 연동이 해제됐어요')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Social"
        title={'SNS를 연동하면\n프로필이 풍부해져요'}
        description={'연결한 SNS를 프로필에 보여드려요.\n나중에 다시 바꿀 수 있어요.'}
      />

      {/* Instagram */}
      <div className="space-y-3">
        <SelectionCard
          icon={<Image src="/images/Instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" />}
          title="Instagram"
          subtitle={store.instagramConnected ? `@${INSTAGRAM_PROFILE.username} 연동됨` : 'Instagram을 연결하면 미리보기를 보여드려요.'}
          badge={store.instagramConnected ? '연동됨' : '선택'}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="micro-text truncate">{INSTAGRAM_PROFILE.profileUrl}</div>
            {store.instagramConnected
              ? <button onClick={handleDisconnectInstagram} className="text-xs rounded-lg px-3 py-1.5 border" style={{ color: 'var(--color-state-danger-text)', borderColor: 'var(--color-state-danger-text)' }}>해제</button>
              : <button onClick={handleConnectInstagram} className="text-xs text-white rounded-lg px-3 py-1.5" style={{ backgroundColor: 'var(--color-accent-dark)' }}>연동하기</button>}
          </div>
        </SelectionCard>

        <SelectionCard
          icon={<Image src="/images/linkedin.png" alt="LinkedIn" width={24} height={24} className="w-6 h-6" />}
          title="LinkedIn"
          subtitle={store.linkedinConnected ? 'myongkoo-kang 연동됨' : 'LinkedIn을 연결하면 커리어 요약을 보여드려요.'}
          badge={store.linkedinConnected ? '연동됨' : '선택'}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="micro-text truncate">{LINKEDIN_PROFILE.profileUrl}</div>
            {store.linkedinConnected
              ? <button onClick={handleDisconnectLinkedIn} className="text-xs rounded-lg px-3 py-1.5 border" style={{ color: 'var(--color-state-danger-text)', borderColor: 'var(--color-state-danger-text)' }}>해제</button>
              : <button onClick={handleConnectLinkedIn} className="text-xs text-white rounded-lg px-3 py-1.5" style={{ backgroundColor: 'var(--color-accent-dark)' }}>연동하기</button>}
          </div>
        </SelectionCard>
      </div>
      <InfoBox variant="info">
        연결하지 않으면 프로필에 보이지 않아요.
      </InfoBox>
      <StepFooter
        canNext={store.instagramConnected || store.linkedinConnected}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
        onSkip={() => store.nextStep()}
        skipLabel="건너뛰기"
      />
    </div>
  )
}

// ─── Step 6: 연락 수단 ───────────────────────────────────
function Step6Contact() {
  const store = useByroStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null)
  const [inputValue, setInputValue] = useState('')
  const channels = store.onboardingContactChannels
  const activeCount = channels.filter((channel) => channel.enabled && channel.value.trim()).length

  const openChannel = (channel: ContactChannel) => {
    setSelectedChannel(channel)
    setInputValue(channel.value)
    setSheetOpen(true)
  }

  const handleSaveChannel = () => {
    if (!selectedChannel) return
    const trimmed = inputValue.trim()
    const next = channels.map((channel) => (
      channel.id === selectedChannel.id
        ? {
          ...channel,
          value: trimmed,
          enabled: Boolean(trimmed),
          href: trimmed ? buildContactHref(selectedChannel.id, trimmed) : '',
        }
        : channel
    ))
    store.setOnboardingContactChannels(next)
    setSheetOpen(false)
    setSelectedChannel(null)
    setInputValue('')
    showToast(trimmed ? '연락 수단이 저장됐어요!' : '연락 수단을 비활성화했어요')
  }

  const handleClearChannel = () => {
    if (!selectedChannel) return
    const next = channels.map((channel) => (
      channel.id === selectedChannel.id
        ? { ...channel, value: '', enabled: false, href: '' }
        : channel
    ))
    store.setOnboardingContactChannels(next)
    setSheetOpen(false)
    setSelectedChannel(null)
    setInputValue('')
    showToast('연락 수단을 비활성화했어요')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIntro
          eyebrow="Contact"
          title={'연락 수단을\n연결해보세요'}
          description={'프로필을 본 사람이 바로 연락할 수 있어요.\n전화, 이메일, 카카오 중에서 연결할 수 있어요.'}
        />

        <div className="surface-card-soft p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-[var(--color-text-strong)]">연결된 연락 수단</div>
              <div className="meta-text mt-1">나중에 Byro 편집에서 언제든 바꿀 수 있어요.</div>
            </div>
            <div className="rounded-full bg-[var(--color-bg-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
              {activeCount}/4
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => openChannel(channel)}
              className="flex w-full items-center gap-3 rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-4 py-4 text-left"
            >
              <ContactTypeIcon channelId={channel.id} enabled={channel.enabled} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-black text-[var(--color-text-strong)]">{channel.label}</div>
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      channel.enabled
                        ? 'bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]'
                        : 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]',
                    ].join(' ')}
                  >
                    {channel.enabled ? '연결됨' : '미연결'}
                  </span>
                </div>
                <div className="meta-text mt-1 truncate">
                  {channel.value?.trim() ? channel.value : `${channel.label}을 연결해보세요`}
                </div>
              </div>
              <span className="text-sm text-[var(--color-text-tertiary)]">›</span>
            </button>
          ))}
        </div>
      </div>

      <StepFooter
        canNext={activeCount > 0}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
        onSkip={() => store.nextStep()}
        skipLabel="건너뛰기"
      />

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="text-sm font-black mb-4">{selectedChannel?.label ?? '연락 수단'} 설정</div>
          {selectedChannel && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <ContactTypeIcon channelId={selectedChannel.id} enabled={Boolean(inputValue.trim())} />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--color-text-strong)]">{selectedChannel.label}</div>
                  <div className="meta-text">{selectedChannel.id === 'phone' ? '전화번호를 입력하면 바로 걸 수 있어요.' : selectedChannel.id === 'email' ? '이메일 주소를 입력하면 메일로 연결돼요.' : '오픈채팅 링크나 코드를 입력해 주세요.'}</div>
                </div>
              </div>

              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={contactPlaceholder(selectedChannel.id)}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none mb-2"
                style={{ borderColor: 'var(--color-border-default)' }}
              />
              <div className="micro-text mb-4">{contactPreview(selectedChannel.id, inputValue)}</div>

              <div className="space-y-2">
                <Button onClick={handleSaveChannel}>저장하기</Button>
                <Button variant="outline" onClick={handleClearChannel}>비활성화</Button>
              </div>
            </>
          )}
        </div>
      </BottomSheet>
    </div>
  )
}

// ─── Step 7: 하이라이트 ───────────────────────────────────
function Step7Highlight() {
  const store = useByroStore()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'picker' | 'form' | 'cert'>('picker')
  const [selectedCert, setSelectedCert] = useState<(typeof CERTIFICATION_HIGHLIGHTS)[number] | null>(null)

  // 직접 입력 폼 상태
  const [selectedCat, setSelectedCat] = useState<typeof HIGHLIGHT_CATEGORIES[0] | null>(null)
  const [hlTitle, setHlTitle] = useState('')
  const [hlRole, setHlRole] = useState('')
  const [hlSchoolType, setHlSchoolType] = useState('')
  const [hlDegree, setHlDegree] = useState('')
  const [hlStatus, setHlStatus] = useState('')
  const [hlStartYear, setHlStartYear] = useState('')
  const [hlEndYear, setHlEndYear] = useState('')
  const [hlEducationYear, setHlEducationYear] = useState('')
  const [hlDesc, setHlDesc] = useState('')
  const [yearPickerTarget, setYearPickerTarget] = useState<'career-start' | 'career-end' | 'education-year' | null>(null)
  const highlightLimitReached = store.highlights.length >= 5
  const isCareerRole = selectedCat?.id === 'career-role'
  const isEducationHistory = selectedCat?.id === 'education-history'
  const educationNeedsDegree = hlSchoolType === '대학교' || hlSchoolType === '대학원'
  const educationNeedsMajor = hlSchoolType !== '고등학교'
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, index) => String(currentYear - index))

  const resetForm = () => {
    setSelectedCat(null)
    setHlTitle('')
    setHlRole('')
    setHlSchoolType('')
    setHlDegree('')
    setHlStatus('')
    setHlStartYear('')
    setHlEndYear('')
    setHlEducationYear('')
    setHlDesc('')
    setYearPickerTarget(null)
  }

  const handleAddHighlight = () => {
    if (highlightLimitReached) {
      showToast('하이라이트는 최대 5개까지 추가할 수 있어요')
      return
    }
    if (!selectedCat || !hlTitle.trim()) {
      showToast('필수 항목을 입력해주세요')
      return
    }
    if (isCareerRole && !hlRole.trim()) {
      showToast('직함을 입력해주세요')
      return
    }
    if (isEducationHistory && !hlSchoolType) {
      showToast('학교 유형을 선택해주세요')
      return
    }
    if (isEducationHistory && educationNeedsDegree && !hlDegree) {
      showToast('세부 학위를 선택해주세요')
      return
    }
    if (isEducationHistory && educationNeedsMajor && !hlRole.trim()) {
      showToast('전공을 입력해주세요')
      return
    }
    if (isEducationHistory && !hlStatus) {
      showToast('상태를 선택해주세요')
      return
    }
    if (isCareerRole && !hlStatus) {
      showToast('상태를 선택해주세요')
      return
    }
    if (isCareerRole && !hlStartYear) {
      showToast('시작 연도를 선택해주세요')
      return
    }
    if (isCareerRole && hlStatus === '종료' && !hlEndYear) {
      showToast('종료 연도를 선택해주세요')
      return
    }
    let metadata: Record<string, string | boolean> | undefined
    if (isEducationHistory) {
      metadata = { status: hlStatus, role: hlRole, degree: hlDegree, schoolType: hlSchoolType }
    } else if (isCareerRole) {
      metadata = { status: hlStatus, role: hlRole, startYear: hlStartYear, endYear: hlStatus === '종료' ? hlEndYear : '' }
    }
    store.addHighlight({
      categoryId: selectedCat.id,
      icon: selectedCat.icon as HighlightIconId,
      title: hlTitle,
      subtitle: isEducationHistory ? `${selectedCat.label} · ${hlSchoolType}` : `${selectedCat.label} · 직접 입력`,
      description: hlDesc,
      year: isCareerRole
        ? `${hlStartYear} - ${hlStatus === '재직 중' ? '현재' : hlEndYear}`
        : hlEducationYear,
      metadata,
    })
    resetForm()
    setPickerOpen(false)
    setSheetMode('picker')
    showToast('하이라이트가 추가됐어요!')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIntro
          eyebrow="Highlight"
          title={'커리어 하이라이트를\n추가해보세요'}
          description={'인증한 정보와 직접 추가한 경험을\n프로필에 함께 보여줄 수 있어요.'}
        />

        <div className="mb-5">
          <InfoBox>표시 항목은 인증 연동이 가능해요</InfoBox>
        </div>

        {store.highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {store.highlights.map((h) => (
              <div key={h.id} className="surface-card flex items-start rounded-[22px] p-3">
                <span className="mr-2 mt-0.5 text-[var(--color-text-strong)]">
                  <HighlightIcon id={h.icon as HighlightIconId} size={18} />
                </span>
                <div className="flex-1">
                  <div className="text-sm font-bold">{h.title}</div>
                  <div className="micro-text">{h.subtitle}</div>
                  {h.description && <div className="meta-text mt-0.5">{h.description}</div>}
                </div>
                <button onClick={() => store.removeHighlight(h.id)} className="ml-2 mt-0.5 text-[var(--color-state-danger-text)]">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            if (highlightLimitReached) {
              showToast('하이라이트는 최대 5개까지 추가할 수 있어요')
              return
            }
            setSheetMode('picker')
            setPickerOpen(true)
          }}
          disabled={highlightLimitReached}
          className="w-full border border-dashed rounded-xl py-3 text-sm font-medium disabled:opacity-45"
          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
        >
          {highlightLimitReached ? '하이라이트 5개를 모두 추가했어요' : '+ 하이라이트 추가하기'}
        </button>
        <div className="micro-text mt-2 text-center">{store.highlights.length}/5</div>
      </div>

      <StepFooter
        canNext={store.highlights.length > 0}
        onNext={() => store.nextStep()}
        onPrev={() => store.prevStep()}
        onSkip={() => store.nextStep()}
        skipLabel="건너뛰기"
      />

      <BottomSheet open={pickerOpen} onClose={() => setPickerOpen(false)}>
        {sheetMode === 'picker' && (
          <div className="px-5 pb-6">
            <div className="text-[22px] font-black tracking-[-0.03em] text-[var(--color-text-strong)] mb-1">경험 추가하기</div>
            <div className="text-sm leading-6 text-[var(--color-text-secondary)] mb-5">
              프로필에 보여줄 경험을 선택하세요.
            </div>

            <div className="space-y-6">
              {HIGHLIGHT_GROUPS.map((group, groupIndex) => (
                <div key={group.id} className={groupIndex > 0 ? 'border-t border-[var(--color-border-soft)] pt-5' : ''}>
                  <div className="mb-3 text-sm font-bold text-[var(--color-text-secondary)]">{group.label}</div>
                  <div className="grid grid-cols-4 gap-3">
                    {HIGHLIGHT_CATEGORIES.filter((cat) => cat.group === group.id).map((cat) => {
                      const certification = CERTIFICATION_HIGHLIGHTS.find((item) => item.categoryId === cat.id)
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            if (cat.certificationOnly && certification) {
                              setSelectedCert(certification)
                              setSheetMode('cert')
                              return
                            }
                            setSelectedCat(cat)
                            setSheetMode('form')
                          }}
                          className="relative overflow-visible rounded-[20px] border border-[var(--color-border-default)] bg-white px-3 py-4 text-center shadow-[0_4px_14px_rgba(17,17,17,0.03)]"
                        >
                          {cat.certificationOnly && (
                            <span className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#217A43] shadow-[0_4px_12px_rgba(17,17,17,0.10)]">
                              <BadgeCheck size={14} />
                            </span>
                          )}
                          <div className="mx-auto mb-2 flex items-center justify-center text-[var(--color-text-secondary)]">
                            <HighlightIcon id={cat.icon as HighlightIconId} size={16} />
                          </div>
                          <div className="text-[12px] font-bold leading-[1.4] text-[var(--color-text-primary)] break-keep">{cat.label}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sheetMode === 'form' && (
          <div className="px-5 pb-6">
            <div className="flex items-center mb-4">
              <button onClick={() => setSheetMode('picker')} className="text-xl text-[#555] mr-3 leading-none">‹</button>
              <div className="text-[18px] font-black text-[var(--color-text-strong)]">직접 입력 하이라이트</div>
            </div>

            {selectedCat && (
              <div className="surface-card mb-4 rounded-[26px] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-strong)]">
                    <HighlightIcon id={selectedCat.icon as HighlightIconId} size={18} />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[var(--color-text-strong)]">{selectedCat.label}</div>
                    <div className="micro-text">직접 입력으로 바로 추가돼요</div>
                  </div>
                </div>
              </div>
            )}

            <div className="surface-card rounded-[26px] p-4">
              <div className="space-y-3">
                {isEducationHistory && (
                  <div className="space-y-2">
                    <div className="micro-text">학교 유형</div>
                    <div className="grid grid-cols-3 gap-2">
                      {['고등학교', '대학교', '대학원'].map((schoolType) => (
                        <button
                          key={schoolType}
                          onClick={() => {
                            setHlSchoolType(schoolType)
                            setHlDegree('')
                            if (schoolType === '고등학교') setHlRole('')
                          }}
                          className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                          style={{
                            borderColor: hlSchoolType === schoolType ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                            backgroundColor: hlSchoolType === schoolType ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                            color: hlSchoolType === schoolType ? '#fff' : 'var(--color-text-secondary)',
                          }}
                        >
                          {schoolType}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isEducationHistory && educationNeedsDegree && (
                  <div className="space-y-2">
                    <div className="micro-text">세부 학위</div>
                    <div className="grid grid-cols-2 gap-2">
                      {(hlSchoolType === '대학교' ? ['전문학사', '학사'] : ['석사', '박사']).map((degree) => (
                        <button
                          key={degree}
                          onClick={() => setHlDegree(degree)}
                          className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                          style={{
                            borderColor: hlDegree === degree ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                            backgroundColor: hlDegree === degree ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                            color: hlDegree === degree ? '#fff' : 'var(--color-text-secondary)',
                          }}
                        >
                          {degree}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input
                  value={hlTitle}
                  onChange={(e) => setHlTitle(e.target.value)}
                  placeholder={isCareerRole ? '회사명' : isEducationHistory ? '학교명' : '제목'}
                  className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
                />
                {isEducationHistory && educationNeedsMajor && (
                  <input
                    value={hlRole}
                    onChange={(e) => setHlRole(e.target.value)}
                    placeholder="전공"
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
                  />
                )}
                {isCareerRole && (
                  <input
                    value={hlRole}
                    onChange={(e) => setHlRole(e.target.value)}
                    placeholder="직함"
                    className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)' }}
                  />
                )}
                {isCareerRole && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setYearPickerTarget('career-start')}
                      className="rounded-2xl border px-4 py-3 text-left text-sm"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlStartYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      {hlStartYear || '시작 연도'}
                    </button>
                    <button
                      onClick={() => {
                        if (hlStatus !== '종료') return
                        setYearPickerTarget('career-end')
                      }}
                      disabled={hlStatus !== '종료'}
                      className="rounded-2xl border px-4 py-3 text-left text-sm disabled:opacity-40"
                      style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlStatus === '재직 중' ? 'var(--color-text-tertiary)' : (hlEndYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)') }}
                    >
                      {hlStatus === '재직 중' ? '현재' : (hlEndYear || '종료 연도')}
                    </button>
                  </div>
                )}
                {isEducationHistory && (
                  <button
                    onClick={() => setYearPickerTarget('education-year')}
                    className="w-full rounded-2xl border px-4 py-3 text-left text-sm"
                    style={{ borderColor: 'var(--color-border-default)', backgroundColor: 'var(--color-bg-soft)', color: hlEducationYear ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}
                  >
                    {hlEducationYear || '연도 선택'}
                  </button>
                )}
                {isCareerRole && (
                  <div className="grid grid-cols-2 gap-2">
                    {['재직 중', '종료'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setHlStatus(status)}
                        className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                        style={{
                          borderColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                          backgroundColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                          color: hlStatus === status ? '#fff' : 'var(--color-text-secondary)',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
                {isEducationHistory && (
                  <div className="space-y-2">
                    <div className="micro-text">현재 상태</div>
                    <div className="grid grid-cols-3 gap-2">
                    {['졸업', '재학', '중퇴'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setHlStatus(status)}
                        className="rounded-2xl border px-3 py-2.5 text-sm font-semibold"
                        style={{
                          borderColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-border-default)',
                          backgroundColor: hlStatus === status ? 'var(--color-accent-dark)' : 'var(--color-bg-soft)',
                          color: hlStatus === status ? '#fff' : 'var(--color-text-secondary)',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                    </div>
                  </div>
                )}
                {!isEducationHistory && (
                  <TextArea
                    value={hlDesc}
                    onChange={setHlDesc}
                    placeholder={isCareerRole ? '어떤 일을 했는지 적어주세요' : '어떤 경험인지 간단히 적어주세요'}
                    maxLength={150}
                    rows={4}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setSheetMode('picker')}>이전</Button>
                <Button onClick={handleAddHighlight} disabled={!selectedCat || !hlTitle.trim() || (isCareerRole && (!hlRole.trim() || !hlStatus || !hlStartYear || (hlStatus === '종료' && !hlEndYear))) || (isEducationHistory && (!hlSchoolType || (educationNeedsDegree && !hlDegree) || (educationNeedsMajor && !hlRole.trim()) || !hlStatus))}>저장하기</Button>
              </div>
            </div>
          </div>
        )}

        {sheetMode === 'cert' && selectedCert && (
          <div className="px-5 pb-6">
            <div className="flex items-center mb-4">
              <button onClick={() => setSheetMode('picker')} className="text-xl text-[#555] mr-3 leading-none">‹</button>
              <div className="text-[18px] font-black text-[var(--color-text-strong)]">{selectedCert.title} 인증</div>
            </div>

            <div className="surface-card rounded-[28px] p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
                <HighlightIcon id={selectedCert.icon as HighlightIconId} size={20} />
              </div>
              {selectedCert.automated ? (
                <>
                  <div className="mt-4 text-sm font-bold text-[var(--color-text-strong)]">진행 방식</div>
                  <div className="mt-2 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>1. 본인확인을 진행하면 필요한 정보를 자동으로 불러와요.</p>
                    <p>2. 확인이 끝나면 하이라이트에 바로 반영돼요.</p>
                  </div>
                  <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                    별도 파일을 보내지 않아도 돼요. 본인확인만 끝나면 자동으로 진행됩니다.
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4 text-sm font-bold text-[var(--color-text-strong)]">진행 방식</div>
                  <div className="mt-2 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <p>1. 리멤버 앱에서 명함 내보내기 파일을 준비해주세요.</p>
                    <p>2. 아래 이메일 주소로 파일을 보내주시면 확인 후 반영돼요.</p>
                  </div>
                  <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
                    <div className="micro-text mb-2">인증 이메일 주소</div>
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1 truncate text-sm font-mono font-bold text-[var(--color-text-strong)]">
                        gangjunmin@data.byro.io
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('gangjunmin@data.byro.io').catch(() => {})
                          showToast('복사됐어요!')
                        }}
                        className="rounded-xl bg-[var(--color-accent-dark)] px-3 py-2 text-xs font-semibold text-white"
                      >
                        복사
                      </button>
                    </div>
                    <div className="micro-text mt-3">{selectedCert.docLabel}</div>
                  </div>
                </>
              )}

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setSheetMode('picker')}>이전</Button>
                <Button onClick={() => { setPickerOpen(false); setSheetMode('picker'); setSelectedCert(null) }}>확인</Button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      <YearPickerSheet
        open={yearPickerTarget !== null}
        onClose={() => setYearPickerTarget(null)}
        title={
          yearPickerTarget === 'career-start' ? '시작 연도 선택'
            : yearPickerTarget === 'career-end' ? '종료 연도 선택'
              : '연도 선택'
        }
        value={
          yearPickerTarget === 'career-start' ? hlStartYear
            : yearPickerTarget === 'career-end' ? hlEndYear
              : hlEducationYear
        }
        options={yearOptions}
        onSelect={(value) => {
          if (yearPickerTarget === 'career-start') setHlStartYear(value)
          if (yearPickerTarget === 'career-end') setHlEndYear(value)
          if (yearPickerTarget === 'education-year') setHlEducationYear(value)
        }}
      />
    </div>
  )
}

// ─── Step 8-S: 자기소개 방법 선택 ────────────────────────
function Step8Select() {
  const store = useByroStore()
  const [noDataModal, setNoDataModal] = useState(false)

  const hasData = store.instagramConnected || store.linkedinConnected || store.selectedKeywords.length > 0

  const handleAI = () => {
    if (!hasData) {
      setNoDataModal(true)
      return
    }
    store.setSelectedBioMethod('ai')
    store.goToStep('bio-ai')
  }

  const handleManual = () => {
    store.setSelectedBioMethod('manual')
    store.goToStep('bio-ai')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Bio"
        title={'자기소개를\n어떻게 작성할까요?'}
        description={'직접 쓰거나 AI 초안을 받을 수 있어요.'}
      />

      <div className="space-y-3">
        <SelectionCard
          icon={<Sparkles size={18} />}
          title="AI가 자기소개 작성하기"
          subtitle="SNS·키워드 기반으로 초안을 만들어드려요"
          tone="accent"
          onClick={handleAI}
        >
          {!hasData && (
            <div className="rounded-lg px-2 py-1.5 text-xs" style={{ backgroundColor: '#FFF8E6', color: '#7A5A00' }}>
              AI 초안을 만들려면 키워드, SNS, 하이라이트 중 하나 이상이 필요해요
            </div>
          )}
          {hasData && (
            <div className="flex flex-wrap gap-1">
              {store.instagramConnected && <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}><Image src="/images/Instagram.svg" alt="" width={12} height={12} className="w-3 h-3" /> Instagram</span>}
              {store.linkedinConnected && <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}><Image src="/images/linkedin.png" alt="" width={12} height={12} className="w-3 h-3" /> LinkedIn</span>}
              {store.selectedKeywords.length > 0 && <span className="text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}>키워드 {store.selectedKeywords.length}개</span>}
            </div>
          )}
        </SelectionCard>

        <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
          <span>또는</span>
          <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        </div>

        {/* 직접 작성 카드 */}
        <SelectionCard
          icon={<Pencil size={18} />}
          title="직접 작성하기"
          subtitle="내 말로 바로 작성할게요"
          onClick={handleManual}
        />
      </div>

      <button className="text-center text-sm text-[var(--color-text-secondary)] mt-6" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
        나중에 작성하기
      </button>

      {/* 정보 부족 모달 */}
      <Modal open={noDataModal} onClose={() => { setNoDataModal(false); store.prevStep() }}>
        <div className="text-center">
          <div className="mb-2 flex justify-center text-[var(--color-state-danger-text)]">
            <AlertCircle size={20} />
          </div>
          <div className="text-sm font-black mb-2">정보가 부족해요</div>
          <div className="meta-text leading-relaxed mb-4">
            AI 초안을 만들려면 아래 정보가 하나 이상 필요해요.
            <br /><br />
            <b>· 평판 키워드</b><br />
            <b>· SNS 연동</b><br />
            <b>· 하이라이트</b>
          </div>
          <div className="space-y-2">
            <Button onClick={() => { setNoDataModal(false); store.goToStep('keywords') }}>정보 추가하러 가기</Button>
            <Button variant="outline" onClick={() => { setNoDataModal(false); handleManual() }}>직접 작성하기</Button>
            <button className="text-xs text-[var(--color-text-secondary)] mt-1" onClick={() => { setNoDataModal(false); store.completeOnboarding(); store.goToStep('complete') }}>나중에 작성하기</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ─── Step 8-A: AI 자기소개 / Step 8-B: 직접 작성 (분기) ───
function Step8AI() {
  const store = useByroStore()
  const isManual = store.selectedBioMethod === 'manual'

  // AI 모드 상태
  const [phase, setPhase] = useState<'loading' | 'done' | 'edit'>(isManual ? 'edit' : 'loading')
  const [bioText, setBioText] = useState('')
  const [aiIndex, setAiIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (isManual) return  // 직접 작성 모드는 로딩 없음
    timerRef.current = setTimeout(() => {
      setBioText(AI_BIO_CANDIDATES[aiIndex])
      setPhase('done')
    }, 2200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiIndex])

  const handleRegenerate = () => {
    setPhase('loading')
    const next = (aiIndex + 1) % AI_BIO_CANDIDATES.length
    setAiIndex(next)
    timerRef.current = setTimeout(() => {
      setBioText(AI_BIO_CANDIDATES[next])
      setPhase('done')
    }, 2200)
  }

  const handleComplete = () => {
    store.setBio(bioText, isManual ? 'manual' : 'ai')
    store.completeOnboarding()
    store.goToStep('complete')
  }

  // ── 직접 작성 모드 ──────────────────────────────────────
  if (isManual) {
    return (
      <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Bio"
        title={'자기소개를 직접\n작성해주세요'}
        description={'나를 잘 보여주는 문장으로 적어주세요.'}
      />

        <label className="text-xs font-bold text-[#555] uppercase tracking-wide mb-2">자기소개</label>
        <TextArea
          value={bioText}
          onChange={setBioText}
          placeholder="예: 창업 3년차. 사람을 만나고 연결하는 걸 좋아합니다."
          maxLength={200}
          rows={6}
        />
        <div className="bg-[#E3F2FD] border border-[#90CAF9] rounded-lg px-3 py-2 text-xs text-[#0D47A1] mt-3 mb-6">
          나중에 AI 초안으로 바꿀 수 있어요.
        </div>

        <div className="space-y-2">
          <Button onClick={handleComplete}>완료</Button>
          <button className="w-full text-center text-sm text-[#888]" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
            나중에 작성하기
          </button>
        </div>
      </div>
    )
  }

  // ── AI 모드 ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="AI Draft"
        title={'AI가 나를 소개해드릴게요'}
        description={'입력한 정보를 바탕으로 초안을 만들었어요.'}
      />

      {phase === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AiBounce />
          <div className="text-sm text-[#888]">소개 문구를 만들고 있어요</div>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="relative bg-[#E6F5E6] border border-[#A5D6A7] rounded-xl p-4 mb-3">
            <div className="text-xs font-bold text-[#1A7A1A] mb-2">AI 초안</div>
            <p className="text-sm text-[#1A7A1A] leading-relaxed pr-10">{bioText}</p>
            <button
              onClick={() => setPhase('edit')}
              className="absolute top-3 right-3 flex items-center gap-1 text-xs text-[#555] bg-white border border-[#ddd] rounded-lg px-2 py-1"
            >
              수정
            </button>
          </div>
          <Button variant="outline" onClick={handleRegenerate}>다시 만들기</Button>
          <div className="h-4" />
        </>
      )}

      {phase === 'edit' && (
        <div className="mb-4">
          <TextArea value={bioText} onChange={setBioText} placeholder="자기소개를 입력해주세요" rows={6} />
        </div>
      )}

      {phase !== 'loading' && (
        <div className="space-y-2">
          <Button onClick={handleComplete}>완료</Button>
          <button className="w-full text-center text-sm text-[#888]" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
            나중에 작성하기
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Step 8: 프로필 완성 ──────────────────────────────────
function Step9Complete() {
  const store = useByroStore()
  const router = useRouter()
  const linkId = store.linkId || 'myongkoo'

  useEffect(() => {
    // completeOnboarding 아직 안 됐다면 처리
    if (!store.isLoggedIn) {
      store.completeOnboarding()
    }
  }, [store])

  const handleCopy = () => {
    navigator.clipboard.writeText(`byro.io/@${linkId}`).catch(() => {})
    showToast('링크가 복사됐어요!')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-6 items-center text-center">
      <div className="w-full rounded-[30px] border border-[#EBEBEB] bg-white px-5 py-7 mb-6">
        <div className="mb-4 flex justify-center text-[var(--color-state-success-text)]">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black mb-2">Byro를<br />만들었어요</h2>
        <p className="text-sm text-[#555] mb-6">이제 링크로 바로 공유할 수 있어요.</p>

        {/* 링크 복사 */}
        <div className="w-full flex items-center bg-[#f8f8f8] border border-[#EBEBEB] rounded-xl px-4 py-3">
          <span className="flex-1 text-sm text-[#333] text-left">byro.io/@{linkId}</span>
          <button onClick={handleCopy} className="text-xs font-bold text-[#0A0A0A] ml-3 flex-shrink-0">복사</button>
        </div>
      </div>

      <div className="w-full space-y-3">
        <Button onClick={() => router.push('/me')}>내 Byro 보러가기</Button>
        <Button variant="outline" onClick={() => router.push('/me')}>프로필 더 꾸미기</Button>
      </div>
    </div>
  )
}
