'use client'

import { Diagnosis, AgentAnalysis, TriageStep } from '@/lib/types'
import { AgentCard } from './agent-card'
import { BottleneckMap } from './bottleneck-map'
import { CEODecision } from './ceo-decision'
import { ActionPlan } from './action-plan'
import { ResourceLoadout } from './resource-loadout'
import { TestLab } from './test-lab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DiagnosisBoardProps {
  diagnosis: Diagnosis | null
  agentAnalyses: AgentAnalysis[]
  currentStep: TriageStep
}

export function DiagnosisBoard({ diagnosis, agentAnalyses, currentStep }: DiagnosisBoardProps) {
  const isComplete = currentStep === 5
  const defaultBottlenecks = [
    { name: 'Sales Readiness', score: 0, description: 'Awaiting data' },
    { name: 'Skill Coverage', score: 0, description: 'Awaiting data' },
    { name: 'Execution Capacity', score: 0, description: 'Awaiting data' },
    { name: 'Confidence Under Pressure', score: 0, description: 'Awaiting data' },
    { name: 'Market Validation', score: 0, description: 'Awaiting data' },
    { name: 'Support Network', score: 0, description: 'Awaiting data' },
    { name: 'Follow-Through Risk', score: 0, description: 'Awaiting data' },
    { name: 'Action vs Planning', score: 0, description: 'Awaiting data' }
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <Tabs defaultValue="diagnosis" className="w-full">
          <TabsList className="mb-6 bg-secondary/50">
            <TabsTrigger value="diagnosis">Live Diagnosis</TabsTrigger>
            <TabsTrigger value="testlab">Agent Test Lab</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnosis" className="space-y-6">
            {/* Agent Grid */}
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Specialist Agents
              </h3>
              <div className="grid gap-3">
                {agentAnalyses.map((analysis, idx) => (
                  <AgentCard
                    key={idx}
                    analysis={analysis}
                    isActive={isComplete}
                  />
                ))}
              </div>
            </div>

            {/* CEO Decision */}
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Final Decision
              </h3>
              <CEODecision diagnosis={diagnosis} isActive={isComplete} />
            </div>

            {/* Bottleneck Map */}
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Bottleneck Analysis
              </h3>
              <BottleneckMap
                scores={diagnosis?.bottleneckMap || defaultBottlenecks}
                isActive={isComplete}
              />
            </div>

            {/* Action Plan */}
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Action Plan
              </h3>
              <ActionPlan diagnosis={diagnosis} isActive={isComplete} />
            </div>

            {/* Resource Loadout */}
            <div>
              <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-4">
                Resource Loadout
              </h3>
              <ResourceLoadout diagnosis={diagnosis} isActive={isComplete} />
            </div>
          </TabsContent>
          
          <TabsContent value="testlab">
            <TestLab />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}
