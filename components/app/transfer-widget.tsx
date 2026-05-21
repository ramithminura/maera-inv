'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { transferLotToSingle } from '@/lib/actions/gemstones'
import type { GemstoneInventory } from '@/lib/types'

interface TransferWidgetProps {
  lot: GemstoneInventory
}

export function TransferWidget({ lot }: TransferWidgetProps) {
  const router = useRouter()
  const [transferCarats, setTransferCarats] = useState('')
  const [loading, setLoading] = useState(false)

  const caratValue = parseFloat(transferCarats)
  const isValid = caratValue > 0 && caratValue <= lot.remaining_carats && lot.remaining_pieces >= 1
  const previewCost = isValid ? (caratValue * lot.unit_price_lkr).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) : null

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      toast.error(`Enter a value between 0.01 and ${lot.remaining_carats.toFixed(2)} ct.`)
      return
    }
    setLoading(true)
    const result = await transferLotToSingle(lot.id, caratValue)
    setLoading(false)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success(`${caratValue.toFixed(2)} ct split — new single stone created.`)
      setTransferCarats('')
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <GitFork className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">Split Stone from Lot</CardTitle>
        </div>
      </CardHeader>
      <form onSubmit={handleTransfer}>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Deduct carats from this lot and create a new individual stone entry. The new stone inherits stone type, shape, treatment, supplier, and purchase date.
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="transfer_carats">Carats to Transfer *</Label>
            <Input
              id="transfer_carats"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              step="0.01"
              min="0.01"
              max={lot.remaining_carats}
              placeholder={`Max ${lot.remaining_carats.toFixed(2)}`}
              value={transferCarats}
              onChange={(e) => setTransferCarats(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {lot.remaining_carats.toFixed(2)} ct ·{' '}
              {lot.remaining_pieces} piece{lot.remaining_pieces !== 1 ? 's' : ''} remaining
            </p>
          </div>

          {previewCost && (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">New stone cost</p>
              <p className="text-sm font-semibold">LKR {previewCost}</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading || lot.remaining_pieces < 1} className="w-full sm:w-auto">
            {loading ? 'Splitting…' : 'Split Stone'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
