'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { Category, ListingCondition, CATEGORY_LIST, CONDITION_LABEL } from '@/types'
import { calcListingFee, buildOrderId } from '@/lib/toss'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/listings/ImageUploader'

interface SpecEntry { key: string; value: string }

export default function ListingForm() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'MTB' as Category,
    condition: 'good' as ListingCondition,
    price: '',
    description: '',
    location: '',
  })
  const [specs, setSpecs] = useState<SpecEntry[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const price = Number(form.price) || 0
  const fee = price > 0 ? calcListingFee(price) : 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addSpec = () => setSpecs(p => [...p, { key: '', value: '' }])
  const updateSpec = (i: number, f: 'key' | 'value', v: string) =>
    setSpecs(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s))
  const removeSpec = (i: number) => setSpecs(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'form') {
      if (imageUrls.filter(u => u.trim()).length === 0) {
        setError('사진을 1장 이상 등록해주세요.')
        return
      }
      setError(null)
      setStep('preview')
      return
    }

    setLoading(true)
    try {
      const specsObj = specs.reduce<Record<string, string>>((acc, { key, value }) => {
        if (key.trim()) acc[key.trim()] = value
        return acc
      }, {})

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          specs: specsObj,
          image_urls: imageUrls.filter(u => u.trim()),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? '등록 실패')
        setLoading(false)
        return
      }

      const { listing, listing_fee } = await res.json()

      // Toss 키 미설정 시 결제 없이 바로 매물 페이지로
      if (!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY) {
        router.push(`/listings/${listing.slug}`)
        return
      }

      // Toss 결제 시작
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
      const tossPayments = await loadTossPayments(clientKey)
      const payment = tossPayments.payment({ customerKey: ANONYMOUS })

      await payment.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: listing_fee },
        orderId: buildOrderId(listing.id),
        orderName: `매물 등록비 — ${form.title}`.slice(0, 100),
        successUrl: `${window.location.origin}/payment/success?listingId=${listing.id}`,
        failUrl: `${window.location.origin}/payment/fail?listingId=${listing.id}`,
      })
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {step === 'form' && (
        <>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="glass-card rounded p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                제목 <span className="text-lime-400">*</span>
              </label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="예: Trek Fuel EX 9.8 2024 판매합니다"
                className="w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500" />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">카테고리</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full glass-input rounded px-4 py-2.5 text-sm text-white">
                  {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">상태</label>
                <select name="condition" value={form.condition} onChange={handleChange}
                  className="w-full glass-input rounded px-4 py-2.5 text-sm text-white">
                  {(Object.entries(CONDITION_LABEL) as [ListingCondition, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  가격 (원) <span className="text-lime-400">*</span>
                </label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min={1}
                  placeholder="2500000"
                  className="w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500" />
                <p className="mt-1 text-xs text-lime-400/70">현재 무료로 등록할 수 있습니다.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">거래 지역</label>
                <input name="location" value={form.location} onChange={handleChange}
                  placeholder="예: 서울 강남구"
                  className="w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">상품 설명</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                placeholder="상품 상태, 구매 시기, 사용 기간, 특이사항 등을 자세히 적어주세요"
                className="w-full glass-input rounded px-4 py-2.5 text-sm text-white placeholder-zinc-500 resize-none" />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                이미지 <span className="text-lime-400">*</span>
                <span className="text-zinc-600 font-normal ml-1">(최대 5개)</span>
              </label>
              <ImageUploader urls={imageUrls} onChange={setImageUrls} maxImages={5} />
            </div>

            {/* Specs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-zinc-300">스펙 (선택)</label>
                <button type="button" onClick={addSpec} className="text-xs text-lime-400 hover:text-lime-300 font-medium">+ 추가</button>
              </div>
              <div className="space-y-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="항목 (예: 프레임 사이즈)"
                      className="flex-1 glass-input rounded px-3 py-2 text-sm text-white placeholder-zinc-500" />
                    <input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="값 (예: M)"
                      className="flex-1 glass-input rounded px-3 py-2 text-sm text-white placeholder-zinc-500" />
                    <button type="button" onClick={() => removeSpec(i)} className="px-2 text-zinc-600 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={!form.title || !form.price}>
            다음 — 미리보기
          </Button>
        </>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="glass-card rounded p-6 border-lime-400/20">
            <h2 className="text-sm font-semibold text-lime-400 mb-4 tracking-wider uppercase">등록 확인</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-500">제목</dt><dd className="text-white font-medium">{form.title}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">카테고리</dt><dd className="text-white">{form.category}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">상태</dt><dd className="text-white">{CONDITION_LABEL[form.condition]}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">판매가</dt><dd className="text-white font-semibold">{formatPrice(price)}</dd></div>
              {form.location && <div className="flex justify-between"><dt className="text-zinc-500">지역</dt><dd className="text-white">{form.location}</dd></div>}
            </dl>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-sm text-zinc-400">등록비</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-lime-400/10 border border-lime-400/30 rounded text-lime-400 text-sm font-bold">
                무료
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-600">등록 후 30일이 지난 뒤 삭제할 수 있습니다.</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep('form')}>수정</Button>
            <Button type="submit" variant="primary" size="lg" disabled={loading} className="flex-1">
              {loading ? '처리 중...' : '무료로 등록하기'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
