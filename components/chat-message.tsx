"use client"

import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"
import { User, Bot } from "lucide-react"
import { TriageCard } from "./triage-card"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  // Parse triage result from assistant messages
  const parseTriageResult = (content: string) => {
    const triageMatch = content.match(/<triage>([\s\S]*?)<\/triage>/)
    if (triageMatch) {
      try {
        const triageData = JSON.parse(triageMatch[1])
        const textContent = content.replace(/<triage>[\s\S]*?<\/triage>/, "").trim()
        return { triageData, textContent }
      } catch {
        return null
      }
    }
    return null
  }

  const triageContent = !isUser ? parseTriageResult(message.content) : null

  return (
    <div className={cn("flex gap-4 py-6", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div className={cn("flex max-w-2xl flex-col gap-4", isUser ? "items-end" : "items-start")}>
        {triageContent ? (
          <>
            {triageContent.textContent && (
              <div className="rounded-lg bg-secondary px-4 py-3 text-sm leading-relaxed">
                {triageContent.textContent}
              </div>
            )}
            <TriageCard result={triageContent.triageData} />
          </>
        ) : (
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm leading-relaxed",
              isUser ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
            )}
          >
            {message.content}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
