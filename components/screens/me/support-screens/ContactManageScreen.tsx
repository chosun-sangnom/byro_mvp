'use client'

import { useState } from 'react'
import { useByroStore } from '@/store/useByroStore'
import { BottomSheet, Button, NavBar, showToast } from '@/components/ui'
import { ContactTypeIcon } from '@/components/contact/ContactTypeIcon'
import type { ContactChannel } from '@/types'
import { buildContactHref, contactPlaceholder, contactPreview } from '@/lib/contactChannels'
import { SAMPLE_PROFILE } from '@/lib/mocks/publicProfiles'

export function ContactManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const initialChannels: ContactChannel[] = (store.user?.contactChannels ?? SAMPLE_PROFILE.contactChannels) as ContactChannel[]
  const [channels, setChannels] = useState<ContactChannel[]>(initialChannels)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null)
  const [inputValue, setInputValue] = useState('')

  const openSheet = (channel: ContactChannel) => {
    setSelectedChannel(channel)
    setInputValue(channel.value)
    setSheetOpen(true)
  }

  const updateChannel = (id: ContactChannel['id'], patch: Partial<ContactChannel>) => {
    setChannels((prev) => prev.map((channel) => (channel.id === id ? { ...channel, ...patch } : channel)))
  }

  const handleSaveChannel = () => {
    if (!selectedChannel) return
    const trimmed = inputValue.trim()
    updateChannel(selectedChannel.id, {
      value: trimmed,
      enabled: trimmed.length > 0,
      href: buildContactHref(selectedChannel.id, trimmed),
    })
    setSheetOpen(false)
    showToast('연락 수단이 저장됐어요')
  }

  const handleDisableChannel = () => {
    if (!selectedChannel) return
    updateChannel(selectedChannel.id, { enabled: false })
    setSheetOpen(false)
    showToast('비활성화됐어요')
  }

  const handleApply = () => {
    store.updateUserContactChannels(channels)
    showToast('연락 수단 설정이 반영됐어요')
    onBack()
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="연락 수단 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-5">공개 프로필 상단 버튼에 노출될 연락 수단을 켜고 끌 수 있어요.</div>
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => openSheet(channel)}
              className="flex items-center w-full py-3 border-b border-[var(--color-border-soft)] text-left"
            >
              <div className="mr-3">
                <ContactTypeIcon channelId={channel.id} enabled={channel.enabled} variant="mono" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-[var(--color-text-primary)]">{channel.label}</div>
                <div className="text-xs text-[var(--color-text-tertiary)]">
                  {channel.enabled ? channel.value || '연결됨' : '비활성화됨'}
                </div>
              </div>
              <span className={['text-[11px] font-semibold rounded-full px-2 py-1', channel.enabled ? 'bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]'].join(' ')}>
                {channel.enabled ? '활성' : '비활성'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border-soft)]">
        <Button onClick={handleApply}>적용하기</Button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedChannel && <ContactTypeIcon channelId={selectedChannel.id} enabled={selectedChannel.enabled} variant="mono" />}
            <div>
              <div className="text-sm font-black">{selectedChannel?.label} 연동</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">값이 있으면 활성화되고, 비우면 버튼만 비활성화됩니다.</div>
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">{selectedChannel?.label}</div>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={contactPlaceholder(selectedChannel?.id)}
            className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-3 text-sm outline-none mb-2 bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <div className="text-[11px] text-[var(--color-text-tertiary)] mb-4">{contactPreview(selectedChannel?.id, inputValue)}</div>
          <div className="space-y-2">
            <Button onClick={handleSaveChannel}>저장하기</Button>
            <Button variant="outline" onClick={handleDisableChannel}>비활성화</Button>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>취소</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
