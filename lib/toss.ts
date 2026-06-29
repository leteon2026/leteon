export function calcListingFee(price: number): number {
  return Math.max(1000, Math.round(price * 0.01))
}

export async function confirmTossPayment(paymentKey: string, orderId: string, amount: number) {
  const secretKey = process.env.TOSS_SECRET_KEY!
  const encoded = Buffer.from(`${secretKey}:`).toString('base64')

  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message ?? '결제 승인 실패')
  }

  return res.json()
}

export function buildOrderId(listingId: string): string {
  return `pin-${listingId}-${Date.now()}`.slice(0, 64)
}
