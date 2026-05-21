import { createClient } from '@/lib/supabase/server'
import { GoldPurchaseForm } from '@/components/app/gold-purchase-form'

export default async function NewGoldPurchasePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('type', 'gold')
    .order('name')

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log Gold Purchase</h1>
        <p className="text-sm text-muted-foreground">Record a new gold purchase into inventory</p>
      </div>
      <GoldPurchaseForm suppliers={data ?? []} />
    </div>
  )
}
