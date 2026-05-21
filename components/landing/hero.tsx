import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function DashboardMockup() {
  const rows = [
    { name: 'Widget Pro', sku: 'WP-001', stock: 543, status: 'ok' as const },
    { name: 'Gadget X', sku: 'GX-042', stock: 12, status: 'low' as const },
    { name: 'Super Tool', sku: 'ST-119', stock: 891, status: 'ok' as const },
    { name: 'Doohickey', sku: 'DH-007', stock: 0, status: 'out' as const },
  ]

  const statusLabel = { ok: '● In Stock', low: '⚠ Low', out: '✕ Out' }
  const statusClass = {
    ok: 'text-green-600 dark:text-green-400',
    low: 'text-orange-500',
    out: 'text-destructive',
  }

  return (
    <div className="relative rounded-2xl border bg-card shadow-xl overflow-hidden">
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
        <div className="size-2.5 rounded-full bg-red-400/80" />
        <div className="size-2.5 rounded-full bg-yellow-400/80" />
        <div className="size-2.5 rounded-full bg-green-500/80" />
        <div className="ml-3 h-2 w-32 rounded-full bg-muted" />
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total SKUs', value: '12,847' },
            { label: 'In Stock', value: '11,203' },
            { label: 'Low Stock', value: '142' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-background p-2.5">
              <p className="text-[10px] text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">{value}</p>
              <div className="mt-1.5 h-1 rounded-full bg-primary/20" />
            </div>
          ))}
        </div>

        <div className="rounded-lg border overflow-hidden text-xs">
          <div className="bg-muted/40 px-3 py-1.5 flex gap-2 text-[10px] font-medium text-muted-foreground">
            <span className="w-20">Product</span>
            <span className="w-14">SKU</span>
            <span className="flex-1">Stock</span>
            <span className="w-16">Status</span>
          </div>
          {rows.map(({ name, sku, stock, status }) => (
            <div key={sku} className="border-t px-3 py-1.5 flex gap-2 items-center">
              <span className="w-20 font-medium truncate">{name}</span>
              <span className="w-14 text-muted-foreground">{sku}</span>
              <span className="flex-1">{stock}</span>
              <span className={cn('w-16 text-[10px] font-semibold', statusClass[status])}>
                {statusLabel[status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
            Now in public beta · Free to get started
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Inventory intelligence,{' '}
            <span className="text-primary">simplified.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Real-time tracking, smart alerts, and powerful analytics for teams
            of all sizes. Know exactly what you have, where it is, and when to
            reorder.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required · Setup in under 5 minutes
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/5 blur-2xl" />
          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
