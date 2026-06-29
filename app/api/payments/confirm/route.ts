import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { confirmTossPayment } from '@/lib/toss'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { paymentKey, orderId, amount, listingId } = await req.json()

  if (!paymentKey || !orderId || !amount || !listingId) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // 매물 확인
  const { data: listing } = await admin
    .from('listings')
    .select('id, seller_id, listing_fee, status, title')
    .eq('id', listingId)
    .single()

  if (!listing) return NextResponse.json({ error: '매물을 찾을 수 없습니다.' }, { status: 404 })
  if (listing.seller_id !== user.id) return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  if (listing.status !== 'draft') return NextResponse.json({ error: '이미 처리된 매물입니다.' }, { status: 400 })

  // 금액 검증
  if (Number(amount) !== listing.listing_fee) {
    return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 })
  }

  try {
    // Toss 결제 승인
    await confirmTossPayment(paymentKey, orderId, Number(amount))

    // 결제 기록 저장
    await admin.from('payments').insert({
      listing_id: listingId,
      user_id: user.id,
      order_id: orderId,
      payment_key: paymentKey,
      amount: Number(amount),
      status: 'confirmed',
    })

    // 매물 활성화
    const { data: updated } = await admin
      .from('listings')
      .update({ status: 'active' })
      .eq('id', listingId)
      .select('slug')
      .single()

    return NextResponse.json({ success: true, slug: updated?.slug })
  } catch (err) {
    await admin.from('payments').upsert({
      listing_id: listingId,
      user_id: user.id,
      order_id: orderId,
      payment_key: paymentKey,
      amount: Number(amount),
      status: 'failed',
    }, { onConflict: 'order_id' })

    return NextResponse.json(
      { error: err instanceof Error ? err.message : '결제 승인 실패' },
      { status: 500 }
    )
  }
}
