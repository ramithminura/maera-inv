import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/app/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect('/login')
  }

  const userEmail = (data.claims.email as string) ?? ''

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar userEmail={userEmail} />
      <main className="flex-1 overflow-y-auto md:ml-64">
        {children}
      </main>
    </div>
  )
}
