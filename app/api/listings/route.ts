import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { calcListingFee } from '@/lib/toss'
import { generateSlug } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const sellerId = searchParams.get('seller_id')
  const status = searchParams.get('status') ?? 'active'

  const supabase = createAdminClient()
  let query = supabase
    .from('listings')
    .select('*, profiles(id, username, avatar_url, heart_count)')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (sellerId) query = query.eq('seller_id', sellerId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listings: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const body = await req.json()
  const { title, category, price, description, specs, image_urls, condition, location, brand, model, year } = body

  if (!title || !category || !price) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 })
  }

  const slug = `${generateSlug(title)}-${Date.now()}`
  const listingFee = calcListingFee(Number(price))
  const canDeleteAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const initialStatus = process.env.TOSS_SECRET_KEY ? 'draft' : 'active'
  const urls: string[] = image_urls ?? []

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('listings')
    .insert({
      seller_id: user.id,
      title,
      slug,
      category,
      price: Number(price),
      description: description ?? '',
      specs: specs ?? {},
      image_urls: urls,
      thumbnail: urls[0] ?? '',
      condition: condition ?? 'good',
      location: location ?? '',
      brand: brand ?? '',
      model: model ?? '',
      year: year ? Number(year) : null,
      status: initialStatus,
      listing_fee: listingFee,
      can_delete_after: canDeleteAfter,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ listing: data, listing_fee: listingFee })
}
