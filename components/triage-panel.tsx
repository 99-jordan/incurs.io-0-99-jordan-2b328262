'use client'

import { useState } from 'react'
import { TriageAnswers, TriageStep } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const questions = [
  {
    id: 'goal',
    question: 'What are you trying to build, change, or achieve?',
    placeholder: 'Be specific about what success looks like...',
    hint: 'The clearer your goal, the sharper our diagnosis.'
  },
  {
    id: 'skills',
    question: 'What skills or advantages do you already have?',
    placeholder: 'List your existing capabilities, network, resources...',
    hint: 'Include technical skills, soft skills, connections, and unique experiences.'
  },
  {
    id: 'weakness',
    question: 'What skill, behaviour, or resource is weakest right now?',
    placeholder: 'Be honest about your gaps...',
    hint: 'The bottleneck you admit is the one we can fix.'
  },
  {
    id: 'hours',
    question: 'How many focused hours can you commit each week?',
    placeholder: 'Enter a realistic number, not an aspirational one...',
    hint: 'Real hours, not screen time. Focused execution time only.'
  },
  {
    id: 'avoidance',
    question: 'What action are you avoiding because it feels uncomfortable?',
    placeholder: 'The thing you know you should do but keep postponing...',
    hint: 'This is often where the real work lives.'
  }
]

interface TriagePanelProps {
  onComplete: (answers: TriageAnswers) => void
  currentStep: TriageStep
  onStepChange: (step: TriageStep) => void
}

export function TriagePanel({ onComplete, currentStep, onStepChange }: TriagePanelProps) {
  const [answers, setAnswers] = useState<Partial<TriageAnswers>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')

  const handleNext = () => {
    if (!currentAnswer.trim()) return
    
    const questionId = questions[currentStep].id as keyof TriageAnswers
    const newAnswers = { ...answers, [questionId]: currentAnswer.trim() }
    setAnswers(newAnswers)
    setCurrentAnswer('')
    
    if (currentStep === 4) {
      onComplete(newAnswers as TriageAnswers)
      onStepChange(5)
    } else {
      onStepChange((currentStep + 1) as TriageStep)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleNext()
    }
  }

  if (currentStep === 5) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Triage Complete</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-2xl font-semibold mb-4">Analysis Running</h2>
          <p className="text-muted-foreground leading-relaxed">
            Five specialist agents are analysing your responses. The CEO Agent is preparing your diagnosis.
          </p>
          
          <div className="mt-8 space-y-4">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {questions.find(q => q.id === key)?.question}
                </p>
                <p className="text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentStep]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Question {currentStep + 1} of 5
          </span>
        </div>
        
        {/* Progress indicators */}
        <div className="flex gap-1.5">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                'h-1 w-8 rounded-full transition-colors',
                idx < currentStep ? 'bg-accent' : idx === currentStep ? 'bg-foreground' : 'bg-border'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-semibold mb-2 text-balance">
          {currentQuestion.question}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {currentQuestion.hint}
        </p>

        <Textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentQuestion.placeholder}
          className="flex-1 min-h-[200px] resize-none bg-secondary/30 border-border focus:border-accent text-foreground placeholder:text-muted-foreground/50"
          autoFocus
        />

        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">Enter</kbd> to continue
          </p>
          
          <Button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {currentStep === 4 ? 'Run Diagnosis' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Previous answers */}
      {currentStep > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Previous responses</p>
          <div className="space-y-2">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-muted-foreground">{questions.find(q => q.id === key)?.question.slice(0, 40)}...</span>
                <p className="text-foreground/80 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
