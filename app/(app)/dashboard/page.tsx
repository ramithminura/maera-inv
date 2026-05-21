import { Coins, Gem, Truck, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [goldResult, gemResult, supplierResult, settingsResult] = await Promise.all([
    supabase
      .from('gold_purchases')
      .select('remaining_grams, total_cost_lkr, purchase_date, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('gemstone_inventory')
      .select('total_cost_lkr, stone_type, purchase_type, purchase_date, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('suppliers')
      .select('id, name, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('settings')
      .select('exchange_rate_lkr_per_usd, gold_low_stock_threshold')
      .single(),
  ])

  const goldPurchases = goldResult.data ?? []
  const gemstones = gemResult.data ?? []
  const suppliers = supplierResult.data ?? []
  const exchangeRate = settingsResult.data?.exchange_rate_lkr_per_usd ?? 0
  const threshold = settingsResult.data?.gold_low_stock_threshold ?? 100

  const totalGoldGrams = goldPurchases.reduce((s, p) => s + (p.remaining_grams ?? 0), 0)
  const totalGoldCost = goldPurchases.reduce((s, p) => s + (p.total_cost_lkr ?? 0), 0)
  const totalGemCost = gemstones.reduce((s, g) => s + (g.total_cost_lkr ?? 0), 0)
  const totalStockValue = totalGoldCost + totalGemCost
  const gemLotCount = gemstones.filter((g) => g.purchase_type === 'lot').length
  const supplierCount = suppliers.length

  type ActivityItem = {
    icon: 'gold' | 'gem' | 'supplier'
    label: string
    sub: string
    created_at: string
  }

  const recentActivity: ActivityItem[] = [
    ...goldPurchases.slice(0, 5).map((p) => ({
      icon: 'gold' as const,
      label: 'Gold purchased',
      sub: `${(p.remaining_grams ?? 0).toFixed(2)}g · ${p.purchase_date}`,
      created_at: p.created_at,
    })),
    ...gemstones.slice(0, 5).map((g) => ({
      icon: 'gem' as const,
      label: `${g.stone_type} ${g.purchase_type === 'lot' ? 'lot' : 'stone'} added`,
      sub: g.purchase_date,
      created_at: g.created_at,
    })),
    ...suppliers.slice(0, 5).map((s) => ({
      icon: 'supplier' as const,
      label: 'Supplier added',
      sub: s.name,
      created_at: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your inventory</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Gold Stock</CardTitle>
              <Coins className={`size-4 ${totalGoldGrams < threshold ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalGoldGrams.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              grams remaining{totalGoldGrams < threshold ? ' · low stock' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gemstone Lots</CardTitle>
              <Gem className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{gemLotCount}</p>
            <p className="text-xs text-muted-foreground mt-1">active lots</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock Value</CardTitle>
              <Activity className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalStockValue > 0
                ? `LKR ${totalStockValue.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`
                : '—'}
            </p>
            {totalStockValue > 0 && exchangeRate > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ≈ ${(totalStockValue / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">gold + gemstones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Suppliers</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{supplierCount}</p>
            <p className="text-xs text-muted-foreground mt-1">suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start by logging a gold purchase or adding gemstone inventory.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {item.icon === 'gold' && <Coins className="size-4 text-yellow-600" />}
                    {item.icon === 'gem' && <Gem className="size-4 text-purple-600" />}
                    {item.icon === 'supplier' && <Truck className="size-4 text-blue-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.created_at).toLocaleDateString('en-LK', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
