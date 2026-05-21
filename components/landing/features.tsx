import { Coins, Gem, FileText, Receipt, Users, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Coins,
    title: 'Gold Stock Tracking',
    description:
      'Log gold purchases by weight and purity. Track remaining grams, weighted average cost, and estimated value across 24K, 22K, 18K, and 14K stock.',
  },
  {
    icon: Gem,
    title: 'Gemstone Management',
    description:
      'Manage gemstone lots and individual stones by carats and pieces. Record clarity, colour, and certificate numbers for full traceability.',
  },
  {
    icon: FileText,
    title: 'Custom Order Quoting',
    description:
      'Build accurate quotes for bespoke jewellery using live gold rates, alloy compositions, and gemstone costs sourced directly from your inventory.',
  },
  {
    icon: Receipt,
    title: 'Invoicing & Payments',
    description:
      'Generate professional invoices tied to orders. Track deposits, balances due, and full payment history for every customer.',
  },
  {
    icon: Users,
    title: 'Customer CRM',
    description:
      'Maintain complete customer records with order history, preferences, ring sizes, and a communication log for calls and messages.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Understand your gold consumption, stock turnover, sales trends, and profitability with clear, exportable reports.',
  },
]

export function Features() {
  return (
    <section id="features" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything a jewellery business needs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The Vault gives your team the tools to manage precious inventory
            with precision — without the complexity of generic ERP software.
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
