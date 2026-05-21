import { createClient } from '@/lib/supabase/server'
import { SuppliersTable } from '@/components/app/suppliers-table'
import type { Supplier } from '@/lib/types'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('suppliers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
        <p className="text-sm text-muted-foreground">Manage your gold and gemstone suppliers</p>
      </div>
      <SuppliersTable suppliers={(data ?? []) as Supplier[]} />
    </div>
  )
}
