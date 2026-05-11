'use client'

/**
 * /[username] — 공개 프로필 페이지
 *
 * owner / visitor 구분은 PublicProfileShell 내부에서 처리.
 * (store.user.linkId === username 여부로 판별)
 *
 * 탭 상태는 URL이 아닌 클라이언트 state로 관리.
 * → 탭 전환 시 페이지 이동 없음, 스크롤 위치 유지
 * TODO(url-tab): 딥링크가 필요한 경우 searchParams로 탭 상태 동기화 고려
 *
 * 탭 구성:
 *   나 (who)        — 커리어 · 하이라이트 · SNS
 *   라이프 (life)   — 취향 · 일상 · 장소
 *   평판 (reputation) — 평판 키워드 · 방명록
 */

import { useState } from 'react'
import { PublicProfileShell } from '@/components/screens/profile/PublicProfileShell'
import { type PublicProfileTabId } from '@/components/screens/profile/PublicProfileTabBar'
import {
  PublicProfileLifeTabPage,
  PublicProfileReputationTabPage,
  PublicProfileWhoTabPage,
} from '@/components/screens/profile/PublicProfileTabPages'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [activeTab, setActiveTab] = useState<PublicProfileTabId>('who')

  return (
    <PublicProfileShell
      username={params.username}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'who' && <PublicProfileWhoTabPage username={params.username} />}
      {activeTab === 'life' && <PublicProfileLifeTabPage username={params.username} />}
      {activeTab === 'reputation' && <PublicProfileReputationTabPage username={params.username} />}
    </PublicProfileShell>
  )
}
