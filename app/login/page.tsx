'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const message = searchParams.get('message')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('이메일 또는 비밀번호를 확인해주세요.')
      setLoading(false)
      return
    }

    // 탈퇴된 계정 차단
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('deleted_at')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profile?.deleted_at) {
        await supabase.auth.signOut()
        setError('탈퇴된 계정입니다. 문의가 필요하시면 고객센터로 연락해주세요.')
        setLoading(false)
        return
      }
    }

    router.replace(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <p className="text-3xl font-black text-lime-400 tracking-widest">LETEON</p>
            <p className="mt-0.5 text-zinc-500 text-xs font-medium tracking-widest uppercase">Korea Bike Marketplace</p>
          </Link>
        </div>

        <div className="glass-card-strong rounded p-7 shadow-2xl shadow-black/50">
          <h1 className="text-base font-bold text-white mb-1 text-center">로그인</h1>
          <p className="text-zinc-500 text-sm text-center mb-6">이메일과 비밀번호를 입력하세요</p>

          {/* 가입 완료 안내 (자동로그인 실패 시) */}
          {message && !error && (
            <div className="mb-5 p-3 bg-lime-400/10 border border-lime-400/30 rounded text-sm text-lime-400 text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full glass-input rounded px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-300 active:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 px-4 rounded transition-colors text-sm mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  로그인 중...
                </span>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-lime-400 hover:text-lime-300 font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
