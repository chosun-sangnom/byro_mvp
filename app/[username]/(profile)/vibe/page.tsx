import { redirect } from 'next/navigation'

export default function UserLifeRedirectPage({
  params,
}: {
  params: { username: string }
}) {
  redirect(`/${params.username}`)
}
