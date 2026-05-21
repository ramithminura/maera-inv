import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/actions/settings'
import { GemstonesTable } from '@/components/app/gemstones-table'
import type { GemstoneInventory } from '@/lib/types'

export default async function GemstonesPage() {
  const supabase = await createClient()
  const [{ data }, settings] = await Promise.all([
    supabase
      .from('gemstone_inventory')
      .select('*, suppliers(name)')
      .order('created_at', { ascending: false }),
    getSettings(),
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gemstone Inventory</h1>
          <p className="text-sm text-muted-foreground">Track loose stone lots and individual pieces</p>
        </div>
        <Button asChild>
          <Link href="/gemstones/new">Add Stones</Link>
        </Button>
      </div>
      <GemstonesTable
        gemstones={(data ?? []) as GemstoneInventory[]}
        exchangeRate={settings?.exchange_rate_lkr_per_usd ?? 0}
      />
    </div>
  )
}
