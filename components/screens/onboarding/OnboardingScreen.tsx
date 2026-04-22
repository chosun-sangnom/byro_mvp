'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Mail, MessageCircle, Phone, Send, Trash2 } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import {
  NavBar, StepBar, Button, Chip, CheckRow, BottomSheet, Modal,
  InfoBox, TextArea, AiBounce, showToast,
} from '@/components/ui'
import type { ContactChannel } from '@/types'
import {
  KEYWORD_GROUPS, HIGHLIGHT_CATEGORIES, AI_BIO_CANDIDATES,
  INSTAGRAM_PROFILE, LINKEDIN_PROFILE,
} from '@/lib/mockData'

const STEP_NUMS: Record<string, number> = {
  login: 0, verify: 1, linkid: 2, keywords: 3, sns: 4,
  contact: 5, highlight: 6, 'bio-select': 7, 'bio-ai': 8, complete: 9,
}

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

  const hasBack = stepNum >= 3 // Step 3(linkid)부터 이전 버튼

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
    telegram: Send,
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
  if (id === 'telegram') return trimmed.startsWith('http') ? trimmed : `https://t.me/${trimmed.replace(/^@/, '')}`
  return ''
}

function contactPlaceholder(id?: ContactChannel['id']) {
  if (id === 'phone') return '010-1234-5678'
  if (id === 'email') return 'name@byro.io'
  if (id === 'kakao') return 'openchat 코드 또는 URL'
  if (id === 'telegram') return '@username 또는 URL'
  return ''
}

function contactPreview(id?: ContactChannel['id'], value?: string) {
  if (!id) return ''
  if (!value?.trim()) return '값을 비우면 비활성화 상태로 저장할 수 있어요.'
  return buildContactHref(id, value)
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
        <div className="micro-text uppercase tracking-[0.18em] mb-2">Welcome</div>
        <div className="text-3xl font-black mb-2">Byro</div>
        <div className="text-lg font-black text-[var(--color-text-strong)] leading-snug">
          말하지 않아도<br />증명되는 나
        </div>
        <div className="meta-text mt-3 leading-relaxed">
          3분 안에 오프라인 신뢰 프로필을 만들고
          <br />
          링크 하나로 공유할 수 있어요.
        </div>
      </div>
      <div className="space-y-3">
        <Button variant="kakao" onClick={handleSocial}>💬 카카오로 시작하기</Button>
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
        description={'이름은 본인인증을 통해 확인됩니다.\n인증 후에는 수정이 어려워요.'}
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
          💬 SMS 인증 — 휴대폰 문자 인증 →
        </Button>
        <Button variant="kakao" disabled={!canProceed} onClick={handleVerify}>
          💛 카카오 인증 — 카카오페이 전자서명 →
        </Button>
      </div>

      <InfoBox variant="info">
        🔒 인증된 이름은 프로필에 실명으로 표시됩니다.
      </InfoBox>
    </div>
  )
}

