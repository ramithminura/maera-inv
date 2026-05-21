'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { createAlloyConfig, updateAlloyConfig } from '@/lib/actions/alloys'
import type { AlloyConfig, AlloyComponent } from '@/lib/types'

interface AlloyConfigFormProps {
  initialData?: AlloyConfig
}

export function AlloyConfigForm({ initialData }: AlloyConfigFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name ?? '')
  const [goldPct, setGoldPct] = useState(String(initialData?.gold_percentage ?? 75))
  const [components, setComponents] = useState<AlloyComponent[]>(
    initialData?.components ?? [{ material: '', percentage: 0, cost_per_gram_lkr: 0 }]
  )
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [loading, setLoading] = useState(false)

  function addComponent() {
    setComponents((c) => [...c, { material: '', percentage: 0, cost_per_gram_lkr: 0 }])
  }

  function removeComponent(i: number) {
    setComponents((c) => c.filter((_, idx) => idx !== i))
  }

  function updateComponent(i: number, field: keyof AlloyComponent, value: string) {
    setComponents((c) =>
      c.map((comp, idx) =>
        idx === i
          ? { ...comp, [field]: field === 'material' ? value : parseFloat(value) || 0 }
          : comp
      )
    )
  }

  const totalAlloySumPct = components.reduce((s, c) => s + c.percentage, 0)
  const estCostPerGram = components.reduce(
    (s, c) => s + (c.percentage / 100) * c.cost_per_gram_lkr,
    0
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const data = {
      name,
      gold_percentage: parseFloat(goldPct),
      components,
      cost_per_gram_lkr: parseFloat(estCostPerGram.toFixed(4)),
      notes: notes || undefined,
    }
    const result = initialData
      ? await updateAlloyConfig(initialData.id, data)
      : await createAlloyConfig(data)
    setLoading(false)
    if (result?.error) toast.error(result.error)
    // On success, server action calls redirect('/alloys')
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-name">Configuration Name *</Label>
            <Input
              id="ac-name"
              placeholder="e.g. 18K White Gold (Standard)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-gold">Gold Percentage *</Label>
            <Input
              id="ac-gold"
              type="number"
              step="0.01"
              min="1"
              max="100"
              value={goldPct}
              onChange={(e) => setGoldPct(e.target.value)}
              required
            />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Alloy Components</Label>
              <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                <Plus className="size-3.5 mr-1" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_80px_90px_32px] gap-2 px-1">
                <p className="text-xs text-muted-foreground">Material</p>
                <p className="text-xs text-muted-foreground">%</p>
                <p className="text-xs text-muted-foreground">LKR/g</p>
                <span />
              </div>

              {components.map((comp, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_90px_32px] gap-2 items-center">
                  <Input
                    placeholder="e.g. Copper"
                    value={comp.material}
                    onChange={(e) => updateComponent(i, 'material', e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={comp.percentage}
                    onChange={(e) => updateComponent(i, 'percentage', e.target.value)}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={comp.cost_per_gram_lkr}
                    onChange={(e) => updateComponent(i, 'cost_per_gram_lkr', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeComponent(i)}
                    disabled={components.length === 1}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total alloy %</span>
                <span className={totalAlloySumPct > 100 - parseFloat(goldPct || '0') ? 'text-destructive font-medium' : 'font-medium'}>
                  {totalAlloySumPct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. alloy cost/g</span>
                <span className="font-medium">LKR {estCostPerGram.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ac-notes">Notes</Label>
            <Textarea
              id="ac-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : initialData ? 'Update Config' : 'Create Config'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
