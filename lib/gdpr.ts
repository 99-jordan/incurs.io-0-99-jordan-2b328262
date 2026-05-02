// GDPR Consent and Data Protection utilities

const CONSENT_KEY = "incurs-gdpr-consent"
const CONSENT_VERSION = "1.0"

export interface GDPRConsent {
  version: string
  essential: boolean // Always true - required for app function
  analytics: boolean // Optional - usage analytics
  aiProcessing: boolean // Required for core functionality - AI analysis
  memoryStorage: boolean // Optional - persistent memory across sessions
  timestamp: Date
}

export interface UserDataExport {
  exportDate: string
  consent: GDPRConsent | null
  chats: unknown[]
  memory: unknown
  appVersion: string
}

export function getConsent(): GDPRConsent | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(CONSENT_KEY)
  if (!stored) return null
  try {
    const consent = JSON.parse(stored)
    return {
      ...consent,
      timestamp: new Date(consent.timestamp),
    }
  } catch {
    return null
  }
}

export function saveConsent(consent: GDPRConsent): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
}

export function hasValidConsent(): boolean {
  const consent = getConsent()
  if (!consent) return false
  // Check if consent version matches current version
  return consent.version === CONSENT_VERSION && consent.aiProcessing
}

export function revokeConsent(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CONSENT_KEY)
}

export function exportAllUserData(): UserDataExport {
  if (typeof window === "undefined") {
    return {
      exportDate: new Date().toISOString(),
      consent: null,
      chats: [],
      memory: null,
      appVersion: "1.0.0",
    }
  }

  const consent = getConsent()
  const chats = localStorage.getItem("incurs-chats")
  const memory = localStorage.getItem("incurs-memory")

  return {
    exportDate: new Date().toISOString(),
    consent,
    chats: chats ? JSON.parse(chats) : [],
    memory: memory ? JSON.parse(memory) : null,
    appVersion: "1.0.0",
  }
}

export function deleteAllUserData(): void {
  if (typeof window === "undefined") return
  
  // Remove all incurs-related data
  localStorage.removeItem("incurs-chats")
  localStorage.removeItem("incurs-memory")
  localStorage.removeItem(CONSENT_KEY)
  
  // Clear any session storage as well
  sessionStorage.clear()
}

export function downloadUserData(): void {
  const data = exportAllUserData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `incurs-data-export-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Data retention policy - auto-delete old conversations
export function enforceDataRetention(maxAgeDays: number = 90): void {
  if (typeof window === "undefined") return
  
  const stored = localStorage.getItem("incurs-chats")
  if (!stored) return
  
  try {
    const chats = JSON.parse(stored)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays)
    
    const filtered = chats.filter((chat: { updatedAt: string }) => {
      const chatDate = new Date(chat.updatedAt)
      return chatDate > cutoffDate
    })
    
    if (filtered.length !== chats.length) {
      localStorage.setItem("incurs-chats", JSON.stringify(filtered))
    }
  } catch {
    // Ignore errors
  }
}
