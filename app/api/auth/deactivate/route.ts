import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(_req: NextRequest) {
  try {
    // 세션에서 현재 유저 확인 (anon key 기반)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 서비스 롤로 profiles 소프트 삭제
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('[deactivate] update error:', error)
      return NextResponse.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 실제 auth.users 삭제는 관리자 기능으로 추후 확장
    // await admin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[deactivate] unexpected error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
