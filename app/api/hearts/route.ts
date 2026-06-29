import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/hearts?to_user_id=xxx — 현재 유저가 해당 유저에게 하트 눌렀는지 확인
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const toUserId = searchParams.get('to_user_id')
  if (!toUserId) return NextResponse.json({ hearted: false })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ hearted: false })

  const { data } = await supabase
    .from('hearts')
    .select('id')
    .eq('from_user_id', user.id)
    .eq('to_user_id', toUserId)
    .maybeSingle()

  return NextResponse.json({ hearted: !!data })
}

// POST /api/hearts — 토글 (누르면 추가, 다시 누르면 삭제)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { to_user_id } = await req.json()
  if (!to_user_id) return NextResponse.json({ error: '대상 유저가 없습니다.' }, { status: 400 })
  if (to_user_id === user.id) return NextResponse.json({ error: '본인에게 하트를 줄 수 없습니다.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('hearts')
    .select('id')
    .eq('from_user_id', user.id)
    .eq('to_user_id', to_user_id)
    .maybeSingle()

  if (existing) {
    await admin.from('hearts').delete().eq('id', existing.id)
    return NextResponse.json({ hearted: false })
  } else {
    await admin.from('hearts').insert({ from_user_id: user.id, to_user_id })
    return NextResponse.json({ hearted: true })
  }
}
