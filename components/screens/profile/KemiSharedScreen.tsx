'use client'

/**
 * KemiSharedScreen — 공유 링크(/k/토큰)로 연 케미 리포트 (SCRUM-159)
 *
 * 로그인 없이 공유한 사람의 리포트 전체를 보여준다. 무료 이용 횟수와 무관.
 * 리포트 생성 24시간 뒤에는 만료 화면을 보여준다.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import { KemiReportBody } from '@/components/screens/profile/KemiReportScreen'
import { LoginModal } from '@/components/screens/profile/LoginModal'
import {
  kemiShareExpiresAt,
  loadKemiShare,
  maskKemiProfile,
  type KemiShareSnapshot,
} from '@/components/screens/profile/kemiShare'
import { BODY, FAINT, HAIRLINE, INK, KEMI_ANIM_CSS, MUTED } from '@/components/screens/profile/kemiReportUi'

function SharedHeader() {
  return (
    <div className="flex h-12 flex-shrink-0 items-center justify-center border-b px-2" style={{ borderColor: HAIRLINE }}>
      <span className="text-[16px] font-bold" style={{ color: INK }}>케미 리포트</span>
    </div>
  )
}

function KemiShareUnavailable({ expired, onCta }: { expired: boolean; onCta: () => void }) {
  // AppShell 안에서 h-full은 늘어나지 않아 flex-1로 남은 높이를 채운다
  return (
    <div className="font-pretendard flex flex-1 flex-col bg-white">
      <SharedHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full" style={{ background: '#F2F3F5' }}>
          <Clock size={26} color={MUTED} />
        </div>
        <h1 className="mt-5 text-[20px] font-bold tracking-[-0.03em]" style={{ color: INK }}>
          {expired ? '공유 기간이 끝난 리포트예요' : '리포트를 찾을 수 없어요'}
        </h1>
        <p className="mt-2 text-[14px] font-medium leading-[1.6]" style={{ color: BODY }}>
          {expired
            ? '케미 리포트는 만들어진 뒤 24시간 동안만 볼 수 있어요.'
            : '링크가 잘못됐거나 이미 사라진 리포트예요.'}
        </p>
      </div>
      <div className="px-5 pb-9">
        <Button onClick={onCta}>내 케미 확인하기</Button>
      </div>
    </div>
  )
}

function remainingLabel(snapshot: KemiShareSnapshot) {
  const hours = Math.ceil((kemiShareExpiresAt(snapshot) - Date.now()) / (60 * 60 * 1000))
  return hours <= 1 ? '1시간 안에 만료돼요' : `${hours}시간 뒤에 만료돼요`
}

export default function KemiSharedScreen({ token }: { token: string }) {
  const router = useRouter()
  const store = useFeloreStore()
  const [mounted, setMounted] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const isLoggedIn = store.isLoggedIn
  const snapshot = loadKemiShare(token)
  const expired = !!snapshot && Date.now() > kemiShareExpiresAt(snapshot)

  const goMyKemi = () => {
    if (isLoggedIn) router.push('/')
    else setLoginOpen(true)
  }

  if (!snapshot || expired) {
    return (
      <>
        <KemiShareUnavailable expired={expired} onCta={goMyKemi} />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </>
    )
  }

  const baseProfile = getNormalizedPublicProfile({ username: snapshot.targetUsername })
  const profile = snapshot.targetMasked ? maskKemiProfile(baseProfile) : baseProfile
  const profileAvatar = snapshot.targetMasked ? undefined : (profile.profileImages?.[0] ?? profile.avatarImage)
  const recipientIsTarget = isLoggedIn && store.user?.linkId === snapshot.targetUsername
  const recipientIsSharer = isLoggedIn && !!snapshot.viewer.linkId && store.user?.linkId === snapshot.viewer.linkId

  // 받은 사람에 따라 CTA가 달라진다: 상대 본인이면 공유한 사람 프로필, 상대가 공개 중이면 나도 상대와 케미, 아니면 내 케미
  let cta: { label: string; onClick: () => void } | null = null
  if (recipientIsSharer) {
    cta = null
  } else if (recipientIsTarget && snapshot.viewer.linkId) {
    cta = { label: `${snapshot.viewer.name}님 프로필 보기`, onClick: () => router.push(`/${snapshot.viewer.linkId}`) }
  } else if (!snapshot.targetMasked) {
    cta = {
      label: `나도 ${profile.name}님과 케미 보기`,
      onClick: () => (isLoggedIn ? router.push(`/${snapshot.targetUsername}/kemi-report`) : setLoginOpen(true)),
    }
  } else {
    cta = { label: '내 케미 확인하기', onClick: goMyKemi }
  }

  return (
    <div className="font-pretendard flex h-full flex-col bg-white">
      <style>{KEMI_ANIM_CSS}</style>
      <SharedHeader />
      <div className="flex items-center justify-center gap-1.5 px-5 pt-3 text-[12px] font-medium" style={{ color: MUTED }}>
        <span>{recipientIsTarget ? `${snapshot.viewer.name}님이 나와의 케미를 공유했어요` : `${snapshot.viewer.name}님이 공유한 리포트예요`}</span>
        <span aria-hidden style={{ color: FAINT }}>|</span>
        <span>{remainingLabel(snapshot)}</span>
      </div>

      <KemiReportBody
        viewer={snapshot.viewer}
        viewerAvatar={snapshot.viewer.avatar}
        profile={profile}
        profileAvatar={profileAvatar}
        profileMasked={snapshot.targetMasked}
        footer={() => (
          <div className="px-5 pb-9 pt-7">
            {cta && <Button onClick={cta.onClick}>{cta.label}</Button>}
            <p className="mt-3 text-center text-[11.5px] font-medium leading-[1.5]" style={{ color: FAINT }}>
              <Link href="/" className="underline underline-offset-2">Felore</Link>에서 나와 잘 맞는 사람을 찾아보세요
            </p>
          </div>
        )}
      />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
