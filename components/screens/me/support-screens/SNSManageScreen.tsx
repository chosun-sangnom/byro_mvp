'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { BottomSheet, Button, NavBar, showToast } from '@/components/ui'
import { INSTAGRAM_PROFILE } from '@/lib/mocks/socialProfiles'

type SnsId = 'instagram' | 'linkedin' | 'youtube' | 'tiktok'

interface SnsConfig {
  id: SnsId
  label: string
  icon: string
  placeholder: string
  hint: string
}

const SNS_CONFIG: SnsConfig[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: '/images/sns/instagram.svg',
    placeholder: 'sss_uuo',
    hint: '아이디만 입력하면 연동됩니다.',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '/images/sns/linkedin.svg',
    placeholder: 'myongkoo-kang',
    hint: '프로필 URL 또는 아이디를 입력해주세요.',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: '/images/sns/youtube.svg',
    placeholder: 'gangminjun',
    hint: '채널 URL 또는 아이디를 입력해주세요.',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: '/images/sns/tiktok.svg',
    placeholder: 'gangminjun',
    hint: '아이디만 입력하면 연동됩니다.',
  },
]

const CONNECTED_FLAG: Record<SnsId, 'instagramConnected' | 'linkedinConnected' | 'youtubeConnected' | 'tiktokConnected'> = {
  instagram: 'instagramConnected',
  linkedin: 'linkedinConnected',
  youtube: 'youtubeConnected',
  tiktok: 'tiktokConnected',
}

const DEFAULT_INPUT: Record<SnsId, string> = {
  instagram: INSTAGRAM_PROFILE.username,
  linkedin: 'myongkoo-kang',
  youtube: 'gangminjun',
  tiktok: 'gangminjun',
}

export function SNSManageScreen({ onBack }: { onBack: () => void }) {
  const store = useFeloreStore()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedSns, setSelectedSns] = useState<SnsId | null>(null)
  const [inputValue, setInputValue] = useState('')

  const isConnected = (id: SnsId) => store[CONNECTED_FLAG[id]]

  const openSheet = (id: SnsId) => {
    setSelectedSns(id)
    setInputValue(DEFAULT_INPUT[id])
    setSheetOpen(true)
  }

  const handleConnect = () => {
    if (!cfg) return
    if (selectedSns === 'instagram') store.connectInstagram()
    if (selectedSns === 'linkedin') store.connectLinkedIn()
    if (selectedSns === 'youtube') store.connectYoutube()
    if (selectedSns === 'tiktok') store.connectTiktok()
    setSheetOpen(false)
    showToast(`${cfg.label} 연동이 완료되었어요!`)
  }

  const handleDisconnect = () => {
    if (!cfg) return
    if (selectedSns === 'instagram') store.disconnectInstagram()
    if (selectedSns === 'linkedin') store.disconnectLinkedIn()
    if (selectedSns === 'youtube') store.disconnectYoutube()
    if (selectedSns === 'tiktok') store.disconnectTiktok()
    setSheetOpen(false)
    showToast(`${cfg.label} 연동이 해제되었어요!`)
  }

  const cfg = SNS_CONFIG.find((c) => c.id === selectedSns)
  const connected = selectedSns ? isConnected(selectedSns) : false

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <NavBar title="" onBack={onBack} onClose={onBack} />

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-6">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-[22px] font-bold leading-[1.35] text-[#0D0D0D]">SNS 연동</h1>
          <p className="text-[16px] font-medium leading-[1.5] text-[#475058]">
            연동하면 AI 요약과 게시물 미리보기를 프로필에 표시할 수 있어요.
          </p>
        </div>

        <div className="overflow-hidden rounded-[12px] border border-[#DEE4EC] px-4">
          {SNS_CONFIG.map(({ id, label, icon }, i) => {
            const active = isConnected(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => openSheet(id)}
                className={[
                  'flex w-full items-center justify-between py-4 text-left',
                  i < SNS_CONFIG.length - 1 ? 'border-b border-[#DEE4EC]' : '',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#F5F6F7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={icon} alt="" className="h-[17px] w-[17px]" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#0D0D0D]">{label}</p>
                    <p className="mt-0.5 text-[12px] font-medium text-[#6C7786]">{active ? '연동됨' : '연동하기'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      'rounded-[6px] px-1.5 py-1 text-[12px] font-bold',
                      active ? 'bg-[#EEFBF2] text-[#11C34B]' : 'bg-[#F5F6F7] text-[#6C7786]',
                    ].join(' ')}
                  >
                    {active ? '연동됨' : '미연동'}
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-[#A8B1BD]" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-5 pb-6">
        <Button onClick={onBack}>적용하기</Button>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        {cfg && (
          <div className="flex flex-col gap-6 px-4 pb-2">
            <div className="flex flex-col gap-2">
              <h2 className="text-[18px] font-bold text-[#0D0D0D]">
                {cfg.label} {connected ? '연동 관리' : '연동하기'}
              </h2>
              <p className="text-[14px] font-medium text-[#475058]">{cfg.hint}</p>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-semibold text-[#0D0D0D]">{cfg.label} 아이디</p>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={cfg.placeholder}
                className="w-full rounded-[10px] border border-[#DEE4EC] bg-white px-3 py-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[#A8B1BD]"
              />
            </div>

            <div className="flex flex-col items-center gap-4">
              {connected ? (
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  style={{ borderRadius: 9999, borderColor: '#DEE4EC', color: '#FF4242', backgroundColor: '#fff' }}
                >
                  연동 해제
                </Button>
              ) : (
                <Button onClick={handleConnect}>연동하기</Button>
              )}
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="text-[14px] font-bold text-[#6C7786]"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
