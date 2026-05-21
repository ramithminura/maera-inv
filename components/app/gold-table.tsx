'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowUpDown, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { deleteGoldPurchase } from '@/lib/actions/gold'
import type { GoldPurchase } from '@/lib/types'

type SortCol = 'date' | 'cost'

function SortIndicator({
  col,
  sortBy,
  sortOrder,
}: {
  col: SortCol
  sortBy: SortCol | null
  sortOrder: 'asc' | 'desc'
}) {
  if (sortBy !== col) return <ArrowUpDown className="size-3 opacity-40 inline ml-1" />
  return sortOrder === 'asc'
    ? <ChevronUp className="size-3 inline ml-1" />
    : <ChevronDown className="size-3 inline ml-1" />
}

interface GoldTableProps {
  purchases: GoldPurchase[]
  exchangeRate?: number
}

export function GoldTable({ purchases, exchangeRate = 0 }: GoldTableProps) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<SortCol | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function handleSort(col: SortCol) {
    if (sortBy === col) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setDeleteLoading(true)
    const result = await deleteGoldPurchase(deletingId)
    setDeleteLoading(false)
    setDeletingId(null)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Purchase deleted.')
      router.refresh()
    }
  }

  const sorted = [...purchases].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(a.purchase_date).getTime() - new Date(b.purchase_date).getTime()
      return sortOrder === 'asc' ? diff : -diff
    }
    if (sortBy === 'cost') {
      const diff = a.total_cost_lkr - b.total_cost_lkr
      return sortOrder === 'asc' ? diff : -diff
    }
    return 0
  })

  if (purchases.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">No gold purchases recorded yet.</p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/gold/new">Log your first purchase</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Date
                  <SortIndicator col="date" sortBy={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Supplier</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Weight (g)</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Rate (LKR/g)</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Remaining (g)</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center justify-end w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Total Cost
                  <SortIndicator col="cost" sortBy={sortBy} sortOrder={sortOrder} />
                </button>
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 tabular-nums">{p.purchase_date}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {p.suppliers?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{p.weight_grams.toFixed(3)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <div>{p.rate_lkr.toLocaleString()}</div>
                  {exchangeRate > 0 && p.rate_usd ? (
                    <div className="text-xs text-muted-foreground">${p.rate_usd.toFixed(2)}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {p.remaining_grams.toFixed(3)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">
                  <div>LKR {p.total_cost_lkr.toLocaleString()}</div>
                  {exchangeRate > 0 ? (
                    <div className="text-xs text-muted-foreground">
                      ≈ ${(p.total_cost_lkr / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Link href={`/gold/${p.id}/edit`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingId(p.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gold purchase?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete this inventory record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
