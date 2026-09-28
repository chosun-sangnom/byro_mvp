'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useFeloreStore } from '@/store/useFeloreStore'
import { NavBar, Button, Modal } from '@/components/ui'

export default function WithdrawScreen() {
  const router = useRouter()
  const store = useFeloreStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [withdrawn, setWithdrawn] = useState(false)

  // 탈퇴 완료 화면(리액트 상태)만 먼저 보여주고, store.resetAll()(로그아웃 포함)은
  // "확인"을 눌러 나갈 때 실행 — 이 페이지를 감싼 RequireAuth가 isLoggedIn=false를
  // 감지하면 router.replace('/signup')를 걸어서 홈이 아니라 온보딩으로 튕겨버린다.
  // router.push 같은 클라이언트 네비게이션으로는 그 경합을 피할 타이밍을 잡기 어려워서,
  // 전체 페이지 이동(location.href)으로 확실히 벗어난 뒤 리셋되도록 처리.
  if (withdrawn) {
    return (
      <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
        <NavBar />
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
            style={{ backgroundColor: 'var(--color-state-success-bg)' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--color-state-success-text)' }} />
          </div>
          <p className="text-[16px] font-bold text-[var(--color-text-strong)]">탈퇴가 완료됐어요</p>
          <p className="mt-2 text-[13px] text-[var(--color-text-secondary)] leading-relaxed">그동안 펠로어를 이용해주셔서 감사해요</p>
          <div className="mt-10 w-full">
            <Button
              onClick={() => {
                store.resetAll()
                window.location.href = '/'
              }}
            >
              확인
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-[var(--color-bg-page)] min-h-full">
      <NavBar title="회원탈퇴" onBack={() => router.back()} />

      <div className="px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <p className="text-[18px] font-black mb-1" style={{ color: 'var(--color-state-danger-text)' }}>
          정말 탈퇴하시겠습니까?
        </p>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-5 leading-relaxed">
          탈퇴 즉시 아래 데이터가 <span className="font-bold text-[var(--color-text-primary)]">영구 삭제</span>되며 복구할 수 없어요.
        </p>
        <ul className="text-left rounded-xl bg-[var(--color-bg-muted)] px-4 py-3 mb-5 space-y-1.5">
          {[
            '내 프로필 정보',
            '저장한 프로필',
            '내가 남긴 리뷰 · 방명록',
            '받은 리뷰 · 방명록',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-[12px] text-[var(--color-text-secondary)]">
              <span className="mt-0.5 flex-shrink-0 text-[var(--color-state-danger-text)]">✕</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-[var(--color-text-tertiary)] mb-6 leading-relaxed">
          탈퇴 후 동일 전화번호로 재가입은 가능하지만,<br />이전 데이터는 복구되지 않습니다.
        </p>

        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          탈퇴하기
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} widthClassName="w-[calc(100%-40px)]">
        <div className="text-left">
          <div className="text-lg font-black mb-2">정말 탈퇴하시겠습니까?</div>
          <div className="meta-text mb-5 leading-relaxed">
            탈퇴하면 모든 데이터가 영구 삭제되고 복구할 수 없어요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>취소</Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmOpen(false)
                setWithdrawn(true)
              }}
              style={{ backgroundColor: '#EF4444', borderColor: 'transparent', color: '#fff' }}
            >
              탈퇴하기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
