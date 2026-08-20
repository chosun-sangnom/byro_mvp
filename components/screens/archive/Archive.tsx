'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MoreVertical } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { NavBar, Avatar, ActionMenu, ActionMenuItem, Modal, showToast } from '@/components/ui'
import { getProfileMeta } from '@/lib/mocks/publicProfiles'
import type { SavedProfile } from '@/types'

type SortKey = 'name' | 'recent'

const SAVED_PAGE_SIZE = 10

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'name', label: '가나다순' },
  { key: 'recent', label: '최근 저장순' },
]

export default function Archive() {
  const router = useRouter()
  const store = useFeloreStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [memoTarget, setMemoTarget] = useState<SavedProfile | null>(null)
  const [memoValue, setMemoValue] = useState('')

  const { activeArchiveTab, setActiveArchiveTab, savedProfiles, recentProfiles } = store

  const sorted: SavedProfile[] = sort === 'name'
    ? [...savedProfiles].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    : [...savedProfiles]

  const q = searchQuery.trim().toLowerCase()
  const filtered = q
    ? sorted.filter((p) => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
    : sorted

  const [visibleCount, setVisibleCount] = useState(SAVED_PAGE_SIZE)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setVisibleCount(SAVED_PAGE_SIZE)
  }, [searchQuery, sort])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + SAVED_PAGE_SIZE, filtered.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filtered.length, visibleCount])

  const visibleProfiles = filtered.slice(0, visibleCount)

  const tabs = [
    { key: 'saved' as const, label: `저장됨 ${savedProfiles.length}` },
    { key: 'recent' as const, label: '최근 본' },
  ]

  return (
    <div className="flex h-full flex-col">
      <NavBar title="저장한 프로필" onBack={() => router.back()} />

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        {/* 탭 */}
        <div className="flex flex-shrink-0 items-center gap-0 rounded-full bg-[#f5f6f7] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveArchiveTab(tab.key)}
              className={[
                'flex-1 rounded-full px-6 py-2 text-[14px] tracking-[-0.28px] transition-colors',
                activeArchiveTab === tab.key
                  ? 'bg-white font-semibold text-[#25313d]'
                  : 'font-bold text-[#6c7786]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 저장됨 탭: 검색 + 정렬 */}
        {activeArchiveTab === 'saved' && (
          <div className="mt-3 flex flex-shrink-0 flex-col gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-[#f5f6f7] p-3">
              <Search size={20} className="flex-shrink-0 text-[#a8b1bd]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름, 직함으로 검색"
                className="flex-1 bg-transparent text-[14px] tracking-[-0.28px] text-[#0d0d0d] outline-none placeholder:text-[#a8b1bd]"
              />
            </div>
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={[
                    'rounded-full px-2.5 py-1.5 text-[14px] tracking-[-0.28px] transition-colors',
                    sort === key
                      ? 'bg-[#25313d] font-bold text-white'
                      : 'border border-[#dee4ec] bg-white font-medium text-[#25313d]',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="mt-6 flex-1">
          {activeArchiveTab === 'saved' ? (
            filtered.length === 0 ? (
              <EmptyState text={q ? '일치하는 검색 결과가 없어요' : '저장된 프로필이 없어요'} />
            ) : (
              <div className="overflow-hidden rounded-[24px] border-[0.66px] border-[#dee4ec]">
                {visibleProfiles.map((p, i) => {
                  const meta = getProfileMeta(p.linkId)
                  return (
                    <div
                      key={p.id}
                      className={[
                        'flex flex-col gap-3 px-4 py-4',
                        i < visibleProfiles.length - 1 ? 'border-b border-[#dee4ec]' : '',
                      ].join(' ')}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          onClick={() => router.push(`/${p.linkId}`)}
                        >
                          <Avatar
                            name={p.name}
                            src={meta.avatarImage}
                            color={meta.avatarColor}
                            textColor={meta.avatarImage ? undefined : '#6c7786'}
                            size={44}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-0.5">
                              <span className="truncate text-[14px] font-semibold tracking-[-0.28px] text-[#0d0d0d]">
                                {p.name}
                              </span>
                              {meta.isVerified && (
                                <img src="/images/ai-tools/exp-verified-badge.svg" alt="인증됨" className="h-3 w-3 flex-shrink-0" />
                              )}
                            </div>
                            {p.title && (
                              <div className="truncate text-[12px] font-medium tracking-[-0.24px] text-[#6c7786]">{p.title}</div>
                            )}
                          </div>
                        </button>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                            className="rounded-full p-1 text-[#0d0d0d] active:bg-[#f5f6f7] transition-colors"
                          >
                            <MoreVertical size={20} />
                          </button>
                          <ActionMenu open={openMenuId === p.id} onClose={() => setOpenMenuId(null)}>
                            <ActionMenuItem
                              label="메모 편집"
                              onClick={() => { setOpenMenuId(null); setMemoTarget(p); setMemoValue(p.memo) }}
                            />
                            <ActionMenuItem
                              label="저장 취소"
                              danger
                              onClick={() => {
                                setOpenMenuId(null)
                                store.unsaveProfile(p.linkId)
                                showToast(`${p.name}님을 저장 목록에서 삭제했어요`)
                              }}
                            />
                          </ActionMenu>
                        </div>
                      </div>
                      {p.memo && (
                        <div className="flex items-center gap-1 rounded-lg bg-[#f0f5ff] py-2.5 pl-3 pr-4">
                          <img src="/images/archive/memo-icon.svg" alt="" className="h-3.5 w-3 flex-shrink-0" />
                          <span className="truncate text-[12px] font-medium tracking-[-0.24px] text-[#25313d]">{p.memo}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                {visibleCount < filtered.length && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    <span className="text-[12px] text-[#a8b1bd]">불러오는 중…</span>
                  </div>
                )}
              </div>
            )
          ) : (
            recentProfiles.length === 0 ? (
              <EmptyState text="최근 본 프로필이 없어요" />
            ) : (
              <div className="overflow-hidden rounded-[24px] border-[0.66px] border-[#dee4ec]">
                {recentProfiles.map((p, i) => {
                  const meta = getProfileMeta(p.linkId)
                  return (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/${p.linkId}`)}
                      className={[
                        'flex w-full items-center justify-between gap-3 px-4 py-4 text-left',
                        i < recentProfiles.length - 1 ? 'border-b border-[#dee4ec]' : '',
                      ].join(' ')}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <Avatar
                          name={p.name}
                          src={meta.avatarImage}
                          color={meta.avatarColor}
                          textColor={meta.avatarImage ? undefined : '#6c7786'}
                          size={44}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-0.5">
                            <span className="truncate text-[14px] font-semibold tracking-[-0.28px] text-[#0d0d0d]">
                              {p.name}
                            </span>
                            {meta.isVerified && (
                              <img src="/images/ai-tools/exp-verified-badge.svg" alt="인증됨" className="h-3 w-3 flex-shrink-0" />
                            )}
                          </div>
                          {p.title && (
                            <div className="truncate text-[12px] font-medium tracking-[-0.24px] text-[#6c7786]">{p.title}</div>
                          )}
                        </div>
                      </div>
                      <span className="flex-shrink-0 text-[12px] font-medium tracking-[-0.24px] text-[#6c7786]">
                        {p.viewedAt}
                      </span>
                    </button>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* 메모 편집 모달 */}
      <Modal open={!!memoTarget} onClose={() => setMemoTarget(null)} widthClassName="w-[294px]">
        <div>
          <div className="mb-4 text-[18px] font-bold tracking-[-0.54px] text-[#0d0d0d]">
            {memoTarget?.name}님 메모 편집
          </div>
          <textarea
            value={memoValue}
            onChange={(e) => setMemoValue(e.target.value)}
            maxLength={100}
            rows={3}
            placeholder="메모를 입력하세요."
            className="mb-1 w-full resize-none rounded-[16px] border border-[#dee4ec] px-3 py-3 text-[14px] tracking-[-0.28px] text-[#0d0d0d] outline-none placeholder:text-[#a8b1bd]"
          />
          <div className="mb-4 text-right text-[12px] tracking-[-0.24px] text-[#6c7786]">
            {memoValue.length}/100
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMemoTarget(null)}
              className="flex-1 rounded-[10px] border border-[#dee4ec] py-3 text-[14px] font-bold tracking-[-0.28px] text-[#25313d]"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (!memoTarget) return
                store.updateProfileMemo(memoTarget.linkId, memoValue)
                setMemoTarget(null)
                showToast('메모를 저장했어요')
              }}
              className="flex-1 rounded-[10px] bg-black py-3 text-[14px] font-bold tracking-[-0.28px] text-white"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <img src="/images/archive/empty-icon.svg" alt="" className="h-12 w-12" />
      <p className="text-[14px] font-semibold tracking-[-0.28px] text-[#6c7786]">{text}</p>
    </div>
  )
}
