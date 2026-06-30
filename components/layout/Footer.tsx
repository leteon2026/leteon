import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* 브랜드 */}
          <div className="shrink-0">
            <span className="text-xl font-black text-lime-400 tracking-widest">LETEON</span>
            <p className="mt-1 text-sm text-zinc-400 font-medium">레테온</p>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              MTB · eMTB · eBike · Surron<br />
              중고 바이크 직거래 마켓
            </p>
          </div>

          <div className="flex gap-12">
            {/* 카테고리 */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">카테고리</p>
              <ul className="space-y-2">
                {['MTB', 'eMTB', 'eBike', 'Parts'].map(cat => (
                  <li key={cat}>
                    <Link href={`/listings?category=${cat}`}
                      className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 이용 */}
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">이용</p>
              <ul className="space-y-2">
                <li><Link href="/listings" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">전체 매물</Link></li>
                <li><Link href="/listings/new" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">매물 등록</Link></li>
                <li><Link href="/my" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">내 계정</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.06]">
          <p className="text-sm text-zinc-500">&copy; {new Date().getFullYear()} LETEON 레테온. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
