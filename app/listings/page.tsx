import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import ListingCard from '@/components/listings/ListingCard'
import CategoryFilter from '@/components/products/CategoryFilter'
import { Listing } from '@/types'
import Link from 'next/link'

interface ListingsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const { category } = await searchParams
  const supabase = createAdminClient()

  let query = supabase
    .from('listings')
    .select('*, profiles(id, username, avatar_url, heart_count)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data: listings } = await query

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {category ? category : '전체 매물'}
          </h1>
          <p className="mt-1 text-base text-zinc-400">{listings?.length ?? 0}개의 매물</p>
        </div>
        <Link
          href="/listings/new"
          className="bg-lime-400 text-black text-sm font-bold px-4 py-2.5 rounded hover:bg-lime-300 transition-colors"
        >
          + 매물 등록
        </Link>
      </div>

      <Suspense fallback={null}>
        <div className="mb-8">
          <CategoryFilter basePath="/listings" />
        </div>
      </Suspense>

      {!listings || listings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-zinc-400 font-medium">등록된 매물이 없습니다.</p>
          <div className="mt-4">
            <Link href="/listings/new" className="text-sm text-lime-400 hover:text-lime-300 font-medium">
              첫 번째 매물을 등록해보세요 →
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {(listings as Listing[]).map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
