'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { PurchaseType, TreatmentType } from '@/lib/types'

export interface GemstoneFormData {
  stone_type: string
  shape: string
  shape_other?: string
  purchase_type: PurchaseType
  total_carats: number
  num_pieces: number
  unit_price_lkr: number
  unit_price_usd?: number
  total_cost_lkr: number
  clarity?: string
  colour?: string
  has_certificate: boolean
  certificate_no?: string
  treatment: TreatmentType
  treatment_other?: string
  advisable_selling_price_lkr?: number
  purchase_date: string
  supplier_id?: string
  notes?: string
}

export async function createGemstone(data: GemstoneFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('gemstone_inventory').insert({
    stone_type: data.stone_type,
    shape: data.shape,
    shape_other: data.shape_other || null,
    purchase_type: data.purchase_type,
    total_carats: data.total_carats,
    num_pieces: data.num_pieces,
    remaining_carats: data.total_carats,
    remaining_pieces: data.num_pieces,
    unit_price_lkr: data.unit_price_lkr,
    unit_price_usd: data.unit_price_usd || null,
    total_cost_lkr: data.total_cost_lkr,
    clarity: data.clarity || null,
    colour: data.colour || null,
    has_certificate: data.has_certificate,
    certificate_no: data.certificate_no || null,
    treatment: data.treatment,
    treatment_other: data.treatment_other || null,
    advisable_selling_price_lkr: data.advisable_selling_price_lkr || null,
    purchase_date: data.purchase_date,
    supplier_id: data.supplier_id || null,
    notes: data.notes || null,
    // photos defaults to '{}' in DB
    // parent_lot_id is null for fresh purchases
  })
  if (error) return { error: error.message }
  revalidatePath('/gemstones')
  redirect('/gemstones')
}

export async function updateGemstone(id: string, data: GemstoneFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gemstone_inventory')
    .update({
      stone_type: data.stone_type,
      shape: data.shape,
      shape_other: data.shape_other || null,
      purchase_type: data.purchase_type,
      total_carats: data.total_carats,
      num_pieces: data.num_pieces,
      unit_price_lkr: data.unit_price_lkr,
      unit_price_usd: data.unit_price_usd || null,
      total_cost_lkr: data.total_cost_lkr,
      clarity: data.clarity || null,
      colour: data.colour || null,
      has_certificate: data.has_certificate,
      certificate_no: data.certificate_no || null,
      treatment: data.treatment,
      treatment_other: data.treatment_other || null,
      advisable_selling_price_lkr: data.advisable_selling_price_lkr || null,
      purchase_date: data.purchase_date,
      supplier_id: data.supplier_id || null,
      notes: data.notes || null,
      // remaining_carats, remaining_pieces intentionally NOT touched — preserves stock state
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/gemstones')
  redirect('/gemstones')
}

export async function transferLotToSingle(
  source_lot_id: string,
  transfer_carats: number,
): Promise<{ newStoneId: string } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('transfer_lot_to_single', {
    source_lot_id,
    transfer_carats,
  })
  if (error) return { error: error.message }
  revalidatePath('/gemstones')
  return { newStoneId: data as string }
}

export async function deleteGemstone(id: string): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  // Auth guard
  const { data: authData } = await supabase.auth.getClaims()
  if (!authData?.claims) return { error: 'Unauthorized' }

  // Block if any split stones reference this record as their parent
  const { data: children, error: childError } = await supabase
    .from('gemstone_inventory')
    .select('id')
    .eq('parent_lot_id', id)
    .limit(1)

  if (childError) return { error: childError.message }

  if (children && children.length > 0) {
    return {
      error:
        'Cannot delete this stone/lot because split stones or production records depend on it.',
    }
  }

  const { error } = await supabase.from('gemstone_inventory').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/gemstones')
  // No redirect — caller uses router.refresh() to stay on the list
}
