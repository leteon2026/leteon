import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const redirect = (to: string) => {
    const url = request.nextUrl.clone()
    const [path, search] = to.split('?')
    url.pathname = path
    url.search = search ? `?${search}` : ''
    const res = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
    return res
  }

  if (pathname.startsWith('/admin')) {
    if (!user) return redirect(`/login?next=${encodeURIComponent(pathname)}`)
    if (!isAdmin(user.email)) return redirect('/?error=forbidden')
  }

  if (['/my', '/listings/new'].some(p => pathname.startsWith(p)) && !user) {
    return redirect(`/login?next=${encodeURIComponent(pathname)}`)
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    return redirect('/')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
