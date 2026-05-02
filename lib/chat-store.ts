import type { Chat, Message, ArmourMemory } from "./types"

const CHATS_KEY = "incurs-chats"
const MEMORY_KEY = "incurs-memory"

export function getChats(): Chat[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(CHATS_KEY)
  if (!stored) return []
  try {
    const chats = JSON.parse(stored)
    return chats.map((chat: Chat) => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg: Message) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }))
  } catch {
    return []
  }
}

export function saveChats(chats: Chat[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}

export function createChat(): Chat {
  return {
    id: crypto.randomUUID(),
    title: "New conversation",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

export function updateChatTitle(chat: Chat): string {
  const firstUserMessage = chat.messages.find((m) => m.role === "user")
  if (firstUserMessage) {
    const content = firstUserMessage.content
    return content.length > 40 ? content.slice(0, 40) + "..." : content
  }
  return "New conversation"
}

export function getMemory(): ArmourMemory {
  if (typeof window === "undefined") {
    return {
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
  }
  const stored = localStorage.getItem(MEMORY_KEY)
  if (!stored) {
    return {
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
  }
  try {
    const memory = JSON.parse(stored)
    return {
      ...memory,
      updatedAt: memory.updatedAt ? new Date(memory.updatedAt) : null,
    }
  } catch {
    return {
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
  }
}

export function saveMemory(memory: ArmourMemory): void {
  if (typeof window === "undefined") return
  localStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
}

export function clearMemory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(MEMORY_KEY)
}
