'use client'

import { Diagnosis } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ActionPlanProps {
  diagnosis: Diagnosis | null
  isActive?: boolean
}

export function ActionPlan({ diagnosis, isActive = false }: ActionPlanProps) {
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  const copyTemplate = () => {
    if (diagnosis?.messageTemplate) {
      navigator.clipboard.writeText(diagnosis.messageTemplate)
      setCopiedTemplate(true)
      setTimeout(() => setCopiedTemplate(false), 2000)
    }
  }

  if (!isActive || !diagnosis) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold text-sm mb-2">Action Plan</h3>
        <p className="text-sm text-muted-foreground">
          Complete the triage to receive your personalised action plan.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Next 24 Hour Move */}
      <div className="p-6 rounded-lg border border-accent bg-accent/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
            <ChevronRight className="h-4 w-4 text-accent-foreground" />
          </div>
          <h3 className="font-bold">Next 24 Hour Move</h3>
        </div>
        <p className="text-foreground leading-relaxed">
          {diagnosis.next24HourMove}
        </p>
        <div className="mt-4 p-3 bg-background/50 rounded border border-border">
          <p className="text-xs text-muted-foreground mb-1">Proof of Action</p>
          <p className="text-sm">{diagnosis.proofOfAction}</p>
        </div>
      </div>

      {/* 7 Day Plan */}
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold mb-4">7 Day Execution Plan</h3>
        <div className="space-y-2">
          {diagnosis.sevenDayPlan.map((day, idx) => (
            <div key={idx} className="flex gap-3 text-sm">
              <span className="text-muted-foreground font-mono text-xs w-12 shrink-0">
                {day.split(':')[0]}
              </span>
              <span className="text-foreground/80">{day.split(':')[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Message Template */}
      {diagnosis.messageTemplate && (
        <div className="p-6 rounded-lg border border-border bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Message Template</h3>
            <button
              onClick={copyTemplate}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copiedTemplate ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono text-xs p-4 bg-background/50 rounded border border-border">
            {diagnosis.messageTemplate}
          </pre>
        </div>
      )}

      {/* Thing to Stop */}
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
        <p className="text-xs text-destructive uppercase tracking-wide mb-1 font-medium">Stop Doing</p>
        <p className="text-sm text-foreground">{diagnosis.thingToStop}</p>
      </div>

      {/* Risk Warning */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Risk If Unchanged</p>
        <p className="text-sm text-foreground/80">{diagnosis.riskIfUnchanged}</p>
      </div>

      {/* Current Advantage */}
      <div className="p-4 rounded-lg border border-success/50 bg-success/5">
        <p className="text-xs text-success uppercase tracking-wide mb-1 font-medium">Your Advantage</p>
        <p className="text-sm text-foreground">{diagnosis.currentAdvantage}</p>
      </div>
    </div>
  )
}
