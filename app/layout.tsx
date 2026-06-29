import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'LETEON 레테온 | MTB · eMTB · eBike · Surron 중고 마켓',
  description: 'MTB, eMTB, eBike, Surron 바이크 C2C 직거래 마켓플레이스 레테온',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-950 text-white antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
