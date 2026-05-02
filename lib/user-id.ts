// Stable per-browser user identifier so Mubit can build long-term memory
// across all chats for the same user. Stored in localStorage; never sent
// anywhere except as the sessionId/userId scope inside Mubit.
const USER_ID_KEY = "incurs-user-id"

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "incurs-demo-user"
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = `incurs-${crypto.randomUUID()}`
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return "incurs-demo-user"
  }
}

export function clearUserId(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(USER_ID_KEY)
  } catch {
    // ignore
  }
}
