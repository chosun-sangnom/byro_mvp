'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronRight, MoreVertical } from 'lucide-react'
import { NavBar, ActionMenu, ActionMenuItem, Modal, BottomSheet, showToast } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { GuestbookEntry } from '@/types'

const REPORT_REASONS = [
  '불쾌한 표현이 있어요',
  '허위 사실이에요',
  '스팸 · 광고성 계정이에요',
  '기타',
]

const FEEDBACK_PAGE_SIZE = 10

// 실제 프로필 사진이 없는 작성자는 이니셜 아바타로 표시 — 순서대로 이 팔레트를 순환
const AVATAR_BG_PALETTE = ['#F4F2FE', '#EFF9FF', '#F5F6F7']

function FeedbackAvatar({ entry, index }: { entry: GuestbookEntry; index: number }) {
  const avatar = getProfileAvatar(entry.linkId)
  if (avatar) {
    return (
      <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={entry.authorName} className="h-full w-full object-cover" />
      </div>
    )
  }
  return (
    <div
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
      style={{ background: AVATAR_BG_PALETTE[index % AVATAR_BG_PALETTE.length] }}
    >
      <span className="text-[14px] font-bold" style={{ color: '#6C7786' }}>{entry.authorName.charAt(0)}</span>
    </div>
  )
}

function FeedbackRow({
  entry,
  index,
  openMenuId,
  setOpenMenuId,
  onRequestDelete,
  onRequestReport,
}: {
  entry: GuestbookEntry
  index: number
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onRequestDelete: (entry: GuestbookEntry) => void
  onRequestReport: (entry: GuestbookEntry) => void
}) {
  const isVerified = !!getProfileAvatar(entry.linkId)
  return (
    <div className="flex items-start gap-2.5">
      <FeedbackAvatar entry={entry} index={index} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{entry.authorName}</span>
          {isVerified && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/reputation-verified-badge.svg" alt="" className="h-3 w-3" />
          )}
          <span className="ml-1 text-[12px] font-medium" style={{ color: '#6C7786' }}>{entry.date}</span>
        </div>
        <p className="mt-1 text-[14px] font-medium" style={{ color: '#475058' }}>{entry.message}</p>
      </div>
      <div className="relative flex-shrink-0">
        <button
          onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
          className="flex h-6 w-6 items-center justify-center"
          aria-label="더보기"
        >
          <MoreVertical size={24} style={{ color: '#A8B1BD' }} />
        </button>
        <ActionMenu open={openMenuId === entry.id} onClose={() => setOpenMenuId(null)}>
          <ActionMenuItem
            label="삭제하기"
            danger
            onClick={() => {
              setOpenMenuId(null)
              onRequestDelete(entry)
            }}
          />
          <ActionMenuItem
            label="신고하기"
            onClick={() => {
              setOpenMenuId(null)
              onRequestReport(entry)
            }}
          />
        </ActionMenu>
      </div>
    </div>
  )
}

