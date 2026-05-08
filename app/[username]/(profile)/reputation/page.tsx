import { redirect } from 'next/navigation'

export default function UserReputationRedirectPage({
  params,
}: {
  params: { username: string }
}) {
  redirect(`/${params.username}`)
}
