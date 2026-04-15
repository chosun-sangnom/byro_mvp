'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button, ProgressBar } from '@/components/ui'

export default function HomeScreen() {
  const router = useRouter()
  const { isLoggedIn, user, login } = useByroStore()

  if (isLoggedIn && user) {
    // H-00-B: 로그인 상태
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-2 mb-5">
            <div>
              <div className="text-[11px] text-[#AAA] uppercase tracking-[0.18em]">Byro Home</div>
              <span className="text-2xl font-black">Byro</span>
            </div>
            <div className="flex-1" />
            <div className="w-10 h-10 rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#555] text-sm">
              {user.name.charAt(0)}
            </div>
          </div>

          <div className="rounded-[30px] border border-[#EBEBEB] bg-white px-4 py-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-[#1A7A1A] bg-[#E6F5E6] rounded-full px-2 py-0.5">프로필 활성</span>
              <span className="text-[10px] text-[#999]">byro.io/@{user.linkId}</span>
            </div>
            <h1 className="text-[30px] font-black leading-tight mb-2">
              말하지 않아도
              <br />
              증명되는 나
            </h1>
            <p className="text-sm text-[#555] leading-relaxed mb-4">
              오늘 만나는 사람에게 보여줄 신뢰 프로필이 준비됐습니다.
              프로필을 다듬거나 링크를 바로 공유할 수 있어요.
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-[#555] mb-1.5">
                <span>{user.name} · 프로필 완성도</span>
                <span className="font-bold text-[#111]">72%</span>
              </div>
              <ProgressBar value={72} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <HomeMetricCard label="링크" value={`@${user.linkId}`} />
              <HomeMetricCard label="평판" value="23회" />
              <HomeMetricCard label="저장" value="8명" />
            </div>
          </div>

          <div className="space-y-2 mb-5">
            <JourneyCard
              icon="🔍"
              title="Before"
              description="모임 전날 링크 하나로 검증 정보와 하이라이트를 확인"
            />
            <JourneyCard
              icon="💬"
              title="During"
              description="한 줄 소개와 키워드로 나를 빠르게 설명"
            />
            <JourneyCard
              icon="⭐"
              title="After"
              description="경험과 평판이 쌓이며 다음 만남의 신뢰 자산이 됨"
            />
          </div>

          <div className="rounded-[24px] border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-4 mb-5">
            <div className="text-sm font-black mb-1">다음 액션</div>
            <div className="text-xs text-[#666] leading-relaxed mb-3">
              프로필을 더 정리하거나, 공개 링크를 열어 실제로 어떻게 보이는지 확인해보세요.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => router.push(`/${user.linkId}`)}>공개 링크 보기</Button>
              <Button onClick={() => router.push('/me')}>내 프로필 관리</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // H-00-A: 비로그인 상태
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-1 px-5 py-4">
        <div className="rounded-[32px] border border-[#EBEBEB] bg-white px-5 py-7 mb-5 text-center">
          <div className="text-[11px] text-[#AAA] uppercase tracking-[0.18em] mb-2">Build Your Real Offline Identity</div>
          <div className="text-3xl font-black mb-3">Byro</div>
          <h1 className="text-[32px] font-black leading-tight mb-3">
            말하지 않아도
            <br />
            증명되는 나
          </h1>
          <p className="text-sm text-[#555] leading-relaxed">
            비즈니스 모임에서 명함 대신
            <br />
            링크 하나로 신뢰를 공유하세요.
          </p>
        </div>

        <div className="rounded-[24px] border border-[#EBEBEB] bg-[#FAFAFA] px-4 py-4 mb-4">
          <div className="text-sm font-black mb-1">왜 Byro인가요?</div>
          <div className="text-xs text-[#666] leading-relaxed">
            프로필 링크 하나로 경력, SNS, 하이라이트, 평판을 연결해
            오프라인 만남의 신뢰를 더 빠르게 만듭니다.
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <JourneyCard
            icon="🔍"
            title="Before"
            description="모임 전날 링크 하나로 경력 검증 정보 확인"
          />
          <JourneyCard
            icon="💬"
            title="During"
            description="한 마디 소개와 키워드로 프로필 전달"
          />
          <JourneyCard
            icon="⭐"
            title="After"
            description="경험과 평판이 누적되며 다음 만남의 자산이 됨"
          />
        </div>

        <Button onClick={() => router.push('/onboarding')}>내 Byro 만들기</Button>
        <button
          className="w-full text-center text-sm text-[#888] mt-3"
          onClick={() => login()}
        >
          이미 계정이 있으신가요? <b className="text-[#0A0A0A]">로그인</b>
        </button>
      </div>
    </div>
  )
}

function JourneyCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-[22px] border border-[#EBEBEB] bg-white px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-bold text-[#111]">{title}</span>
      </div>
      <div className="text-xs text-[#777] leading-relaxed">{description}</div>
    </div>
  )
}

function HomeMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F7F7] px-3 py-3 text-center">
      <div className="text-[11px] text-[#888] mb-1">{label}</div>
      <div className="text-sm font-black text-[#111] truncate">{value}</div>
    </div>
  )
}
