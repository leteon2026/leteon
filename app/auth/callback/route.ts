import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// 비밀번호 재설정 이메일의 token_hash 처리 및
// 구버전 email confirmation code 처리용으로 유지
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // 비밀번호 재설정 / 이메일 인증 링크 (token_hash 방식)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
    return NextResponse.redirect(next.startsWith('/') ? `${origin}${next}` : `${origin}/`)
  }

  // code 방식 (PKCE 코드 교환)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(next.startsWith('/') ? `${origin}${next}` : `${origin}/`)
}
