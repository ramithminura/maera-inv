'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { upsertSettings } from '@/lib/actions/settings'
import type { Settings } from '@/lib/types'

interface SettingsFormProps {
  initialData: Settings | null
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.company_name ?? 'The Vault')
  const [goldRate, setGoldRate] = useState(String(initialData?.gold_rate_per_gram_lkr ?? ''))
  const [exchangeRate, setExchangeRate] = useState(String(initialData?.exchange_rate_lkr_per_usd ?? ''))
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(initialData?.gold_low_stock_threshold ?? 100)
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await upsertSettings({
      company_name: companyName,
      gold_rate_per_gram_lkr: parseFloat(goldRate) || 0,
      exchange_rate_lkr_per_usd: parseFloat(exchangeRate) || 0,
      gold_low_stock_threshold: parseFloat(lowStockThreshold) || 100,
    })
    setLoading(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Settings saved')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gold_rate">Gold Rate (LKR per gram)</Label>
            <Input
              id="gold_rate"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              step="0.01"
              min="0"
              placeholder="e.g. 28000"
              value={goldRate}
              onChange={(e) => setGoldRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Reference rate for reporting. Updated manually.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exchange_rate">Exchange Rate (LKR per USD)</Label>
            <Input
              id="exchange_rate"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              step="0.01"
              min="0"
              placeholder="e.g. 325"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="low_stock">Gold Low Stock Threshold (grams)</Label>
            <Input
              id="low_stock"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              step="0.01"
              min="0"
              placeholder="e.g. 100"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Dashboard warns when gold stock falls below this weight.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
