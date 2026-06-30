'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const categories = [
  { value: '', label: '전체' },
  { value: 'MTB', label: 'MTB' },
  { value: 'eMTB', label: 'eMTB' },
  { value: 'eBike', label: 'eBike' },
  { value: 'Surron', label: 'Surron' },
  { value: 'Parts', label: 'Parts' },
]

interface CategoryFilterProps {
  basePath?: string
}

export default function CategoryFilter({ basePath = '/products' }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') || ''

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`${basePath}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat.value}
          onClick={() => handleSelect(cat.value)}
          className={`px-4 py-2 rounded text-sm font-semibold border transition-all duration-200 ${
            current === cat.value
              ? 'bg-lime-400 text-black border-lime-400'
              : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-lime-400 hover:text-lime-400'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
