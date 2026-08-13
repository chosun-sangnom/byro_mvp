'use client'

import { useRouter } from 'next/navigation'
import { useFeloreStore } from '@/store/useFeloreStore'
import { NavBar, Button } from '@/components/ui'

export default function WithdrawScreen() {
  const router = useRouter()
  const store = useFeloreStore()

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
            '연결 관계',
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

        <Button
          variant="danger"
          onClick={() => {
            store.resetAll()
            router.push('/')
          }}
        >
          탈퇴하기
        </Button>
      </div>
    </div>
  )
}
