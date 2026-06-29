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
      <p className="text-zinc-500 text-sm mb-8">
        판매 가격의 1%를 등록비로 결제하면 매물이 게시됩니다.
        등록 후 30일이 지나야 삭제할 수 있습니다.
      </p>
      <ListingForm />
    </div>
  )
}
