'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Profile {
  username: string | null
  email: string | null
  phone: string | null
  created_at: string | null
  heart_count: number | null
  deleted_at: string | null
}

interface Props {
  user: User
  profile: Profile | null
}

export default function AccountClient({ user, profile }: Props) {
  const router = useRouter()
  const [deactivating, setDeactivating] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeactivate = async () => {
    setDeactivating(true)
    setError(null)

    const res = await fetch('/api/auth/deactivate', { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? '탈퇴 처리 중 오류가 발생했습니다.')
      setDeactivating(false)
      setShowConfirm(false)
      return
    }

    // 서버 측 소프트 삭제 완료 → 세션 삭제 후 홈으로
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded bg-lime-400/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">내 계정</h1>
          <p className="text-xs text-zinc-500 mt-0.5">계정 정보 및 설정</p>
        </div>
      </div>

      {/* 계정 정보 */}
      <div className="glass-card rounded p-6 mb-4">
        <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-5">계정 정보</p>

        <dl className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <dt className="text-sm text-zinc-500">닉네임</dt>
            <dd className="text-sm font-semibold text-white">{profile?.username ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <dt className="text-sm text-zinc-500">이메일</dt>
            <dd className="text-sm text-white">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <dt className="text-sm text-zinc-500">전화번호</dt>
            <dd className="text-sm text-white">{profile?.phone || '—'}</dd>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <dt className="text-sm text-zinc-500">신뢰 수</dt>
            <dd className="text-sm text-white font-mono">{profile?.heart_count ?? 0}</dd>
          </div>
          {joinedDate && (
            <div className="flex items-center justify-between py-2">
              <dt className="text-sm text-zinc-500">가입일</dt>
              <dd className="text-sm text-zinc-400">{joinedDate}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 pt-4 border-t border-white/[0.06] flex gap-4">
          <Link
            href="/my"
            className="text-sm text-lime-400 hover:text-lime-300 font-medium transition-colors"
          >
            프로필 수정 →
          </Link>
        </div>
      </div>

      {/* 내 매물 바로가기 */}
      <div className="glass-card rounded p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">내 매물 관리</p>
          <p className="text-xs text-zinc-500 mt-0.5">등록한 매물을 확인하고 수정할 수 있어요</p>
        </div>
        <Link
          href="/my"
          className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
        >
          보기
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* 탈퇴 섹션 */}
      <div className="glass-card rounded p-6 mt-6">
        <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase mb-3">위험 구역</p>
        <p className="text-sm text-zinc-400 mb-4">
          탈퇴하면 계정이 비활성화됩니다. 등록된 매물은 숨겨지며 이 작업은 되돌리기 어렵습니다.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-red-400 hover:text-red-300 font-medium border border-red-500/30 hover:border-red-400/50 px-4 py-2 rounded transition-colors"
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded">
            <p className="text-sm font-semibold text-white mb-1">정말 탈퇴하시겠습니까?</p>
            <p className="text-xs text-zinc-400 mb-4">
              탈퇴 후에는 동일한 이메일로 재가입이 제한될 수 있습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="text-sm font-semibold text-red-400 border border-red-500/40 hover:border-red-400/60 px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {deactivating ? '처리 중...' : '탈퇴 확인'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={deactivating}
                className="text-sm text-zinc-400 hover:text-white px-4 py-2 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
