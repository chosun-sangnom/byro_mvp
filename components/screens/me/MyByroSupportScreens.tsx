'use client'

import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { Button, BottomSheet, Modal, showToast } from '@/components/ui'
import { ContactTypeIcon } from '@/components/contact/ContactTypeIcon'
import type { ContactChannel, Highlight, UserState } from '@/types'
import { buildContactHref, contactPlaceholder, contactPreview } from '@/lib/contactChannels'
import { INSTAGRAM_PROFILE, KEYWORD_GROUPS, SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mockData'

export function ManageByroScreen({
  allHighlights,
  connectedSnsCount,
  totalReputationCount,
  onLogout,
  onBack,
  onEditBasic,
  onEditHighlight,
  onEditSNS,
  onEditReputation,
  onEditContact,
  onEditGuestbook,
  user,
}: {
  allHighlights: Highlight[]
  connectedSnsCount: number
  totalReputationCount: number
  onLogout: () => void
  onBack: () => void
  onEditBasic: () => void
  onEditHighlight: () => void
  onEditSNS: () => void
  onEditReputation: () => void
  onEditContact: () => void
  onEditGuestbook: () => void
  user: UserState
}) {
  const activeContactCount = user.contactChannels?.filter((channel) => channel.enabled && channel.value.trim()).length ?? 0
  const completionChecks = [
    { label: '프로필 사진', done: Boolean(user.avatarImage) },
    { label: '자기소개', done: user.bio.trim().length >= 20 },
    { label: '연락 수단', done: activeContactCount > 0 },
    { label: 'SNS 연동', done: connectedSnsCount > 0 },
    { label: '하이라이트', done: allHighlights.length > 0 },
  ]
  const completionPercent = Math.round((completionChecks.filter((item) => item.done).length / completionChecks.length) * 100)
  const remainingItems = completionChecks.filter((item) => !item.done).slice(0, 3)
  const manageRows = [
    { title: '기본정보', meta: user.bio.trim() ? '사진, 이름, 자기소개 편집' : '사진, 이름, 자기소개를 설정하세요', onClick: onEditBasic },
    { title: '연락 수단', meta: activeContactCount > 0 ? `${activeContactCount}개 연결됨` : '전화, 이메일, 카카오를 연결하세요', onClick: onEditContact },
    { title: 'SNS 연동', meta: connectedSnsCount > 0 ? `${connectedSnsCount}개 연동됨` : '인스타그램과 링크드인을 연결하세요', onClick: onEditSNS },
    { title: '하이라이트', meta: allHighlights.length > 0 ? `${allHighlights.length}개 항목 관리` : '프로필에 보여줄 경험을 추가하세요', onClick: onEditHighlight },
    { title: '평판 키워드', meta: `선택 ${user.selectedKeywords.length}개 · 누적 ${totalReputationCount}회`, onClick: onEditReputation },
    { title: '방명록', meta: `${SAMPLE_PROFILE.guestbook.length}개 메시지 관리`, onClick: onEditGuestbook },
  ] as const

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] bg-[rgba(16,17,20,0.82)] backdrop-blur-md flex-shrink-0">
        <button onClick={onBack} className="mr-3 text-xl leading-none text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black flex-1">Byro 편집</span>
        <button onClick={onLogout} className="text-xs text-[var(--color-text-tertiary)]">로그아웃</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-5 py-4">
          <div className="settings-shell mb-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Profile Completion</div>
                <div className="mt-2 text-[19px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">프로필 완성도 {completionPercent}%</div>
                <div className="meta-text mt-1">
                  {remainingItems.length > 0
                    ? `${remainingItems.map((item) => item.label).join(', ')} 항목을 채우면 더 좋아져요.`
                    : '기본 프로필 구성이 완료됐어요.'}
                </div>
              </div>
              <div className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                {completionChecks.filter((item) => item.done).length}/{completionChecks.length}
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-bg-muted)]">
              <div className="h-full rounded-full bg-[var(--color-accent-dark)]" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">Manage</div>
            <div className="mt-2 text-[18px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">Byro 편집</div>
            <div className="meta-text mt-1 leading-relaxed">각 항목을 눌러 별도 페이지에서 수정하세요.</div>
          </div>
          <div className="settings-shell overflow-hidden p-2.5">
            {manageRows.map((row, index) => (
              <button
                key={row.title}
                onClick={row.onClick}
                className={`settings-row flex w-full items-center gap-4 px-4 py-3.5 text-left ${index > 0 ? 'mt-2' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">{row.title}</div>
                  <div className="mt-1 text-[11px] leading-[1.5] text-white/48">{row.meta}</div>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/56">
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
            icon={<SnsIcon label="X" bg="#9F9F9F" />}
            title="X (Twitter)"
            subtitle="준비중"
            disabled
          />
          <SnsManageRow
            icon={<SnsIcon label="@" bg="#B2B2B2" />}
            title="Threads"
            subtitle="준비중"
            disabled
          />
          <SnsManageRow
            icon={<SnsIcon label="f" bg="#9FC3F7" />}
            title="Facebook"
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
            onChange={(e) => setInputValue(e.target.value)}
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
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black text-[var(--color-text-strong)]">연락 수단 관리</span>
      </div>

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
            onChange={(e) => setInputValue(e.target.value)}
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

export function ReputationManageScreen({
  currentKeywords,
  onBack,
}: {
  currentKeywords: string[]
  onBack: () => void
}) {
  const store = useByroStore()
  const [keywords, setKeywords] = useState<string[]>([...currentKeywords])
  const [confirmKeyword, setConfirmKeyword] = useState<string | null>(null)

  const getReputationCount = (kw: string) =>
    SAMPLE_PROFILE.reputationKeywords.find((r) => r.keyword === kw)?.count ?? 0

  const toggleKeyword = (kw: string) => {
    if (keywords.includes(kw)) {
      const count = getReputationCount(kw)
      if (count > 0) {
        setConfirmKeyword(kw)
        return
      }
      setKeywords((prev) => prev.filter((item) => item !== kw))
      return
    }
    if (keywords.length >= 5) {
      showToast('최대 5개까지 선택할 수 있어요')
      return
    }
    setKeywords((prev) => [...prev, kw])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">평판 키워드 편집</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="text-xs text-[var(--color-text-tertiary)] mb-4">선택된 키워드는 프로필 카드 안에 노출됩니다. 최대 5개까지 선택할 수 있어요.</div>
        <div className="space-y-4 mb-4">
          {KEYWORD_GROUPS.map((group) => (
            <div key={group.category}>
              <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">{group.category}</div>
              <div className="flex flex-wrap gap-1.5">
                {group.keywords.map((kw) => {
                  const selected = keywords.includes(kw)
                  return (
                    <button
                      key={kw}
                      onClick={() => toggleKeyword(kw)}
                      className={['text-xs px-3 py-1.5 rounded-full border font-semibold', selected ? 'border-[var(--color-accent-dark)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]'].join(' ')}
                      style={selected ? { backgroundColor: 'var(--color-accent-dark)' } : undefined}
                    >
                      {kw}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-[var(--color-border-soft)]">
        <Button onClick={() => { store.updateUserKeywords(keywords); showToast('키워드가 저장됐어요!'); onBack() }}>저장</Button>
      </div>

      <Modal open={confirmKeyword !== null} onClose={() => setConfirmKeyword(null)}>
        <div className="text-center">
          <div className="text-xl mb-3">⚠️</div>
          <div className="text-sm font-black mb-2">누적 평판이 사라져요</div>
          <div className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-4">
            <span className="font-bold">&ldquo;{confirmKeyword}&rdquo;</span> 키워드에 쌓인{' '}
            <span className="font-bold">{confirmKeyword ? getReputationCount(confirmKeyword) : 0}개</span>의 평판이 영구적으로 삭제돼요.
            <br />
            정말 해제하시겠어요?
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmKeyword(null)}>취소</Button>
            <Button onClick={() => {
              if (confirmKeyword) setKeywords((prev) => prev.filter((item) => item !== confirmKeyword))
              setConfirmKeyword(null)
            }}
            >
              해제하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export function GuestbookManageScreen({ onBack }: { onBack: () => void }) {
  const store = useByroStore()
  const entries = SAMPLE_PROFILE.guestbook.filter((entry) => !store.deletedGuestbookIds.includes(entry.id))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">방명록 관리</span>
        <span className="ml-2 text-xs text-[#AAA]">{entries.length}개</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {entries.length === 0 ? (
          <div className="text-center text-sm text-[#AAA] mt-16">받은 방명록이 없어요</div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 rounded-[18px] border border-[#F0F0F0] bg-[#FCFCFC] px-3 py-3">
                {getProfileAvatar(entry.linkId) ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getProfileAvatar(entry.linkId)} alt={entry.authorName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)] flex-shrink-0">
                    {entry.authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-bold text-[#222]">{entry.authorName}</div>
                    <div className="text-[10px] text-[#BBB]">{entry.date}</div>
                  </div>
                  <div className="text-xs text-[#666] mt-0.5">{entry.message}</div>
                </div>
                <button
                  onClick={() => { store.deleteGuestbookEntry(entry.id); showToast('방명록을 삭제했어요') }}
                  className="flex-shrink-0 text-[#CCC] hover:text-[#E53935] transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
