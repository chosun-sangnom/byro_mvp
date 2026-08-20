'use client'

import { X } from 'lucide-react'
import type { ReputationKeywordGroup } from '@/lib/mocks/reputationKeywords'
import { Button, BottomSheet, CheckboxDot, Modal } from '@/components/ui'

export function ExperienceBottomSheet({
  open,
  profileName,
  isLoggedIn,
  experienceKeywordGroups,
  selectedKeywords,
  experienceMessage,
  isAnonymous,
  onToggleAnonymous,
  onToggleKeyword,
  onMessageChange,
  onSubmit,
  onLogin,
  onClose,
}: {
  open: boolean
  profileName: string
  isLoggedIn: boolean
  experienceKeywordGroups: ReputationKeywordGroup[]
  selectedKeywords: string[]
  experienceMessage: string
  isAnonymous: boolean
  onToggleAnonymous: () => void
  onToggleKeyword: (keyword: string) => void
  onMessageChange: (value: string) => void
  onSubmit: () => void
  onLogin: () => void
  onClose: () => void
}) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="px-4 pb-6">
        <p className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>{profileName}에게 경험 남기기</p>

        <div className="mt-6 space-y-6">
          {experienceKeywordGroups.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{group.category}</p>
              <div className="flex flex-wrap gap-2">
                {group.keywords.map((keyword) => {
                  const selected = selectedKeywords.includes(keyword)
                  return (
                    <button
                      key={keyword}
                      onClick={() => onToggleKeyword(keyword)}
                      className="rounded-full border px-3.5 py-2 text-[14px] font-medium transition-colors"
                      style={{
                        background: selected ? '#25313D' : '#fff',
                        borderColor: selected ? '#25313D' : '#DEE4EC',
                        color: selected ? '#fff' : '#25313D',
                        fontWeight: selected ? 600 : 500,
                      }}
                    >
                      {keyword}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>
            한마디 <span className="font-medium" style={{ color: '#6C7786' }}>(선택)</span>
          </p>
          <div className="rounded-3xl border p-3" style={{ borderColor: '#DEE4EC' }}>
            <textarea
              value={experienceMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="이 분과의 경험을 한마디로 남겨보세요"
              maxLength={100}
              rows={2}
              className="w-full resize-none text-[14px] font-medium outline-none placeholder:text-[#A8B1BD]"
              style={{ color: '#0D0D0D' }}
            />
          </div>
          <p className="mt-1 text-right text-[12px] font-medium" style={{ color: '#6C7786' }}>{experienceMessage.length}/100</p>
        </div>

        {isLoggedIn && (
          <button onClick={onToggleAnonymous} className="mt-4 flex items-center gap-2">
            <CheckboxDot checked={isAnonymous} />
            <span className="text-[16px] font-medium" style={{ color: '#25313D' }}>익명으로 남기기</span>
          </button>
        )}

        <div className="mt-6 space-y-2">
          <Button onClick={onSubmit}>피드백 남기기</Button>
          {!isLoggedIn && (
            <>
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1" style={{ background: '#DEE4EC' }} />
                <span className="text-[14px] font-medium" style={{ color: '#7F8A95' }}>이름으로 남기고 싶다면</span>
                <div className="h-px flex-1" style={{ background: '#DEE4EC' }} />
              </div>
              <Button variant="outline" onClick={onLogin} style={{ borderColor: '#DEE4EC', color: '#25313D' }}>로그인하기</Button>
            </>
          )}
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
  onCreateFelore,
  onLogin,
  onClose,
}: {
  open: boolean
  profileName: string
  isLoggedIn: boolean
  onRequestExperience: () => void
  onCreateFelore: () => void
  onLogin: () => void
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} widthClassName="w-[288px]">
      <div className="flex justify-end">
        <button onClick={onClose} aria-label="닫기">
          <X size={20} color="#A8B1BD" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/experience-done-icon.svg" alt="" className="h-12 w-12" />

        <p className="mt-4 text-[22px] font-bold" style={{ color: '#0D0D0D' }}>경험을 남겼어요!</p>
        <p className="mt-2 text-[16px] font-medium leading-[1.5]" style={{ color: '#475058' }}>
          {profileName}님의 평판이 쌓였어요.{isLoggedIn && <> 서로 연결된 신뢰가 만들어졌습니다.</>}
        </p>
      </div>

      <div className="relative mt-9 flex flex-col items-center gap-1">
        <div className="rounded-md px-3 py-2 text-[12px] font-medium text-white" style={{ background: 'rgba(0,0,0,0.8)' }}>
          나도 평판을 받고 싶다면?
        </div>
        <div className="w-full space-y-3">
          {isLoggedIn ? (
            <>
              <Button onClick={onRequestExperience}>경험 요청 보내기</Button>
              <Button variant="outline" onClick={onClose} style={{ borderColor: '#DEE4EC', color: '#25313D' }}>프로필로 돌아가기</Button>
            </>
          ) : (
            <>
              <Button onClick={onCreateFelore}>내 FELORE 만들기</Button>
              <Button variant="outline" onClick={onLogin} style={{ borderColor: '#DEE4EC', color: '#25313D' }}>로그인하기</Button>
              <button onClick={onClose} className="w-full py-1 text-[14px] font-bold" style={{ color: '#6C7786' }}>프로필로 돌아가기</button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
