'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  createGoldPurchase,
  updateGoldPurchase,
  checkDuplicateGoldPurchase,
} from '@/lib/actions/gold'
import type { GoldPurchaseFormData } from '@/lib/actions/gold'
import type { GoldPurchase } from '@/lib/types'

const today = new Date().toISOString().split('T')[0]

interface GoldPurchaseFormProps {
  suppliers: { id: string; name: string }[]
  initialData?: GoldPurchase
}

export function GoldPurchaseForm({ suppliers, initialData }: GoldPurchaseFormProps) {
  const isEdit = !!initialData
  const router = useRouter()

  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchase_date ?? today)
  const [supplierId, setSupplierId] = useState<string>(initialData?.supplier_id ?? '__none__')
  const [weight, setWeight] = useState(initialData?.weight_grams?.toString() ?? '')
  const [rateLkr, setRateLkr] = useState(initialData?.rate_lkr?.toString() ?? '')
  const [rateUsd, setRateUsd] = useState(initialData?.rate_usd?.toString() ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)

  const pendingData = useRef<GoldPurchaseFormData | null>(null)

  const totalCost = weight && rateLkr
    ? (parseFloat(weight) * parseFloat(rateLkr)).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null

  async function handleSave(data: GoldPurchaseFormData) {
    setLoading(true)
    const result = isEdit
      ? await updateGoldPurchase(initialData.id, data)
      : await createGoldPurchase(data)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    // On success, server action calls redirect('/gold')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data: GoldPurchaseFormData = {
      purchase_date: purchaseDate,
      supplier_id: supplierId === '__none__' ? undefined : supplierId,
      weight_grams: parseFloat(weight),
      rate_lkr: parseFloat(rateLkr),
      rate_usd: rateUsd ? parseFloat(rateUsd) : undefined,
      notes: notes || undefined,
    }

    // Duplicate check only on create — editing an existing row is always intentional
    if (!isEdit) {
      const { isDuplicate } = await checkDuplicateGoldPurchase(
        data.purchase_date,
        data.weight_grams,
        data.rate_lkr,
      )
      if (isDuplicate) {
        pendingData.current = data
        setShowDuplicateDialog(true)
        return
      }
    }

    await handleSave(data)
  }

  async function handleDuplicateConfirm() {
    setShowDuplicateDialog(false)
    if (pendingData.current) await handleSave(pendingData.current)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-4">

            {/* Purchase date — full width (purity removed) */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                autoFocus
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Supplier (optional)</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="weight">Weight (grams) *</Label>
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  step="0.001"
                  min="0.001"
                  placeholder="e.g. 100.000"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rate_lkr">Rate (LKR/g) *</Label>
                <Input
                  id="rate_lkr"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 28000"
                  value={rateLkr}
                  onChange={(e) => setRateLkr(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rate_usd">Rate (USD/g) — optional</Label>
              <Input
                id="rate_usd"
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min="0"
                placeholder="e.g. 86.50"
                value={rateUsd}
                onChange={(e) => setRateUsd(e.target.value)}
              />
            </div>

            {totalCost && (
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-lg font-semibold">LKR {totalCost}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Any additional details…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>

          {/* Sticky on mobile, normal on md+ */}
          <CardFooter className="sticky bottom-0 bg-background border-t gap-3 md:static md:border-0">
            <Button type="button" variant="outline" className="flex-1 md:flex-none" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Purchase'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Duplicate purchase warning */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Purchase Warning</AlertDialogTitle>
            <AlertDialogDescription>
              An identical gold purchase already exists for this date, weight, and rate. Are you sure you want to log it again?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDuplicateConfirm}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
