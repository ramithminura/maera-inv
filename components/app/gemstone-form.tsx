'use client'

import { useState } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { createGemstone, updateGemstone } from '@/lib/actions/gemstones'
import type { GemstoneInventory, PurchaseType, TreatmentType } from '@/lib/types'

const STONE_TYPES = ['Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Alexandrite', 'Spinel', 'Tanzanite', 'Other']
const SHAPES = ['Round', 'Oval', 'Cushion', 'Emerald Cut', 'Pear', 'Marquise', 'Heart', 'Princess', 'Radiant', 'Other']
const TREATMENTS: TreatmentType[] = ['None', 'Heated', 'Unheated', 'Fracture Filled', 'Beryllium Treated', 'Other']

const today = new Date().toISOString().split('T')[0]

function seedStoneType(value: string | undefined): { type: string; custom: string } {
  if (!value) return { type: '', custom: '' }
  return STONE_TYPES.includes(value)
    ? { type: value, custom: '' }
    : { type: 'Other', custom: value }
}

function seedShape(value: string | undefined): { shape: string; other: string } {
  if (!value) return { shape: '', other: '' }
  return SHAPES.includes(value)
    ? { shape: value, other: '' }
    : { shape: 'Other', other: value }
}

interface GemstoneFormProps {
  suppliers: { id: string; name: string }[]
  initialData?: GemstoneInventory
}

