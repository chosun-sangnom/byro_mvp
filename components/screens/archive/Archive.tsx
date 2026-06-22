'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Search, X } from 'lucide-react'
import { useByroStore } from '@/store/useByroStore'
import { ActionMenu, ActionMenuItem, Modal, showToast } from '@/components/ui'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'
import type { SavedProfile } from '@/types'

type SortKey = 'name' | 'recent'

export default function Archive() {
  const router = useRouter()
  const store = useByroStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [memoTarget, setMemoTarget] = useState<SavedProfile | null>(null)
  const [memoValue, setMemoValue] = useState('')

  useEffect(() => {
    if (!store.isLoggedIn) {
      router.replace('/signup')
    }
  }, [store.isLoggedIn, router])

  if (!store.isLoggedIn) return null

  const { activeArchiveTab, setActiveArchiveTab, savedProfiles } = store
  const { recentProfiles } = SAMPLE_PROFILE

  const sorted: SavedProfile[] = sort === 'name'
    ? [...savedProfiles].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    : [...savedProfiles]

  const q = searchQuery.trim().toLowerCase()
  const filtered = q
    ? sorted.filter((p) => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
    : sorted

  const tabs = [
    { key: 'saved' as const, label: `저장됨 ${savedProfiles.length}` },
    { key: 'recent' as const, label: '최근 본' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center px-5 h-12 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border-default)' }}>
        <button onClick={() => router.back()} className="text-sm mr-3 text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black">아카이브</span>
      </div>

      {/* 탭 */}
      <div className="flex px-5 gap-2 flex-shrink-0 overflow-x-auto py-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveArchiveTab(tab.key)}
            className={[
              'flex-1 min-w-fit py-2.5 px-3 text-xs font-semibold rounded-full border transition-colors',
              activeArchiveTab === tab.key
                ? 'border-[var(--color-accent-dark)] text-white'
                : 'bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)] border-[var(--color-border-default)]',
            ].join(' ')}
            style={activeArchiveTab === tab.key ? { backgroundColor: 'var(--color-accent-dark)' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">

        {/* 저장됨 탭 */}
        {activeArchiveTab === 'saved' && (
          <div className="flex flex-col h-full">
            {/* 검색바 + 정렬 */}
            <div className="px-5 pb-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-3 py-2.5">
                <Search size={14} className="flex-shrink-0 text-[var(--color-text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름, 직함으로 검색"
                  className="flex-1 bg-transparent text-[13px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="flex-shrink-0">
                    <X size={14} className="text-[var(--color-text-tertiary)]" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5">
                {(['name', 'recent'] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className="rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors"
                    style={sort === key
                      ? { backgroundColor: 'var(--color-accent-dark)', borderColor: 'var(--color-accent-dark)', color: '#fff' }
                      : { backgroundColor: 'var(--color-bg-soft)', borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }
                    }
                  >
                    {key === 'name' ? '가나다순' : '최근 저장순'}
                  </button>
                ))}
              </div>
            </div>

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {filtered.length === 0 ? (
                <p className="micro-text text-center pt-10">
                  {q ? '검색 결과가 없어요' : '저장된 프로필이 없어요'}
                </p>
              ) : filtered.map((p) => (
                <div key={p.id} className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3">
                  <button className="flex items-center gap-3 flex-1 min-w-0" onClick={() => router.push(`/${p.linkId}`)}>
                    <ProfileAvatar linkId={p.linkId} name={p.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{p.name}</div>
                      {p.title && (
                        <div className="meta-text mt-0.5 truncate">{p.title}</div>
                      )}
                      {p.memo && (
                        <div className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 truncate">{p.memo}</div>
                      )}
                    </div>
                  </button>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      className="rounded-full p-1.5 text-[var(--color-text-tertiary)] active:bg-[var(--color-bg-muted)] transition-colors"
                    >
                      <MoreHorizontal size={16} />
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
              ))}
            </div>
          </div>
        )}

        {/* 최근 본 탭 */}
        {activeArchiveTab === 'recent' && (
          <div className="px-5 py-2">
            {recentProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/${p.linkId}`)}
                className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3"
              >
                <ProfileAvatar linkId={p.linkId} name={p.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="meta-text mt-0.5">{p.title}</div>
                </div>
                <div className="micro-text flex-shrink-0">{p.viewedAt}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 메모 편집 모달 */}
      <Modal open={!!memoTarget} onClose={() => setMemoTarget(null)}>
        <div>
          <div className="text-base font-black mb-3">
            {memoTarget?.name}님 메모 편집
          </div>
          <textarea
            value={memoValue}
            onChange={(e) => setMemoValue(e.target.value)}
            maxLength={100}
            rows={3}
            placeholder="메모를 입력하세요"
            className="w-full resize-none rounded-[16px] border border-[var(--color-border-default)] bg-[var(--color-bg-muted)] px-4 py-3 text-[14px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] mb-1"
          />
          <div className="text-right text-[11px] text-[var(--color-text-tertiary)] mb-4">
            {memoValue.length}/100
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMemoTarget(null)}
              className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)]"
              style={{ borderColor: 'var(--color-border-default)' }}
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
              className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: 'var(--color-accent-dark)' }}
            >
              저장
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ProfileAvatar({ linkId, name, size }: { linkId: string; name: string; size: number }) {
  const avatar = getProfileAvatar(linkId)
  const style = { width: size, height: size }

  if (avatar) {
    return (
      <div className="overflow-hidden rounded-full bg-[var(--color-bg-muted)] flex-shrink-0" style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt={`${name} 프로필 사진`} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center font-bold text-[var(--color-text-secondary)] text-sm flex-shrink-0" style={style}>
      {name.charAt(0)}
    </div>
  )
}
