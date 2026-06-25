// [임시] 템플릿 기반 네트워크 인사이트 생성
// 실제 구현 시 서버사이드 LLM 호출로 교체 (명함 데이터 전체 컨텍스트 기반)

import type { RememberIndustry } from '@/types'

export type NetworkInsightResult = {
  text: string
  isMatch: boolean
}

export function generateNetworkInsight({
  profileName,
  total,
  industries,
  topIndustryRanks,
  topIndustryRoles,
  viewerDomain,
}: {
  profileName: string
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  topIndustryRanks?: RememberIndustry[]
  topIndustryRoles?: RememberIndustry[]
  viewerDomain: string
}): NetworkInsightResult {
  const top = industries[0]
  const isMatch = top?.name === viewerDomain
  const viewerIndustry = industries.find((i) => i.name === viewerDomain)

  const topRole = topIndustryRoles?.[0]
  const topRank = topIndustryRanks?.[0]

  if (isMatch) {
    const roleStr = topRole ? ` ${topRole.name}이 ${topRole.ratio}%로 가장 많고,` : ''
    const rankStr = topRank ? ` ${topRank.name} 비율이 ${topRank.ratio}%로 높아 의사결정자와의 연결이 탄탄해요.` : ''
    return {
      text: `${profileName}님의 핵심 네트워크가 회원님의 관심 분야인 ${viewerDomain}이에요. 전체 ${total}명 중 ${top.count ?? Math.round(total * top.ratio / 100)}명(${top.ratio}%)이 해당 업계이며,${roleStr}${rankStr}`,
      isMatch: true,
    }
  }

  if (viewerIndustry) {
    const count = viewerIndustry.count ?? Math.round(total * viewerIndustry.ratio / 100)
    const topStr = top ? `${profileName}님은 ${top.name} 중심(${top.ratio}%)의 네트워크를 갖고 있어요. ` : ''
    return {
      text: `${topStr}회원님이 관심 있는 ${viewerDomain} 업계와도 ${viewerIndustry.ratio}%(${count}명)로 연결되어 있어 접점을 찾기 좋아요.`,
      isMatch: false,
    }
  }

  // 뷰어 도메인이 상대 네트워크에 없는 경우
  const others = industries.slice(1, 3).map((i) => i.name).join(', ')
  const topStr = top ? `${profileName}님은 ${top.name} 중심(${top.ratio}%)의 네트워크예요. ` : ''
  return {
    text: `${topStr}회원님이 관심 있는 ${viewerDomain} 업계와의 직접 접점은 적지만${others ? `, ${others} 등 다양한 분야와 연결되어 있어요` : '요'}.`,
    isMatch: false,
  }
}
