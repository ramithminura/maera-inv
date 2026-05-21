import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/actions/settings'
import { GoldTable } from '@/components/app/gold-table'
import type { GoldPurchase } from '@/lib/types'

export default async function GoldPage() {
  const supabase = await createClient()
  const [{ data }, settings] = await Promise.all([
    supabase
      .from('gold_purchases')
      .select('*, suppliers(name)')
      .order('purchase_date', { ascending: false }),
    getSettings(),
  ])

  const purchases = (data ?? []) as GoldPurchase[]
  const exchangeRate = settings?.exchange_rate_lkr_per_usd ?? 0
  const threshold = settings?.gold_low_stock_threshold ?? 100

  const totalRemaining = purchases.reduce((s, p) => s + p.remaining_grams, 0)
  const wac =
    totalRemaining > 0
      ? purchases.reduce((s, p) => s + p.remaining_grams * p.rate_lkr, 0) / totalRemaining
      : 0
  const estimatedValue = totalRemaining * wac
  const isLowStock = totalRemaining < threshold

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gold Purchases</h1>
          <p className="text-sm text-muted-foreground">Track your gold stock and weighted average cost</p>
        </div>
        <Button asChild>
          <Link href="/gold/new">Log Purchase</Link>
        </Button>
      </div>

      {/* Low-stock warning */}
      {isLowStock && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 dark:bg-yellow-900/20 dark:border-yellow-700">
          <AlertTriangle className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Low stock —{' '}
            <strong>{totalRemaining.toFixed(2)}g</strong> remaining, below your{' '}
            <strong>{threshold}g</strong> threshold.
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalRemaining.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">grams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weighted Avg. Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {wac > 0 ? `LKR ${wac.toFixed(2)}` : '—'}
            </p>
            {wac > 0 && exchangeRate > 0 && (
              <p className="text-xs text-muted-foreground">${(wac / exchangeRate).toFixed(2)}/g</p>
            )}
            <p className="text-xs text-muted-foreground">per gram</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {estimatedValue > 0
                ? `LKR ${estimatedValue.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`
                : '—'}
            </p>
            {estimatedValue > 0 && exchangeRate > 0 && (
              <p className="text-xs text-muted-foreground">
                ≈ ${(estimatedValue / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
            )}
            <p className="text-xs text-muted-foreground">at WAC</p>
          </CardContent>
        </Card>
      </div>

      {/* Sortable table — client component */}
      <GoldTable purchases={purchases} exchangeRate={exchangeRate} />
    </div>
  )
}
