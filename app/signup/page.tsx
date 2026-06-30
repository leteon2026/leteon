'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const PHONE_RE = /^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/

interface FieldErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
  terms?: string
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
  const [terms, setTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm(prev => ({ ...prev, [key]: value }))
    // 타이핑 시작하면 해당 필드 에러 지우기
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const markTouched = (key: string) => () =>
    setTouched(prev => ({ ...prev, [key]: true }))

  function validateField(key: keyof typeof form, value: string): string | undefined {
    switch (key) {
      case 'username': {
        const v = value.trim()
        if (!v) return '닉네임을 입력해주세요.'
        if (v.length < 2) return '닉네임은 2자 이상이어야 합니다.'
        if (v.length > 20) return '닉네임은 20자 이하여야 합니다.'
        return undefined
      }
      case 'email':
        if (!value.trim()) return '이메일을 입력해주세요.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '올바른 이메일 형식이 아닙니다.'
        return undefined
      case 'password':
        if (!value) return '비밀번호를 입력해주세요.'
        if (value.length < 6) return '비밀번호는 6자 이상이어야 합니다.'
        return undefined
      case 'confirmPassword':
        if (!value) return '비밀번호를 한 번 더 입력해주세요.'
        if (value !== form.password) return '비밀번호가 일치하지 않습니다.'
        return undefined
      case 'phone': {
        const v = value.trim()
        if (!v) return '전화번호를 입력해주세요.'
        if (!PHONE_RE.test(v.replace(/\s/g, ''))) return '올바른 형식이 아닙니다. (예: 010-1234-5678)'
        return undefined
      }
    }
  }

  function validateAll(): FieldErrors {
    const errors: FieldErrors = {}
    for (const key of ['username', 'email', 'password', 'confirmPassword', 'phone'] as const) {
      const err = validateField(key, form[key])
      if (err) errors[key] = err
    }
    if (!terms) errors.terms = '이용약관에 동의해주세요.'
    return errors
  }

  const handleBlur = (key: keyof typeof form) => () => {
    setTouched(prev => ({ ...prev, [key]: true }))
    const err = validateField(key, form[key])
    setFieldErrors(prev => ({ ...prev, [key]: err }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    const errors = validateAll()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setTouched({ username: true, email: true, password: true, confirmPassword: true, phone: true })
      return
    }

    setLoading(true)

    // 서버에서 user 생성 (SUPABASE_SERVICE_ROLE_KEY는 이 route handler 안에서만 사용)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
        username: form.username.trim(),
        phone: form.phone.trim(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setGlobalError(data.error ?? '회원가입 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    // 가입 성공 → 즉시 로그인 (이메일 인증 없음)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })

    if (signInError) {
      // 로그인 실패 (극히 드문 케이스) → 로그인 페이지로 안내
      router.push('/login?message=가입이 완료되었습니다. 로그인해주세요.')
      return
    }

    router.push('/')
    router.refresh()
  }

  const inputClass = (key: keyof FieldErrors) =>
    `w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors ${
      touched[key] && fieldErrors[key] ? 'border-red-500/60' : ''
    }`

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
          <h1 className="text-base font-bold text-white mb-1 text-center">회원가입</h1>
          <p className="text-zinc-500 text-sm text-center mb-6">계정을 만들어 시작하세요</p>

          {globalError && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400 text-center">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 닉네임 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                닉네임 <span className="text-lime-400">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={set('username')}
                onBlur={handleBlur('username')}
                maxLength={20}
                placeholder="2~20자"
                className={inputClass('username')}
              />
              {touched.username && fieldErrors.username ? (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>
              ) : (
                <p className="mt-1 text-xs text-zinc-600 text-right">{form.username.length}/20</p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                이메일 <span className="text-lime-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                onBlur={handleBlur('email')}
                autoComplete="email"
                placeholder="example@email.com"
                className={inputClass('email')}
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                비밀번호 <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onBlur={handleBlur('password')}
                  autoComplete="new-password"
                  placeholder="6자 이상"
                  className={`${inputClass('password')} pr-11`}
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
              {touched.password && fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                비밀번호 확인 <span className="text-lime-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  autoComplete="new-password"
                  placeholder="비밀번호 재입력"
                  className={`${inputClass('confirmPassword')} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 tracking-wide uppercase">
                전화번호 <span className="text-lime-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                onBlur={handleBlur('phone')}
                onFocus={markTouched('phone')}
                autoComplete="tel"
                placeholder="010-0000-0000"
                className={inputClass('phone')}
              />
              {touched.phone && fieldErrors.phone ? (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>
              ) : (
                <p className="mt-1 text-xs text-zinc-600">현재는 전화번호 인증 없이 가입됩니다.</p>
              )}
            </div>

            {/* 이용약관 */}
            <div className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={e => {
                      setTerms(e.target.checked)
                      if (fieldErrors.terms) setFieldErrors(prev => ({ ...prev, terms: undefined }))
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-colors ${
                    terms
                      ? 'bg-lime-400 border-lime-400'
                      : 'border-white/20 bg-white/5 group-hover:border-white/40'
                  }`}>
                    {terms && (
                      <svg className="w-4 h-4 text-zinc-950 p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-zinc-400 leading-relaxed">
                  레테온의{' '}
                  <span className="text-lime-400 underline underline-offset-2">이용약관</span>
                  {' '}및{' '}
                  <span className="text-lime-400 underline underline-offset-2">개인정보처리방침</span>
                  에 동의합니다.
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="mt-1 text-xs text-red-400 pl-7">{fieldErrors.terms}</p>
              )}
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
                  처리 중...
                </span>
              ) : (
                '회원가입'
              )}
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
