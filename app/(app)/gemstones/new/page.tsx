import { createClient } from '@/lib/supabase/server'
import { GemstoneForm } from '@/components/app/gemstone-form'

export default async function NewGemstonePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('type', 'gemstone')
    .order('name')

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Gemstone Stock</h1>
        <p className="text-sm text-muted-foreground">Record a new lot or individual stone purchase</p>
      </div>
      <GemstoneForm suppliers={data ?? []} />
    </div>
  )
}
