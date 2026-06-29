import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Listing, ListingStatus } from '@/types'
import { formatPrice } from '@/lib/utils'
import MyProfileForm from './MyProfileForm'
import MyListingActions from './MyListingActions'

const statusLabel: Record<ListingStatus, string> = {
  draft: '미결제',
  active: '판매중',
  sold: '판매완료',
  deleted: '삭제됨',
}

const statusColor: Record<ListingStatus, string> = {
  draft: 'text-yellow-400',
  active: 'text-lime-400',
  sold: 'text-blue-400',
  deleted: 'text-zinc-500',
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const [{ data: profile }, { data: listings }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black text-white mb-8">내 계정</h1>

      {/* Profile Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" sizes="64px" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-400">
                {profile?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.username}</h2>
            <p className="text-sm text-zinc-400 mt-0.5">신뢰 {profile?.heart_count} · {user.email}</p>
          </div>
        </div>
        <MyProfileForm profile={profile} userId={user.id} />
      </div>

      {/* My Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white">내 매물</h2>
          <Link href="/listings/new" className="text-sm text-lime-400 hover:text-lime-300 font-medium">
            + 매물 등록
          </Link>
        </div>

        {!listings || listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-base">등록한 매물이 없습니다.</p>
            <Link href="/listings/new" className="mt-4 inline-block text-sm text-lime-400 hover:text-lime-300 font-medium">
              첫 매물 등록하기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(listings as Listing[]).map(listing => (
              <div key={listing.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold ${statusColor[listing.status]}`}>
                      {statusLabel[listing.status]}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-sm text-zinc-400">{listing.category}</span>
                  </div>
                  <Link href={`/listings/${listing.slug}`} className="text-base font-semibold text-white hover:text-lime-400 transition-colors line-clamp-1">
                    {listing.title}
                  </Link>
                  <p className="text-sm font-black text-lime-400 mt-0.5">{formatPrice(listing.price)}</p>
                  {listing.can_delete_after && (
                    <p className="text-sm text-zinc-500 mt-1">
                      삭제 가능: {new Date(listing.can_delete_after).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                </div>
                <MyListingActions
                  listingId={listing.id}
                  slug={listing.slug}
                  currentStatus={listing.status}
                  canDelete={listing.can_delete_after ? new Date() >= new Date(listing.can_delete_after) : false}
                  canDeleteAfter={listing.can_delete_after}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
