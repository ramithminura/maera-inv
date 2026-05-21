import { Activity, Bell, BarChart3, Globe, Users, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const features = [
  {
    icon: Activity,
    title: 'Real-time Tracking',
    description:
      'Monitor inventory levels across every location the moment they change. No more manual counts or stale spreadsheets.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description:
      'Set reorder thresholds and receive automated notifications before you run out of critical stock.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description:
      'Understand sales velocity, stock turnover, and seasonal trends with clear, actionable reports.',
  },
  {
    icon: Globe,
    title: 'Multi-location',
    description:
      'Manage inventory across warehouses, retail stores, and fulfillment centers from a single platform.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Role-based access controls and full audit logs keep your team aligned and your data secure.',
  },
  {
    icon: Zap,
    title: 'Integrations',
    description:
      'Connect with Shopify, QuickBooks, WooCommerce, and dozens more tools your business already uses.',
  },
]

export function Features() {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to manage inventory
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Maera gives your team the tools to stay on top of stock — without
            the complexity of enterprise software.
          </p>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
