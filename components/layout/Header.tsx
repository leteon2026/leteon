'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const categories = [
  { label: 'MTB',    href: '/listings?category=MTB' },
  { label: 'eMTB',   href: '/listings?category=eMTB' },
  { label: 'eBike',  href: '/listings?category=eBike' },
  { label: 'Surron', href: '/listings?category=Surron' },
  { label: 'Parts',  href: '/listings?category=Parts' },
]

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ username: string; avatar_url: string } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase.from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    closeDrawer()
    window.location.href = '/login'
  }

  const displayName = profile?.username || user?.email?.split('@')[0] || '사용자'

  return (
    <>
      {/* 헤더 바 */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center justify-between h-14 px-4 max-w-screen-xl mx-auto">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeDrawer}>
            <span className="text-xl font-black text-lime-400 tracking-widest">LETEON</span>
            <span className="hidden sm:block text-xs text-zinc-600 font-medium">레테온</span>
          </Link>

          {/* 데스크탑 카테고리 */}
          <nav className="hidden md:flex items-center gap-5">
            {categories.map(c => (
              <Link key={c.href} href={c.href}
                className="text-sm text-zinc-400 hover:text-lime-400 transition-colors font-medium">
                {c.label}
              </Link>
            ))}
          </nav>

          {/* 데스크탑 우측 */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/listings/new"
                  className="bg-lime-400 text-black text-xs font-bold px-3.5 py-2 rounded hover:bg-lime-300 transition-colors whitespace-nowrap">
                  + 매물 등록
                </Link>
                <Link href="/my" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden border border-zinc-700 flex-shrink-0">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={displayName} width={32} height={32} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-400 group-hover:text-white">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors hidden lg:block">
                    {displayName}
                  </span>
                </Link>
                <button onClick={handleLogout}
                  className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-2 py-1">
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login"
                className="text-sm text-zinc-400 hover:text-lime-400 transition-colors font-medium">
                로그인
              </Link>
            )}
          </div>

          {/* 모바일: 로그인 전 로그인 버튼 */}
          {!user && (
            <Link href="/login"
              className="md:hidden text-sm text-zinc-400 hover:text-lime-400 transition-colors font-medium mr-2">
              로그인
            </Link>
          )}

          {/* 햄버거 버튼 */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            onClick={() => setDrawerOpen(true)}
            aria-label="메뉴 열기"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 모바일 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 딤 배경 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDrawer} aria-hidden="true" />

          {/* 드로어 패널 */}
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl">

            {/* 드로어 헤더 */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-800 shrink-0">
              <span className="text-base font-black text-lime-400 tracking-widest">LETEON</span>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white rounded transition-colors"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 로그인 유저 정보 */}
            {user && (
              <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 flex-shrink-0">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={displayName} width={40} height={40} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base font-bold text-zinc-400">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 메뉴 본문 */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">

              {/* 카테고리 */}
              <p className="px-3 pb-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">카테고리</p>
              {categories.map(c => (
                <Link key={c.href} href={c.href} onClick={closeDrawer}
                  className="block px-3 py-3 text-sm font-medium text-zinc-300 hover:text-lime-400 hover:bg-zinc-900 rounded transition-colors">
                  {c.label}
                </Link>
              ))}

              {/* 전체 매물 */}
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <Link href="/listings" onClick={closeDrawer}
                  className="block px-3 py-3 text-sm font-medium text-zinc-300 hover:text-lime-400 hover:bg-zinc-900 rounded transition-colors">
                  전체 매물
                </Link>
              </div>

              {/* 내 계정 */}
              {user && (
                <div className="mt-4 pt-4 border-t border-zinc-800/60">
                  <Link href="/my" onClick={closeDrawer}
                    className="block px-3 py-3 text-sm font-medium text-zinc-300 hover:text-lime-400 hover:bg-zinc-900 rounded transition-colors">
                    내 매물 / 프로필
                  </Link>
                </div>
              )}
            </nav>

            {/* 하단 액션 */}
            <div className="shrink-0 px-3 pb-8 pt-3 border-t border-zinc-800 space-y-2">
              {user ? (
                <>
                  <Link href="/listings/new" onClick={closeDrawer}
                    className="flex items-center justify-center gap-2 w-full bg-lime-400 text-black text-sm font-bold py-3 rounded hover:bg-lime-300 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    매물 등록
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-center text-sm text-zinc-600 hover:text-red-400 py-2.5 rounded transition-colors">
                    로그아웃
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeDrawer}
                  className="block w-full text-center bg-lime-400 text-black text-sm font-bold py-3 rounded hover:bg-lime-300 transition-colors">
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
