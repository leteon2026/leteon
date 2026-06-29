import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import AdminListingActions from './AdminListingActions'

const statusLabel: Record<string, string> = { draft: '미결제', active: '판매중', sold: '완료', deleted: '삭제' }
const statusColor: Record<string, string> = {
  draft: 'text-yellow-400', active: 'text-lime-400', sold: 'text-blue-400', deleted: 'text-zinc-500',
}

export default async function AdminListingsPage() {
  const supabase = createAdminClient()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, profiles(username)')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">매물 관리</h1>
      {!listings || listings.length === 0 ? (
        <div className="text-center py-24 text-zinc-400"><p>매물이 없습니다.</p></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['제목', '판매자', '카테고리', '가격', '상태', '등록일', '관리'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-400 tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((listing: Record<string, any>) => (
                  <tr key={listing.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white line-clamp-1 max-w-xs">{listing.title}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{listing.profiles?.username ?? '-'}</td>
                    <td className="px-4 py-3 text-zinc-300">{listing.category}</td>
                    <td className="px-4 py-3 text-lime-400 font-semibold">{formatPrice(listing.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${statusColor[listing.status]}`}>
                        {statusLabel[listing.status] ?? listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                      {new Date(listing.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <AdminListingActions listingId={listing.id} />
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
