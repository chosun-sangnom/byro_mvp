'use client'

import { Mail, Copy } from 'lucide-react'
import { NavBar, showToast } from '@/components/ui'
import { RememberNetworkGraph } from '@/components/highlights/RememberNetworkGraph'
import type { RememberInsight } from '@/types'

interface RememberHighlight {
  total: number
  industries: Array<{ name: string; ratio: number; count?: number }>
  insight?: RememberInsight
}

export function RememberNetworkManageScreen({
  userLinkId,
  rememberHighlight,
  onBack,
}: {
  userLinkId: string
  rememberHighlight: RememberHighlight
  onBack: () => void
}) {
  const email = `${userLinkId}@data.byro.io`

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email).catch(() => {})
    showToast('이메일 주소가 복사됐어요!')
  }

  const handleConfirm = () => {
    showToast('인증 메일 발송 후 반영을 기다려주세요')
    onBack()
  }

  return (
    <div className="flex flex-col h-full">
      <NavBar title="리멤버 네트워크" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

        {/* 현재 네트워크 미리보기 */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
            현재 네트워크
          </p>
          <RememberNetworkGraph
            total={rememberHighlight.total}
            industries={rememberHighlight.industries}
            insight={rememberHighlight.insight}
          />
        </div>

        {/* 업데이트 방법 */}
        <div className="rounded-[22px] border border-[var(--color-border-soft)] overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] mb-3" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-dark)' }}>
              <Mail size={18} />
            </div>
            <p className="text-[16px] font-black tracking-[-0.02em]" style={{ color: 'var(--color-text-primary)' }}>
              네트워크 업데이트
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.65]" style={{ color: 'var(--color-text-secondary)' }}>
              리멤버 앱에서 명함을 내보내기 한 뒤, 아래 이메일로 파일을 보내주세요.
              확인 후 1-2 영업일 내에 반영돼요.
            </p>
          </div>

          <div className="mx-5 mb-5 rounded-[16px] px-4 py-3.5" style={{ background: 'var(--color-bg-soft)', border: '1px solid var(--color-border-default)' }}>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--color-text-tertiary)' }}>
              나의 Byro 인증 이메일
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 truncate text-[13px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {email}
              </p>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white"
                style={{ background: 'var(--color-accent-dark)' }}
              >
                <Copy size={11} />
                복사
              </button>
            </div>
          </div>

          {/* 단계별 안내 */}
          <div className="px-5 pb-5 space-y-2">
            {[
              '리멤버 앱 → 명함첩 → 우측 상단 메뉴 → 내보내기',
              '내보낸 파일을 위 이메일로 첨부해서 보내기',
              '확인 후 네트워크 데이터가 업데이트돼요',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white"
                  style={{ background: 'var(--color-accent-dark)' }}
                >
                  {i + 1}
                </span>
                <p className="text-[12px] leading-[1.6]" style={{ color: 'var(--color-text-secondary)' }}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full rounded-full py-3.5 text-[14px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent-dark))' }}
            >
              메일 보냈어요
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
