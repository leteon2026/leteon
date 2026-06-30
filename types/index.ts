// Surron은 DB CHECK 제약에 남아있어 기존 데이터 호환 유지 (UI에서는 제외)
export type Category = 'MTB' | 'eMTB' | 'eBike' | 'Surron' | 'Parts'

export type ListingStatus = 'draft' | 'active' | 'sold' | 'deleted'

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'

export type PaymentStatus = 'pending' | 'confirmed' | 'failed'

export interface Profile {
  id: string
  username: string
  avatar_url: string
  bio: string
  phone: string
  email: string
  verified_phone: boolean
  role: string
  heart_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Listing {
  id: string
  seller_id: string
  title: string
  slug: string
  category: Category
  price: number
  description: string
  specs: Record<string, string>
  image_urls: string[]
  thumbnail: string
  condition: ListingCondition
  location: string
  status: ListingStatus
  listing_fee: number
  can_delete_after: string | null
  brand: string
  model: string
  year: number | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Heart {
  id: string
  from_user_id: string
  to_user_id: string
  created_at: string
}

export interface Payment {
  id: string
  listing_id: string | null
  user_id: string | null
  order_id: string
  payment_key: string | null
  amount: number
  status: PaymentStatus
  created_at: string
}

export const CONDITION_LABEL: Record<ListingCondition, string> = {
  new: '새 상품',
  like_new: '거의 새것',
  good: '양호',
  fair: '보통',
}

// Surron은 표시하지 않음 (카테고리 4개로 고정)
export const CATEGORY_LIST: Category[] = ['MTB', 'eMTB', 'eBike', 'Parts']