// ─── Step 3: 링크 ID ──────────────────────────────────────
function Step3LinkId() {
  const store = useByroStore()
  const [input, setInput] = useState(store.linkId)
  const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle')

  const LINK_REGEX = /^[a-z0-9_]{4,20}$/

  const handleChange = (v: string) => {
    setInput(v)
    store.setLinkId(v)
    if (v.length === 0) setStatus('idle')
    else if (LINK_REGEX.test(v)) setStatus('valid')
    else setStatus('error')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-4">
      <StepIntro
        eyebrow="Link"
        title={'나만의 Byro 링크를\n만들어보세요'}
        description={'한 번 설정하면 변경이 어렵습니다.\n공유하기 쉬운 ID를 추천합니다.'}
      />
      <InfoBox variant="warn">
        🔒 <b>오픈베타 전용 기능</b><br />
        현재 오픈베타 참여자에게만 무료. 정식 출시 후 유료 전환 예정.
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
      {status === 'valid' && <p className="text-xs text-[var(--color-state-success-text)] mb-3">✓ 사용 가능한 ID예요</p>}
      {status === 'error' && <p className="text-xs text-[var(--color-state-danger-text)] mb-3">영문 소문자, 숫자, 밑줄(_)만 가능 · 4~20자</p>}
      <p className="meta-text mb-6">· 영문 소문자, 숫자, 밑줄(_) &nbsp;· 4~20자 이내</p>
      {input && status !== 'error' && (
        <div className="surface-card-soft rounded-2xl px-4 py-3 mb-5">
          <div className="micro-text mb-1">미리보기</div>
          <div className="text-sm font-semibold text-[var(--color-text-strong)]">byro.io/@{input}</div>
        </div>
      )}

      <Button disabled={status !== 'valid'} onClick={() => store.nextStep()}>다음</Button>
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
          description={'방문자가 평가할 때 사용할 키워드예요.\n최대 5개까지 선택할 수 있습니다.'}
        />
        <div className="rounded-lg px-3 py-2 text-xs flex justify-between mb-4" style={{ backgroundColor: 'var(--color-state-info-bg)', border: '1px solid var(--color-state-info-text)', color: 'var(--color-state-info-text)' }}>
          <span>✨ AI 자기소개 생성에도 활용돼요</span>
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

      <div className="px-5 pb-5 space-y-2 border-t border-[#EBEBEB] pt-3">
        <Button onClick={() => store.nextStep()}>다음</Button>
        <button className="w-full text-center text-sm text-[#888]" onClick={() => store.nextStep()}>건너뛰기</button>
      </div>
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
        description={'하드코딩된 프로필 주소를 기준으로\n시안용 미리보기를 연결합니다.'}
      />

      {/* Instagram */}
      <div className="space-y-3">
        <SelectionCard
          icon={<Image src="/images/Instagram.svg" alt="Instagram" width={24} height={24} className="w-6 h-6" />}
          title="Instagram"
          subtitle={store.instagramConnected ? `@${INSTAGRAM_PROFILE.username} 연동됨` : '하드코딩된 Instagram 주소를 연결해 미리보기를 보여줍니다.'}
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
          subtitle={store.linkedinConnected ? 'myongkoo-kang 연동됨' : '하드코딩된 LinkedIn 주소로 커리어 요약을 보여줍니다.'}
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
        🔒 SNS 미연동 시 해당 섹션은 프로필에 공개되지 않아요.
      </InfoBox>

      <div className="mt-auto pt-4 space-y-2">
        <Button onClick={() => store.nextStep()}>다음</Button>
        <button className="w-full text-center text-sm text-[var(--color-text-secondary)]" onClick={() => store.nextStep()}>나중에 연동하기</button>
      </div>
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
          description={'프로필을 본 사람이 바로 연락할 수 있어요.\n전화, 이메일, 카카오, 텔레그램 중 원하는 것만 연결하면 됩니다.'}
        />

        <div className="surface-card-soft p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-[var(--color-text-strong)]">연결된 연락 수단</div>
              <div className="meta-text mt-1">온보딩 후에도 Byro 편집에서 언제든 바꿀 수 있어요.</div>
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

      <div className="px-5 pb-5 pt-3 border-t border-[#EBEBEB] space-y-2">
        <Button onClick={() => store.nextStep()}>다음</Button>
        <button className="w-full text-center text-sm text-[var(--color-text-secondary)]" onClick={() => store.nextStep()}>나중에 연결하기</button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="text-sm font-black mb-4">{selectedChannel?.label ?? '연락 수단'} 설정</div>
          {selectedChannel && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <ContactTypeIcon channelId={selectedChannel.id} enabled={Boolean(inputValue.trim())} />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--color-text-strong)]">{selectedChannel.label}</div>
                  <div className="meta-text">{selectedChannel.id === 'phone' ? '전화번호를 입력하면 바로 걸 수 있어요.' : selectedChannel.id === 'email' ? '이메일 주소를 입력하면 메일로 연결돼요.' : selectedChannel.id === 'kakao' ? '오픈채팅 링크나 코드를 입력해 주세요.' : '텔레그램 사용자명이나 링크를 입력해 주세요.'}</div>
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
  const [sheetOpen, setSheetOpen] = useState(false)
  const certItems = [
    {
      icon: '💼',
      title: '재직기간 인증',
      sub: '건강보험공단 기준으로 재직 지속 기간 확인',
      badge: '인증 가능',
      docLabel: '건강보험 관련 재직 증빙',
    },
    {
      icon: '🤝',
      title: '리멤버 직업 네트워크',
      sub: '리멤버 앱 명함 내보내기로 네트워크 인증',
      badge: '인증 가능',
      docLabel: '리멤버 명함 내보내기 파일',
    },
    {
      icon: '🏢',
      title: '법인 영속성',
      sub: '법인 운영 기간과 정상 운영 여부 확인',
      badge: '인증 가능',
      docLabel: '법인 운영 증빙 서류',
    },
    {
      icon: '✈️',
      title: '항공 마일리지',
      sub: '항공사 회원 등급으로 출장형 프로필 인증',
      badge: '인증 가능',
      docLabel: '항공사 등급 확인 자료',
    },
  ] as const
  const [selectedCert, setSelectedCert] = useState<(typeof certItems)[number] | null>(null)
  const certModalOpen = selectedCert !== null

  // 직접 입력 폼 상태
  const [selectedCat, setSelectedCat] = useState<typeof HIGHLIGHT_CATEGORIES[0] | null>(null)
  const [hlTitle, setHlTitle] = useState('')
  const [hlYear, setHlYear] = useState('')
  const [hlDesc, setHlDesc] = useState('')

  const handleAddHighlight = () => {
    if (!selectedCat || !hlTitle) {
      showToast('카테고리와 제목을 입력해주세요')
      return
    }
    store.addHighlight({
      icon: selectedCat.icon,
      title: hlTitle,
      subtitle: `${selectedCat.label} · 직접 입력`,
      description: hlDesc,
      year: hlYear,
    })
    setSheetOpen(false)
    setSelectedCat(null)
    setHlTitle('')
    setHlYear('')
    setHlDesc('')
    showToast('하이라이트가 추가됐어요!')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <StepIntro
          eyebrow="Highlight"
          title={'커리어 하이라이트를\n추가해보세요'}
          description={'인증된 정보와 직접 입력한 경험을 함께 보여주면\n프로필 신뢰도가 더 올라갑니다.'}
        />

        {/* 인증 가능 항목 */}
        <div className="space-y-2 mb-4">
          {certItems.map((item) => (
            <SelectionCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.sub}
              badge={item.badge}
            >
              <button
                onClick={() => setSelectedCert(item)}
                className="text-xs text-white rounded-lg px-3 py-1.5"
                style={{ backgroundColor: 'var(--color-accent-dark)' }}
              >
                인증하기
              </button>
            </SelectionCard>
          ))}
        </div>

        {/* 직접 입력 목록 */}
        {store.highlights.length > 0 && (
          <div className="space-y-2 mb-4">
            {store.highlights.map((h) => (
              <div key={h.id} className="surface-card flex items-start rounded-[22px] p-3">
                <span className="text-lg mr-2 mt-0.5">{h.icon}</span>
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

        {/* 직접 입력 추가 버튼 */}
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full border border-dashed rounded-xl py-3 text-sm font-medium"
          style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
        >
          + 강연, 협업, 수상 등 추가하기
        </button>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[#EBEBEB] space-y-2">
        <Button onClick={() => store.nextStep()}>다음</Button>
        <button className="w-full text-center text-sm text-[var(--color-text-secondary)]" onClick={() => store.nextStep()}>나중에 추가하기</button>
      </div>

      {/* 인증 이메일 모달 */}
      <Modal open={certModalOpen} onClose={() => setSelectedCert(null)}>
        <div className="text-center">
          <div className="text-xl mb-3">📧</div>
          <div className="text-sm font-black mb-2">인증 서류 발송</div>
          <div className="meta-text leading-relaxed mb-4">
            아래 이메일로 {selectedCert?.docLabel ?? '인증 자료를'}<br />발송해주세요.
          </div>
          <div className="surface-card-soft rounded-xl px-3 py-2 text-sm font-mono text-[var(--color-accent-dark)] mb-4">
            gangjunmin@data.byro.io
          </div>
          <Button onClick={() => setSelectedCert(null)}>확인</Button>
        </div>
      </Modal>

      {/* 직접 입력 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="text-sm font-black mb-4">경험 추가하기</div>

          {/* 카테고리 그리드 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {HIGHLIGHT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat)}
                className={[
                  'flex flex-col items-center p-2 rounded-xl border text-center transition-all',
                  selectedCat?.id === cat.id
                    ? 'bg-[var(--color-accent-dark)] border-[var(--color-accent-dark)] text-white'
                    : 'border-[var(--color-border-default)] text-[var(--color-text-secondary)]',
                ].join(' ')}
              >
                <span className="text-lg mb-1">{cat.icon}</span>
                <span className="text-[10px] font-semibold leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <input
              value={hlTitle}
              onChange={(e) => setHlTitle(e.target.value)}
              placeholder="제목 (필수)"
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
            <input
              value={hlYear}
              onChange={(e) => setHlYear(e.target.value)}
              placeholder="연도 (예: 2023)"
              type="number"
              className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ borderColor: 'var(--color-border-default)' }}
            />
            <TextArea
              value={hlDesc}
              onChange={setHlDesc}
              placeholder="설명 (선택, 150자)"
              maxLength={150}
              rows={3}
            />
          </div>

          <Button onClick={handleAddHighlight}>추가하기</Button>
        </div>
      </BottomSheet>
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
        description={'지금까지 입력한 정보와 연동된 SNS를 활용해\n자기소개를 만들 수 있어요.'}
      />

      <div className="space-y-3">
        <SelectionCard
          icon="✨"
          title="AI가 자기소개 작성하기"
          subtitle="SNS·키워드 기반으로 초안을 만들어드려요"
          tone="accent"
          onClick={handleAI}
        >
          {!hasData && (
            <div className="rounded-lg px-2 py-1.5 text-xs" style={{ backgroundColor: '#FFF8E6', color: '#7A5A00' }}>
              ⚠️ AI 초안 생성에는 키워드·SNS·하이라이트 중 최소 1개가 필요해요
            </div>
          )}
          {hasData && (
            <div className="flex flex-wrap gap-1">
              {store.instagramConnected && <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}><Image src="/images/Instagram.svg" alt="" width={12} height={12} className="w-3 h-3" /> Instagram</span>}
              {store.linkedinConnected && <span className="inline-flex items-center gap-1 text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}><Image src="/images/linkedin.png" alt="" width={12} height={12} className="w-3 h-3" /> LinkedIn</span>}
              {store.selectedKeywords.length > 0 && <span className="text-xs bg-white rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--color-border-default)' }}>🏷 키워드 {store.selectedKeywords.length}개</span>}
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
          icon="✍️"
          title="직접 작성하기"
          subtitle="내 말로 자유롭게 작성해요"
          onClick={handleManual}
        />
      </div>

      <button className="text-center text-sm text-[var(--color-text-secondary)] mt-6" onClick={() => { store.completeOnboarding(); store.goToStep('complete') }}>
        나중에 작성하기
      </button>

      {/* 정보 부족 모달 */}
      <Modal open={noDataModal} onClose={() => { setNoDataModal(false); store.prevStep() }}>
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm font-black mb-2">정보가 부족해요</div>
          <div className="meta-text leading-relaxed mb-4">
            AI 자기소개를 만들려면<br />아래 중 하나 이상이 필요해요.<br /><br />
            <b>· 평판 키워드 선택</b><br />
            <b>· SNS 연동</b><br />
            <b>· 하이라이트 인증</b>
          </div>
          <div className="space-y-2">
            <Button onClick={() => { setNoDataModal(false); store.goToStep('keywords') }}>← 정보 추가하러 가기</Button>
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
          description={'나를 잘 표현하는 문장으로 자유롭게 써보세요.'}
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
          💡 나중에 AI 자기소개로 바꿀 수 있어요
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
        description={'지금까지 입력한 정보를 바탕으로 자기소개 초안을 만들었어요.'}
      />

      {phase === 'loading' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AiBounce />
          <div className="text-sm text-[#888]">SNS 분석 중...</div>
        </div>
      )}

      {phase === 'done' && (
        <>
          <div className="relative bg-[#E6F5E6] border border-[#A5D6A7] rounded-xl p-4 mb-3">
            <div className="text-xs font-bold text-[#1A7A1A] mb-2">✨ AI 초안 · 키워드 + SNS 기반</div>
            <p className="text-sm text-[#1A7A1A] leading-relaxed pr-10">{bioText}</p>
            <button
              onClick={() => setPhase('edit')}
              className="absolute top-3 right-3 flex items-center gap-1 text-xs text-[#555] bg-white border border-[#ddd] rounded-lg px-2 py-1"
            >
              ✏️ 수정
            </button>
          </div>
          <Button variant="outline" onClick={handleRegenerate}>🔄 다시 생성하기</Button>
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
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2">내 Byro가<br />만들어졌어요!</h2>
        <p className="text-sm text-[#555] mb-6">이제 나의 신뢰 프로필을 공유해보세요</p>

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
