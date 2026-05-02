'use client'

import { Diagnosis } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CEODecisionProps {
  diagnosis: Diagnosis | null
  isActive?: boolean
}

export function CEODecision({ diagnosis, isActive = false }: CEODecisionProps) {
  return (
    <div className={cn(
      'p-6 rounded-lg border transition-all duration-300',
      isActive 
        ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10' 
        : 'border-border bg-card/50'
    )}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">👔</span>
        <div>
          <h3 className="font-bold text-lg">CEO Agent</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Final Decision</p>
        </div>
      </div>
      
      {isActive && diagnosis ? (
        <div className="space-y-4">
          <div className="p-4 bg-background/50 rounded-lg border border-border">
            <p className="text-sm font-medium text-accent mb-1">Primary Bottleneck</p>
            <p className="text-lg font-bold">{diagnosis.primaryBottleneck}</p>
          </div>
          
          <p className="text-sm leading-relaxed text-foreground/90">
            {diagnosis.ceoDecision}
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Secondary</p>
              <p className="text-sm font-medium">{diagnosis.secondaryBottleneck}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hidden Obstacle</p>
              <p className="text-sm font-medium">{diagnosis.hiddenObstacle}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Execution Readiness</p>
              <p className={cn(
                'text-2xl font-mono font-bold',
                diagnosis.overallScore >= 70 ? 'text-success' : 
                diagnosis.overallScore >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {diagnosis.overallScore}/100
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Awaiting complete triage data to make final decision...
        </p>
      )}
    </div>
  )
}
