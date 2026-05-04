import { Button } from '@/components/ui'
import { HighlightIcon } from '@/components/highlights/HighlightIcon'
import type { HighlightIconId } from '@/types'
import type { CertificationItem } from './constants'

interface HighlightManageCertificationViewProps {
  selectedCert: CertificationItem
  userLinkId: string
  onBack: () => void
  onCopyEmail: () => void
  onConfirm: () => void
}

export function HighlightManageCertificationView({
  selectedCert,
  userLinkId,
  onBack,
  onCopyEmail,
  onConfirm,
}: HighlightManageCertificationViewProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-12 border-b border-[var(--color-border-soft)] flex-shrink-0">
        <button onClick={onBack} className="text-xl text-[var(--color-text-secondary)] mr-3 leading-none">‹</button>
        <span className="text-base font-black">{selectedCert.title} 인증</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="surface-card rounded-[28px] p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
            <HighlightIcon id={selectedCert.icon as HighlightIconId} size={20} />
          </div>
          <div className="mt-4 text-[22px] font-black tracking-[-0.03em] text-[var(--color-text-strong)]">{selectedCert.title}</div>
          <div className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            {selectedCert.summary}
          </div>
        </div>

        <div className="surface-card mt-4 rounded-[28px] p-5">
          <div className="text-sm font-bold text-[var(--color-text-strong)]">인증 방법</div>
          {selectedCert.automated ? (
            <>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                <p>1. 본인확인을 진행하면 필요한 정보를 자동으로 불러와요.</p>
                <p>2. 확인이 끝나면 하이라이트에 인증 항목으로 바로 반영돼요.</p>
              </div>
              <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                별도 파일을 보내지 않아도 돼요. 본인확인만 완료되면 자동으로 진행됩니다.
              </div>
            </>
          ) : (
            <>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                <p>1. 리멤버 앱에서 명함 내보내기 파일을 준비해주세요.</p>
                <p>2. 아래 이메일 주소로 파일을 보내주시면 확인 후 반영돼요.</p>
              </div>
              <div className="mt-5 rounded-[22px] border border-[var(--color-border-default)] bg-[var(--color-bg-soft)] px-4 py-4">
                <div className="micro-text mb-2">나의 Byro 인증 이메일 주소</div>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1 truncate text-sm font-mono font-bold text-[var(--color-text-strong)]">
                    {userLinkId}@data.byro.io
                  </div>
                  <button
                    onClick={onCopyEmail}
                    className="rounded-xl bg-[var(--color-accent-dark)] px-3 py-2 text-xs font-semibold text-white"
                  >
                    복사
                  </button>
                </div>
                <div className="micro-text mt-3">{selectedCert.emailLabel}</div>
              </div>
            </>
          )}

          <div className="mt-5 flex gap-2">
            <Button variant="outline" onClick={onBack}>이전</Button>
            <Button onClick={onConfirm}>확인</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
