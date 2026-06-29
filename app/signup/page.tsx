'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_EMAIL } from '@/lib/admin'

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

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const username = form.username.trim()
    if (!username) {
      setError('닉네임을 입력해주세요.')
      return
    }
    if (username.length < 2 || username.length > 20) {
      setError('닉네임은 2~20자여야 합니다.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (form.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (form.email !== ADMIN_EMAIL && !form.phone.trim()) {
      setError('전화번호를 입력해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: username, phone: form.phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.replace('/')
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="w-12 h-12 bg-lime-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">이메일을 확인하세요</h2>
            <p className="text-zinc-400 text-sm mb-1">
              <span className="text-lime-400 font-medium">{form.email}</span>로
            </p>
            <p className="text-zinc-400 text-sm mb-6">인증 링크를 보냈습니다. 링크를 클릭해 가입을 완료하세요.</p>
            <Link href="/login" className="text-sm text-lime-400 hover:text-lime-300 font-medium">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-3xl font-black text-lime-400 tracking-widest">LETEON</p>
          <p className="mt-1 text-zinc-400 text-sm font-medium">레테온</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-7">
          <h1 className="text-base font-bold text-white mb-1 text-center">회원가입</h1>
          <p className="text-zinc-400 text-sm text-center mb-6">계정을 만들어 시작하세요</p>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                닉네임 <span className="text-lime-400">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                required
                maxLength={20}
                placeholder="2~20자"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
              <p className="mt-1 text-xs text-zinc-600 text-right">{form.username.length}/20</p>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                이메일 <span className="text-lime-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
                placeholder="example@email.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                비밀번호 <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="new-password"
                  placeholder="6자 이상"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                비밀번호 확인 <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  autoComplete="new-password"
                  placeholder="비밀번호 재입력"
                  className={`w-full bg-zinc-800 border rounded-2xl px-4 py-2.5 pr-11 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 ${
                    form.confirmPassword && form.password !== form.confirmPassword
                      ? 'border-red-500/60'
                      : 'border-zinc-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            {/* 핸드폰 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                전화번호
                {form.email === ADMIN_EMAIL
                  ? <span className="ml-1 text-zinc-600 font-normal">(선택)</span>
                  : <span className="text-lime-400 ml-0.5">*</span>
                }
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
                placeholder="010-0000-0000"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 px-4 rounded-2xl transition-colors text-sm mt-2"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-lime-400 hover:text-lime-300 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
