import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { CONDITION_LABEL } from '@/types'
import Badge from '@/components/ui/Badge'
import HeartButton from '@/components/profile/HeartButton'
import ListingActions from './ListingActions'

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(id, username, avatar_url, bio, heart_count)')
    .eq('slug', slug)
    .neq('status', 'deleted')
    .single()

  // phone은 migration 003 실행 후 별도 조회
  let sellerPhone = ''
  if (listing?.profiles?.id) {
    const { data: phoneData } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', listing.profiles.id)
      .single()
    sellerPhone = (phoneData as any)?.phone ?? ''
  }

  if (!listing) notFound()

  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  const isOwner = user?.id === listing.seller_id
  const isSold = listing.status === 'sold'
  const canDeleteAfter = listing.can_delete_after ? new Date(listing.can_delete_after) : null
  const canDelete = canDeleteAfter ? new Date() >= canDeleteAfter : false
  const seller = listing.profiles

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/" className="hover:text-lime-400 transition-colors">홈</Link>
        <span>/</span>
        <Link href="/listings" className="hover:text-lime-400 transition-colors">매물</Link>
        <span>/</span>
        <Link href={`/listings?category=${listing.category}`} className="hover:text-lime-400 transition-colors">
          {listing.category}
        </Link>
      </nav>

      {/* 제목 + 가격 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="zinc">{listing.category}</Badge>
          <Badge variant="default">{CONDITION_LABEL[listing.condition as keyof typeof CONDITION_LABEL] ?? listing.condition}</Badge>
          {isSold && <Badge variant="red">판매완료</Badge>}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{listing.title}</h1>
        <p className="mt-3 text-3xl font-black font-mono text-lime-400">{formatPrice(listing.price)}</p>
        <p className="mt-1 text-xs text-zinc-600">
          등록일: {new Date(listing.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>

      {/* 판매자 소개 */}
      {seller && (
        <div className="bg-zinc-900 border border-zinc-700 rounded p-5 mb-8">
          <p className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">판매자 소개</p>

          <div className="flex items-start justify-between gap-4">
            <Link href={`/profile/${seller.id}`} className="flex items-center gap-3 group min-w-0">
              <div className="relative w-12 h-12 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                {seller.avatar_url ? (
                  <Image src={seller.avatar_url} alt={seller.username} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-black text-zinc-500">
                    {seller.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors">
                  {seller.username}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">신뢰 {seller.heart_count}</p>
              </div>
            </Link>

            {!isOwner && (
              <div className="flex-shrink-0">
                <HeartButton
                  toUserId={seller.id}
                  initialCount={seller.heart_count}
                  currentUserId={user?.id}
                />
              </div>
            )}
          </div>

          {/* 전화번호 + 거래 지역 */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sellerPhone && (
              <div className="flex items-center gap-3 bg-zinc-800 rounded px-4 py-3">
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="text-xs text-zinc-500">전화번호</p>
                  <p className="text-sm font-semibold text-white">{sellerPhone}</p>
                </div>
              </div>
            )}
            {listing.location && (
              <div className="flex items-center gap-3 bg-zinc-800 rounded px-4 py-3">
                <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-xs text-zinc-500">거래 지역</p>
                  <p className="text-sm font-semibold text-white">{listing.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* 판매자 소개글 */}
          {seller.bio && (
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-4">
              {seller.bio}
            </p>
          )}
        </div>
      )}

      {/* 사진 */}
      {listing.image_urls && listing.image_urls.length > 0 ? (
        <div className="mb-8 space-y-3">
          <div className="relative aspect-video sm:aspect-square bg-zinc-900 rounded overflow-hidden border border-zinc-700">
            <Image
              src={listing.image_urls[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
            {isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-2xl font-black text-white tracking-widest">판매완료</span>
              </div>
            )}
          </div>
          {listing.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.image_urls.slice(1, 5).map((url: string, i: number) => (
                <div key={i} className="relative aspect-square bg-zinc-900 rounded overflow-hidden border border-zinc-700">
                  <Image src={url} alt={`${listing.title} ${i + 2}`} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-zinc-900 rounded border border-zinc-700 flex items-center justify-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* 상품 설명 */}
      <div className="bg-zinc-900 border border-zinc-700 rounded p-5 mb-6">
        <h2 className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">상품 설명</h2>
        {listing.description ? (
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">{listing.description}</p>
        ) : (
          <p className="text-sm text-zinc-600">등록된 설명이 없습니다.</p>
        )}
      </div>

      {/* 스펙 */}
      {listing.specs && Object.keys(listing.specs).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-700 rounded p-5 mb-6">
          <h2 className="text-xs font-semibold text-zinc-500 tracking-widest uppercase mb-4">스펙</h2>
          <dl className="space-y-2">
            {Object.entries(listing.specs).map(([key, value]) => (
              <div key={key} className="flex gap-3 text-sm">
                <dt className="text-zinc-500 w-32 shrink-0">{key}</dt>
                <dd className="text-zinc-200">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* 내 매물 관리 */}
      {isOwner && (
        <ListingActions
          listingId={listing.id}
          currentStatus={listing.status}
          canDelete={canDelete}
          canDeleteAfter={listing.can_delete_after}
        />
      )}
    </div>
  )
}
