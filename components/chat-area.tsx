"use client"

import { useRef, useEffect, useLayoutEffect } from "react"
import { ChatMessage } from "./chat-message"
import type { Message } from "@/lib/types"
import { Brain, Zap, Target, Shield, Sparkles } from "lucide-react"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)

  // Track whether the user is "at the bottom". If they scroll up, we stop
  // auto-following so they can read history without being yanked down.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      stickToBottomRef.current = distanceFromBottom < 80
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // Sync scroll *before paint* using auto (instant) so the stream feels
  // smooth rather than chasing a smooth-scroll animation behind tokens.
  useLayoutEffect(() => {
    if (!stickToBottomRef.current) return
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto p-8">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-3 text-2xl font-semibold tracking-tight">incurs.io</h1>
          <p className="mb-8 text-muted-foreground">
            Adaptive armour for ambition. Diagnose the bottleneck. Remember the pattern. Choose the next move.
          </p>

          <div className="grid gap-3 text-left sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Goal Diagnosis</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  What are you trying to build, change or achieve?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Reality Check</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  What proof exists, and what are you avoiding?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Bottleneck Map</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sales readiness, validation, capacity, pressure and follow-through.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">CEO Decision</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  One practical next move. No huge plan. Real proof.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Run your triage: what serious goal is stuck right now?
          </p>
        </div>
      </div>
    )
  }

  // Only show "thinking" indicator when waiting for the assistant's first delta —
  // i.e. the last message is still from the user. Once the assistant starts
  // streaming, its partial text is already rendered inside the last ChatMessage,
  // so we MUST NOT render a second bubble or text appears twice.
  const lastMessage = messages[messages.length - 1]
  const isWaitingForReply = isLoading && (!lastMessage || lastMessage.role === "user")

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isWaitingForReply && (
          <div className="flex gap-4 py-6">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Brain className="h-4 w-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" style={{ animationDelay: "0.2s" }} />
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
