import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const authError = searchParams.get('error')
  if (authError) {
    const desc = searchParams.get('error_description') ?? authError
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(desc)}`
    )
  }

  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | null
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

  // 이메일 인증 링크 (token_hash 방식)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }
    return NextResponse.redirect(
      next.startsWith('/') ? `${origin}${next}` : `${origin}/`
    )
  }

  // code 방식 (구버전 이메일 확인 링크 대응)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      )
    }
  }

  if (next.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdmin(user?.email)) {
      return NextResponse.redirect(`${origin}/?error=forbidden`)
    }
  }

  return NextResponse.redirect(
    next.startsWith('/') ? `${origin}${next}` : `${origin}/`
  )
}
