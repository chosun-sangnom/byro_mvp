'use client'

import { Award, Lightbulb } from 'lucide-react'
import type { ReputationKeywordGroup } from '@/lib/mocks/reputationKeywords'
import { Button, BottomSheet, Chip, Modal, TextArea } from '@/components/ui'

export function ExperienceBottomSheet({
  open,
  profileName,
  currentUserName,
  isLoggedIn,
  experienceKeywordGroups,
  selectedKeywords,
  experienceMessage,
  onToggleKeyword,
  onMessageChange,
  onSubmit,
  onLogin,
  onClose,
}: {
  open: boolean
  profileName: string
  currentUserName?: string
  isLoggedIn: boolean
  experienceKeywordGroups: ReputationKeywordGroup[]
  selectedKeywords: string[]
  experienceMessage: string
  onToggleKeyword: (keyword: string) => void
  onMessageChange: (value: string) => void
  onSubmit: () => void
  onLogin: () => void
  onClose: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-1 text-[15px] font-bold text-[var(--color-text-strong)]">{profileName}에게 경험 남기기</div>
        <div className="mb-5 text-[12px] text-[var(--color-text-tertiary)]">
          {isLoggedIn ? `${currentUserName ?? '나'}으로 남겨져요` : '익명 사용자로 남겨져요'}
        </div>
        <div className="mb-4 space-y-4">
          {experienceKeywordGroups.map((group) => (
            <div key={group.category}>
              <div className="mb-2 text-[11px] font-bold text-[var(--color-text-secondary)]">{group.category}</div>
              <div className="flex flex-wrap gap-2">
                {group.keywords.map((keyword) => (
                  <Chip
                    key={keyword}
                    label={keyword}
                    selected={selectedKeywords.includes(keyword)}
                    onClick={() => onToggleKeyword(keyword)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mb-1.5 text-[12px] text-[var(--color-text-tertiary)]">한마디 (선택)</div>
        <TextArea
          value={experienceMessage}
          onChange={onMessageChange}
          placeholder="이 분과의 경험을 한마디로 남겨보세요"
          maxLength={100}
          rows={3}
          dark
        />
        <div className="mt-4 space-y-2">
          <Button onClick={onSubmit}>경험 남기기</Button>
          {!isLoggedIn && (
            <>
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
                <span className="text-[11px] text-[var(--color-text-tertiary)]">이름으로 남기고 싶다면</span>
                <div className="h-px flex-1 bg-[var(--color-border-soft)]" />
              </div>
              <Button variant="outline" onClick={onLogin}>로그인하기</Button>
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

export function SaveProfileMemoSheet({
  open,
  profileName,
  memoText,
  onMemoChange,
  onSave,
  onClose,
}: {
  open: boolean
  profileName: string
  memoText: string
  onMemoChange: (value: string) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-5 pb-6">
        <div className="mb-1 text-[15px] font-bold text-[var(--color-text-strong)]">프로필 저장</div>
        <div className="mb-5 text-[12px] text-[var(--color-text-tertiary)]">{profileName}</div>
        <div className="mb-1.5 text-[12px] text-[var(--color-text-tertiary)]">메모 (선택)</div>
        <TextArea
          value={memoText}
          onChange={onMemoChange}
          placeholder="어디서 만났는지, 어떤 분인지 메모해두세요"
          maxLength={80}
          rows={3}
          dark
        />
        <div className="mt-4 space-y-2">
          <Button onClick={onSave}>저장하기</Button>
          <Button variant="ghost" onClick={onClose}>취소</Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export function ExperienceDoneModal({
  open,
  profileName,
  isLoggedIn,
  onRequestExperience,
  onCreateByro,
  onLogin,
  onClose,
}: {
  open: boolean
  profileName: string
  isLoggedIn: boolean
  onRequestExperience: () => void
  onCreateByro: () => void
  onLogin: () => void
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-muted)]"
            style={{ boxShadow: '0 0 24px rgba(75,108,245,0.22)' }}
          >
            <Award size={28} color="var(--color-accent-dark)" strokeWidth={1.8} />
          </div>
        </div>

        <div className="mb-2 text-[17px] font-black text-[var(--color-text-strong)]">경험을 남겼어요!</div>
        <div className="mb-5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {profileName} 님의 평판이 쌓였어요.{isLoggedIn && <><br />서로 연결된 신뢰가 만들어졌습니다.</>}
        </div>

        {isLoggedIn ? (
          <>
            <div className="mb-5 flex gap-2.5 rounded-xl border border-[var(--color-state-info-bg)] bg-[var(--color-state-info-bg)] px-3.5 py-3 text-left">
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-[var(--color-state-info-text)]" />
              <div>
                <div className="text-[12px] font-bold text-[var(--color-state-info-text)]">나도 평판을 받고 싶다면?</div>
                <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--color-state-info-text)] opacity-80">
                  {profileName} 님에게 경험 남기기를 요청해 보세요.
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={onRequestExperience}>{profileName} 님에게 경험 요청하기</Button>
              <Button variant="outline" onClick={onClose}>프로필로 돌아가기</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3.5 text-left">
              <div className="mb-1 text-[13px] font-bold text-[var(--color-text-primary)]">나도 평판을 받고 싶다면?</div>
              <div className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
                Byro를 만들면 {profileName} 님에게 경험 요청을 보내고,<br />평판을 쌓을 수 있어요.
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={onCreateByro}>내 Byro 만들기</Button>
              <Button variant="outline" onClick={onLogin}>로그인하기</Button>
              <Button variant="ghost" onClick={onClose}>{profileName} 님 프로필로 돌아가기</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
