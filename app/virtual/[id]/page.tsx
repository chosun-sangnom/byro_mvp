import { notFound } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { VirtualProfilePage } from '@/components/screens/profile/VirtualProfilePage'
import { getVirtualProfileById } from '@/lib/mocks/virtualProfiles'

export default function VirtualProfileRoute({ params }: { params: { id: string } }) {
  const profile = getVirtualProfileById(params.id)
  if (!profile) notFound()

  return (
    <AppShell showHeader>
      <VirtualProfilePage profile={profile} />
    </AppShell>
  )
}
