"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
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

// Helper to extract text from UIMessage parts
function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ""
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

// Convert UIMessage to our Message format
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
  const [memory, setMemory] = useState<ArmourMemory>({
    knownGoal: null,
    repeatedBottleneck: null,
    currentAdvantage: null,
    currentRisk: null,
    lastCommitment: null,
    proofOfAction: null,
    lessonLearned: null,
    nextCheckInQuestion: null,
    updatedAt: null,
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [memoryCollapsed, setMemoryCollapsed] = useState(true)
  const [consent, setConsent] = useState<GDPRConsent | null>(null)
  const [showConsentBanner, setShowConsentBanner] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [memoryBackend, setMemoryBackend] = useState<"mubit" | "session-only" | "unknown">("unknown")

  // Create transport that attaches userId + chatId to every request so
  // Mubit can scope long-term memory to this specific browser/user.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/triage",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: {
            messages,
            chatId: id,
            userId: userId ?? "incurs-demo-user",
          },
        }),
      }),
    [userId]
  )

  // AI chat hook with AI SDK 6 patterns
  const { messages, status, sendMessage, stop } = useChat({
    id: currentChatId || undefined,
    transport,
  })

  const isLoading = status === "streaming" || status === "submitted"

  // Extract memory from triage results
  const extractAndSaveMemory = useCallback((content: string) => {
    const triageMatch = content.match(/<triage>([\s\S]*?)<\/triage>/)
    if (triageMatch) {
      try {
        const triageData = JSON.parse(triageMatch[1])
        setMemory((prev) => {
          const newMemory: ArmourMemory = {
            ...prev,
            knownGoal: triageData.primaryBottleneck ? prev.knownGoal : null,
            repeatedBottleneck: triageData.primaryBottleneck || prev.repeatedBottleneck,
            currentAdvantage: triageData.currentAdvantage || prev.currentAdvantage,
            currentRisk: triageData.riskIfUnchanged || prev.currentRisk,
            lastCommitment: triageData.next24HourMove || prev.lastCommitment,
            proofOfAction: triageData.proofOfAction || prev.proofOfAction,
            lessonLearned: triageData.memoryUpdate || prev.lessonLearned,
            nextCheckInQuestion: "Did you complete your 24-hour move?",
            updatedAt: new Date(),
          }
          saveMemory(newMemory)
          return newMemory
        })
      } catch {
        // Ignore parsing errors
      }
    }
  }, [])

  // Sync messages to chat when they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const convertedMessages = messages.map(uiMessageToMessage)
      
      setChats((prev) => {
        const updated = prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: convertedMessages,
              title: updateChatTitle({ ...chat, messages: convertedMessages }),
              updatedAt: new Date(),
            }
          }
          return chat
        })
        saveChats(updated)
        return updated
      })

      // Check for memory updates in the last assistant message
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === "assistant") {
        const content = getUIMessageText(lastMessage)
        extractAndSaveMemory(content)
      }
    }
  }, [messages, currentChatId, extractAndSaveMemory])

  // Load chats and memory on mount
  useEffect(() => {
    try {
      // Stable per-browser user id so Mubit can build long-term memory
      setUserId(getOrCreateUserId())

      // Check which memory backend is active server-side
      fetch("/api/triage", { method: "GET" })
        .then((r) => r.json())
        .then((info) => {
          if (info?.memory === "mubit" || info?.memory === "session-only") {
            setMemoryBackend(info.memory)
          }
        })
        .catch(() => setMemoryBackend("session-only"))

      // Check GDPR consent
      const storedConsent = getConsent()
      setConsent(storedConsent)

      // Show banner if no valid consent (but don't block app)
      if (!hasValidConsent()) {
        setShowConsentBanner(true)
      }

      // Always load data and ensure there's a current chat
      enforceDataRetention(90)

      const loadedChats = getChats()
      const loadedMemory = (storedConsent?.memoryStorage ?? true) ? getMemory() : null
      if (loadedMemory) setMemory(loadedMemory)

      // Always ensure there's a current chat to prevent useChat id race condition
      if (loadedChats.length > 0) {
        const sorted = [...loadedChats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        setChats(loadedChats)
        setCurrentChatId(sorted[0].id)
      } else {
        const initialChat = createChat()
        setChats([initialChat])
        setCurrentChatId(initialChat.id)
        saveChats([initialChat])
      }
    } catch (err) {
      console.error("[v0] Mount error:", err)
      // Fallback: create a fresh chat so the app is at least usable
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
        // Ensure we always have at least one chat
        if (updated.length === 0) {
          const fresh = createChat()
          saveChats([fresh])
          if (currentChatId === chatId) {
            setCurrentChatId(fresh.id)
          }
          return [fresh]
        }
        saveChats(updated)
        if (currentChatId === chatId) {
          setCurrentChatId(updated[0].id)
        }
        return updated
      })
    },
    [currentChatId]
  )

  const handleSendMessage = useCallback(
    (content: string) => {
      // currentChatId is always set thanks to mount logic - just send
      sendMessage({ text: content })
    },
    [sendMessage]
  )

  const handleClearMemory = useCallback(() => {
    clearMemory()
    setMemory({
      knownGoal: null,
      repeatedBottleneck: null,
      currentAdvantage: null,
      currentRisk: null,
      lastCommitment: null,
      proofOfAction: null,
      lessonLearned: null,
      nextCheckInQuestion: null,
      updatedAt: null,
    })
  }, [])

  const handleAcceptConsent = useCallback((newConsent: GDPRConsent) => {
    saveConsent(newConsent)
    setConsent(newConsent)
    setShowConsentBanner(false)
  }, [])

  const handleDeclineConsent = useCallback(() => {
    // User declined - accept minimal consent (essential only)
    const minimalConsent: GDPRConsent = {
      version: "1.0",
      essential: true,
      analytics: false,
      aiProcessing: true, // Required for app to work
      memoryStorage: false,
      timestamp: new Date(),
    }
    saveConsent(minimalConsent)
    setConsent(minimalConsent)
    setShowConsentBanner(false)
  }, [])

  const handleDataDeleted = useCallback(() => {
    // Ensure we always have a current chat
    const fresh = createChat()
    setChats([fresh])
    setCurrentChatId(fresh.id)
    saveChats([fresh])
    setMemory({
      knownGoal: null,
      repeatedBottleneck: null,
      currentAdvantage: null,
      currentRisk: null,
      lastCommitment: null,
      proofOfAction: null,
      lessonLearned: null,
      nextCheckInQuestion: null,
      updatedAt: null,
    })
    setShowConsentBanner(true)
  }, [])

  // Get streaming content from the last assistant message if loading
  const streamingContent = useMemo(() => {
    if (isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        return getUIMessageText(lastMessage)
      }
    }
    return ""
  }, [isLoading, messages])

  // Convert UIMessages to our Message format for display
  const displayMessages: Message[] = useMemo(() => {
    return messages.map(uiMessageToMessage)
  }, [messages])

  return (
    <>
      {/* GDPR Consent Banner - overlay on top */}
      {showConsentBanner && (
        <ConsentBanner onAccept={handleAcceptConsent} onDecline={handleDeclineConsent} />
      )}

      {/* Privacy Settings Dialog */}
      <PrivacySettings
        open={showPrivacySettings}
        onOpenChange={setShowPrivacySettings}
        consent={consent}
        onConsentChange={setConsent}
        onDataDeleted={handleDataDeleted}
      />

      {/* Main App - always render, consent banner is an overlay */}
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <ChatSidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenPrivacySettings={() => setShowPrivacySettings(true)}
        />

        {/* Main Chat Area */}
        <div className="flex flex-1 flex-col">
          <ChatArea messages={displayMessages} isLoading={isLoading} streamingContent={streamingContent} />
          <ChatInput onSend={handleSendMessage} onStop={stop} isLoading={isLoading} />
        </div>

        {/* Memory Panel */}
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
