'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface MyListingActionsProps {
  listingId: string
  slug: string
  currentStatus: string
  canDelete: boolean
  canDeleteAfter: string | null
}

export default function MyListingActions({ listingId, slug, currentStatus, canDelete, canDeleteAfter }: MyListingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusToggle = async () => {
    setLoading(true)
    await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus === 'sold' ? 'active' : 'sold' }),
    })
    router.refresh()
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return
    setLoading(true)
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      {currentStatus !== 'draft' && (
        <button
          onClick={handleStatusToggle}
          disabled={loading}
          className="text-xs text-zinc-400 hover:text-lime-400 transition-colors font-medium disabled:opacity-50 whitespace-nowrap"
        >
          {currentStatus === 'sold' ? '판매중' : '완료처리'}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={!canDelete || loading}
        title={!canDelete && canDeleteAfter ? `${new Date(canDeleteAfter).toLocaleDateString('ko-KR')} 이후 삭제 가능` : undefined}
        className="text-xs text-zinc-600 hover:text-red-400 transition-colors font-medium disabled:opacity-30 whitespace-nowrap"
      >
        삭제
      </button>
    </div>
  )
}