export function GemstoneForm({ suppliers, initialData }: GemstoneFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const seedType = seedStoneType(initialData?.stone_type)
  const seedSh = seedShape(initialData?.shape)

  const [purchaseType, setPurchaseType] = useState<PurchaseType>(initialData?.purchase_type ?? 'lot')
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchase_date ?? today)
  const [stoneType, setStoneType] = useState(seedType.type)
  const [customStoneType, setCustomStoneType] = useState(seedType.custom)
  const [shape, setShape] = useState(seedSh.shape)
  const [shapeOther, setShapeOther] = useState(seedSh.other)
  const [supplierId, setSupplierId] = useState(initialData?.supplier_id ?? '__none__')
  const [totalCarats, setTotalCarats] = useState(initialData?.total_carats?.toString() ?? '')
  const [numPieces, setNumPieces] = useState(initialData?.num_pieces?.toString() ?? '1')
  const [unitPrice, setUnitPrice] = useState(initialData?.unit_price_lkr?.toString() ?? '')
  const [unitPriceUsd, setUnitPriceUsd] = useState(initialData?.unit_price_usd?.toString() ?? '')
  const [treatment, setTreatment] = useState<TreatmentType>(initialData?.treatment ?? 'None')
  const [treatmentOther, setTreatmentOther] = useState(initialData?.treatment_other ?? '')
  const [hasCertificate, setHasCertificate] = useState(initialData?.has_certificate ?? false)
  const [certificateNo, setCertificateNo] = useState(initialData?.certificate_no ?? '')
  const [clarity, setClarity] = useState(initialData?.clarity ?? '')
  const [colour, setColour] = useState(initialData?.colour ?? '')
  const [advisableSp, setAdvisableSp] = useState(initialData?.advisable_selling_price_lkr?.toString() ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const effectiveStoneType = stoneType === 'Other' ? customStoneType : stoneType
  const effectiveShape = shape === 'Other' ? (shapeOther || 'Other') : shape
  const pieces = purchaseType === 'single' ? 1 : parseInt(numPieces) || 1

  // Lot → always per-carat; Single → always per-piece (1 piece × price)
  const totalCost = totalCarats && unitPrice
    ? purchaseType === 'lot'
      ? parseFloat(totalCarats) * parseFloat(unitPrice)
      : parseFloat(unitPrice)
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!effectiveStoneType || !shape) {
      toast.error('Please select a stone type and shape.')
      return
    }
    setLoading(true)
    const payload = {
      stone_type: effectiveStoneType,
      shape: effectiveShape,
      shape_other: shape === 'Other' ? shapeOther || undefined : undefined,
      purchase_type: purchaseType,
      total_carats: parseFloat(totalCarats),
      num_pieces: pieces,
      unit_price_lkr: parseFloat(unitPrice),
      unit_price_usd: unitPriceUsd ? parseFloat(unitPriceUsd) : undefined,
      total_cost_lkr: totalCost ?? 0,
      clarity: clarity || undefined,
      colour: colour || undefined,
      has_certificate: hasCertificate,
      certificate_no: hasCertificate ? (certificateNo || undefined) : undefined,
      treatment,
      treatment_other: treatment === 'Other' ? (treatmentOther || undefined) : undefined,
      advisable_selling_price_lkr: advisableSp ? parseFloat(advisableSp) : undefined,
      purchase_date: purchaseDate,
      supplier_id: supplierId === '__none__' ? undefined : supplierId,
      notes: notes || undefined,
    }
    const result = isEdit
      ? await updateGemstone(initialData.id, payload)
      : await createGemstone(payload)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    // On success, server action calls redirect('/gemstones')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">

          {/* Purchase type toggle */}
          <div className="flex flex-col gap-1.5">
            <Label>Purchase Type *</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {(['lot', 'single'] as PurchaseType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setPurchaseType(t)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                    purchaseType === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t === 'lot' ? 'Lot' : 'Single Stone'}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase date — autoFocus on first field */}
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

          {/* Stone type + shape */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Stone Type *</Label>
              <Select value={stoneType} onValueChange={setStoneType}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {STONE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {stoneType === 'Other' && (
                <Input
                  placeholder="Specify stone type…"
                  value={customStoneType}
                  onChange={(e) => setCustomStoneType(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Shape *</Label>
              <Select value={shape} onValueChange={setShape}>
                <SelectTrigger><SelectValue placeholder="Select shape…" /></SelectTrigger>
                <SelectContent>
                  {SHAPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {shape === 'Other' && (
                <Input
                  placeholder="Specify shape…"
                  value={shapeOther}
                  onChange={(e) => setShapeOther(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
          </div>

          {/* Carats + pieces */}
          <div className={`grid gap-4 ${purchaseType === 'lot' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="total_carats">Total Carats *</Label>
              <Input
                id="total_carats"
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min="0.01"
                placeholder="e.g. 4.20"
                value={totalCarats}
                onChange={(e) => setTotalCarats(e.target.value)}
                required
              />
            </div>

            {purchaseType === 'lot' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="num_pieces">Number of Pieces *</Label>
                <Input
                  id="num_pieces"
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  step="1"
                  min="1"
                  placeholder="e.g. 20"
                  value={numPieces}
                  onChange={(e) => setNumPieces(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit_price">
                {purchaseType === 'lot' ? 'Price per Carat (LKR) *' : 'Price per Stone (LKR) *'}
              </Label>
              <Input
                id="unit_price"
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min="0"
                placeholder="e.g. 20000"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit_price_usd">Price (USD) — optional</Label>
              <Input
                id="unit_price_usd"
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="0.01"
                min="0"
                placeholder="e.g. 62.50"
                value={unitPriceUsd}
                onChange={(e) => setUnitPriceUsd(e.target.value)}
              />
            </div>
          </div>

          {/* Derived total cost */}
          {totalCost !== null && (
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-lg font-semibold">
                LKR {totalCost.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Optional Details</p>

          {/* Treatment */}
          <div className="flex flex-col gap-1.5">
            <Label>Treatment</Label>
            <Select value={treatment} onValueChange={(v) => setTreatment(v as TreatmentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TREATMENTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {treatment === 'Other' && (
              <Input
                placeholder="Specify treatment…"
                value={treatmentOther}
                onChange={(e) => setTreatmentOther(e.target.value)}
                className="mt-1"
              />
            )}
          </div>

          {/* Certificate */}
          <div className="flex flex-col gap-1.5">
            <Label>Certificate</Label>
            <div className="flex rounded-lg border overflow-hidden">
              {[false, true].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setHasCertificate(v)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    hasCertificate === v
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {v ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
            {hasCertificate && (
              <Input
                placeholder="e.g. GIA 12345678"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                className="mt-1"
              />
            )}
          </div>

          {/* Clarity + colour */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clarity">Clarity</Label>
              <Input id="clarity" placeholder="e.g. VVS1" value={clarity} onChange={(e) => setClarity(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="colour">Colour</Label>
              <Input id="colour" placeholder="e.g. D, Pigeon Blood" value={colour} onChange={(e) => setColour(e.target.value)} />
            </div>
          </div>

          {/* Advisable selling price */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="adv_sp">Advisable Selling Price (LKR)</Label>
            <Input
              id="adv_sp"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              step="0.01"
              min="0"
              placeholder="e.g. 250000"
              value={advisableSp}
              onChange={(e) => setAdvisableSp(e.target.value)}
            />
          </div>

          {/* Supplier */}
          <div className="flex flex-col gap-1.5">
            <Label>Supplier</Label>
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

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="gem-notes">Notes</Label>
            <Textarea id="gem-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

        </CardContent>

        {/* Sticky on mobile, normal on md+ */}
        <CardFooter className="sticky bottom-0 bg-background border-t gap-3 md:static md:border-0">
          <Button type="button" variant="outline" className="flex-1 md:flex-none" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 md:flex-none">
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Stones'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
