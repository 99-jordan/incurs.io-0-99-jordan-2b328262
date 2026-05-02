"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import type { Chat, Message, ArmourMemory } from "@/lib/types"
import { getChats, saveChats, createChat, updateChatTitle, getMemory, saveMemory, clearMemory } from "@/lib/chat-store"
import { getOrCreateUserId } from "@/lib/user-id"
import { getConsent, saveConsent, hasValidConsent, enforceDataRetention, type GDPRConsent } from "@/lib/gdpr"
import { ConsentBanner } from "@/components/consent-banner"
import { PrivacySettings } from "@/components/privacy-settings"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatArea } from "@/components/chat-area"
import { ChatInput } from "@/components/chat-input"
import { MemoryPanel } from "@/components/memory-panel"

const EMPTY_MEMORY: ArmourMemory = {
  knownGoal: null,
  repeatedBottleneck: null,
  currentAdvantage: null,
  currentRisk: null,
  lastCommitment: null,
  proofOfAction: null,
  lessonLearned: null,
  nextCheckInQuestion: null,
  updatedAt: null,
}

// Convert a stored Message to AI SDK 6 UIMessage shape
function messageToUIMessage(msg: Message): UIMessage {
  return {
    id: msg.id,
    role: msg.role,
    parts: [{ type: "text", text: msg.content }],
  } as UIMessage
}

// Extract plain text from a UIMessage's parts array
function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

