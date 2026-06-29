'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface ListingActionsProps {
  listingId: string
  currentStatus: string
  canDelete: boolean
  canDeleteAfter: string | null
}

export default function ListingActions({ listingId, currentStatus, canDelete, canDeleteAfter }: ListingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleMarkSold = async () => {
    setLoading('sold')
    await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: currentStatus === 'sold' ? 'active' : 'sold' }),
    })
    router.refresh()
    setLoading(null)
  }

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    setLoading('delete')
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/my')
    } else {
      const data = await res.json()
      alert(data.error)
    }
    setLoading(null)
  }

  return (
    <div className="mt-6 border-t border-zinc-800 pt-6 space-y-3">
      <p className="text-xs text-zinc-500 font-medium tracking-wider uppercase mb-3">내 매물 관리</p>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleMarkSold}
          disabled={loading === 'sold'}
          className="flex-1"
        >
          {currentStatus === 'sold' ? '판매중으로 변경' : '판매완료 처리'}
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={!canDelete || loading === 'delete'}
          className="flex-1"
          title={!canDelete && canDeleteAfter ? `${new Date(canDeleteAfter).toLocaleDateString('ko-KR')} 이후 삭제 가능` : undefined}
        >
          {loading === 'delete' ? '삭제 중...' : '삭제'}
        </Button>
      </div>
      {!canDelete && canDeleteAfter && (
        <p className="text-xs text-zinc-600 text-center">
          삭제 가능일: {new Date(canDeleteAfter).toLocaleDateString('ko-KR')}
        </p>
      )}
    </div>
  )
}
