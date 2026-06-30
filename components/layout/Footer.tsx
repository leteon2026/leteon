import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black/60 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="max-w-screen-xl mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          {/* 브랜드 */}
          <div className="shrink-0">
            <span className="text-xl font-black text-lime-400 tracking-widest">LETEON</span>
            <p className="mt-1 text-sm text-zinc-400 font-medium">레테온</p>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              MTB · eMTB · eBike · Parts<br />
              중고 바이크 C2C 직거래 플랫폼
            </p>
            <p className="mt-3 text-xs text-zinc-600">
              레테온은 통신판매중개업자로서 거래 당사자가<br className="hidden sm:block" />
              아니며, 회원 간 거래에 대한 책임은 판매자에게 있습니다.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            {/* 카테고리 */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">카테고리</p>
              <ul className="space-y-2.5">
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
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">이용</p>
              <ul className="space-y-2.5">
                <li><Link href="/listings" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">전체 매물</Link></li>
                <li><Link href="/listings/new" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">매물 등록</Link></li>
                <li><Link href="/my" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">내 계정</Link></li>
              </ul>
            </div>

            {/* 정책 */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">정책</p>
              <ul className="space-y-2.5">
                <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">이용약관</Link></li>
                <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">개인정보처리방침</Link></li>
                <li>
                  <a href="mailto:leteon2026@gmail.com"
                    className="text-sm text-zinc-400 hover:text-lime-400 transition-colors">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} LETEON 레테온. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">이용약관</Link>
            <span className="text-zinc-800">·</span>
            <Link href="/privacy" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-semibold">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
