import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { AlloysGrid } from '@/components/app/alloys-grid'
import type { AlloyConfig } from '@/lib/types'

export default async function AlloysPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('alloy_configs')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alloy Configurations</h1>
          <p className="text-sm text-muted-foreground">Manage alloy compositions used in production</p>
        </div>
        <Button asChild>
          <Link href="/alloys/new">New Config</Link>
        </Button>
      </div>
      <AlloysGrid alloys={(data ?? []) as AlloyConfig[]} />
    </div>
  )
}
