'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Gem, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-foreground">
          <Gem className="size-5 text-primary" />
          <span>The Vault</span>
        </Link>

        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="size-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-foreground">
        <Gem className="size-5 text-primary" />
        <span>Maera</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Start managing inventory for free</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              By signing up you agree to our{' '}
              <Link href="#" className="underline hover:text-foreground">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </form>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="ml-1 font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
