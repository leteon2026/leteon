import Link from 'next/link'
import Image from 'next/image'
import { Listing, CONDITION_LABEL } from '@/types'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const firstImage = listing.image_urls?.[0]

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group block bg-zinc-900 border border-zinc-700 rounded overflow-hidden hover:border-zinc-500 transition-colors duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge variant="zinc">{listing.category}</Badge>
          {listing.condition && (
            <Badge variant="default">{CONDITION_LABEL[listing.condition]}</Badge>
          )}
        </div>
        {listing.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-sm font-bold text-zinc-300 tracking-widest">판매완료</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-lime-400 transition-colors">
          {listing.title}
        </h3>

        {listing.location && (
          <p className="mt-1 text-xs text-zinc-500 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.location}
          </p>
        )}

        {listing.profiles && (
          <p className="mt-1 text-xs text-zinc-500">
            {listing.profiles.username}
          </p>
        )}

        <p className="mt-2 text-base font-black font-mono text-lime-400">{formatPrice(listing.price)}</p>
      </div>
    </Link>
  )
}
