'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight, MoreHorizontal } from 'lucide-react'
import { NavBar, ActionMenu, ActionMenuItem, Modal, BottomSheet, Button, CheckRow, TextArea, showToast } from '@/components/ui'
import { REPUTATION_KEYWORD_GROUPS } from '@/lib/mocks/reputationKeywords'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { GuestbookEntry } from '@/types'

const REPORT_REASONS = [
  '불쾌한 표현이 있어요',
  '허위 사실이에요',
  '스팸 · 광고성 내용이에요',
  '기타',
]

const FEEDBACK_PAGE_SIZE = 5

function FeedbackRow({
  entry,
  openMenuId,
  setOpenMenuId,
  onRequestDelete,
  onRequestReport,
}: {
  entry: GuestbookEntry
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onRequestDelete: (entry: GuestbookEntry) => void
  onRequestReport: (entry: GuestbookEntry) => void
}) {
  const avatar = getProfileAvatar(entry.linkId)
  return (
    <div className="flex gap-3 py-3.5 first:pt-0">
      {avatar ? (
        <div className="mt-0.5 h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[var(--color-bg-soft)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt={entry.authorName} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-soft)] text-xs font-bold text-[var(--color-text-secondary)]">
          {entry.authorName.charAt(0)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">{entry.authorName}</div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-[var(--color-text-tertiary)]">{entry.date}</div>
            <div className="relative">
              <button
                onClick={() => setOpenMenuId(openMenuId === entry.id ? null : entry.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-text-tertiary)] opacity-40 active:opacity-100 transition-opacity"
                aria-label="더보기"
              >
                <MoreHorizontal size={13} />
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
        </div>
        <div className="mt-1 text-[13px] leading-snug text-[var(--color-text-secondary)]">{entry.message}</div>
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
    .slice(0, 5)

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
    <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
      <div className="text-center">
        <div className="text-base font-black mb-1" style={{ color: 'var(--color-state-danger-text)' }}>
          피드백을 삭제하시겠어요?
        </div>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4 leading-relaxed">
          삭제하면 복구할 수 없어요.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>취소</Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>삭제하기</Button>
        </div>
      </div>
    </Modal>
  )

  const reportSheet = (
    <BottomSheet open={!!reportTarget} onClose={closeReportSheet}>
      <div className="px-5 pb-6">
        <div className="text-base font-black mb-1" style={{ color: 'var(--color-text-primary)' }}>
          피드백 신고하기
        </div>
        <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4 leading-relaxed">
          {reportTarget?.authorName}님이 남긴 피드백을 신고해요. 사유를 선택해주세요.
        </p>

        <div className="mb-4">
          {REPORT_REASONS.map((reason) => (
            <CheckRow
              key={reason}
              label={reason}
              checked={reportReason === reason}
              onToggle={() => setReportReason(reason)}
            />
          ))}
        </div>

        <TextArea
          value={reportDetail}
          onChange={setReportDetail}
          placeholder="구체적인 내용을 적어주시면 검토에 도움이 돼요 (선택)"
          maxLength={300}
          rows={3}
          dark
        />

        <div className="mt-4">
          <Button variant="danger" disabled={!reportReason} onClick={handleSubmitReport}>
            제출하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  )

  if (showAllFeedback) {
    return (
      <div className="flex flex-col h-full">
        <NavBar title="받은 피드백" onBack={() => setShowAllFeedback(false)} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-3 text-[12px] text-[var(--color-text-tertiary)]">총 {allEntries.length}개의 피드백이에요</div>
          <div className="divide-y divide-[var(--color-border-soft)]">
            {visibleEntries.map((entry) => (
              <FeedbackRow
                key={entry.id}
                entry={entry}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onRequestDelete={setDeleteTarget}
                onRequestReport={setReportTarget}
              />
            ))}
          </div>
          {hasMoreToLoad && (
            <div ref={loadMoreRef} className="py-4 text-center">
              <span className="text-[11px] text-[var(--color-text-tertiary)]">불러오는 중…</span>
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

        {/* 상단 서머리 */}
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-soft)] px-4 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">Summary</div>
          <div className="mt-1 text-[17px] font-black text-[var(--color-text-primary)]">함께한 사람들이 남긴 평판이에요</div>
          <div className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            나와 함께한 사람들이 선택한 키워드와 남긴 한마디가 쌓입니다. 프로필에는 상위 키워드와 최근 피드백이 노출돼요.
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              키워드 누적 {totalReputationCount}회
            </span>
            <span className="rounded-full border border-[var(--color-border-default)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">
              피드백 {allEntries.length}개
            </span>
            {topKeywords.slice(0, 3).map((item) => (
              <span key={item.keyword} className="chip-metric">
                {item.keyword} <span className="ml-1 font-black text-[var(--color-text-strong)]">{item.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* 받은 평판 키워드 */}
        <div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-text-primary)]">받은 평판</div>
          <div className="space-y-4">
            {REPUTATION_KEYWORD_GROUPS.map((group) => (
              <div key={group.category}>
                <div className="text-xs font-bold text-[var(--color-text-secondary)] mb-2">{group.category}</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.keywords.map((keyword) => {
                    const count = getReputationCount(keyword)
                    return (
                      <div
                        key={keyword}
                        className={[
                          'rounded-full border px-3 py-1.5 text-xs font-semibold',
                          count > 0
                            ? 'border-[var(--color-accent-dark)] bg-[var(--color-accent-bg)] text-[var(--color-text-primary)]'
                            : 'border-[var(--color-border-default)] bg-[var(--color-bg-soft)] text-[var(--color-text-tertiary)]',
                        ].join(' ')}
                      >
                        {keyword}
                        <span className="ml-1.5 text-[10px] font-black opacity-80">{count > 0 ? count : '0'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 받은 피드백 */}
        <div>
          <div className="mb-3 text-[13px] font-bold text-[var(--color-text-primary)]">받은 피드백</div>
          {allEntries.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border-soft)] px-4 py-6 text-center text-[12px] text-[var(--color-text-tertiary)]">
              아직 받은 피드백이 없어요
            </div>
          ) : (
            <>
              <div className="divide-y divide-[var(--color-border-soft)]">
                {displayedEntries.map((entry) => (
                  <FeedbackRow
                    key={entry.id}
                    entry={entry}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    onRequestDelete={setDeleteTarget}
                    onRequestReport={setReportTarget}
                  />
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={() => {
                    setVisibleCount(FEEDBACK_PAGE_SIZE)
                    setShowAllFeedback(true)
                  }}
                  className="mt-4 flex w-full items-center justify-between rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-3 text-left active:opacity-70"
                >
                  <span className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
                    더보기
                  </span>
                  <ChevronRight className="h-4 w-4 text-[var(--color-text-tertiary)]" />
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
