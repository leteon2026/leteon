import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingForm from '@/components/listings/ListingForm'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-black text-white mb-2">매물 등록</h1>
      <div className="flex items-center gap-2 mb-8">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-lime-400/10 border border-lime-400/30 rounded text-lime-400 text-xs font-bold">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          지금은 무료 등록
        </span>
        <p className="text-zinc-500 text-sm">등록 후 30일이 지나야 삭제할 수 있습니다.</p>
      </div>
      <ListingForm />
    </div>
  )
}
