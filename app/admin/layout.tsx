import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import AdminLogoutButton from './AdminLogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')
  if (!isAdmin(user.email)) redirect('/?error=forbidden')

  const navItems = [
    { href: '/admin', label: '대시보드' },
    { href: '/admin/listings', label: '매물 관리' },
    { href: '/admin/payments', label: '결제 내역' },
    { href: '/admin/users', label: '유저 관리' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black text-lime-400 tracking-widest">LETEON</Link>
            <span className="bg-lime-400/10 text-lime-400 text-xs font-bold px-2 py-0.5 rounded tracking-wider">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex gap-1 mb-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 overflow-x-auto w-full sm:w-fit">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
