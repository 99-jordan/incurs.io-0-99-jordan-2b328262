"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TriageResult } from "@/lib/types"
import {
  AlertTriangle,
  Target,
  Zap,
  BookOpen,
  Video,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Brain,
  Search,
  Crown,
  Shield,
} from "lucide-react"

interface TriageCardProps {
  result: TriageResult
}

export function TriageCard({ result }: TriageCardProps) {
  const scoreRows = Object.entries(result.bottleneckScores ?? {}).map(([key, score]) => ({
    key,
    score,
    label: key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()),
  }))

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-chart-1"
    if (score >= 4) return "text-warning"
    return "text-destructive"
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 7) return "bg-chart-1"
    if (score >= 4) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <Card className="w-full overflow-hidden border-accent/25 bg-card shadow-2xl shadow-black/20">
      <div className="border-b border-border bg-gradient-to-r from-accent/15 via-card to-card px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              <p className="font-mono text-xs font-medium uppercase tracking-[0.24em] text-accent">
                CEO Decision
              </p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">{result.primaryBottleneck}</h2>
          </div>
          <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
            {result.aiMode === "live" ? "Live triage" : "Demo triage"}
          </Badge>
        </div>
      </div>

      <CardContent className="space-y-5 p-5">
        <section className="rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-accent">
            Final call
          </p>
          <p className="mt-2 text-base font-semibold leading-relaxed">{result.ceoFinalDecision}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <SignalCard icon={AlertTriangle} label="Hidden obstacle" value={result.hiddenObstacle} tone="danger" />
          <SignalCard icon={Target} label="Secondary risk" value={result.secondaryBottleneck} tone="warning" />
          <SignalCard icon={Shield} label="Current advantage" value={result.currentAdvantage} tone="success" />
        </section>

        <section className="grid gap-3 rounded-xl border border-border bg-secondary/30 p-3 sm:grid-cols-5">
          <AgentSignal name="Goal" identity="Clarifier" value={result.goalAgentDiagnosis} />
          <AgentSignal name="Reality" identity="Truth Teller" value={result.realityAgentDiagnosis} />
          <AgentSignal name="Skill" identity="Capability Auditor" value={result.skillAgentDiagnosis} />
          <AgentSignal name="Resource" identity="Quartermaster" value={result.resourceAgentRecommendation} />
          <AgentSignal name="CEO" identity="Final Decision Maker" value={result.ceoFinalDecision} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Next 24 hours
                </p>
              </div>
              <p className="mt-2 text-sm font-medium">{result.next24HourMove}</p>
            </div>

            {result.messageTemplate && (
              <div className="rounded-xl border border-border bg-secondary/40 p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Short message
                  </p>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{result.messageTemplate}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <SignalCard icon={CheckCircle} label="Proof" value={result.proofOfAction} tone="success" />
              <SignalCard icon={XCircle} label="Stop doing" value={result.stopDoing} tone="danger" />
            </div>
          </div>

          {scoreRows.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Bottleneck map
              </p>
              <div className="mt-4 space-y-3">
                {scoreRows.map((score) => (
                  <div key={score.key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">{score.label}</span>
                      <span className={`text-xs font-medium ${getScoreColor(score.score)}`}>{score.score}/10</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBarColor(score.score)}`}
                        style={{ width: `${score.score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-secondary/30 p-4">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Resource loadout
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ResourceItem icon={BookOpen} label="Book" value={result.recommendedBook} />
            <ResourceItem icon={Video} label="Video" value={result.recommendedVideo} />
            <ResourceItem icon={Calendar} label="Local event type" value={result.recommendedEventType} />
            <ResourceItem icon={Search} label="Deep dive" value={result.recommendedDeepDive} />
          </div>
        </section>

        {result.sevenDayPlan?.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Seven-day direction
            </p>
            <div className="mt-3 grid gap-2">
              {result.sevenDayPlan.slice(0, 7).map((step, index) => (
                <div key={`${index}-${step}`} className="flex items-start gap-3 rounded-lg bg-secondary/50 p-2.5">
                  <Badge variant="outline" className="mt-0.5 shrink-0 border-border text-[10px]">
                    {index + 1}
                  </Badge>
                  <p className="text-sm">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  )
}

function SignalCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof AlertTriangle
  label: string
  value: string
  tone: "danger" | "warning" | "success"
}) {
  const toneClass = {
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
    success: "bg-chart-1/10 text-chart-1",
  }[tone]

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className={`inline-flex rounded-lg p-1.5 ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed">{value}</p>
    </div>
  )
}

function AgentSignal({ name, identity, value }: { name: string; identity: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-card/80 p-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{identity}</p>
      <p className="mt-2 line-clamp-4 text-xs leading-relaxed">{value}</p>
    </div>
  )
}

function ResourceItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-card p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium leading-relaxed">{value}</p>
      </div>
    </div>
  )
}
