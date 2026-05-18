'use client'

import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { BottomSheet, Button, NavBar, showToast } from '@/components/ui'
import { INSTAGRAM_PROFILE } from '@/lib/mocks/socialProfiles'

type SnsId = 'instagram' | 'linkedin'

interface SnsConfig {
  id: SnsId
  label: string
  bg: string
  iconLabel: string
  placeholder: string
  urlPrefix: string
  hint: string
}

const SNS_CONFIG: SnsConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    bg: '#C13584',
    iconLabel: 'ig',
    placeholder: 'sss_uuo',
    urlPrefix: 'instagram.com/',
    hint: '아이디만 입력하면 연동됩니다',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    bg: '#0A66C2',
    iconLabel: 'in',
    placeholder: 'myongkoo-kang',
    urlPrefix: 'linkedin.com/in/',
    hint: '프로필 URL 또는 아이디를 입력해주세요',
  },
]

export function SNSManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSns, setSelectedSns] = useState<SnsId | null>(null)
  const [inputValue, setInputValue] = useState('')

  const isConnected = (id: SnsId) =>
    id === 'instagram' ? store.instagramConnected : store.linkedinConnected

  const openSheet = (id: SnsId) => {
    setSelectedSns(id)
    setInputValue(id === 'instagram' ? INSTAGRAM_PROFILE.username : 'myongkoo-kang')
    setSheetOpen(true)
  }

  const handleConnect = () => {
    if (selectedSns === 'instagram') store.connectInstagram()
    if (selectedSns === 'linkedin') store.connectLinkedIn()
    setSheetOpen(false)
    showToast('SNS 연동이 완료됐어요!')
  }

  const handleDisconnect = () => {
    if (selectedSns === 'instagram') store.disconnectInstagram()
    if (selectedSns === 'linkedin') store.disconnectLinkedIn()
    setSheetOpen(false)
    showToast('SNS 연동이 해제됐어요')
  }

  const cfg = SNS_CONFIG.find((c) => c.id === selectedSns)
  const connected = selectedSns ? isConnected(selectedSns) : false

  return (
    <div className="flex flex-col h-full">
      <NavBar title="SNS 연동" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="mb-4 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
          연동하면 AI 요약과 게시물 미리보기를 프로필에 표시할 수 있어요.
        </p>

        {/* 연동 가능 SNS */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)] mb-4">
          {SNS_CONFIG.map(({ id, label, bg, iconLabel }, i) => {
            const active = isConnected(id)
            return (
              <button
                key={id}
                onClick={() => openSheet(id)}
                className={[
                  'flex w-full items-center gap-3 px-5 py-4 text-left transition-colors active:bg-white/[0.03]',
                  i < SNS_CONFIG.length - 1 ? 'border-b border-[var(--color-border-soft)]' : '',
                ].join(' ')}
              >
                <SnsIcon label={iconLabel} bg={bg} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                    {active ? '연동됨' : '연동하기'}
                  </p>
                </div>
                <span className={[
                  'flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold mr-2',
                  active
                    ? 'bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]'
                    : 'bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]',
                ].join(' ')}>
                  {active ? '연동됨' : '미연동'}
                </span>
                <ChevronRight size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)] opacity-30" />
              </button>
            )
          })}
        </div>

        {/* 준비중 SNS */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)]">
          {([
            { label: 'YouTube', bg: '#FF0000', iconLabel: 'YT' },
            { label: 'TikTok',  bg: '#111111', iconLabel: 'TT' },
          ] as const).map(({ label, bg, iconLabel }, i) => (
            <div
              key={label}
              className={[
                'flex items-center gap-3 px-5 py-4 opacity-40',
                i === 0 ? 'border-b border-[var(--color-border-soft)]' : '',
              ].join(' ')}
            >
              <SnsIcon label={iconLabel} bg={bg} />
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-[var(--color-text-primary)]">{label}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">준비중</p>
              </div>
              <span className="rounded-full bg-[var(--color-bg-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-text-tertiary)]">
                준비중
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 연동 바텀시트 */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {cfg && (
          <div className="px-5 pb-6">
            <div className="flex items-center gap-3 mb-5">
              <SnsIcon label={cfg.iconLabel} bg={cfg.bg} />
              <div>
                <p className="text-[15px] font-black">{cfg.label} {connected ? '연동 관리' : '연동하기'}</p>
                <p className="text-[12px] text-[var(--color-text-tertiary)]">{cfg.hint}</p>
              </div>
            </div>

            <label className="text-[12px] text-[var(--color-text-secondary)] mb-1.5 block">{cfg.label} 아이디</label>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={cfg.placeholder}
              className="w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-4 py-3 text-sm outline-none mb-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
            />
            <p className="text-[11px] text-[var(--color-text-tertiary)] mb-5">
              {cfg.urlPrefix}{inputValue || cfg.placeholder}
            </p>

            <div className="space-y-2">
              <Button onClick={handleConnect}>연동하기</Button>
              <Button variant="outline" disabled={!connected} onClick={handleDisconnect}>
                연동 해제
              </Button>
              <Button variant="ghost" onClick={() => setSheetOpen(false)}>취소</Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

function SnsIcon({ label, bg }: { label: string; bg: string }): ReactNode {
  return (
    <div
      className="h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-bold"
      style={{ backgroundColor: bg }}
    >
      {label}
    </div>
  )
}
