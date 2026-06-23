'use client'

import { useRouter } from 'next/navigation'
import { useByroStore } from '@/store/useByroStore'
import { Button, Modal } from '@/components/ui'

export function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useByroStore()
  const router = useRouter()

  // [임시] 실제 OAuth 미연동 — 클릭 시 mock 로그인 처리
  const handleLogin = () => {
    store.login()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <p className="text-[15px] font-black text-[var(--color-text-strong)] mb-1">로그인이 필요해요</p>
      <p className="text-[11px] text-[var(--color-text-tertiary)] mb-5 leading-relaxed">
        바이로 계정으로 로그인하면 이용할 수 있어요.
      </p>
      <div className="space-y-2 mb-4">
        <Button variant="kakao" onClick={handleLogin}>카카오로 로그인</Button>
        <Button variant="naver" onClick={handleLogin}>N  네이버로 로그인</Button>
        <Button variant="google" onClick={handleLogin}>G  구글로 로그인</Button>
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
