'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { AlloyComponent } from '@/lib/types'

export interface AlloyConfigFormData {
  name: string
  gold_percentage: number
  components: AlloyComponent[]
  cost_per_gram_lkr: number
  notes?: string
}

export async function createAlloyConfig(data: AlloyConfigFormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('alloy_configs').insert({
    name: data.name,
    gold_percentage: data.gold_percentage,
    components: data.components,
    cost_per_gram_lkr: data.cost_per_gram_lkr,
    notes: data.notes || null,
    is_active: true,
  })
  if (error) return { error: error.message }
  revalidatePath('/alloys')
  redirect('/alloys')
}

export async function updateAlloyConfig(id: string, data: AlloyConfigFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alloy_configs')
    .update({
      name: data.name,
      gold_percentage: data.gold_percentage,
      components: data.components,
      cost_per_gram_lkr: data.cost_per_gram_lkr,
      notes: data.notes || null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/alloys')
  redirect('/alloys')
}

export async function toggleAlloyActive(id: string, currentValue: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('alloy_configs')
    .update({ is_active: !currentValue })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/alloys')
}
