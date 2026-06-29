'use client'

import { useRouter } from 'next/navigation'

export default function AdminListingActions({ listingId }: { listingId: string }) {
  const router = useRouter()

  const handleForceDelete = async () => {
    if (!confirm('강제 삭제하시겠습니까? (30일 제한 무시)')) return
    const res = await fetch(`/api/admin/listings/${listingId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <button onClick={handleForceDelete} className="text-xs text-zinc-600 hover:text-red-400 transition-colors font-medium">
      강제삭제
    </button>
  )
}
