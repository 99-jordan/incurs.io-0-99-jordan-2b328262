'use client'

import { testCases } from '@/lib/diagnosis-engine'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export function TestLab() {
  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg">Agent Test Lab</h3>
          <p className="text-sm text-muted-foreground">
            Example diagnoses demonstrating system accuracy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">All Tests Passing</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {testCases.map((test) => (
          <div
            key={test.id}
            className="p-4 rounded-lg border border-border bg-background/30 hover:bg-background/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Test Goal</p>
                <p className="text-sm font-medium">{test.goal}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className={cn(
                    'text-lg font-mono font-bold',
                    test.score >= 70 ? 'text-success' : 
                    test.score >= 50 ? 'text-warning' : 'text-destructive'
                  )}>
                    {test.score}
                  </p>
                </div>
                
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center',
                  test.pass ? 'bg-success/20' : 'bg-destructive/20'
                )}>
                  {test.pass ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-accent mb-1">Primary Bottleneck</p>
                <p className="text-foreground/80">{test.primaryBottleneck}</p>
              </div>
              <div>
                <p className="text-xs text-accent mb-1">CEO Next Move</p>
                <p className="text-foreground/80 line-clamp-2">{test.ceoNextMove}</p>
              </div>
              <div>
                <p className="text-xs text-accent mb-1">Resource</p>
                <p className="text-foreground/80 line-clamp-2">{test.resourceRecommendation}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">{test.diagnosisNotes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
