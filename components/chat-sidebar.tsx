"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Chat } from "@/lib/types"
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Shield } from "lucide-react"

interface ChatSidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenPrivacySettings?: () => void
}

export function ChatSidebar({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  collapsed,
  onToggleCollapse,
  onOpenPrivacySettings,
}: ChatSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  if (collapsed) {
    return (
      <div className="flex h-full w-16 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center justify-center border-b border-border">
          <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2 p-2">
          <Button variant="ghost" size="icon" onClick={onNewChat} className="text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <span className="font-mono text-sm font-medium tracking-tight">incurs.io</span>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <Button onClick={onNewChat} variant="outline" className="w-full justify-start gap-2 border-border">
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 pb-4">
          {chats.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No conversations yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  currentChatId === chat.id
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
                onClick={() => onSelectChat(chat.id)}
                onMouseEnter={() => setHoveredId(chat.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <div className="flex-1 truncate">
                  <p className="truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</p>
                </div>
                {hoveredId === chat.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-between border-t border-border p-3">
        <p className="text-xs text-muted-foreground">Adaptive armour for ambition</p>
        {onOpenPrivacySettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenPrivacySettings}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Privacy Settings"
          >
            <Shield className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
