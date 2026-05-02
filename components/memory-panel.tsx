"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import type { ArmourMemory } from "@/lib/types"
import {
  Target,
  AlertTriangle,
  Zap,
  Shield,
  CheckCircle,
  BookOpen,
  HelpCircle,
  Trash2,
  Brain,
  Lock,
} from "lucide-react"

interface MemoryPanelProps {
  memory: ArmourMemory
  pendingMemory?: ArmourMemory | null
  onApproveMemory?: () => void
  onRejectMemory?: () => void
  onEditPendingMemory?: (memoryText: string) => void
  onClearMemory: () => void
  collapsed: boolean
  onToggleCollapse: () => void
  memoryBackend?: "mubit" | "session-only" | "unknown"
}

const memoryFields = [
  { key: "knownGoal", label: "Known Goal", icon: Target, color: "text-accent" },
  { key: "repeatedBottleneck", label: "Repeated Bottleneck", icon: AlertTriangle, color: "text-destructive" },
  { key: "currentAdvantage", label: "Current Advantage", icon: Zap, color: "text-chart-1" },
  { key: "currentRisk", label: "Current Risk", icon: Shield, color: "text-warning" },
  { key: "lastCommitment", label: "Last Commitment", icon: CheckCircle, color: "text-chart-1" },
  { key: "proofOfAction", label: "Proof of Action", icon: CheckCircle, color: "text-chart-1" },
  { key: "lessonLearned", label: "Lesson Learned", icon: BookOpen, color: "text-accent" },
  { key: "nextCheckInQuestion", label: "Next Check-in", icon: HelpCircle, color: "text-muted-foreground" },
] as const

export function MemoryPanel({
  memory,
  pendingMemory,
  onApproveMemory,
  onRejectMemory,
  onEditPendingMemory,
  onClearMemory,
  collapsed,
  onToggleCollapse,
  memoryBackend = "unknown",
}: MemoryPanelProps) {
  const hasMemory = Object.values(memory).some((v) => v !== null && v !== undefined)
  const isMubitActive = memoryBackend === "mubit"

  if (collapsed) {
    return (
      <div className="flex h-full w-12 shrink-0 flex-col border-l border-border bg-card transition-[width] duration-200 ease-out">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mx-auto mt-3 text-muted-foreground"
        >
          <Brain className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-card transition-[width] duration-200 ease-out">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Armour Memory</span>
          {isMubitActive ? (
            <Badge variant="outline" className="border-chart-1/40 bg-chart-1/10 px-1.5 py-0 text-[10px] font-medium text-chart-1">
              Mubit live
            </Badge>
          ) : memoryBackend === "session-only" ? (
            <Badge variant="outline" className="border-border px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
              Local only
            </Badge>
          ) : null}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="text-muted-foreground">
          <Brain className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 p-4">
          {pendingMemory && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-accent">
                  <Brain className="h-3 w-3" />
                  Memory Update Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-3 pt-0">
                <Textarea
                  value={pendingMemory.lessonLearned || ""}
                  onChange={(event) => onEditPendingMemory?.(event.target.value)}
                  className="min-h-24 text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={onApproveMemory} className="flex-1">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={onRejectMemory} className="flex-1">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasMemory ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Brain className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No memories stored yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your patterns and progress will appear here as you use incurs.io
                </p>
              </CardContent>
            </Card>
          ) : (
            memoryFields.map(({ key, label, icon: Icon, color }) => {
              const value = memory[key]
              if (!value) return null

              return (
                <Card key={key} className="border-border/50">
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon className={`h-3 w-3 ${color}`} />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 pt-0">
                    <p className="text-sm">{value}</p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </ScrollArea>

      {hasMemory && (
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearMemory}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Clear all memories
          </Button>
        </div>
      )}

      <div className="border-t border-border bg-secondary/30 p-3">
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {isMubitActive
              ? "incurs.io only stores memories you approve. Live memory is stored in Mubit and scoped to this browser user."
              : "incurs.io only stores memories you choose to save. You can review, edit, or delete memories at any time."}
          </p>
        </div>
      </div>
    </div>
  )
}