export function ReputationManageScreen({
  onBack,
}: {
  onBack: () => void
}) {
  const totalReputationCount = SAMPLE_PROFILE.reputationKeywords.reduce((sum, item) => sum + item.count, 0)
  const topKeywords = [...SAMPLE_PROFILE.reputationKeywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const getReputationCount = (keyword: string) =>
    SAMPLE_PROFILE.reputationKeywords.find((item) => item.keyword === keyword)?.count ?? 0

  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GuestbookEntry | null>(null)
  const [showAllFeedback, setShowAllFeedback] = useState(false)
  const [visibleCount, setVisibleCount] = useState(FEEDBACK_PAGE_SIZE)
  const [reportTarget, setReportTarget] = useState<GuestbookEntry | null>(null)
  const [reportReason, setReportReason] = useState<string | undefined>(undefined)
  const [reportDetail, setReportDetail] = useState('')
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const allEntries = SAMPLE_PROFILE.guestbook.filter((e) => !deletedIds.includes(e.id))
  const displayedEntries = allEntries.slice(0, 3)
  const hasMore = allEntries.length > 3

  const visibleEntries = allEntries.slice(0, visibleCount)
  const hasMoreToLoad = visibleCount < allEntries.length

  useEffect(() => {
    if (!showAllFeedback) return
    const sentinel = loadMoreRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + FEEDBACK_PAGE_SIZE, allEntries.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [showAllFeedback, allEntries.length, visibleCount])

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    setDeletedIds((prev) => [...prev, deleteTarget.id])
    setDeleteTarget(null)
    showToast('피드백을 삭제했어요')
  }

  const closeReportSheet = () => {
    setReportTarget(null)
    setReportReason(undefined)
    setReportDetail('')
  }

  const handleSubmitReport = () => {
    if (!reportReason) return
    closeReportSheet()
    showToast('신고가 접수됐어요')
  }

  const deleteConfirmModal = (
    <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} widthClassName="w-[294px]">
      <p className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>
        피드백을 삭제하시겠어요?
      </p>
      <p className="mt-2 text-[14px] font-medium" style={{ color: '#475058' }}>
        삭제하면 복구할 수 없어요.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setDeleteTarget(null)}
          className="flex-1 rounded-[10px] border py-3 text-[14px] font-bold"
          style={{ borderColor: '#DEE4EC', color: '#25313D', background: '#fff' }}
        >
          취소
        </button>
        <button
          onClick={handleConfirmDelete}
          className="flex-1 rounded-[10px] py-3 text-[14px] font-bold text-white"
          style={{ background: '#FF4242' }}
        >
          삭제하기
        </button>
      </div>
    </Modal>
  )

  const reportSheet = (
    <BottomSheet open={!!reportTarget} onClose={closeReportSheet}>
      <div className="px-5 pb-2">
        <div className="text-[18px] font-bold" style={{ color: '#0D0D0D' }}>
          피드백 신고하기
        </div>
        <p className="mt-2 text-[14px] font-medium" style={{ color: '#475058' }}>
          신고 사유를 선택해주세요
        </p>

        <div className="mt-4 space-y-4">
          {REPORT_REASONS.map((reason) => {
            const checked = reportReason === reason
            return (
              <button
                key={reason}
                type="button"
                onClick={() => setReportReason(reason)}
                className="flex w-full items-center gap-2"
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: checked ? 'var(--color-accent-dark)' : '#F5F6F7' }}
                >
                  <Check size={11} strokeWidth={3} color={checked ? '#fff' : '#A8B1BD'} />
                </span>
                <span className="flex-1 text-left text-[16px] font-medium" style={{ color: '#25313D' }}>
                  {reason}
                </span>
              </button>
            )
          })}
        </div>

        <input
          type="text"
          value={reportDetail}
          onChange={(e) => setReportDetail(e.target.value)}
          placeholder="내용을 입력해주세요"
          maxLength={300}
          className="mt-4 w-full rounded-full border px-4 py-3 text-[14px] font-medium outline-none placeholder:text-[#A8B1BD]"
          style={{ borderColor: '#DEE4EC', color: '#0D0D0D' }}
        />

        <button
          onClick={handleSubmitReport}
          disabled={!reportReason}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-full text-[16px] font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--color-accent-gold)' }}
        >
          제출하기
        </button>
      </div>
    </BottomSheet>
  )

  if (showAllFeedback) {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="받은 피드백" onBack={() => setShowAllFeedback(false)} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-6 flex items-center gap-1">
            <span className="text-[22px] font-bold" style={{ color: '#0D0D0D' }}>받은 피드백</span>
            <span className="rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
              {allEntries.length}개
            </span>
          </div>
          <div className="space-y-4">
            {visibleEntries.map((entry, i) => (
              <div key={entry.id}>
                <FeedbackRow
                  entry={entry}
                  index={i}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onRequestDelete={setDeleteTarget}
                  onRequestReport={setReportTarget}
                />
                {i < visibleEntries.length - 1 && <div className="mt-4 h-px" style={{ background: '#DEE4EC' }} />}
              </div>
            ))}
          </div>
          {hasMoreToLoad && (
            <div ref={loadMoreRef} className="py-4 text-center">
              <span className="text-[11px]" style={{ color: '#A8B1BD' }}>불러오는 중…</span>
            </div>
          )}
        </div>
        {deleteConfirmModal}
        {reportSheet}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="평판 관리" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* 요약 */}
        <div className="rounded-xl border p-4" style={{ borderColor: '#DEE4EC' }}>
          <p className="text-[14px] font-medium" style={{ color: '#6C7786' }}>요약</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="flex-1 text-[18px] font-bold" style={{ color: '#0D0D0D' }}>
              함께한 사람들이 남긴 평판이에요
            </p>
            <span className="shrink-0 rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
              총 {totalReputationCount}개
            </span>
          </div>
          <p className="mt-2 text-[14px] font-medium" style={{ color: '#475058' }}>
            나와 함께한 사람들이 선택한 키워드와 남긴 한마디가 쌓입니다. 프로필에는 상위 키워드와 최근 피드백이 노출돼요.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {topKeywords.map((item) => (
              <div
                key={item.keyword}
                className="flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] font-medium"
                style={{ borderColor: '#DEE4EC', color: '#25313D' }}
              >
                {item.keyword}
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] font-medium" style={{ color: '#6C7786' }}>
            키워드 누적 {totalReputationCount}회 / 피드백 {allEntries.length}개
          </p>
        </div>

        {/* 받은 평판 키워드 */}
        <div>
          <p className="mb-3 text-[16px] font-bold" style={{ color: '#0D0D0D' }}>받은 평판</p>
          <div className="space-y-5">
            {REPUTATION_KEYWORD_GROUPS.map((group) => (
              <div key={group.category} className="space-y-3">
                <p className="text-[14px] font-semibold" style={{ color: '#0D0D0D' }}>{group.category}</p>
                <div className="flex flex-wrap gap-2">
                  {group.keywords.map((keyword) => {
                    const count = getReputationCount(keyword)
                    const active = count > 0
                    return (
                      <div
                        key={keyword}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium"
                        style={{
                          background: active ? '#F0F5FF' : '#fff',
                          borderColor: active ? '#CCDDFF' : '#DEE4EC',
                          color: active ? '#0D0D0D' : '#25313D',
                        }}
                      >
                        {keyword}
                        <span className="font-semibold" style={{ color: '#25313D' }}>{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 받은 피드백 */}
        <div className="rounded-3xl border p-4" style={{ borderColor: '#DEE4EC' }}>
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-bold" style={{ color: '#0D0D0D' }}>받은 피드백</p>
            <span className="rounded-md px-1.5 py-1 text-[12px] font-bold" style={{ background: '#F0F5FF', color: '#25313D' }}>
              총 {allEntries.length}개
            </span>
          </div>
          {allEntries.length === 0 ? (
            <p className="py-4 text-center text-[12px]" style={{ color: '#A8B1BD' }}>아직 받은 피드백이 없어요</p>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                {displayedEntries.map((entry, i) => (
                  <div key={entry.id}>
                    <FeedbackRow
                      entry={entry}
                      index={i}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      onRequestDelete={setDeleteTarget}
                      onRequestReport={setReportTarget}
                    />
                    {i < displayedEntries.length - 1 && <div className="mt-4 h-px" style={{ background: '#DEE4EC' }} />}
                  </div>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={() => {
                    setVisibleCount(FEEDBACK_PAGE_SIZE)
                    setShowAllFeedback(true)
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-0.5 text-[14px] font-semibold"
                  style={{ color: '#475058' }}
                >
                  피드백 전체 보기
                  <ChevronRight size={20} style={{ color: '#475058' }} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="h-4" />
      </div>

      {deleteConfirmModal}
      {reportSheet}
    </div>
  )
}
