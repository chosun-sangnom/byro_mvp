'use client'

/**
 * 케미 리포트 공용 UI 토큰·조각
 *
 * 두 사람 리포트(KemiReportScreen)와 내 케미리포트(PublicProfileKemiZone)가
 * 같은 팔레트·타이포·불릿을 쓰도록 한 곳에 모아둔다. 새 색을 만들지 않고
 * 프로필 화면들이 이미 쓰던 값에 이름만 붙였다.
 */

export const HAIRLINE = '#DEE4EC'
export const INK = '#0D0D0D'
export const BODY = '#475058'
export const MUTED = '#6C7786'
export const FAINT = '#A8B1BD'
export const ACCENT = '#25313D'
export const WARN = '#D95F00'

/** 케미의 블루 아이덴티티는 유지하되 아래로 갈수록 앱 액센트(#25313D)에 가깝게 떨어뜨린다 */
export const HERO_GRADIENT =
  'radial-gradient(135% 105% at 18% -8%, #8FCCFF 0%, #57A9FF 22%, #2183FB 44%, #0B57D6 68%, #1B3A78 100%)'

/** 히어로·레이더·항목 등장 애니메이션 (스코프용 접두사 kemi-) */
export const KEMI_ANIM_CSS = `
@keyframes kemiCrossL { from { opacity: 0; transform: translateX(30px) scale(.78) } to { opacity: 1; transform: translateX(0) scale(1) } }
@keyframes kemiCrossR { from { opacity: 0; transform: translateX(-30px) scale(.78) } to { opacity: 1; transform: translateX(0) scale(1) } }
@keyframes kemiPop { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: scale(1) } }
@keyframes kemiFadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
/* 한글은 어절 중간에서 끊기면 읽기 나쁘다 — 리포트 본문에만 keep-all 적용 */
[data-kemi-report] p, [data-kemi-report] h1, [data-kemi-report] h3 { word-break: keep-all; overflow-wrap: break-word; }
@media (prefers-reduced-motion: reduce) {
  [data-kemi-anim] { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`

/**
 * 항목 카드 안의 포인트 목록.
 * 불릿을 텍스트(`· `)가 아니라 별도 요소로 빼서, 줄바꿈된 문장이 불릿 아래로
 * 흘러내리지 않고 왼쪽이 가지런히 맞도록 한다.
 */
export function PointGroup({
  tone,
  title,
  items,
}: {
  tone: 'good' | 'watch'
  title: string
  items: string[]
}) {
  const color = tone === 'good' ? ACCENT : WARN
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-bold tracking-[-0.01em]" style={{ color }}>{title}</p>
      <div className="flex flex-col gap-1.5">
        {items.map((text, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-[7.5px] size-[3px] shrink-0 rounded-full" style={{ background: FAINT }} />
            <p className="flex-1 text-[13px] leading-[1.62]" style={{ color: BODY }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 항목 카드 껍데기 — 두 리포트가 같은 라운드·보더·그림자를 쓰게 한다 */
export function KemiAxisCard({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] px-[18px] py-[18px]"
      style={{ border: `1px solid ${HAIRLINE}`, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', ...style }}
    >
      {children}
    </div>
  )
}

/** 잠긴 항목 위에 얹는 넛지 오버레이 */
export function KemiLockedOverlay({ missingItems }: { missingItems: string[] }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6" style={{ background: 'rgba(255,255,255,0.55)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/kemi/locked-alert.svg" alt="" className="size-8" />
      <p className="text-center text-[13px] font-semibold leading-[1.4]" style={{ color: INK }}>
        {missingItems.join(' · ')} 채우면 열려요
      </p>
    </div>
  )
}
