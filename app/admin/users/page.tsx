import { createAdminClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = createAdminClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">유저 관리</h1>
      <p className="text-base text-zinc-400 mb-6">전체 {profiles?.length ?? 0}명</p>

      {!profiles || profiles.length === 0 ? (
        <div className="text-center py-24 text-zinc-400"><p>등록된 유저가 없습니다.</p></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['유저', '소개', '하트', '가입일', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-400 tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p: Record<string, any>) => (
                  <tr key={p.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                          {p.avatar_url ? (
                            <Image src={p.avatar_url} alt={p.username} width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-zinc-400">
                              {p.username?.[0]?.toUpperCase() ?? '?'}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-white">{p.username || '(이름 없음)'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[200px]">
                      <p className="line-clamp-1">{p.bio || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{p.heart_count}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/profile/${p.id}`}
                        className="text-sm text-zinc-400 hover:text-lime-400 transition-colors font-medium">
                        프로필 보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
