"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, UIMessage } from "ai"
import type { Chat, Message, ArmourMemory } from "@/lib/types"
import { getChats, saveChats, createChat, updateChatTitle, getMemory, saveMemory, clearMemory } from "@/lib/chat-store"
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
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<GDPRConsent | null>(null)
  const [showConsentBanner, setShowConsentBanner] = useState(false)
  const [showPrivacySettings, setShowPrivacySettings] = useState(false)

  const currentChat = chats.find((c) => c.id === currentChatId)

  // Create transport with memoization
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/triage" }),
    []
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
    setMounted(true)
    
    // Check GDPR consent first
    const storedConsent = getConsent()
    setConsent(storedConsent)
    
    if (!hasValidConsent()) {
      setShowConsentBanner(true)
      return
    }
    
    // Enforce data retention policy (90 days)
    enforceDataRetention(90)
    
    const loadedChats = getChats()
    const loadedMemory = storedConsent?.memoryStorage ? getMemory() : {
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
    setChats(loadedChats)
    setMemory(loadedMemory)

    // Select most recent chat or create new one
    if (loadedChats.length > 0) {
      const sorted = [...loadedChats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      setCurrentChatId(sorted[0].id)
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
        saveChats(updated)
        return updated
      })
      if (currentChatId === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId)
        if (remaining.length > 0) {
          setCurrentChatId(remaining[0].id)
        } else {
          setCurrentChatId(null)
        }
      }
    },
    [currentChatId, chats]
  )

  const handleSendMessage = useCallback(
    async (content: string) => {
      // Create new chat if none selected
      if (!currentChatId) {
        const newChat = createChat()
        const userMessage: Message = {
          id: crypto.randomUUID(),
          role: "user",
          content,
          timestamp: new Date(),
        }
        newChat.messages = [userMessage]
        newChat.title = content.length > 40 ? content.slice(0, 40) + "..." : content
        newChat.updatedAt = new Date()

        setChats((prev) => {
          const updated = [newChat, ...prev]
          saveChats(updated)
          return updated
        })
        setCurrentChatId(newChat.id)
      }

      // Send to AI using AI SDK 6 pattern
      sendMessage({ text: content })
    },
    [currentChatId, sendMessage]
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
    
    // Load data now that consent is given
    enforceDataRetention(90)
    const loadedChats = getChats()
    const loadedMemory = newConsent.memoryStorage ? getMemory() : {
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
    setChats(loadedChats)
    setMemory(loadedMemory)
    
    if (loadedChats.length > 0) {
      const sorted = [...loadedChats].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      setCurrentChatId(sorted[0].id)
    }
  }, [])

  const handleDeclineConsent = useCallback(() => {
    // User declined - show a message that the app requires consent
    setShowConsentBanner(false)
  }, [])

  const handleDataDeleted = useCallback(() => {
    setChats([])
    setCurrentChatId(null)
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

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-2 font-mono text-2xl font-bold tracking-tight">
            incurs<span className="text-accent">.</span>io
          </h1>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* GDPR Consent Banner */}
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

      {/* Main App - only show if consent is valid */}
      {!showConsentBanner && (
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
          />
        </div>
      )}
    </>
  )
}