function uiMessageToMessage(msg: UIMessage): Message {
  return {
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: getUIMessageText(msg),
    timestamp: new Date(),
  }
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [memory, setMemory] = useState<ArmourMemory>(EMPTY_MEMORY)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [memoryCollapsed, setMemoryCollapsed] = useState(true)
  const [consent, setConsent] = useState<GDPRConsent | null>(null)
  const [showConsentBanner, setShowConsentBanner] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [memoryBackend, setMemoryBackend] = useState<"mubit" | "session-only" | "unknown">("unknown")

  // Stable refs so the transport never has to be recreated.
  const userIdRef = useRef<string>("incurs-demo-user")
  const lastLoadedChatRef = useRef<string | null>(null)

  // Transport is created exactly once. It reads userId from the ref each request,
  // so a userId change after mount never tears down an in-flight stream.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/triage",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: {
            messages,
            chatId: id,
            userId: userIdRef.current,
          },
        }),
      }),
    [],
  )

  // Persist a fully-completed chat to localStorage once streaming finishes.
  const persistChat = useCallback((chatId: string, finalMessages: UIMessage[]) => {
    const converted = finalMessages.map(uiMessageToMessage)
    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: converted,
              title: updateChatTitle({ ...c, messages: converted }),
              updatedAt: new Date(),
            }
          : c,
      )
      saveChats(updated)
      return updated
    })

    // Extract structured triage memory from the final assistant message
    const lastAssistant = [...finalMessages].reverse().find((m) => m.role === "assistant")
    if (lastAssistant) {
      const text = getUIMessageText(lastAssistant)
      const triageMatch = text.match(/<triage>([\s\S]*?)<\/triage>/)
      if (triageMatch) {
        try {
          const t = JSON.parse(triageMatch[1])
          setMemory((prev) => {
            const next: ArmourMemory = {
              knownGoal: prev.knownGoal,
              repeatedBottleneck: t.primaryBottleneck || prev.repeatedBottleneck,
              currentAdvantage: t.currentAdvantage || prev.currentAdvantage,
              currentRisk: t.riskIfUnchanged || prev.currentRisk,
              lastCommitment: t.next24HourMove || prev.lastCommitment,
              proofOfAction: t.proofOfAction || prev.proofOfAction,
              lessonLearned: t.memoryUpdate || prev.lessonLearned,
              nextCheckInQuestion: "Did you complete your 24-hour move?",
              updatedAt: new Date(),
            }
            saveMemory(next)
            return next
          })
        } catch {
          // ignore malformed triage block
        }
      }
    }
  }, [])

  // AI SDK chat hook. Note: id changes RESET internal messages — that's why we
  // re-seed history with setMessages in the effect below.
  const { messages, status, sendMessage, stop, setMessages } = useChat({
    id: currentChatId || undefined,
    transport,
    onFinish: ({ messages: finalMessages }) => {
      if (currentChatId) persistChat(currentChatId, finalMessages)
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Re-seed useChat with stored messages whenever the active chat changes.
  // Only seeds once per chatId switch, so streaming deltas aren't overwritten.
  useEffect(() => {
    if (!currentChatId) return
    if (lastLoadedChatRef.current === currentChatId) return
    lastLoadedChatRef.current = currentChatId

    const chat = chats.find((c) => c.id === currentChatId)
    if (chat && chat.messages.length > 0) {
      setMessages(chat.messages.map(messageToUIMessage))
    } else {
      setMessages([])
    }
  }, [currentChatId, chats, setMessages])

  // Update sidebar title as soon as the user sends their first message
  // (don't wait for the assistant to finish streaming).
  useEffect(() => {
    if (!currentChatId) return
    const userMsgs = messages.filter((m) => m.role === "user")
    if (userMsgs.length === 0) return

    setChats((prev) => {
      const chat = prev.find((c) => c.id === currentChatId)
      if (!chat) return prev
      const draft = { ...chat, messages: messages.map(uiMessageToMessage) }
      const newTitle = updateChatTitle(draft)
      if (chat.title === newTitle) return prev
      return prev.map((c) => (c.id === currentChatId ? { ...c, title: newTitle, updatedAt: new Date() } : c))
    })
  }, [messages, currentChatId])

  // Mount: hydrate everything.
  useEffect(() => {
    try {
      userIdRef.current = getOrCreateUserId()

      fetch("/api/triage", { method: "GET" })
        .then((r) => r.json())
        .then((info) => {
          if (info?.memory === "mubit" || info?.memory === "session-only") {
            setMemoryBackend(info.memory)
          }
        })
        .catch(() => setMemoryBackend("session-only"))

      const storedConsent = getConsent()
      setConsent(storedConsent)
      if (!hasValidConsent()) setShowConsentBanner(true)

      enforceDataRetention(90)

      const loadedChats = getChats()
      const loadedMemory = (storedConsent?.memoryStorage ?? true) ? getMemory() : null
      if (loadedMemory) setMemory(loadedMemory)

      if (loadedChats.length > 0) {
        const sorted = [...loadedChats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        setChats(sorted)
        setCurrentChatId(sorted[0].id)
      } else {
        const initialChat = createChat()
        setChats([initialChat])
        setCurrentChatId(initialChat.id)
        saveChats([initialChat])
      }
    } catch (err) {
      console.error("[v0] Mount error:", err)
      const initialChat = createChat()
      setChats([initialChat])
      setCurrentChatId(initialChat.id)
    }
  }, [])

  const handleNewChat = useCallback(() => {
    const newChat = createChat()
    setChats((prev) => {
      const updated = [newChat, ...prev]
      saveChats(updated)
      return updated
    })
    setCurrentChatId(newChat.id)
  }, [])

  const handleSelectChat = useCallback((chatId: string) => {
    setCurrentChatId(chatId)
  }, [])

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => {
        const updated = prev.filter((c) => c.id !== chatId)
        if (updated.length === 0) {
          const fresh = createChat()
          saveChats([fresh])
          if (currentChatId === chatId) setCurrentChatId(fresh.id)
          return [fresh]
        }
        saveChats(updated)
        if (currentChatId === chatId) setCurrentChatId(updated[0].id)
        return updated
      })
    },
    [currentChatId],
  )

  const handleClearAllChats = useCallback(() => {
    const fresh = createChat()
    saveChats([fresh])
    setChats([fresh])
    setCurrentChatId(fresh.id)
  }, [])

  const handleSendMessage = useCallback(
    (content: string) => {
      sendMessage({ text: content })
    },
    [sendMessage],
  )

  const handleClearMemory = useCallback(() => {
    clearMemory()
    setMemory(EMPTY_MEMORY)
  }, [])

  const handleAcceptConsent = useCallback((newConsent: GDPRConsent) => {
    saveConsent(newConsent)
    setConsent(newConsent)
    setShowConsentBanner(false)
  }, [])

  const handleDeclineConsent = useCallback(() => {
    const minimalConsent: GDPRConsent = {
      version: "1.0",
      essential: true,
      analytics: false,
      aiProcessing: true,
      memoryStorage: false,
      timestamp: new Date(),
    }
    saveConsent(minimalConsent)
    setConsent(minimalConsent)
    setShowConsentBanner(false)
  }, [])

  const handleDataDeleted = useCallback(() => {
    const fresh = createChat()
    setChats([fresh])
    setCurrentChatId(fresh.id)
    saveChats([fresh])
    setMemory(EMPTY_MEMORY)
    setShowConsentBanner(true)
  }, [])

  const streamingContent = useMemo(() => {
    if (!isLoading || messages.length === 0) return ""
    const last = messages[messages.length - 1]
    return last.role === "assistant" ? getUIMessageText(last) : ""
  }, [isLoading, messages])

  const displayMessages: Message[] = useMemo(() => messages.map(uiMessageToMessage), [messages])

  return (
    <>
      {showConsentBanner && <ConsentBanner onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />}

      <PrivacySettings
        open={showPrivacySettings}
        onOpenChange={setShowPrivacySettings}
        consent={consent}
        onConsentChange={setConsent}
        onDataDeleted={handleDataDeleted}
      />

      <div className="flex h-screen bg-background">
          <ChatSidebar
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onClearAllChats={handleClearAllChats}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onOpenPrivacySettings={() => setShowPrivacySettings(true)}
          />

        <div className="flex flex-1 flex-col">
          <ChatArea messages={displayMessages} isLoading={isLoading} streamingContent={streamingContent} />
          <ChatInput onSend={handleSendMessage} onStop={stop} isLoading={isLoading} />
        </div>

        <MemoryPanel
          memory={memory}
          onClearMemory={handleClearMemory}
          collapsed={memoryCollapsed}
          onToggleCollapse={() => setMemoryCollapsed(!memoryCollapsed)}
          memoryBackend={memoryBackend}
        />
      </div>
    </>
  )
}
