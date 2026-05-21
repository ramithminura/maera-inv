'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SupplierType } from '@/lib/types'

export interface SupplierFormData {
  name: string
  type: SupplierType
  phone?: string
  email?: string
  notes?: string
}

export async function createSupplier(data: SupplierFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('suppliers').insert({
    name: data.name,
    type: data.type,
    phone: data.phone || null,
    email: data.email || null,
    notes: data.notes || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/suppliers')
}

export async function updateSupplier(id: string, data: SupplierFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('suppliers')
    .update({
      name: data.name,
      type: data.type,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/suppliers')
}

export async function deleteSupplier(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/suppliers')
}
