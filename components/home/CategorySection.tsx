import Link from 'next/link'

const categories = [
  { name: 'MTB',    desc: '산악 마운틴 바이크' },
  { name: 'eMTB',   desc: '전동 MTB' },
  { name: 'eBike',  desc: '전기 자전거' },
  { name: 'Surron', desc: '전기 오토바이' },
  { name: 'Parts',  desc: '부품 & 악세서리' },
]

export default function CategorySection() {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-white">카테고리</h2>
        <p className="mt-1 text-sm text-zinc-500">원하는 라이딩 스타일을 선택하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.name}
            href={`/listings?category=${cat.name}`}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-lime-400/50 hover:bg-zinc-800 transition-colors duration-200"
          >
            <div className="text-sm font-bold text-white">{cat.name}</div>
            <div className="mt-1 text-xs text-zinc-500 leading-relaxed">{cat.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
