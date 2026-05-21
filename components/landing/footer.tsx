import Link from 'next/link'
import { Gem } from 'lucide-react'

const links = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' },
  ],
  Support: [
    { label: 'Contact', href: 'mailto:hello@thevault.app' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/20" id="contact">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <Gem className="size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold leading-none">The Vault</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Jewellery &amp; Gemstone Inventory System. Purpose-built for
              manufacturers and retailers who need precision inventory control.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="flex flex-col gap-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 The Vault. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
