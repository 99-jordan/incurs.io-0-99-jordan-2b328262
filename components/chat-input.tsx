"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowUp, Square } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  isLoading: boolean
  placeholder?: string
}

export function ChatInput({ onSend, onStop, isLoading, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-xl border border-border bg-secondary/50 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "What are you trying to build, change, or achieve?"}
            rows={1}
            className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isLoading}
          />
          {isLoading && onStop ? (
            <Button
              onClick={onStop}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          incurs.io diagnoses bottlenecks and gives one practical next move. Press Enter to send.
        </p>
      </div>
    </div>
  )
}
