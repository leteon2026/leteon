import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import { Listing } from '@/types'

export default async function FeaturedListings() {
  const supabase = createAdminClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(id, username, avatar_url, heart_count)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4)

  if (!listings || listings.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white">최근 매물</h2>
          <p className="mt-3 text-zinc-500">방금 등록된 바이크들</p>
        </div>
        <div className="text-center py-16">
          <p className="text-zinc-600">아직 등록된 매물이 없습니다.</p>
          <Link href="/listings/new" className="mt-4 inline-block text-sm text-lime-400 hover:text-lime-300 font-medium">
            첫 번째 매물을 등록해보세요 →
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-2">Latest</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">최근 매물</h2>
        </div>
        <Link href="/listings" className="text-sm text-lime-400 hover:text-lime-300 font-medium hidden sm:block tracking-wide">
          전체보기 →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(listings as Listing[]).map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link href="/listings" className="text-sm text-lime-400 hover:text-lime-300 font-medium">
          전체 매물 보기 →
        </Link>
      </div>
    </section>
  )
}
