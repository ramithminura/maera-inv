'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowUpDown, ChevronDown, ChevronUp, Pencil, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { deleteGemstone } from '@/lib/actions/gemstones'
import type { GemstoneInventory } from '@/lib/types'

const FILTERS = ['All', 'Diamond', 'Ruby', 'Sapphire', 'Emerald', 'Other'] as const

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

interface GemstonesTableProps {
  gemstones: GemstoneInventory[]
  exchangeRate?: number
}

export function GemstonesTable({ gemstones, exchangeRate = 0 }: GemstonesTableProps) {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
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
    const result = await deleteGemstone(deletingId)
    setDeleteLoading(false)
    setDeletingId(null)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Gemstone deleted.')
      router.refresh()
    }
  }

  // Token-based multi-word search: every space-separated token must match at least one field
  const tokens = searchQuery.toLowerCase().split(' ').filter(Boolean)

  const filtered = gemstones
    .filter((g) => {
      if (activeFilter === 'Other') return !['Diamond', 'Ruby', 'Sapphire', 'Emerald'].includes(g.stone_type)
      if (activeFilter !== 'All') return g.stone_type.toLowerCase() === activeFilter.toLowerCase()
      return true
    })
    .filter((g) => {
      if (tokens.length === 0) return true
      const fields = [
        g.stone_type,
        g.shape,
        g.shape_other ?? '',
        g.colour ?? '',
        g.clarity ?? '',
        g.treatment,
        g.treatment_other ?? '',
      ].map((f) => f.toLowerCase())
      return tokens.every((token) => fields.some((field) => field.includes(token)))
    })

  const sorted = [...filtered].sort((a, b) => {
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

  return (
    <>
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by stone, colour, shape, treatment…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                activeFilter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-lg border bg-muted/20 flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {gemstones.length === 0 ? 'No gemstones recorded yet.' : 'No gemstones match this filter.'}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Shape</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Purchase</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Date
                      <SortIndicator col="date" sortBy={sortBy} sortOrder={sortOrder} />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Treatment</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Rem. Carats</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden xs:table-cell">Rem. Pcs</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Unit Price</th>
                  <th className="px-4 py-3 text-right hidden md:table-cell">
                    <button
                      onClick={() => handleSort('cost')}
                      className="flex items-center justify-end w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Total Cost
                      <SortIndicator col="cost" sortBy={sortBy} sortOrder={sortOrder} />
                    </button>
                  </th>
                  <th className="px-2 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.map((g) => (
                  <tr key={g.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/gemstones/${g.id}`}
                        className="hover:underline underline-offset-4"
                      >
                        {g.stone_type}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {g.shape === 'Other' && g.shape_other ? g.shape_other : g.shape}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        g.purchase_type === 'lot'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      )}>
                        {g.purchase_type === 'lot' ? 'Lot' : 'Single'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums hidden sm:table-cell">
                      {g.purchase_date}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {g.treatment === 'None' ? '—' : g.treatment === 'Other' && g.treatment_other
                        ? g.treatment_other
                        : g.treatment}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{g.remaining_carats.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums hidden xs:table-cell">{g.remaining_pieces}</td>
                    <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                      <div>
                        LKR {g.unit_price_lkr.toLocaleString()}
                        <span className="text-xs text-muted-foreground ml-1">
                          /{g.purchase_type === 'lot' ? 'ct' : 'pc'}
                        </span>
                      </div>
                      {exchangeRate > 0 && g.unit_price_usd ? (
                        <div className="text-xs text-muted-foreground">
                          ${g.unit_price_usd.toFixed(2)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums hidden md:table-cell">
                      <div>LKR {g.total_cost_lkr.toLocaleString()}</div>
                      {exchangeRate > 0 && g.unit_price_usd ? (
                        <div className="text-xs text-muted-foreground">
                          ${(g.total_cost_lkr / exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}
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
                          <Link href={`/gemstones/${g.id}/edit`}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingId(g.id)}
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
        )}
      </div>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => { if (!open) setDeletingId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gemstone record?</AlertDialogTitle>
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
