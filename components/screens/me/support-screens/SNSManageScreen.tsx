'use client'

import { useState, type ReactNode } from 'react'
import { useByroStore } from '@/store/useByroStore'
import { BottomSheet, Button, showToast } from '@/components/ui'
import { INSTAGRAM_PROFILE } from '@/lib/mocks/socialProfiles'

export function SNSManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSns, setSelectedSns] = useState<'instagram' | 'linkedin' | null>(null)
  const [inputValue, setInputValue] = useState('')

  const openSheet = (sns: 'instagram' | 'linkedin') => {
    setSelectedSns(sns)
    setInputValue(sns === 'instagram' ? INSTAGRAM_PROFILE.username : 'myongkoo-kang')
    setSheetOpen(true)
  }

  const handleConnect = () => {
    if (selectedSns === 'instagram') store.connectInstagram()
    if (selectedSns === 'linkedin') store.connectLinkedIn()
    setSheetOpen(false)
    showToast('SNS 연동이 완료됐어요!')
  }

  const connected = selectedSns === 'instagram'
    ? store.instagramConnected
    : selectedSns === 'linkedin'
      ? store.linkedinConnected
      : false

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">SNS 연동 관리</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-5">연동하면 AI 요약과 게시물 미리보기를 확인할 수 있어요.</div>
        <div className="space-y-0.5">
          <SnsManageRow
            icon={<SnsIcon label="ig" bg="#C13584" />}
            title="Instagram"
            subtitle="instagram.com/sss_uuo · AI 요약 완료"
            onClick={() => openSheet('instagram')}
          />
          <SnsManageRow
            icon={<SnsIcon label="in" bg="#0A66C2" />}
            title="LinkedIn"
            subtitle="myongkoo-kang · 링크드인 연동하기"
            onClick={() => openSheet('linkedin')}
          />
          <SnsManageRow
            icon={<SnsIcon label="YT" bg="#FF0000" />}
            title="YouTube"
            subtitle="준비중"
            disabled
          />
          <SnsManageRow
            icon={<SnsIcon label="TT" bg="#111111" />}
            title="TikTok"
            subtitle="준비중"
            disabled
          />
        </div>

        <div className="mt-5 rounded-xl bg-[var(--color-bg-soft)] px-4 py-3 text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
          연동된 정보는 시안용 더미 데이터와 함께 표시됩니다.
          연동 해제는 하단 바텀시트에서만 가능합니다.
        </div>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-4">
            {selectedSns === 'instagram' && <SnsIcon label="ig" bg="#C13584" />}
            {selectedSns === 'linkedin' && <SnsIcon label="in" bg="#0A66C2" />}
            <div>
              <div className="text-sm font-black">{selectedSns === 'instagram' ? 'Instagram 연동하기' : 'LinkedIn 연동하기'}</div>
              <div className="text-xs text-[var(--color-text-tertiary)]">
                {selectedSns === 'instagram' ? '아이디만 입력하면 연동됩니다' : '프로필 URL 또는 아이디를 입력해주세요'}
              </div>
            </div>
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] mb-1">{selectedSns === 'instagram' ? 'Instagram 아이디' : 'LinkedIn 아이디'}</div>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder={selectedSns === 'instagram' ? 'sss_uuo' : 'myongkoo-kang'}
            className="w-full border border-[var(--color-border-default)] rounded-xl px-4 py-3 text-sm outline-none mb-2 bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <div className="text-[11px] text-[#AAA] mb-4">
            {selectedSns === 'instagram' ? '예: instagram.com/' : '예: linkedin.com/in/'}{inputValue || (selectedSns === 'instagram' ? 'sss_uuo' : 'myongkoo-kang')}
          </div>
          <div className="space-y-2">
            <Button onClick={handleConnect}>연동하기</Button>
            <Button
              variant="outline"
              disabled={!connected}
              onClick={() => {
                if (selectedSns === 'instagram') store.disconnectInstagram()
                if (selectedSns === 'linkedin') store.disconnectLinkedIn()
                setSheetOpen(false)
                showToast('SNS 연동이 해제됐어요')
              }}
            >
              연동 해제
            </Button>
            <Button variant="ghost" onClick={() => setSheetOpen(false)}>취소</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

function SnsIcon({ label, bg }: { label: string; bg: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: bg }}>
      {label}
    </div>
  )
}

function SnsManageRow({
  icon,
  title,
  subtitle,
  disabled,
  onClick,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center w-full py-3 border-b border-[#F1F1F1] text-left disabled:opacity-45"
    >
      <div className="mr-3">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-[var(--color-text-primary)]">{title}</div>
        <div className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</div>
      </div>
      <span className="text-sm text-[var(--color-text-tertiary)]">{disabled ? '준비중' : '›'}</span>
    </button>
  )
}
