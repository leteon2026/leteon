import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative flex items-center justify-center overflow-hidden border-b border-white/5 hero-pattern">
      {/* 라임 글로우 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-lime-400/[0.07] blur-3xl pointer-events-none" />

      <div className="relative text-center px-4 max-w-3xl mx-auto py-24 sm:py-36">
        {/* 라벨 칩 */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-7 glass-card rounded text-lime-400 text-[11px] font-bold tracking-[0.2em] uppercase">
          <span className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse" />
          Korea Bike Marketplace
        </div>

        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-white leading-none tracking-tight">
          LETEON
        </h1>
        <p className="mt-3 text-base sm:text-lg text-lime-400 font-black tracking-[0.3em]">
          레테온
        </p>

        <p className="mt-8 text-base sm:text-lg text-zinc-400 max-w-sm mx-auto leading-relaxed">
          MTB · eMTB · eBike
          <span className="block mt-1 text-sm text-zinc-500">바이크 C2C 직거래 마켓</span>
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/listings">
            <Button size="lg" variant="primary">전체 매물 보기</Button>
          </Link>
          <Link href="/listings/new">
            <Button size="lg" variant="outline">매물 등록</Button>
          </Link>
        </div>

        {/* 하단 구분선 통계 */}
        <div className="mt-14 flex items-center justify-center gap-8 text-center">
          <div>
            <p className="text-xl font-black font-mono text-white">C2C</p>
            <p className="text-xs text-zinc-600 mt-0.5">직거래</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div>
            <p className="text-xl font-black font-mono text-white">0%</p>
            <p className="text-xs text-zinc-600 mt-0.5">중개 수수료</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div>
            <p className="text-xl font-black font-mono text-white">4</p>
            <p className="text-xs text-zinc-600 mt-0.5">카테고리</p>
          </div>
        </div>
      </div>
    </section>
  )
}
