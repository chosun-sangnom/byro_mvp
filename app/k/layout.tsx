import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// SCRUM-159 — 공유 리포트는 검색 노출 제외. 리포트별 OG 카드(제목, 설명, 썸네일)는 서버 구현 범위
export const metadata: Metadata = {
  title: '케미 리포트 | Felore',
  robots: { index: false, follow: false },
}

export default function KemiShareLayout({ children }: { children: ReactNode }) {
  return children
}
