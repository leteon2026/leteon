import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Profile, Listing } from '@/types'
import HeartButton from '@/components/profile/HeartButton'
import ListingCard from '@/components/listings/ListingCard'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase
      .from('listings')
      .select('*, profiles(id, username, avatar_url, heart_count)')
      .eq('seller_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const authSupabase = await createClient()
  const { data: { user } } = await authSupabase.auth.getUser()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 border-2 border-zinc-700">
            {(profile as Profile).avatar_url ? (
              <Image
                src={(profile as Profile).avatar_url}
                alt={(profile as Profile).username}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-zinc-400">
                {(profile as Profile).username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-white">{(profile as Profile).username}</h1>
            {(profile as Profile).bio && (
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{(profile as Profile).bio}</p>
            )}
            <p className="mt-2 text-xs text-zinc-600">
              {new Date((profile as Profile).created_at).toLocaleDateString('ko-KR')} 가입
            </p>

            {/* Stats */}
            <div className="mt-4 flex items-center justify-center sm:justify-start gap-6">
              <div className="text-center">
                <p className="text-2xl font-black text-lime-400">{(profile as Profile).heart_count}</p>
                <p className="text-xs text-zinc-500 mt-0.5">받은 신뢰</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white">{listings?.length ?? 0}</p>
                <p className="text-xs text-zinc-500 mt-0.5">판매 중인 매물</p>
              </div>
            </div>
          </div>

          {/* Heart Button */}
          <div className="flex-shrink-0">
            <HeartButton
              toUserId={id}
              initialCount={(profile as Profile).heart_count}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-xl font-black text-white mb-6">판매 중인 매물</h2>
        {!listings || listings.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <p>판매 중인 매물이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {(listings as Listing[]).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
