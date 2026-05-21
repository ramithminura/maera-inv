import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For individual jewellers getting started.',
    features: [
      '1 user',
      'Up to 100 products',
      'Gold & gemstone inventory',
      'Basic reports',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing jewellery workshops and boutiques.',
    features: [
      'Up to 5 users',
      'Unlimited products',
      'Full CRM',
      'Custom order quoting',
      'Invoicing & payments',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    period: '',
    description: 'For multi-location chains and wholesalers.',
    features: [
      'Unlimited users',
      'Multi-location support',
      'SSO & role-based access',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: 'mailto:hello@thevault.app',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free, upgrade when your business grows. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map(({ name, price, period, description, features, cta, href, highlighted }) => (
            <Card
              key={name}
              className={cn(
                'relative flex flex-col',
                highlighted && 'ring-2 ring-primary'
              )}
            >
              {highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Recommended
                  </span>
                </div>
              )}

              <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{price}</span>
                  {period && (
                    <span className="text-sm text-muted-foreground">{period}</span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col gap-3">
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={href}>{cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
