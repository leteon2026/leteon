import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AccountClient from './AccountClient'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/account')
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('username, email, phone, created_at, heart_count, deleted_at')
    .eq('id', user.id)
    .single()

  // 탈퇴 계정 처리
  if (profile?.deleted_at) {
    redirect('/')
  }

  return <AccountClient user={user} profile={profile} />
}
