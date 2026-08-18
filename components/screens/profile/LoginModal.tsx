'use client'

import { useRouter } from 'next/navigation'
import { useFeloreStore } from '@/store/useFeloreStore'
import { Button, GoogleIcon, Modal } from '@/components/ui'

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useFeloreStore()
  const router = useRouter()

  // [임시] 실제 OAuth 미연동 - 클릭 시 mock 로그인 처리
  const handleLogin = () => {
    store.login()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <p className="text-[15px] font-black text-[var(--color-text-strong)] mb-1">로그인이 필요해요</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mb-5 leading-relaxed">
        펠로어 계정으로 로그인하면 이용할 수 있어요.
      </p>
      <div className="space-y-2 mb-4">
        <Button variant="google" onClick={handleLogin}>
          <span className="inline-flex w-full items-center justify-center gap-2">
            <GoogleIcon /> 구글로 로그인
          </span>
        </Button>
      </div>
      <button
        type="button"
        onClick={() => { onClose(); router.push('/signup') }}
        className="w-full text-center text-[12px] text-[var(--color-text-tertiary)]"
      >
        전화번호로 로그인 / 회원가입 →
      </button>
    </Modal>
  )
}
