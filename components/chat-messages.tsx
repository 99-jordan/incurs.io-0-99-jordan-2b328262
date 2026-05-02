"use client"

import { useEffect, useRef } from "react"
import { User, Bot, Target, Eye, Zap, BookOpen, Crown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message, DiagnosisResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  streamingContent: string
}

function DiagnosisCard({ diagnosis }: { diagnosis: DiagnosisResult }) {
  const scores = diagnosis.bottleneckScores

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
      <div className="flex items-center gap-2 text-accent">
        <Crown className="h-5 w-5" />
        <span className="font-mono text-sm font-medium">CEO DIAGNOSIS</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Primary Bottleneck</p>
          <p className="mt-1 font-medium text-foreground">{diagnosis.primaryBottleneck}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Hidden Obstacle</p>
          <p className="mt-1 font-medium text-foreground">{diagnosis.hiddenObstacle}</p>
        </div>
      </div>

      <div className="rounded-md border border-accent/30 bg-accent/10 p-3">
        <p className="text-xs text-accent">Next 24-Hour Move</p>
        <p className="mt-1 font-medium text-foreground">{diagnosis.next24HourMove}</p>
      </div>

      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Stop Doing</p>
        <p className="mt-1 text-foreground">{diagnosis.stopDoing}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Bottleneck Scores</p>
        <div className="grid gap-2 text-xs">
          {Object.entries(scores).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-40 text-muted-foreground">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    value >= 7 ? "bg-chart-1" : value >= 4 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${value * 10}%` }}
                />
              </div>
              <span className="w-6 text-right text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-xs">Book</span>
          </div>
          <p className="mt-1 text-sm text-foreground">{diagnosis.recommendedBook}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="text-xs">Video</span>
          </div>
          <p className="mt-1 text-sm text-foreground">{diagnosis.recommendedVideo}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs">Event</span>
          </div>
          <p className="mt-1 text-sm text-foreground">{diagnosis.recommendedEventType}</p>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-3">
        <p className="text-xs text-muted-foreground">Proof of Action</p>
        <p className="mt-1 text-foreground">{diagnosis.proofOfAction}</p>
      </div>
    </div>
  )
}

export function ChatMessages({ messages, isLoading, streamingContent }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
              <Zap className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
            incurs.io
          </h1>
          <p className="mb-1 text-muted-foreground">
            Adaptive armour for ambition
          </p>
          <p className="text-sm text-muted-foreground">
            Tell me what you&apos;re trying to build, change, or achieve.
            I&apos;ll diagnose the real bottleneck and give you one practical next move.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  message.role === "user"
                    ? "bg-secondary text-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <p className="text-sm font-medium text-foreground">
                  {message.role === "user" ? "You" : "incurs.io"}
                </p>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
                </div>
                {message.diagnosis && <DiagnosisCard diagnosis={message.diagnosis} />}
              </div>
            </div>
          ))}

          {isLoading && streamingContent && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <p className="text-sm font-medium text-foreground">incurs.io</p>
                <div className="prose prose-sm prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-foreground">{streamingContent}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingContent && (
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <p className="text-sm font-medium text-foreground">incurs.io</p>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </ScrollArea>
  )
}
