import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, profiles(id, username, avatar_url, heart_count)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ listing: data })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await req.json()
  const admin = createAdminClient()

  const { data: listing } = await admin.from('listings').select('seller_id').eq('id', id).single()
  if (!listing || listing.seller_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const { data, error } = await admin
    .from('listings')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listing: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: listing } = await admin
    .from('listings')
    .select('seller_id, can_delete_after')
    .eq('id', id)
    .single()

  if (!listing) return NextResponse.json({ error: '매물을 찾을 수 없습니다.' }, { status: 404 })
  if (listing.seller_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })

  if (listing.can_delete_after && new Date() < new Date(listing.can_delete_after)) {
    const availableDate = new Date(listing.can_delete_after).toLocaleDateString('ko-KR')
    return NextResponse.json(
      { error: `${availableDate} 이후에 삭제할 수 있습니다.` },
      { status: 403 }
    )
  }

  const { error } = await admin.from('listings').update({ status: 'deleted' }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
