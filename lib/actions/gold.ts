'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface GoldPurchaseFormData {
  purchase_date: string
  supplier_id?: string
  weight_grams: number
  rate_lkr: number
  rate_usd?: number
  notes?: string
}

export async function createGoldPurchase(data: GoldPurchaseFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('gold_purchases').insert({
    purchase_date: data.purchase_date,
    supplier_id: data.supplier_id || null,
    weight_grams: data.weight_grams,
    rate_lkr: data.rate_lkr,
    rate_usd: data.rate_usd || null,
    remaining_grams: data.weight_grams,
    notes: data.notes || null,
    // total_cost_lkr is GENERATED ALWAYS AS (weight_grams * rate_lkr) — never included
  })
  if (error) return { error: error.message }
  revalidatePath('/gold')
  redirect('/gold')
}

export async function updateGoldPurchase(id: string, data: GoldPurchaseFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gold_purchases')
    .update({
      purchase_date: data.purchase_date,
      supplier_id: data.supplier_id || null,
      weight_grams: data.weight_grams,
      rate_lkr: data.rate_lkr,
      rate_usd: data.rate_usd || null,
      notes: data.notes || null,
      // total_cost_lkr is GENERATED — auto-recalculates on weight/rate change
      // remaining_grams intentionally NOT touched — preserves consumed inventory state
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/gold')
  redirect('/gold')
}

export async function checkDuplicateGoldPurchase(
  purchase_date: string,
  weight_grams: number,
  rate_lkr: number,
): Promise<{ isDuplicate: boolean }> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gold_purchases')
    .select('id')
    .eq('purchase_date', purchase_date)
    .eq('weight_grams', weight_grams)
    .eq('rate_lkr', rate_lkr)
    .limit(1)
  if (error) return { isDuplicate: false }
  return { isDuplicate: (data?.length ?? 0) > 0 }
}

export async function deleteGoldPurchase(id: string): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  // Auth guard — getClaims() validates JWT via JWKS, zero network round-trip
  const { data: authData } = await supabase.auth.getClaims()
  if (!authData?.claims) return { error: 'Unauthorized' }

  // Fetch the row to run the safety check before touching the DB
  const { data, error: fetchError } = await supabase
    .from('gold_purchases')
    .select('weight_grams, remaining_grams')
    .eq('id', id)
    .single()

  if (fetchError || !data) return { error: 'Purchase record not found.' }

  // Block if any grams have been consumed (remaining < original weight)
  if (data.remaining_grams < data.weight_grams) {
    return {
      error:
        'Cannot delete this batch because gold from it has already been consumed in production.',
    }
  }

  const { error } = await supabase.from('gold_purchases').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/gold')
  // No redirect — caller uses router.refresh() to stay on the list
}
