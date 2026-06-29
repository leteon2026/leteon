'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [slug, setSlug] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const listingId = searchParams.get('listingId')

    if (!paymentKey || !orderId || !amount || !listingId) {
      setStatus('error')
      setErrorMsg('결제 정보가 올바르지 않습니다.')
      return
    }

    fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount), listingId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSlug(data.slug)
          setStatus('success')
        } else {
          setErrorMsg(data.error ?? '결제 승인 실패')
          setStatus('error')
        }
      })
      .catch(() => {
        setErrorMsg('네트워크 오류가 발생했습니다.')
        setStatus('error')
      })
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">결제 확인 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-white">결제 처리 실패</h1>
        <p className="mt-3 text-sm text-zinc-400 max-w-md">{errorMsg}</p>
        <div className="mt-8 flex gap-3">
          <Link href="/listings"><Button variant="outline">목록으로</Button></Link>
          <Link href="/listings/new"><Button variant="primary">다시 시도</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-full border border-lime-400/30 bg-lime-400/10 flex items-center justify-center mx-auto mb-6">
        <svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-xl font-black text-white">매물이 등록되었습니다</h1>
      <p className="mt-3 text-sm text-zinc-400 max-w-md">결제가 완료되어 매물이 게시되었습니다.</p>
      <div className="mt-8 flex gap-3">
        {slug && <Link href={`/listings/${slug}`}><Button variant="primary">내 매물 보기</Button></Link>}
        <Link href="/listings"><Button variant="outline">전체 매물</Button></Link>
      </div>
    </div>
  )
}
