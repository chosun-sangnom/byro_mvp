'use client'

/**
 * KemiReportScreen — 케미 리포트 전용 페이지 (2026-09 재설계)
 *
 * 이전엔 PublicProfileCompatibilitySheet(바텀시트)였으나, 축당 근거를
 * "좋은 점 / 짚어볼 점"으로 세세하게 풀어 보여주는 밀도라 시트에는 안 들어가
 * 전용 페이지(`/[username]/kemi-report`)로 전환했다. 사주 궁합처럼 세세하게
 * 푸는 건 "풀이의 밀도" 얘기지 사주 로직을 쓴다는 뜻이 아니다 — 모든 문장은
 * 여전히 실제 프로필 필드 근거를 단다 (생년월일·생시 미사용).
 *
 * TODO(real API): GAP-8 — kemiReport.ts의 목업 규칙 생성을 서버/LLM으로 교체.
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Download, Share2 } from 'lucide-react'
import { showToast } from '@/components/ui'
import { useFeloreStore } from '@/store/useFeloreStore'
import { useProfileOwner } from '@/hooks/useProfileOwner'
import { getNormalizedPublicProfile } from '@/components/screens/profile/publicProfileData'
import {
  AXIS_ORDER,
  buildKemiReport,
  computeKemiScore,
} from '@/components/screens/profile/kemiReport'
import type { KemiAxisReport, KemiPurpose } from '@/types'

const HAIRLINE = '#DEE4EC'

// 히어로·레이더·항목 등장 애니메이션 키프레임 (스코프용 접두사 kemi-)
const KEMI_ANIM_CSS = `
@keyframes kemiCrossL { from { opacity: 0; transform: translateX(34px) scale(.72) } to { opacity: 1; transform: translateX(0) scale(1) } }
@keyframes kemiCrossR { from { opacity: 0; transform: translateX(-34px) scale(.72) } to { opacity: 1; transform: translateX(0) scale(1) } }
@keyframes kemiPop { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: scale(1) } }
@keyframes kemiFadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
@media (prefers-reduced-motion: reduce) {
  [data-kemi-anim] { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`

// ── 오각형 레이더 차트 ───────────────────────────────────────────────────
function KemiRadar({ axes, score }: { axes: KemiAxisReport[]; score: number }) {
  const cx = 120
  const cy = 112
  const maxR = 78

  const [filled, setFilled] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 160)
    return () => clearTimeout(t)
  }, [])

  const angleFor = (i: number) => (360 / axes.length) * i - 90
  const point = (i: number, r: number) => {
    const rad = (angleFor(i) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const ringPoints = (r: number) => axes.map((_, i) => point(i, r)).map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = axes.map((a, i) => point(i, (Math.max(a.strength, 4) / 100) * maxR)).map((p) => `${p.x},${p.y}`).join(' ')
  const centerOrigin = { transformOrigin: `${cx}px ${cy}px` } as const

  return (
    <svg viewBox="0 0 240 224" role="img" aria-label="다섯 축 케미 레이더" className="mx-auto w-full max-w-[220px]">
      {[1 / 3, 2 / 3, 1].map((f) => (
        <polygon key={f} points={ringPoints(maxR * f)} fill="none" stroke={HAIRLINE} strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const p = point(i, maxR)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={HAIRLINE} strokeWidth={1} />
      })}
      <polygon
        points={areaPoints}
        fill="var(--color-accent-dark)"
        fillOpacity={0.16}
        stroke="var(--color-accent-dark)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{
          ...centerOrigin,
          transform: filled ? 'scale(1)' : 'scale(0.02)',
          opacity: filled ? 1 : 0,
          transition: 'transform 0.85s cubic-bezier(0.34,1.4,0.5,1), opacity 0.5s ease',
        }}
      />
      {axes.map((a, i) => {
        const p = point(i, (Math.max(a.strength, 4) / 100) * maxR)
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2.6}
            fill="var(--color-accent-dark)"
            style={{
              ...centerOrigin,
              transform: filled ? 'scale(1)' : 'scale(0)',
              opacity: filled ? 1 : 0,
              transition: `transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.05}s, opacity 0.3s ease ${0.2 + i * 0.05}s`,
            }}
          />
        )
      })}
      {axes.map((a, i) => {
        const p = point(i, maxR + 18)
        const anchor = Math.abs(p.x - cx) < 4 ? 'middle' : p.x > cx ? 'start' : 'end'
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fontWeight={700}
            fill={a.locked ? '#A8B1BD' : '#475058'}
          >
            {a.label}
          </text>
        )
      })}
      <circle cx={cx} cy={cy} r={27} fill="#fff" stroke={HAIRLINE} strokeWidth={1} />
      <text x={cx} y={cy - 2} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0D0D0D">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={8} fontWeight={700} letterSpacing="0.05em" fill="#6C7786">케미 점수</text>
    </svg>
  )
}

// ── 공유 카드 (html2canvas 캡처 + 미리보기 겸용) ────────────────────────────
function AvatarCircle({ src, name, size, fontSize }: { src?: string; name: string; size: number; fontSize: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '0.66px solid rgba(255,255,255,0.85)', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #BFDBFE, #2563EB)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '0.66px solid rgba(255,255,255,0.85)', flexShrink: 0,
    }}>
      <span style={{ fontSize, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{name.charAt(0)}</span>
    </div>
  )
}

function ShareCard({
  cardRef,
  viewerName,
  viewerAvatar,
  profileName,
  profileAvatar,
  score,
  tags,
  offscreen,
}: {
  cardRef?: React.RefObject<HTMLDivElement>
  viewerName: string
  viewerAvatar?: string
  profileName: string
  profileAvatar?: string
  score: number
  tags: string[]
  offscreen?: boolean
}) {
  return (
    <div
      ref={cardRef}
      style={{
        ...(offscreen ? { position: 'fixed', left: '-9999px', top: 0, width: '328px' } : { width: '100%' }),
        background: '#FFFFFF',
        borderRadius: '12px',
        fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: 'hidden',
        border: offscreen ? undefined : `0.66px solid ${HAIRLINE}`,
      }}
    >
      <div style={{
        position: 'relative',
        background: 'radial-gradient(circle at 28% 8%, #73B9FF 0%, #57ABFF 22%, #3A9DFF 38%, #1D8EFF 52%, #0E87FF 62%, #0080FF 72%, #0657FF 100%)',
        padding: '24px',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)',
          background: '#FFFFFF', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px',
          padding: '4px 6px', display: 'flex', alignItems: 'center', gap: '2px',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/kemi/report-badge-icon.svg" alt="" style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#25313D' }}>Kemi Report</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={viewerAvatar} name={viewerName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{viewerName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <AvatarCircle src={profileAvatar} name={profileName} size={64} fontSize={22} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{profileName}</span>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#6C7786' }}>케미 점수</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#0D0D0D' }}>{score}점</span>
          </div>
          <div style={{ height: '4px', borderRadius: '100px', background: HAIRLINE, width: '100%' }}>
            <div style={{ height: '100%', borderRadius: '100px', background: '#25313D', width: `${score}%` }} />
          </div>
        </div>
        {tags.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#6C7786', marginBottom: '12px' }}>강한 축</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tags.map((tag) => (
                <span key={tag} style={{ background: '#F0F5FF', color: '#25313D', borderRadius: '8px', padding: '6px 10px', fontSize: '14px', fontWeight: 700 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 분석 중 로딩 화면 (학력 OCR 인증 화면과 동일한 스피너·레이아웃) ─────────────
const KEMI_ANALYZE_STEPS = [
  '이름·프로필 인식 중...',
  '경력·평판 분석 중...',
  '성격·생활·취향 분석 중...',
  '케미 리포트 정리 중...',
]

function KemiAnalyzing({ targetName, onBack, onDone }: { targetName: string; onBack: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 700),
      setTimeout(() => setStep(2), 1400),
      setTimeout(() => setStep(3), 2100),
      setTimeout(onDone, 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-[100] mx-auto flex w-full max-w-[430px] flex-col bg-white">
      <div className="flex h-12 flex-shrink-0 items-center px-2" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <button onClick={onBack} className="flex items-center p-2" style={{ color: '#0D0D0D' }}>
          <ChevronLeft size={20} />
        </button>
      </div>
      <div className="px-5 pt-2">
        <h1 className="text-[22px] font-bold text-[#0D0D0D]">{targetName}님과의 케미 리포트</h1>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/ai-tools/ocr-loading-spinner.svg" alt="" className="h-12 w-12 animate-spin" />
        <p className="text-[14px] font-semibold text-[#475058]">{KEMI_ANALYZE_STEPS[step]}</p>
      </div>
    </div>
  )
}

// ── 메인 스크린 ─────────────────────────────────────────────────────────
export default function KemiReportScreen({ username }: { username: string }) {
  const router = useRouter()
  const store = useFeloreStore()
  const { isOwner, isLoggedIn, user } = useProfileOwner(username)

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (isOwner || !isLoggedIn) router.replace(`/${username}`)
  }, [mounted, isOwner, isLoggedIn, router, username])

  const profile = getNormalizedPublicProfile({
    username,
    user: store.user,
    ownerHighlights: store.highlights,
    ownerTabVisibility: store.tabVisibility,
  })

  const [purpose, setPurpose] = useState<KemiPurpose>('work')
  const [sharing, setSharing] = useState(false)
  const [analyzing, setAnalyzing] = useState(true)
  const cardRef = useRef<HTMLDivElement>(null)

  const viewerName = user?.name ?? '나'
  const viewerAvatar = user?.profileImages?.[0] ?? user?.avatarImage
  const profileAvatar = profile.profileImages?.[0] ?? profile.avatarImage

  const report = buildKemiReport(
    purpose,
    { name: viewerName, title: user?.title ?? '', whoIAm: user?.whoIAm, life: user?.life },
    profile,
    // [임시] 강명구 리포트에선 생활 축 잠금(뷰어 미입력) 패턴을 목업으로 보여준다
    { forceLifeLock: username === 'mk' },
  )

  if (!mounted || isOwner || !isLoggedIn) return null

  if (analyzing) {
    return <KemiAnalyzing targetName={profile.name} onBack={() => router.back()} onDone={() => setAnalyzing(false)} />
  }

  const archetype = report.archetype
  const score = computeKemiScore(report.axes, purpose)
  const strongTags = [...report.axes]
    .filter((a) => !a.locked && !a.partial)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((a) => a.label)

  const handleShare = async () => {
    if (!cardRef.current || sharing) return
    setSharing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true, logging: false })
      await new Promise<void>((resolve) => {
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(); return }
          const file = new File([blob], `felore-kemi-${profile.name}.png`, { type: 'image/png' })
          try {
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({ files: [file], title: `${profile.name}님과의 케미 리포트`, text: `felore에서 ${profile.name}님과의 케미를 확인했어요!` })
            } else {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `felore-kemi-${profile.name}.png`
              a.click()
              URL.revokeObjectURL(url)
              showToast('이미지가 저장됐어요')
            }
          } catch {
            // 사용자가 공유 시트를 취소한 경우 등 — 에러로 취급하지 않음
          }
          resolve()
        }, 'image/png')
      })
    } catch {
      showToast('공유에 실패했어요', 'error')
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <style>{KEMI_ANIM_CSS}</style>
      {/* 헤더 */}
      <div className="flex h-12 flex-shrink-0 items-center justify-between border-b px-2" style={{ borderColor: HAIRLINE }}>
        <button onClick={() => router.back()} className="flex items-center p-2" style={{ color: '#0D0D0D' }}>
          <ChevronLeft size={20} />
        </button>
        <span className="text-[16px] font-bold" style={{ color: '#0D0D0D' }}>{profile.name}님과의 케미</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 히어로 */}
        <div
          className="px-6 pb-7 pt-6 text-center"
          style={{ background: 'radial-gradient(circle at 28% 8%, #73B9FF 0%, #57ABFF 22%, #3A9DFF 38%, #1D8EFF 52%, #0E87FF 62%, #0080FF 72%, #0657FF 100%)' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Kemi Report</span>
          <div className="mt-3 flex items-start justify-center gap-4">
            <div
              className="flex flex-col items-center gap-2.5"
              data-kemi-anim
              style={{ animation: 'kemiCrossL .55s cubic-bezier(.22,1,.36,1) both' }}
            >
              <AvatarCircle src={viewerAvatar} name={viewerName} size={56} fontSize={20} />
              <span className="text-[12px] font-bold text-white">{viewerName}</span>
            </div>
            <span
              className="mt-4 text-[18px] font-bold text-white/70"
              data-kemi-anim
              style={{ animation: 'kemiPop .4s ease .32s both' }}
            >
              ×
            </span>
            <div
              className="flex flex-col items-center gap-2.5"
              data-kemi-anim
              style={{ animation: 'kemiCrossR .55s cubic-bezier(.22,1,.36,1) both' }}
            >
              <AvatarCircle src={profileAvatar} name={profile.name} size={56} fontSize={20} />
              <span className="text-[12px] font-bold text-white">{profile.name}</span>
            </div>
          </div>
          <div data-kemi-anim style={{ animation: 'kemiFadeUp .5s ease .38s both' }}>
            <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-white">{archetype.name}</h1>
            <p className="mt-1 text-[14px] font-medium text-white/90">{archetype.verdict}</p>
            <span className="mt-3 inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[12px] font-semibold text-white">
              {archetype.grade}
            </span>
          </div>
        </div>

        {/* 목적 토글 */}
        <div className="flex justify-center gap-2 px-5 pt-4">
          {(['work', 'relationship'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurpose(p)}
              className="rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap"
              style={purpose === p
                ? { background: '#0D0D0D', color: '#fff' }
                : { border: `1px solid ${HAIRLINE}`, color: '#6C7786' }}
            >
              {p === 'work' ? '협업' : '관계'}
            </button>
          ))}
        </div>

        {/* 레이더 */}
        <div className="px-5 pt-3">
          <KemiRadar axes={report.axes} score={score} />
        </div>

        {/* 축별 상세 분석 */}
        <div className="px-5 pt-2">
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: '#6C7786' }}>축별 상세 분석</p>
          <div className="flex flex-col gap-3">
            {AXIS_ORDER.map((id, idx) => {
              const axis = report.axes.find((a) => a.id === id)!
              return (
                <div
                  key={id}
                  data-kemi-anim
                  className="relative overflow-hidden rounded-[16px] px-4 py-4"
                  style={{ border: `0.66px solid ${HAIRLINE}`, animation: `kemiFadeUp .45s ease ${0.15 + idx * 0.08}s both` }}
                >
                  {/* 타이틀은 잠긴 축이어도 항상 노출 — 안의 분석 내용만 가린다 */}
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="text-[15px] font-bold" style={{ color: '#0D0D0D' }}>{axis.label}</span>
                    {!axis.locked && !axis.partial && (
                      <span
                        className="rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold"
                        style={axis.signalKind === 'same'
                          ? { background: 'var(--color-accent-soft)', color: 'var(--color-accent-dark)' }
                          : { background: '#FFF4E0', color: '#D95F00' }}
                      >
                        {axis.signalKind === 'same' ? '같음' : '보완'}
                      </span>
                    )}
                  </div>

                  {axis.locked ? (
                    <div className="relative">
                      <div className="select-none" style={{ filter: 'blur(5px)' }} aria-hidden>
                        <p className="mb-3 text-[13px] leading-[1.55]" style={{ color: '#475058' }}>
                          내 정보를 채우면 이 축에서 {profile.name}님과 얼마나 잘 맞는지, 어떤 점을 조심하면 좋을지 함께 정리해 드려요.
                        </p>
                        <p className="mb-1 text-[12px] font-bold" style={{ color: '#0D0D0D' }}>잘 맞는 점</p>
                        <div className="flex flex-col gap-1">
                          <p className="text-[13px] leading-[1.55]" style={{ color: '#475058' }}>· 두 사람의 공통점이 여기에 표시돼요</p>
                          <p className="text-[13px] leading-[1.55]" style={{ color: '#475058' }}>· 서로 잘 맞는 부분을 짚어 드려요</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6" style={{ background: 'rgba(255,255,255,0.5)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/kemi/locked-alert.svg" alt="" className="size-8" />
                        <p className="text-center text-[13px] font-semibold leading-[1.3]" style={{ color: '#0D0D0D' }}>
                          {axis.missingItems.join(' · ')} 채우면 열려요
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {axis.lead && (
                        <p className="mb-3 text-[13px] leading-[1.55]" style={{ color: '#475058' }}>{axis.lead}</p>
                      )}
                      {axis.goodPoints.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-1 text-[12px] font-bold" style={{ color: '#0D0D0D' }}>잘 맞는 점</p>
                          <div className="flex flex-col gap-1">
                            {axis.goodPoints.map((text, i) => (
                              <p key={i} className="text-[13px] leading-[1.55]" style={{ color: '#475058' }}>· {text}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {axis.watchPoints.length > 0 && (
                        <div>
                          <p className="mb-1 text-[12px] font-bold" style={{ color: '#0D0D0D' }}>보완이 필요한 점</p>
                          <div className="flex flex-col gap-1">
                            {axis.watchPoints.map((text, i) => (
                              <p key={i} className="text-[13px] leading-[1.55]" style={{ color: '#475058' }}>· {text}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 종합 노트 */}
        <div className="flex flex-col gap-2 px-5 pt-4">
          <div
            data-kemi-anim
            className="rounded-[16px] p-4"
            style={{ background: 'var(--color-bg-surface)', animation: 'kemiFadeUp .45s ease .6s both' }}
          >
            <p className="text-[13px] font-bold" style={{ color: '#0D0D0D' }}>잘 맞는 지점</p>
            <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: '#475058' }}>{report.goodNote}</p>
          </div>
          <div
            data-kemi-anim
            className="rounded-[16px] p-4"
            style={{ background: 'var(--color-bg-surface)', animation: 'kemiFadeUp .45s ease .68s both' }}
          >
            <p className="text-[13px] font-bold" style={{ color: '#0D0D0D' }}>조심할 지점</p>
            <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: '#475058' }}>{report.watchNote}</p>
          </div>
        </div>

        {/* 저장/공유 — 미니 카드는 상단 히어로와 중복이라 화면엔 숨기고 캡처용으로만 렌더 */}
        <div className="px-5 pt-5 pb-8">
          <ShareCard
            cardRef={cardRef}
            viewerName={viewerName}
            viewerAvatar={viewerAvatar}
            profileName={profile.name}
            profileAvatar={profileAvatar}
            score={score}
            tags={strongTags}
            offscreen
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-[14px] font-bold disabled:opacity-50"
              style={{ border: `1px solid ${HAIRLINE}`, color: '#25313D' }}
            >
              <Download size={16} />
              {sharing ? '저장 중…' : '저장'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-black py-3 text-[14px] font-bold text-white disabled:opacity-50"
            >
              <Share2 size={16} />
              {sharing ? '공유 중…' : '공유'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
