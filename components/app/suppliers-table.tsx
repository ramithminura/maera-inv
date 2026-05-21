'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createSupplier, updateSupplier, deleteSupplier } from '@/lib/actions/suppliers'
import type { Supplier, SupplierType } from '@/lib/types'

const TYPE_LABELS: Record<SupplierType, string> = {
  gold: 'Gold',
  gemstone: 'Gemstone',
  findings: 'Findings',
  other: 'Other',
}

const TYPE_CLASSES: Record<SupplierType, string> = {
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  gemstone: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  findings: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
}

interface FormState {
  name: string
  type: SupplierType
  phone: string
  email: string
  notes: string
}

const EMPTY_FORM: FormState = { name: '', type: 'gold', phone: '', email: '', notes: '' }

interface SuppliersTableProps {
  suppliers: Supplier[]
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDialogOpen(true)
  }

  function openEdit(s: Supplier) {
    setForm({ name: s.name, type: s.type, phone: s.phone ?? '', email: s.email ?? '', notes: s.notes ?? '' })
    setEditingId(s.id)
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const data = { name: form.name, type: form.type, phone: form.phone, email: form.email, notes: form.notes }
    const result = editingId
      ? await updateSupplier(editingId, data)
      : await createSupplier(data)
    setLoading(false)
    if (result?.error) { toast.error(result.error); return }
    setDialogOpen(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    const result = await deleteSupplier(deleteId)
    setLoading(false)
    setDeleteId(null)
    if (result?.error) toast.error(result.error)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} size="sm">
          <Plus className="size-4 mr-1" /> Add Supplier
        </Button>
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">No suppliers yet.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={openAdd}>
            Add your first supplier
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_CLASSES[s.type]}`}>
                      {TYPE_LABELS[s.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(s.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-name">Name *</Label>
              <Input id="s-name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as SupplierType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="gemstone">Gemstone</SelectItem>
                  <SelectItem value="findings">Findings</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-phone">Phone</Label>
              <Input id="s-phone" type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="s-notes">Notes</Label>
              <Textarea id="s-notes" rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Supplier?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
