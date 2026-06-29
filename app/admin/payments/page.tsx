import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient()
  const { data: payments } = await supabase
    .from('payments')
    .select('*, profiles(username), listings(title)')
    .order('created_at', { ascending: false })

  const statusLabel: Record<string, string> = { pending: '대기', confirmed: '완료', failed: '실패' }
  const statusColor: Record<string, string> = {
    pending: 'text-yellow-400', confirmed: 'text-lime-400', failed: 'text-red-400',
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-6">결제 내역</h1>
      {!payments || payments.length === 0 ? (
        <div className="text-center py-24 text-zinc-400"><p>결제 내역이 없습니다.</p></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['주문번호', '판매자', '매물', '금액', '상태', '결제일'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-zinc-400 tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(payments as any[]).map(p => (
                  <tr key={p.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50">
                    <td className="px-4 py-3">
                      <p className="text-sm text-zinc-400 font-mono">{p.order_id.slice(0, 24)}...</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-200">{p.profiles?.username ?? '-'}</td>
                    <td className="px-4 py-3 text-zinc-200 max-w-[200px]">
                      <p className="line-clamp-1">{p.listings?.title ?? '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-lime-400 font-semibold">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${statusColor[p.status]}`}>
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm whitespace-nowrap">
                      {new Date(p.created_at).toLocaleString('ko-KR')}
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
