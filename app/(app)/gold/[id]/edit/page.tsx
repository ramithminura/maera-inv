import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GoldPurchaseForm } from '@/components/app/gold-purchase-form'
import type { GoldPurchase } from '@/lib/types'

export default async function EditGoldPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [purchaseResult, suppliersResult] = await Promise.all([
    supabase.from('gold_purchases').select('*').eq('id', id).single(),
    supabase.from('suppliers').select('id, name').eq('type', 'gold').order('name'),
  ])

  if (purchaseResult.error || !purchaseResult.data) notFound()

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Gold Purchase</h1>
        <p className="text-sm text-muted-foreground">
          Update purchase details — remaining stock is preserved
        </p>
      </div>
      <GoldPurchaseForm
        initialData={purchaseResult.data as GoldPurchase}
        suppliers={suppliersResult.data ?? []}
      />
    </div>
  )
}
