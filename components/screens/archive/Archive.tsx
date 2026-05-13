'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { SAMPLE_PROFILE, getProfileAvatar } from '@/lib/mocks/publicProfiles'

export default function Archive() {
  const router = useRouter()
  const store = useByroStore()

  const [activeRequestTab, setActiveRequestTab] = useState<'connection' | 'feedback'>('connection')

  useEffect(() => {
    if (!store.isLoggedIn) {
      router.replace('/onboarding')
    }
  }, [store.isLoggedIn, router])

  if (!store.isLoggedIn) return null

  const { activeArchiveTab, setActiveArchiveTab } = store
  const { savedProfiles, recentProfiles, receivedRequests, connectionRequests } = SAMPLE_PROFILE

  const totalRequests = receivedRequests.length + connectionRequests.length

  const tabs = [
    { key: 'connected' as const, label: `연결된 사람 ${savedProfiles.length}` },
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
          <div className="px-5 py-2">
            {savedProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/${p.linkId}`)}
                className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3"
              >
                <ProfileAvatar linkId={p.linkId} name={p.name} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-bold">{p.name}</div>
                    <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ color: 'var(--color-accent-dark)', background: 'var(--color-accent-bg)' }}>연결됨</span>
                  </div>
                  <div className="meta-text mt-0.5">{p.title}</div>
                  {p.memo && (
                    <div className="text-xs text-[var(--color-text-secondary)] rounded-full px-2.5 py-1 mt-2 inline-block bg-[var(--color-bg-muted)] border border-[var(--color-border-default)]">
                      📝 {p.memo}
                    </div>
                  )}
                </div>
                <div className="micro-text flex-shrink-0">{p.savedAt}</div>
              </button>
            ))}
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
                        onClick={() => showToast('연결 요청을 수락했어요')}
                        className="flex-1 text-white text-xs font-bold py-2 rounded-xl"
                        style={{ backgroundColor: 'var(--color-accent-dark)' }}
                      >
                        수락
                      </button>
                      <button
                        onClick={() => showToast('연결 요청을 거절했어요')}
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
