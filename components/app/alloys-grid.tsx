'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toggleAlloyActive } from '@/lib/actions/alloys'
import type { AlloyConfig } from '@/lib/types'

interface AlloysGridProps {
  alloys: AlloyConfig[]
}

export function AlloysGrid({ alloys }: AlloysGridProps) {
  const [toggling, setToggling] = useState<string | null>(null)

  async function handleToggle(id: string, currentValue: boolean) {
    setToggling(id)
    const result = await toggleAlloyActive(id, currentValue)
    setToggling(null)
    if (result?.error) toast.error(result.error)
  }

  if (alloys.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/20 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">No alloy configurations yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alloys.map((alloy) => (
        <Card key={alloy.id} className={!alloy.is_active ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{alloy.name}</CardTitle>
              <Badge variant="secondary">{alloy.gold_percentage}% Gold</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="space-y-1">
              {alloy.components.map((c, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{c.material}</span>
                  <span className="font-medium">{c.percentage}%</span>
                </div>
              ))}
            </div>

            {alloy.cost_per_gram_lkr > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                Alloy cost: LKR {alloy.cost_per_gram_lkr.toFixed(2)}/g
              </p>
            )}

            {alloy.notes && (
              <p className="text-xs text-muted-foreground">{alloy.notes}</p>
            )}
          </CardContent>

          <CardFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleToggle(alloy.id, alloy.is_active)}
              disabled={toggling === alloy.id}
            >
              {alloy.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outline" size="icon-sm" asChild>
              <Link href={`/alloys/${alloy.id}/edit`}>
                <Pencil className="size-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
