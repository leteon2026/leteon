import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  const [
    { count: activeListings },
    { count: totalUsers },
    { count: pendingPayments },
    { data: recentListings },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('listings')
      .select('*, profiles(username)')
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const statusColor: Record<string, string> = {
    draft: 'text-yellow-400',
    active: 'text-lime-400',
    sold: 'text-blue-400',
    deleted: 'text-zinc-500',
  }
  const statusLabel: Record<string, string> = {
    draft: '미결제',
    active: '판매중',
    sold: '판매완료',
    deleted: '삭제됨',
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-8">대시보드</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: '활성 매물', value: activeListings ?? 0, href: '/admin/listings' },
          { label: '전체 유저', value: totalUsers ?? 0, href: '/admin/users' },
          { label: '완료 결제', value: pendingPayments ?? 0, href: '/admin/payments' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-black text-lime-400">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">최근 매물</h2>
          <Link href="/admin/listings" className="text-sm text-lime-400 hover:text-lime-300 font-medium">전체보기 →</Link>
        </div>
        {!recentListings || recentListings.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-8">매물이 없습니다.</p>
        ) : (
          <div className="space-y-0">
            {recentListings.map((l: Record<string, any>) => (
              <div key={l.id} className="flex items-center justify-between py-3.5 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-white line-clamp-1">{l.title}</p>
                  <p className="text-sm text-zinc-400 mt-0.5">{l.profiles?.username} · {l.category}</p>
                </div>
                <span className={`text-sm font-semibold ${statusColor[l.status] ?? 'text-zinc-400'}`}>
                  {statusLabel[l.status] ?? l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
