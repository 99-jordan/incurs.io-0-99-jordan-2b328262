"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

interface TriageCardProps {
  result: TriageResult
}

export function TriageCard({ result }: TriageCardProps) {
  const [activeTab, setActiveTab] = useState("diagnosis")
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
    <Card className="w-full border-accent/20 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <CardTitle className="text-base font-medium">CEO Diagnosis</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="diagnosis" className="flex-1">
              Diagnosis
            </TabsTrigger>
            <TabsTrigger value="action" className="flex-1">
              CEO Move
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diagnosis" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Primary Bottleneck
                  </p>
                  <p className="text-sm font-medium">{result.primaryBottleneck}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-warning/10 p-3">
                <Target className="mt-0.5 h-4 w-4 text-warning" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Secondary Bottleneck
                  </p>
                  <p className="text-sm font-medium">{result.secondaryBottleneck}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-secondary p-3">
                <Zap className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Hidden Obstacle
                  </p>
                  <p className="text-sm">{result.hiddenObstacle}</p>
                </div>
              </div>
            </div>

            {scoreRows.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bottleneck Map
                </p>
                <div className="grid gap-2">
                  {scoreRows.map((score) => (
                    <div key={score.key} className="flex items-center gap-3">
                      <span className="w-36 text-xs text-muted-foreground">{score.label}</span>
                      <div className="h-2 flex-1 rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreBarColor(score.score)}`}
                          style={{ width: `${score.score * 10}%` }}
                        />
                      </div>
                      <span className={`w-6 text-right text-xs font-medium ${getScoreColor(score.score)}`}>
                        {score.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advantage and risk */}
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <div className="rounded-md bg-chart-1/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Advantage
                </p>
                <p className="mt-1 text-sm">{result.currentAdvantage}</p>
              </div>
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Risk if Unchanged
                </p>
                <p className="mt-1 text-sm">{result.riskIfUnchanged}</p>
              </div>
            </div>

            <div className="grid gap-3 pt-2">
              <div className="rounded-md border border-border bg-secondary/40 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Agent Notes</p>
                <div className="mt-2 space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Goal:</span> {result.goalAgentDiagnosis}</p>
                  <p><span className="text-muted-foreground">Reality:</span> {result.realityAgentDiagnosis}</p>
                  <p><span className="text-muted-foreground">Skill:</span> {result.skillAgentDiagnosis}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="action" className="space-y-4">
            <div className="rounded-md border border-accent/40 bg-accent/10 p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-accent" />
                <p className="text-xs font-medium uppercase tracking-wide text-accent">CEO Final Decision</p>
              </div>
              <p className="mt-2 font-medium">{result.ceoFinalDecision}</p>
            </div>

            <div className="rounded-md border border-accent/30 bg-accent/5 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <p className="text-xs font-medium uppercase tracking-wide text-accent">Next 24 Hours</p>
              </div>
              <p className="mt-2 font-medium">{result.next24HourMove}</p>
            </div>

            {result.sevenDayPlan && result.sevenDayPlan.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  7-Day Plan
                </p>
                <div className="space-y-2">
                  {result.sevenDayPlan.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-md bg-secondary p-3">
                      <Badge variant="outline" className="shrink-0">
                        {i + 1}
                      </Badge>
                      <p className="text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.messageTemplate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Message Template
                  </p>
                </div>
                <div className="rounded-md bg-secondary p-3">
                  <p className="font-mono text-sm">{result.messageTemplate}</p>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-md bg-chart-1/10 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-chart-1" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Proof of Action
                  </p>
                  <p className="mt-1 text-sm">{result.proofOfAction}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-3">
                <XCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Stop Doing
                  </p>
                  <p className="mt-1 text-sm">{result.stopDoing}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="rounded-md border border-border bg-secondary/40 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resource Agent
              </p>
              <p className="mt-1 text-sm">{result.resourceAgentRecommendation}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-md bg-secondary p-3">
                <BookOpen className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended Book
                  </p>
                  <p className="mt-1 text-sm font-medium">{result.recommendedBook}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-secondary p-3">
                <Video className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Recommended Video
                  </p>
                  <p className="mt-1 text-sm font-medium">{result.recommendedVideo}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-secondary p-3">
                <Calendar className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Event Type
                  </p>
                  <p className="mt-1 text-sm font-medium">{result.recommendedEventType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-secondary p-3">
                <Search className="mt-0.5 h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Deep Dive
                  </p>
                  <p className="mt-1 text-sm font-medium">{result.recommendedDeepDive}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
