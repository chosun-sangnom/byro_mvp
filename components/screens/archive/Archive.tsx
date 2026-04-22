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
      <div className="flex items-center px-5 h-12 border-b border-[#EBEBEB] flex-shrink-0">
        <button onClick={() => router.back()} className="text-sm text-[#555] mr-3">‹</button>
        <div>
          <div className="text-[11px] text-[#AAA] uppercase tracking-[0.18em]">Archive</div>
          <span className="text-base font-black">아카이브</span>
        </div>
      </div>

      <div className="px-5 pt-4 pb-3">
        <div className="rounded-[28px] border border-[#EBEBEB] bg-white px-4 py-4">
          <div className="text-sm font-black mb-1">만났던 사람과 신뢰 기록</div>
          <div className="text-xs text-[#666] leading-relaxed mb-4">
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
                : 'border-[#E2E2E2] bg-white text-[#888]',
            ].join(' ')}
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
            <div className="text-xs text-[#AAA] mb-3">메모와 함께 저장한 프로필</div>
            {savedProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push('/jiminlee')}
                className="flex items-center gap-3 rounded-[22px] border border-[#EBEBEB] bg-white px-4 py-4 w-full text-left mb-3"
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
                    <span className="text-[10px] text-[#888] bg-[#F5F5F5] rounded-full px-2 py-0.5">저장됨</span>
                  </div>
                  <div className="text-xs text-[#888] mt-0.5">{p.title}</div>
                  {p.memo && (
                    <div className="text-xs text-[#444] bg-[#fffde7] rounded-full px-2.5 py-1 mt-2 inline-block">
                      📝 {p.memo}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-[#BBB]">{p.savedAt}</div>
              </button>
            ))}
          </div>
        )}

        {/* 최근 본 탭 */}
        {activeArchiveTab === 'recent' && (
          <div className="px-5 py-3">
            <div className="text-xs text-[#AAA] mb-3">최근 확인한 공개 프로필</div>
            {recentProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push('/jiminlee')}
                className="flex items-center gap-3 rounded-[22px] border border-[#EBEBEB] bg-white px-4 py-4 w-full text-left mb-3"
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
                  <div className="text-xs text-[#888] mt-0.5">{p.title}</div>
                </div>
                <div className="text-[11px] text-[#BBB]">{p.viewedAt}</div>
              </button>
            ))}
          </div>
        )}

        {/* 받은 요청 탭 */}
        {activeArchiveTab === 'requests' && (
          <div className="px-5 py-3">
            <div className="text-xs text-[#AAA] mb-3">다른 사람이 남긴 경험 요청</div>
            {receivedRequests.map((r) => (
              <div key={r.id} className="border border-[#EBEBEB] rounded-[24px] bg-white p-4 mb-3">
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
                    <div className="text-[11px] text-[#AAA]">경험 요청 도착</div>
                  </div>
                  <span className="text-xs text-[#bbb]">{r.requestedAt}</span>
                </div>
                {r.message
                  ? <p className="text-xs text-[#555] mb-3 leading-relaxed rounded-2xl bg-[#FAFAFA] border border-[#F0F0F0] px-3 py-3">{r.message}</p>
                  : <p className="text-xs text-[#aaa] mb-3 italic">요청 메시지 없음</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/jiminlee')}
                    className="flex-1 bg-[#0A0A0A] text-white text-xs font-bold py-2 rounded-xl"
                  >
                    경험 남기기
                  </button>
                  <button
                    onClick={() => showToast('나중에 목록 하단으로 이동했어요')}
                    className="flex-1 border border-[#ddd] text-xs font-bold py-2 rounded-xl text-[#555]"
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
    <div className="rounded-2xl bg-[#F7F7F7] px-3 py-3 text-center">
      <div className="text-[11px] text-[#888] mb-1">{label}</div>
      <div className="text-sm font-black text-[#111]">{value}</div>
    </div>
  )
}
