'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') ?? '결제가 취소되었습니다.'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center mx-auto mb-6">
        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-black text-white">결제 실패</h1>
      <p className="mt-3 text-sm text-zinc-400 max-w-md">{message}</p>
      <p className="mt-1 text-xs text-zinc-600">매물 정보는 저장되지 않았습니다. 다시 시도해주세요.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/listings"><Button variant="outline">목록으로</Button></Link>
        <Link href="/listings/new"><Button variant="primary">다시 등록</Button></Link>
      </div>
    </div>
  )
}
