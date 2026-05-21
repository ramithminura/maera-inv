import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/app/settings-form'
import type { Settings } from '@/lib/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*').single()

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your company defaults</p>
      </div>
      <SettingsForm initialData={data as Settings | null} />
    </div>
  )
}
