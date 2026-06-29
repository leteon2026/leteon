import { Suspense } from 'react'

export default function PaymentFailLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
