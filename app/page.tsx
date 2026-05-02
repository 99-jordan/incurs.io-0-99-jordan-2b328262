'use client'

import { useState, useEffect } from 'react'
import { TriageAnswers, Diagnosis, AgentAnalysis, TriageStep } from '@/lib/types'
import { generateDiagnosis, getAgentAnalyses } from '@/lib/diagnosis-engine'
import { TriagePanel } from '@/components/triage-panel'
import { DiagnosisBoard } from '@/components/diagnosis-board'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'

const defaultAgentAnalyses: AgentAnalysis[] = [
  { agent: 'Goal Agent', icon: '🎯', status: 'analysing', finding: '', severity: 'low' },
  { agent: 'Reality Agent', icon: '🔍', status: 'analysing', finding: '', severity: 'low' },
  { agent: 'Skill Agent', icon: '⚡', status: 'analysing', finding: '', severity: 'low' },
  { agent: 'Resource Agent', icon: '📚', status: 'analysing', finding: '', severity: 'low' },
  { agent: 'CEO Agent', icon: '👔', status: 'analysing', finding: '', severity: 'low' }
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState<TriageStep>(0)
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [agentAnalyses, setAgentAnalyses] = useState<AgentAnalysis[]>(defaultAgentAnalyses)
  const [showIntro, setShowIntro] = useState(true)

  const handleTriageComplete = (answers: TriageAnswers) => {
    const newDiagnosis = generateDiagnosis(answers)
    const analyses = getAgentAnalyses(answers)
    setDiagnosis(newDiagnosis)
    setAgentAnalyses(analyses)
  }

  const handleReset = () => {
    setCurrentStep(0)
    setDiagnosis(null)
    setAgentAnalyses(defaultAgentAnalyses)
    setShowIntro(true)
  }

  const handleStart = () => {
    setShowIntro(false)
  }

  // Intro screen
  if (showIntro) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              incurs<span className="text-accent">.</span>io
            </h1>
            <p className="text-xl text-muted-foreground">
              Adaptive armour for ambition
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <p className="text-lg text-foreground/80 leading-relaxed text-balance">
              Most personal development tools give motivation or generic plans. 
              We diagnose the real bottleneck first.
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-secondary rounded-full">Sales Readiness</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Skill Coverage</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Execution Capacity</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Confidence</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Market Validation</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Support Network</span>
              <span className="px-3 py-1 bg-secondary rounded-full">Follow-Through</span>
            </div>

            <p className="text-muted-foreground">
              Five specialist agents analyse you from different angles. 
              The CEO Agent makes one final decision: your next move.
            </p>
          </div>

          <Button
            onClick={handleStart}
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90 px-8"
          >
            Begin Triage
          </Button>

          <p className="mt-8 text-xs text-muted-foreground">
            incurs.io does not help people dream. It audits whether they can execute.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">
            incurs<span className="text-accent">.</span>io
          </h1>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Adaptive armour for ambition
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {currentStep === 5 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Triage
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              {currentStep === 5 ? 'Diagnosis Complete' : 'Triage Active'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
        {/* Left Panel - Triage */}
        <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-border p-6 lg:p-8 overflow-auto">
          <TriagePanel
            onComplete={handleTriageComplete}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>

        {/* Right Panel - Diagnosis Board */}
        <div className="w-full lg:w-1/2 xl:w-3/5 bg-secondary/20 overflow-hidden">
          <DiagnosisBoard
            diagnosis={diagnosis}
            agentAnalyses={agentAnalyses}
            currentStep={currentStep}
          />
        </div>
      </div>
    </main>
  )
}
