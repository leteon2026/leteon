'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function MyProfileForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [form, setForm] = useState({
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    phone: profile?.phone ?? '',
  })
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하여야 합니다.')
      return
    }

    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `avatars/${userId}-${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { cacheControl: '31536000', upsert: true })

    if (uploadErr) {
      setError(`업로드 실패: ${uploadErr.message}`)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSave = async () => {
    setError(null)
    const username = form.username.trim()
    if (!username) { setError('닉네임을 입력해주세요.'); return }
    if (username.length < 2 || username.length > 20) { setError('닉네임은 2~20자여야 합니다.'); return }

    setLoading(true)
    const res = await fetch(`/api/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio: form.bio, avatar_url: avatarUrl, phone: form.phone }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '저장 실패')
      setLoading(false)
      return
    }

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const displayName = form.username || userId.slice(0, 8)

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 아바타 */}
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-zinc-500">
              {displayName[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '사진 변경'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="block mt-1 text-xs text-zinc-600 hover:text-red-400 transition-colors"
            >
              사진 삭제
            </button>
          )}
          <p className="mt-1 text-xs text-zinc-600">JPG, PNG · 5MB 이하</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </div>

      {/* 닉네임 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-zinc-300">닉네임</label>
          <span className={`text-xs ${form.username.length > 18 ? 'text-yellow-400' : 'text-zinc-600'}`}>
            {form.username.length}/20
          </span>
        </div>
        <input
          value={form.username}
          onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
          maxLength={20}
          placeholder="닉네임 입력"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
        />
        <p className="mt-1 text-xs text-zinc-600">2~20자. 다른 유저에게 표시되는 이름입니다.</p>
      </div>

      {/* 소개 */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-zinc-300">소개</label>
          <span className={`text-xs ${form.bio.length > 140 ? 'text-yellow-400' : 'text-zinc-600'}`}>
            {form.bio.length}/160
          </span>
        </div>
        <textarea
          value={form.bio}
          onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
          rows={3}
          maxLength={160}
          placeholder="자신을 소개해보세요 — 어떤 바이크를 타는지, 어디서 라이딩하는지 등"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 resize-none"
        />
      </div>

      {/* 전화번호 */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">전화번호</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          placeholder="010-0000-0000"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
        />
        <p className="mt-1 text-xs text-zinc-600">매물 상세 페이지에서 잠재 구매자에게 표시됩니다.</p>
      </div>

      {/* 저장 */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || uploading}
          className="bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
        >
          {loading ? '저장 중...' : saved ? '저장됨' : '저장'}
        </button>
        {saved && (
          <span className="text-sm text-lime-400 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            프로필이 저장되었습니다
          </span>
        )}
      </div>
    </div>
  )
}
