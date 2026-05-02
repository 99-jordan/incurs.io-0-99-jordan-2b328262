'use client'

import { AgentAnalysis } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  analysis: AgentAnalysis
  isActive?: boolean
}

export function AgentCard({ analysis, isActive = false }: AgentCardProps) {
  const severityColors = {
    low: 'border-chart-1/50 bg-chart-1/5',
    medium: 'border-warning/50 bg-warning/5',
    high: 'border-accent/50 bg-accent/5',
    critical: 'border-destructive/50 bg-destructive/5'
  }

  const severityBadge = {
    low: 'bg-chart-1/20 text-chart-1',
    medium: 'bg-warning/20 text-warning',
    high: 'bg-accent/20 text-accent',
    critical: 'bg-destructive/20 text-destructive'
  }

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all duration-300',
        isActive ? severityColors[analysis.severity] : 'border-border bg-card/50',
        isActive && 'shadow-lg'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{analysis.icon}</span>
          <h3 className="font-semibold text-sm">{analysis.agent}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isActive && (
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide',
              severityBadge[analysis.severity]
            )}>
              {analysis.severity}
            </span>
          )}
          <div className={cn(
            'h-2 w-2 rounded-full',
            analysis.status === 'complete' ? 'bg-success' : 'bg-muted-foreground animate-pulse'
          )} />
        </div>
      </div>
      
      <p className={cn(
        'text-sm leading-relaxed',
        isActive ? 'text-foreground' : 'text-muted-foreground'
      )}>
        {isActive ? analysis.finding : 'Awaiting triage data...'}
      </p>
    </div>
  )
}
