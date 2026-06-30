import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="flex items-center justify-center bg-zinc-950 border-b border-zinc-800">
      <div className="text-center px-4 max-w-3xl mx-auto py-24 sm:py-32">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tight">
          LETEON
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-lime-400 font-black tracking-widest">
          레테온
        </p>

        <p className="mt-8 text-base sm:text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
          MTB · eMTB · eBike · Surron<br />
          바이크 C2C 직거래 마켓
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/listings">
            <Button size="lg" variant="primary">
              전체 매물 보기
            </Button>
          </Link>
          <Link href="/listings/new">
            <Button size="lg" variant="outline">
              매물 등록
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
