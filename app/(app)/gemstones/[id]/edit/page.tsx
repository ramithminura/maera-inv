import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GemstoneForm } from '@/components/app/gemstone-form'
import type { GemstoneInventory } from '@/lib/types'

export default async function EditGemstonePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [gemResult, suppliersResult] = await Promise.all([
    supabase.from('gemstone_inventory').select('*').eq('id', id).single(),
    supabase.from('suppliers').select('id, name').eq('type', 'gemstone').order('name'),
  ])

  if (gemResult.error || !gemResult.data) notFound()

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Gemstone</h1>
        <p className="text-sm text-muted-foreground">
          Update stone details — remaining stock is preserved
        </p>
      </div>
      <GemstoneForm
        initialData={gemResult.data as GemstoneInventory}
        suppliers={suppliersResult.data ?? []}
      />
    </div>
  )
}
