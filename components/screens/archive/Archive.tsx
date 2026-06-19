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

  const [activeRequestTab, setActiveRequestTab] = useState<'connection' | 'feedback'>('connection')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [disconnectTarget, setDisconnectTarget] = useState<SavedProfile | null>(null)

  useEffect(() => {
    if (!store.isLoggedIn) {
      router.replace('/signup')
    }
  }, [store.isLoggedIn, router])

  if (!store.isLoggedIn) return null

  const { activeArchiveTab, setActiveArchiveTab } = store
  const { recentProfiles, receivedRequests } = SAMPLE_PROFILE
  const connectedProfiles = store.connectedProfiles
  const connectionRequests = store.connectionRequests

  const totalRequests = receivedRequests.length + connectionRequests.length

  // 정렬
  const sorted: SavedProfile[] = sort === 'name'
    ? [...connectedProfiles].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    : [...connectedProfiles].reverse()

  // 검색 — 이름(활동명) + 직함(title)
  const q = searchQuery.trim().toLowerCase()
  const filtered = q
    ? sorted.filter((p) => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
    : sorted

  const tabs = [
    { key: 'connected' as const, label: `연결된 사람 ${connectedProfiles.length}` },
    { key: 'recent' as const, label: '최근 본' },
    { key: 'requests' as const, label: totalRequests > 0 ? `받은 요청 ${totalRequests}` : '받은 요청' },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center px-5 h-12 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border-default)' }}>
        <button onClick={() => router.back()} className="text-sm mr-3 text-[var(--color-text-secondary)]">‹</button>
        <span className="text-base font-black">연결 관리</span>
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

        {/* 연결된 사람 탭 */}
        {activeArchiveTab === 'connected' && (
          <div className="flex flex-col h-full">
            {/* 검색바 + 정렬 */}
            <div className="px-5 pb-3 space-y-2">
              {/* 검색 */}
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
              {/* 정렬 */}
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
                    {key === 'name' ? '가나다순' : '최근 연결순'}
                  </button>
                ))}
              </div>
            </div>

            {/* 목록 */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {filtered.length === 0 ? (
                <p className="micro-text text-center pt-10">
                  {q ? '검색 결과가 없어요' : '연결된 사람이 없어요'}
                </p>
              ) : filtered.map((p) => (
                <div key={p.id} className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3">
                  <button className="flex items-center gap-3 flex-1 min-w-0" onClick={() => router.push(`/${p.linkId}`)}>
                    <ProfileAvatar linkId={p.linkId} name={p.name} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold truncate">{p.name}</div>
                        <span className="flex-shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ color: 'var(--color-accent-dark)', background: 'var(--color-accent-bg)' }}>연결됨</span>
                      </div>
                      {p.title && (
                        <div className="meta-text mt-0.5 truncate">{p.title}</div>
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
                        label="연결 해제"
                        danger
                        onClick={() => { setOpenMenuId(null); setDisconnectTarget(p) }}
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

        {/* 받은 요청 탭 */}
        {activeArchiveTab === 'requests' && (
          <div className="flex flex-col h-full">
            {/* 세그먼트 탭 */}
            <div className="px-5 pb-3">
              <div className="grid grid-cols-2 gap-1 rounded-[20px] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-1">
                <button
                  onClick={() => setActiveRequestTab('connection')}
                  className="flex items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[12px] font-semibold transition"
                  style={{
                    backgroundColor: activeRequestTab === 'connection' ? 'var(--color-accent-bg)' : 'transparent',
                    color: activeRequestTab === 'connection' ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                  }}
                >
                  연결 요청
                  {connectionRequests.length > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                      style={{
                        backgroundColor: activeRequestTab === 'connection' ? 'var(--color-accent-dark)' : 'var(--color-bg-muted)',
                        color: activeRequestTab === 'connection' ? 'white' : 'var(--color-text-tertiary)',
                      }}
                    >
                      {connectionRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveRequestTab('feedback')}
                  className="flex items-center justify-center gap-1.5 rounded-[14px] py-2.5 text-[12px] font-semibold transition"
                  style={{
                    backgroundColor: activeRequestTab === 'feedback' ? 'var(--color-accent-bg)' : 'transparent',
                    color: activeRequestTab === 'feedback' ? 'var(--color-accent-dark)' : 'var(--color-text-secondary)',
                  }}
                >
                  피드백 요청
                  {receivedRequests.length > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none"
                      style={{
                        backgroundColor: activeRequestTab === 'feedback' ? 'var(--color-accent-dark)' : 'var(--color-bg-muted)',
                        color: activeRequestTab === 'feedback' ? 'white' : 'var(--color-text-tertiary)',
                      }}
                    >
                      {receivedRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 연결 요청 목록 */}
            {activeRequestTab === 'connection' && (
              <div className="flex-1 overflow-y-auto px-5 space-y-3">
                {connectionRequests.length === 0 ? (
                  <p className="micro-text text-center pt-10">받은 연결 요청이 없어요</p>
                ) : connectionRequests.map((r) => (
                  <div key={r.id} className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ProfileAvatar linkId={r.linkId} name={r.name} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">{r.name}</div>
                        <div className="meta-text">{r.title}</div>
                      </div>
                      <span className="micro-text flex-shrink-0">{r.requestedAt}</span>
                    </div>
                    {r.message && (
                      <p className="surface-card-soft text-xs text-[var(--color-text-secondary)] leading-relaxed rounded-2xl px-3 py-3 mb-3">{r.message}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          store.acceptConnectionRequest(r.id)
                          showToast(`${r.name}님과 연결됐어요!`)
                        }}
                        className="flex-1 text-white text-xs font-bold py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--color-accent-dark)' }}
                      >
                        수락
                      </button>
                      <button
                        onClick={() => {
                          store.rejectConnectionRequest(r.id)
                          showToast('연결 요청을 거절했어요')
                        }}
                        className="flex-1 border text-xs font-bold py-2 rounded-xl text-[var(--color-text-secondary)]"
                        style={{ borderColor: 'var(--color-border-default)' }}
                      >
                        거절
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 피드백 요청 목록 */}
            {activeRequestTab === 'feedback' && (
              <div className="flex-1 overflow-y-auto px-5 space-y-3">
                {receivedRequests.length === 0 ? (
                  <p className="micro-text text-center pt-10">받은 피드백 요청이 없어요</p>
                ) : receivedRequests.map((r) => (
                  <div key={r.id} className="surface-card rounded-[22px] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <ProfileAvatar linkId={r.linkId} name={r.name} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">{r.name}</div>
                        <div className="meta-text">피드백 요청</div>
                      </div>
                      <span className="micro-text flex-shrink-0">{r.requestedAt}</span>
                    </div>
                    {r.message && (
                      <p className="surface-card-soft text-xs text-[var(--color-text-secondary)] leading-relaxed rounded-2xl px-3 py-3 mb-3">{r.message}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/${r.linkId}`)}
                        className="flex-1 text-white text-xs font-bold py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--color-accent-dark)' }}
                      >
                        피드백 남기기
                      </button>
                      <button
                        onClick={() => showToast('나중에 목록 하단으로 이동했어요')}
                        className="flex-1 border text-xs font-bold py-2 rounded-xl text-[var(--color-text-secondary)]"
                        style={{ borderColor: 'var(--color-border-default)' }}
                      >
                        나중에
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 연결 해제 확인 모달 */}
      <Modal open={!!disconnectTarget} onClose={() => setDisconnectTarget(null)}>
        <div className="text-center">
          <div className="text-base font-black mb-2">
            {disconnectTarget?.name}님과의 연결을 해제할까요?
          </div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mb-5 leading-relaxed">
            주고받은 메시지, 피드백, 방명록 기록은 그대로 유지돼요.<br />
            상대방에게 알림이 가지 않아요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDisconnectTarget(null)}
              className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold text-[var(--color-text-secondary)]"
              style={{ borderColor: 'var(--color-border-default)' }}
            >
              취소
            </button>
            <button
              onClick={() => {
                if (!disconnectTarget) return
                store.disconnectProfile(disconnectTarget.linkId)
                setDisconnectTarget(null)
                showToast(`${disconnectTarget.name}님과 연결을 해제했어요`)
              }}
              className="flex-1 rounded-xl border py-2.5 text-[13px] font-semibold"
              style={{ borderColor: 'rgba(198,40,40,0.28)', color: 'var(--color-state-danger-text)' }}
            >
              연결 해제
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
