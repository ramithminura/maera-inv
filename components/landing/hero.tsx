import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function DashboardMockup() {
  const rows = [
    { name: '24K Gold Bar', detail: '250.00 g', value: 'LKR 1,125,000', status: 'ok' as const },
    { name: 'Ruby Lot #12', detail: '4.20 ct', value: 'LKR 84,000', status: 'ok' as const },
    { name: 'Diamond Round', detail: '0.50 ct', value: 'LKR 375,000', status: 'low' as const },
    { name: '18K Rose Alloy', detail: '18K / 75%', value: 'LKR 0/g', status: 'ok' as const },
  ]

  const statusLabel = { ok: '● Active', low: '⚠ Low Stock', out: '✕ Out' }
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
            { label: 'Gold Stock', value: '842.5 g' },
            { label: 'Gemstone Lots', value: '38' },
            { label: 'Stock Value', value: 'LKR 14.2M' },
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
            <span className="w-24">Item</span>
            <span className="flex-1">Detail</span>
            <span className="w-20 text-right">Value</span>
          </div>
          {rows.map(({ name, detail, value, status }) => (
            <div key={name} className="border-t px-3 py-1.5 flex gap-2 items-center">
              <span className="w-24 font-medium truncate">{name}</span>
              <span className="flex-1 text-muted-foreground">{detail}</span>
              <span className={cn('w-20 text-right text-[10px] font-semibold', statusClass[status])}>
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
            Now in beta · Free to get started
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Jewellery Inventory,{' '}
            <span className="text-primary">Built for the Trade.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
            Manage gold stock, gemstones, custom orders, and invoicing — all in
            one place. Built for jewellery manufacturers and retailers.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start for Free
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">See Features</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            No credit card required · Takes 2 minutes to set up
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
