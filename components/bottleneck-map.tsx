'use client'

import { BottleneckScore } from '@/lib/types'
import { cn } from '@/lib/utils'

interface BottleneckMapProps {
  scores: BottleneckScore[]
  isActive?: boolean
}

export function BottleneckMap({ scores, isActive = false }: BottleneckMapProps) {
  const getScoreColor = (score: number) => {
    if (score <= 3) return 'bg-destructive'
    if (score <= 5) return 'bg-accent'
    if (score <= 7) return 'bg-warning'
    return 'bg-success'
  }

  const getScoreTextColor = (score: number) => {
    if (score <= 3) return 'text-destructive'
    if (score <= 5) return 'text-accent'
    if (score <= 7) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Bottleneck Map</h3>
        {isActive && (
          <span className="text-xs text-muted-foreground">Live Analysis</span>
        )}
      </div>
      
      <div className="space-y-3">
        {scores.map((bottleneck, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {bottleneck.name}
              </span>
              <span className={cn(
                'text-xs font-mono font-bold',
                isActive ? getScoreTextColor(bottleneck.score) : 'text-muted-foreground'
              )}>
                {bottleneck.score}/10
              </span>
            </div>
            
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  isActive ? getScoreColor(bottleneck.score) : 'bg-muted-foreground/30'
                )}
                style={{ width: isActive ? `${bottleneck.score * 10}%` : '0%' }}
              />
            </div>
            
            {isActive && (
              <p className="text-xs text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {bottleneck.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
