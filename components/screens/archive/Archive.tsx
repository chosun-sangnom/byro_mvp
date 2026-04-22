'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { showToast } from '@/components/ui'
import { SAMPLE_PROFILE } from '@/lib/mockData'

export default function Archive() {
  const router = useRouter()
  const store = useByroStore()

  useEffect(() => {
    if (!store.isLoggedIn) {
      router.replace('/onboarding')
    }
  }, [store.isLoggedIn, router])

  if (!store.isLoggedIn) return null

  const { activeArchiveTab, setActiveArchiveTab } = store
  const { savedProfiles, recentProfiles, receivedRequests } = SAMPLE_PROFILE

  const tabs = [
    { key: 'saved', label: `저장 ${savedProfiles.length}` },
    { key: 'recent', label: '🕐 최근 본' },
    { key: 'requests', label: `받은 요청 [${receivedRequests.length}]` },
  ] as const

  return (
    <div className="flex flex-col h-full">
      {/* 네비 */}
      <div className="flex items-center px-5 h-12 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border-default)' }}>
        <button onClick={() => router.back()} className="text-sm mr-3 text-[var(--color-text-secondary)]">‹</button>
        <div>
          <div className="micro-text uppercase tracking-[0.18em]">Archive</div>
          <span className="text-base font-black">아카이브</span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3">
        <div className="surface-card px-4 py-4 rounded-[28px]">
          <div className="text-sm font-black mb-1">만났던 사람과 신뢰 기록</div>
          <div className="meta-text leading-relaxed mb-4">
            저장한 프로필, 최근 본 사람, 경험 요청을 한 곳에서 관리할 수 있어요.
          </div>
          <div className="grid grid-cols-3 gap-2">
            <ArchiveMetricCard label="저장" value={String(savedProfiles.length)} />
            <ArchiveMetricCard label="최근 본" value={String(recentProfiles.length)} />
            <ArchiveMetricCard label="요청" value={String(receivedRequests.length)} />
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex px-5 gap-2 flex-shrink-0 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveArchiveTab(tab.key)}
            className={[
              'flex-1 min-w-fit py-2.5 px-3 text-xs font-semibold rounded-full border transition-colors',
              activeArchiveTab === tab.key
                ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                : 'bg-white text-[var(--color-text-secondary)]',
            ].join(' ')}
            style={activeArchiveTab === tab.key ? undefined : { borderColor: 'var(--color-border-default)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto">
        {/* 저장 탭 */}
        {activeArchiveTab === 'saved' && (
          <div className="px-5 py-3">
            <div className="micro-text mb-3">메모와 함께 저장한 프로필</div>
            {savedProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push('/jiminlee')}
                className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3"
              >
                {p.name === '이지민' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/jimin-profile-5x4.jpg" alt={`${p.name} 프로필 사진`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#555] text-sm flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-sm font-bold">{p.name}</div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] rounded-full px-2 py-0.5">저장됨</span>
                  </div>
                  <div className="meta-text mt-0.5">{p.title}</div>
                  {p.memo && (
                    <div className="text-xs text-[var(--color-text-primary)] rounded-full px-2.5 py-1 mt-2 inline-block" style={{ backgroundColor: '#FFF8E6' }}>
                      📝 {p.memo}
                    </div>
                  )}
                </div>
                <div className="micro-text">{p.savedAt}</div>
              </button>
            ))}
          </div>
        )}

        {/* 최근 본 탭 */}
        {activeArchiveTab === 'recent' && (
          <div className="px-5 py-3">
            <div className="micro-text mb-3">최근 확인한 공개 프로필</div>
            {recentProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push('/jiminlee')}
                className="surface-card flex items-center gap-3 rounded-[22px] px-4 py-4 w-full text-left mb-3"
              >
                {p.name === '이지민' ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/jimin-profile-5x4.jpg" alt={`${p.name} 프로필 사진`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#555] text-sm flex-shrink-0">
                    {p.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="meta-text mt-0.5">{p.title}</div>
                </div>
                <div className="micro-text">{p.viewedAt}</div>
              </button>
            ))}
          </div>
        )}

        {/* 받은 요청 탭 */}
        {activeArchiveTab === 'requests' && (
          <div className="px-5 py-3">
            <div className="micro-text mb-3">다른 사람이 남긴 경험 요청</div>
            {receivedRequests.map((r) => (
              <div key={r.id} className="surface-card rounded-[24px] p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  {r.name === '이지민' ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e0e0e0] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/jimin-profile-5x4.jpg" alt={`${r.name} 프로필 사진`} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#555] text-sm flex-shrink-0">
                      {r.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">{r.name}</div>
                    <div className="micro-text">경험 요청 도착</div>
                  </div>
                  <span className="micro-text">{r.requestedAt}</span>
                </div>
                {r.message
                  ? <p className="surface-card-soft text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed rounded-2xl px-3 py-3">{r.message}</p>
                  : <p className="micro-text mb-3 italic">요청 메시지 없음</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/jiminlee')}
                    className="flex-1 text-white text-xs font-bold py-2 rounded-xl"
                    style={{ backgroundColor: 'var(--color-accent-dark)' }}
                  >
                    경험 남기기
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
    </div>
  )
}

function ArchiveMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card-soft rounded-2xl px-3 py-3 text-center">
      <div className="micro-text mb-1">{label}</div>
      <div className="text-sm font-black text-[var(--color-text-strong)]">{value}</div>
    </div>
  )
}
