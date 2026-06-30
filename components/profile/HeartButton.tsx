'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface HeartButtonProps {
  toUserId: string
  initialCount: number
  currentUserId?: string
}

export default function HeartButton({ toUserId, initialCount, currentUserId }: HeartButtonProps) {
  const router = useRouter()
  const [hearted, setHearted] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentUserId || currentUserId === toUserId) return
    fetch(`/api/hearts?to_user_id=${toUserId}`)
      .then(r => r.json())
      .then(d => setHearted(d.hearted ?? false))
  }, [toUserId, currentUserId])

  const handleToggle = async () => {
    if (!currentUserId) { router.push('/login'); return }
    if (currentUserId === toUserId) return

    setLoading(true)
    const res = await fetch('/api/hearts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_user_id: toUserId }),
    })
    const data = await res.json()
    if (res.ok) {
      setHearted(data.hearted)
      setCount(prev => data.hearted ? prev + 1 : Math.max(0, prev - 1))
      router.refresh()
    }
    setLoading(false)
  }

  const isOwnProfile = currentUserId === toUserId

  return (
    <button
      onClick={handleToggle}
      disabled={loading || isOwnProfile}
      className={`flex items-center gap-2 px-4 py-2 rounded border font-semibold text-sm transition-all duration-200 backdrop-blur-sm ${
        isOwnProfile
          ? 'border-white/10 text-zinc-600 cursor-default bg-white/[0.03]'
          : hearted
          ? 'bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25'
          : 'bg-white/[0.03] border-white/10 text-zinc-400 hover:border-red-400/50 hover:text-red-400 hover:bg-red-500/10'
      } disabled:opacity-50`}
    >
      <svg
        className="w-4 h-4"
        fill={hearted ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>{count}</span>
      {!isOwnProfile && (
        <span className="text-xs opacity-70">{hearted ? '취소' : '신뢰해요'}</span>
      )}
    </button>
  )
}
