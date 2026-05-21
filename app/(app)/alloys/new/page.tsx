import { AlloyConfigForm } from '@/components/app/alloy-config-form'

export default function NewAlloyPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Alloy Configuration</h1>
        <p className="text-sm text-muted-foreground">Define a reusable alloy composition template</p>
      </div>
      <AlloyConfigForm />
    </div>
  )
}
