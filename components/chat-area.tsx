"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import type { Message } from "@/lib/types"
import { Brain, Zap, Target, Shield, Sparkles } from "lucide-react"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Brain className="h-8 w-8 text-accent" />
          </div>
          <h1 className="mb-3 text-2xl font-semibold tracking-tight">incurs.io</h1>
          <p className="mb-8 text-muted-foreground">
            Adaptive armour for ambition. Tell me what you want to achieve, and I&apos;ll diagnose the real
            bottleneck stopping you.
          </p>

          <div className="grid gap-3 text-left sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Goal Diagnosis</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Is your goal specific, measurable, and genuinely yours?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Reality Check</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  What&apos;s your actual current state? What have you tried?
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Bottleneck Map</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  8 dimensions analysed: clarity, validation, capability, capacity, and more.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">CEO Decision</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  One practical next move. No fluff. Real motion.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Start by telling me: What do you want to build, achieve, or change?
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
    <ScrollArea className="flex-1">
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

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
