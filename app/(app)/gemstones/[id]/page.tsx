import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TransferWidget } from '@/components/app/transfer-widget'
import type { GemstoneInventory } from '@/lib/types'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}

export default async function GemstoneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [gemResult, childrenResult] = await Promise.all([
    supabase.from('gemstone_inventory').select('*, suppliers(name)').eq('id', id).single(),
    supabase
      .from('gemstone_inventory')
      .select('id, stone_type, shape, total_carats, remaining_carats, remaining_pieces, treatment, purchase_date, unit_price_lkr, total_cost_lkr')
      .eq('parent_lot_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (gemResult.error || !gemResult.data) notFound()

  const gem = gemResult.data as GemstoneInventory
  const children = (childrenResult.data ?? []) as GemstoneInventory[]

  const displayShape = gem.shape === 'Other' && gem.shape_other ? gem.shape_other : gem.shape
  const displayTreatment =
    gem.treatment === 'None'
      ? 'None'
      : gem.treatment === 'Other' && gem.treatment_other
      ? gem.treatment_other
      : gem.treatment

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/gemstones"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Back to Inventory
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{gem.stone_type}</h1>
          <p className="text-sm text-muted-foreground">
            {displayShape} · {gem.purchase_type === 'lot' ? 'Lot' : 'Single Stone'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/gemstones/${id}/edit`}>
            <Pencil className="size-4 mr-2" />
            Edit
          </Link>
        </Button>
      </div>

      {/* Parent lot link (if this stone was split from a lot) */}
      {gem.parent_lot_id && (
        <div className="rounded-lg border bg-muted/20 px-4 py-2.5 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Split from lot</span>
          <Link
            href={`/gemstones/${gem.parent_lot_id}`}
            className="font-medium underline underline-offset-4 hover:text-muted-foreground"
          >
            View source lot →
          </Link>
        </div>
      )}

      {/* Stone details card */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <DetailRow label="Stone Type" value={gem.stone_type} />
          <DetailRow label="Shape" value={displayShape} />
          <DetailRow label="Purchase Date" value={gem.purchase_date} />
          <DetailRow label="Total Carats" value={`${gem.total_carats.toFixed(2)} ct`} />
          <DetailRow
            label="Remaining"
            value={`${gem.remaining_carats.toFixed(2)} ct · ${gem.remaining_pieces} pc`}
          />
          <DetailRow
            label="Unit Price"
            value={`LKR ${gem.unit_price_lkr.toLocaleString()} /${gem.purchase_type === 'lot' ? 'ct' : 'pc'}`}
          />
          <DetailRow
            label="Total Cost"
            value={`LKR ${gem.total_cost_lkr.toLocaleString()}`}
          />
          <DetailRow label="Treatment" value={displayTreatment} />
          <DetailRow
            label="Certificate"
            value={gem.has_certificate ? gem.certificate_no || 'Yes' : 'No'}
          />
          {gem.clarity && <DetailRow label="Clarity" value={gem.clarity} />}
          {gem.colour && <DetailRow label="Colour" value={gem.colour} />}
          {gem.advisable_selling_price_lkr && (
            <DetailRow
              label="Advisable Selling Price"
              value={`LKR ${gem.advisable_selling_price_lkr.toLocaleString()}`}
            />
          )}
          {gem.suppliers?.name && <DetailRow label="Supplier" value={gem.suppliers.name} />}
          {gem.unit_price_usd && (
            <DetailRow label="Unit Price (USD)" value={`$${gem.unit_price_usd.toFixed(2)}`} />
          )}
          {gem.notes && (
            <div className="col-span-2 sm:col-span-3 flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="text-sm">{gem.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer widget — lots only */}
      {gem.purchase_type === 'lot' && <TransferWidget lot={gem} />}

      {/* Split history */}
      {children.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Split History</h2>
          <div className="rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stone</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Carats</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Remaining</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {children.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/gemstones/${c.id}`}
                        className="hover:underline underline-offset-4"
                      >
                        {c.stone_type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {c.purchase_date}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{c.total_carats.toFixed(2)} ct</td>
                    <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                      {c.remaining_carats.toFixed(2)} ct
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      LKR {c.total_cost_lkr.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
