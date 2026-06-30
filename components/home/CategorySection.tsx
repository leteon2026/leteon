import Link from 'next/link'

const categories = [
  {
    name: 'MTB',
    desc: '산악 마운틴 바이크',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    name: 'eMTB',
    desc: '전동 MTB',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: 'eBike',
    desc: '전기 자전거',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12a7 7 0 1 0 14 0A7 7 0 0 0 5 12z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3l2 2M12 5V3M12 19v2" />
      </svg>
    ),
  },
  {
    name: 'Parts',
    desc: '부품 & 악세서리',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.965-3.641a3 3 0 0 1-4.243 4.243" />
      </svg>
    ),
  },
]

export default function CategorySection() {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-2">Browse</p>
        <h2 className="text-2xl font-black text-white">카테고리</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.name}
            href={`/listings?category=${cat.name}`}
            className="glass-card rounded group p-5 hover:border-lime-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-lime-400/5"
          >
            <div className="text-zinc-500 group-hover:text-lime-400 transition-colors duration-300 mb-3">
              {cat.icon}
            </div>
            <div className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors duration-300">{cat.name}</div>
            <div className="mt-1 text-xs text-zinc-500 leading-relaxed">{cat.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
