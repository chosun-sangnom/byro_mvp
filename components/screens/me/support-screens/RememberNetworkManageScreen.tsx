'use client'

import { showToast } from '@/components/ui'
import { HighlightManageCertificationView, type CertificationLikeItem } from '@/components/screens/me/highlight-manage/HighlightManageCertificationView'

const REMEMBER_NETWORK_CERT: CertificationLikeItem = {
  categoryId: 'remember-network',
  icon: 'users',
  title: '리멤버 직업 네트워크',
  summary: '리멤버 명함 파일과 이메일로 직업 네트워크를 인증해요',
  pickerDescription: '리멤버 명함 파일을 메일로 보내면 직업 네트워크를 인증해요',
  automated: false,
  emailLabel: '리멤버 명함 내보내기 파일',
}

export function RememberNetworkManageScreen({
  userLinkId,
  onBack,
}: {
  userLinkId: string
  onBack: () => void
}) {
  return (
    <HighlightManageCertificationView
      selectedCert={REMEMBER_NETWORK_CERT}
      userLinkId={userLinkId}
      onBack={onBack}
      onCopyEmail={() => {
        navigator.clipboard.writeText(`${userLinkId}@data.byro.io`).catch(() => {})
        showToast('복사됐어요!')
      }}
      onConfirm={() => {
        showToast('인증 메일 발송 후 반영을 기다려주세요')
        onBack()
      }}
    />
  )
}
