'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Gem,
  LayoutDashboard,
  Coins,
  FlaskConical,
  Truck,
  Settings,
  Menu,
  X,
  Package,
  ShoppingCart,
  Users,
  LogOut,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userEmail: string
}

const navSections = [
  {
    label: null,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '/gold', label: 'Gold', icon: Coins },
      { href: '/gemstones', label: 'Gemstones', icon: Gem },
      { href: '/alloys', label: 'Alloy Configs', icon: FlaskConical },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
]

const comingSoonItems = [
  { label: 'Products', icon: Package },
  { label: 'Orders', icon: ShoppingCart },
  { label: 'Customers', icon: Users },
]

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b px-4 py-4">
        <Gem className="size-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold leading-none text-foreground">The Vault</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Jewellery &amp; Gemstone Inventory</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, si) => (
          <div key={si} className="space-y-1">
            {section.label && (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive(href)
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        ))}

        {/* Coming Soon */}
        <div className="space-y-1">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </p>
          {comingSoonItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground opacity-40 cursor-not-allowed select-none"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t px-3 py-3 space-y-1">
        <Link
          href="/settings"
          onClick={() => setIsOpen(false)}
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
            isActive('/settings')
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          )}
        >
          <Settings className="size-4 shrink-0" />
          Settings
        </Link>

        <Separator className="my-2" />

        <div className="px-2 py-1">
          <p className="text-xs text-muted-foreground truncate mb-2">{userEmail}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 flex size-9 items-center justify-center rounded-md border bg-background shadow-sm"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-200',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r bg-background">
        <SidebarContent />
      </aside>
    </>
  )
}
