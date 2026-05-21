import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AlloyConfigForm } from '@/components/app/alloy-config-form'
import type { AlloyConfig } from '@/lib/types'

export default async function EditAlloyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('alloy_configs').select('*').eq('id', id).single()

  if (!data) notFound()

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Alloy Configuration</h1>
        <p className="text-sm text-muted-foreground">Update the composition and cost details</p>
      </div>
      <AlloyConfigForm initialData={data as AlloyConfig} />
    </div>
  )
}
