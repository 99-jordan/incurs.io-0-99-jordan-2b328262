export type AgentType = "goal" | "reality" | "skill" | "resource" | "ceo"

export type BottleneckCategory =
  | "clarity"
  | "validation"
  | "capability"
  | "capacity"
  | "confidence"
  | "support"
  | "follow_through"
  | "avoidance"

export interface BottleneckScore {
  category: BottleneckCategory
  score: number
  label: string
  description: string
}

export interface TriageResult {
  primaryBottleneck: string
  secondaryBottleneck: string
  hiddenObstacle: string
  currentAdvantage: string
  riskIfUnchanged: string
  bottleneckScores: BottleneckScore[]
  next24HourMove: string
  sevenDayPlan: string[]
  recommendedBook: string
  recommendedVideo: string
  recommendedEventType: string
  messageTemplate: string
  proofOfAction: string
  stopDoing: string
  memoryUpdate: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  triageResult?: TriageResult
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ArmourMemory {
  knownGoal: string | null
  repeatedBottleneck: string | null
  currentAdvantage: string | null
  currentRisk: string | null
  lastCommitment: string | null
  proofOfAction: string | null
  lessonLearned: string | null
  nextCheckInQuestion: string | null
  updatedAt: Date | null
}

export const AGENTS = [
  {
    id: "goal" as const,
    name: "Goal Agent",
    description: "Understands what you want and what success looks like",
  },
  {
    id: "reality" as const,
    name: "Reality Agent",
    description: "Checks what is actually missing and whether you are avoiding hard truths",
  },
  {
    id: "skill" as const,
    name: "Skill Agent",
    description: "Audits skills, sales ability, confidence, time, and follow-through capacity",
  },
  {
    id: "resource" as const,
    name: "Resource Agent",
    description: "Recommends one book, one video, and one event type",
  },
  {
    id: "ceo" as const,
    name: "CEO Agent",
    description: "Makes the final decision on the primary bottleneck and next move",
  },
]
