'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useByroStore } from '@/store/useByroStore'
import { BottomSheet, Button, Chip, InfoBox, showToast } from '@/components/ui'
import { ContactTypeIcon } from '@/components/contact/ContactTypeIcon'
import { StepFooter, StepIntro, SelectionCard } from '@/components/screens/onboarding/OnboardingShared'
import type { ContactChannel } from '@/types'
import { KEYWORD_GROUPS } from '@/lib/mocks/keywords'
import { INSTAGRAM_PROFILE, LINKEDIN_PROFILE } from '@/lib/mocks/socialProfiles'
import { buildContactHref, contactPlaceholder, contactPreview } from '@/lib/contactChannels'

export function Step4Keywords() {
  const store = useByroStore()
  const { selectedKeywords } = store

  const handleToggle = (keyword: string) => {
    if (!selectedKeywords.includes(keyword) && selectedKeywords.length >= 5) {
      showToast('키워드는 최대 5개까지 선택할 수 있어요')
      return
    }
    store.toggleKeyword(keyword)
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

        {KEYWORD_GROUPS.map((group, index) => (
          <div key={group.category} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[var(--color-accent-dark)] text-white text-xs font-bold rounded px-1.5 py-0.5">{index + 1}</span>
              <span className="text-xs font-bold text-[var(--color-text-secondary)]">{group.category}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {group.keywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  selected={selectedKeywords.includes(keyword)}
                  onClick={() => handleToggle(keyword)}
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

export function Step5SNS() {
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

export function Step6Contact() {
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
                onChange={(event) => setInputValue(event.target.value)}
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
