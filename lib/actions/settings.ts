'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Settings } from '@/lib/types'

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

export interface SettingsFormData {
  company_name: string
  gold_rate_per_gram_lkr: number
  exchange_rate_lkr_per_usd: number
  gold_low_stock_threshold: number
}

export async function upsertSettings(data: SettingsFormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('settings')
    .update({
      company_name: data.company_name,
      gold_rate_per_gram_lkr: data.gold_rate_per_gram_lkr,
      exchange_rate_lkr_per_usd: data.exchange_rate_lkr_per_usd,
      gold_low_stock_threshold: data.gold_low_stock_threshold,
      updated_at: new Date().toISOString(),
    })
    .eq('id', SETTINGS_ID)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

/** Lightweight helper for server components that need exchange rate or threshold. */
export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_ID)
    .single()
  return (data as Settings) ?? null
}
