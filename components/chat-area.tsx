"use client"

import { useRef, useEffect, useLayoutEffect } from "react"
import { ChatMessage } from "./chat-message"
import type { Message } from "@/lib/types"
import { Brain, CalendarSearch, Crown, Eye, ShieldCheck, Target, type LucideIcon } from "lucide-react"

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

const agentQuestionnaire: Array<{
  name: string
  identity: string
  question: string
  watches: string
  icon: LucideIcon
  colour: string
  glow: string
}> = [
  {
    name: "Goal Agent",
    identity: "The Clarifier",
    question: "What are you trying to build, change or achieve?",
    watches: "Goal clarity, urgency and the real success condition.",
    icon: Target,
    colour: "border-amber-400/35 bg-amber-400/10 text-amber-200",
    glow: "from-amber-400/25",
  },
  {
    name: "Reality Agent",
    identity: "The Truth Teller",
    question: "What evidence proves this matters in the real world?",
    watches: "Proof, assumptions, market validation and avoidance.",
    icon: Eye,
    colour: "border-sky-400/35 bg-sky-400/10 text-sky-200",
    glow: "from-sky-400/25",
  },
  {
    name: "Skill Agent",
    identity: "The Capability Auditor",
    question: "Where will execution break first?",
    watches: "Sales readiness, capacity, confidence and follow-through.",
    icon: ShieldCheck,
    colour: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
    glow: "from-emerald-400/25",
  },
  {
    name: "Resource Agent",
    identity: "The Quartermaster",
    question: "Where are you based, and what support would create motion?",
    watches: "Local events, useful resources and procrastination risk.",
    icon: CalendarSearch,
    colour: "border-violet-400/35 bg-violet-400/10 text-violet-200",
    glow: "from-violet-400/25",
  },
  {
    name: "CEO Agent",
    identity: "The Final Decision Maker",
    question: "What is the one uncomfortable move you need to make?",
    watches: "Primary bottleneck, next move, proof and what to stop doing.",
    icon: Crown,
    colour: "border-rose-400/35 bg-rose-400/10 text-rose-200",
    glow: "from-rose-400/25",
  },
]

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
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/80 shadow-2xl shadow-black/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,122,80,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(80,160,255,0.14),_transparent_36%)]" />
            <div className="relative grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="border-b border-border bg-background/35 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
                  <Brain className="h-3.5 w-3.5" />
                  Multi-agent triage
                </div>

                <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Diagnose the constraint before you choose the move.
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  incurs.io opens with a short conversational questionnaire. Each answer passes through a
                  specialist agent, then the CEO Agent reveals the bottleneck, the local signal, and one
                  practical next move.
                </p>

                <div className="mt-8 grid gap-3 rounded-2xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      First answer
                    </span>
                    <span className="rounded-full bg-accent/10 px-2 py-1 text-[10px] text-accent">
                      Start below
                    </span>
                  </div>
                  <p className="text-lg font-medium leading-snug">
                    Tell me the goal that is stuck, messy, or too important to keep guessing at.
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Example: “I want to build an AI voice agent company for local businesses, but I keep
                    building instead of selling.”
                  </p>
                </div>

                <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  The chat is the relationship. The agents are the machinery.
                </p>
              </section>

              <section className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3 px-1">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Questionnaire path
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">One question at a time. No static form.</p>
                  </div>
                  <div className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted-foreground sm:block">
                    5 agents
                  </div>
                </div>

                <div className="grid gap-3">
                  {agentQuestionnaire.map((agent, index) => (
                    <AgentQuestionCard key={agent.name} agent={agent} index={index} />
                  ))}
                </div>
              </section>
            </div>
          </div>
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

function AgentQuestionCard({
  agent,
  index,
}: {
  agent: (typeof agentQuestionnaire)[number]
  index: number
}) {
  const Icon = agent.icon

  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${agent.colour} p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20`}>
      <div className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r ${agent.glow} to-transparent opacity-70`} />
      <div className="relative flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-current/25 bg-background/40">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="text-sm font-semibold">{agent.name}</p>
            <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] opacity-80">
              {agent.identity}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium leading-snug text-foreground">{agent.question}</p>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{agent.watches}</p>
        </div>
      </div>
    </div>
  )
}
