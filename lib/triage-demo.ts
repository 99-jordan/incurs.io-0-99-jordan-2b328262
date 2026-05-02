import type { TriageResult } from "./types"

export const TRIAGE_AREAS = [
  "goal clarity",
  "existing skills and advantages",
  "weakest skill, behaviour or resource",
  "available focused hours",
  "uncomfortable action being avoided",
] as const

const businessSignals = [
  "company",
  "business",
  "startup",
  "clients",
  "sales",
  "ai",
  "product",
  "agency",
  "software",
  "saas",
]

const planningSignals = ["overthinking", "researching", "planning", "waiting until ready", "building instead of selling"]

export function getTextFromMessage(message: { parts?: unknown; content?: string }): string {
  if (typeof message.content === "string") return message.content
  if (!Array.isArray(message.parts)) return ""

  return message.parts
    .filter((part): part is { type: "text"; text: string } => {
      return Boolean(part && typeof part === "object" && (part as { type?: string }).type === "text")
    })
    .map((part) => part.text)
    .join("")
}

export function buildDemoTriageResult(input: {
  goal?: string
  answers?: string[]
  messages?: Array<{ role?: string; parts?: unknown; content?: string }>
  localArea?: string
}): TriageResult {
  const userTexts =
    input.messages
      ?.filter((message) => message.role === "user")
      .map(getTextFromMessage)
      .filter(Boolean) ?? []

  const goal = input.goal || userTexts[0] || "A serious goal that needs sharper execution."
  const answers = input.answers?.length ? input.answers : userTexts.slice(1)
  const combined = [goal, ...answers].join(" ").toLowerCase()
  const isBusinessGoal = businessSignals.some((signal) => combined.includes(signal))
  const isPlanningAvoidance = planningSignals.some((signal) => combined.includes(signal))
  const hasBuyerSignal = /buyer|customer|client|user|lead|prospect/.test(combined)
  const hasOutreachAvoidance = /cold|outreach|selling|sales|hearing no|rejection|buyer conversation/.test(combined)
  const hoursMatch = combined.match(/(\d+)\s*(focused\s*)?(hours|hrs)/)
  const focusedHours = hoursMatch ? Number(hoursMatch[1]) : 6

  const primaryBottleneck =
    isBusinessGoal && (hasOutreachAvoidance || combined.includes("sales")) ? "sales readiness" : "execution capacity"
  const secondaryBottleneck = isBusinessGoal && !hasBuyerSignal ? "market validation" : "follow through risk"
  const hiddenObstacle =
    isPlanningAvoidance || hasOutreachAvoidance
      ? "avoidance through planning"
      : "using preparation to delay proof from reality"

  return {
    primaryBottleneck,
    secondaryBottleneck,
    hiddenObstacle,
    currentAdvantage: isBusinessGoal
      ? "You already understand the product space well enough to test demand with real buyers."
      : "You have enough clarity to start testing behaviour instead of redesigning the goal.",
    riskIfUnchanged: isBusinessGoal
      ? "You keep improving the idea while the market remains untested."
      : "The goal stays emotionally important but operationally optional.",
    bottleneckScores: {
      salesReadiness: isBusinessGoal ? 3 : 5,
      skillCoverage: combined.includes("skills") || combined.includes("tools") ? 7 : 6,
      executionCapacity: focusedHours >= 10 ? 7 : 5,
      confidenceUnderPressure: hasOutreachAvoidance ? 3 : 5,
      marketValidation: hasBuyerSignal ? 5 : 2,
      supportNetwork: combined.includes("network") || combined.includes("support") ? 6 : 4,
      followThroughRisk: focusedHours >= 10 ? 5 : 7,
    },
    goalAgentDiagnosis: `The goal is serious enough to matter, but the success condition needs proof from the outside world: ${goal}`,
    realityAgentDiagnosis: isBusinessGoal
      ? "The missing evidence is buyer exposure, not another product feature."
      : "The missing evidence is repeated action under ordinary pressure.",
    skillAgentDiagnosis: isBusinessGoal
      ? "Technical skill is not the constraint. Sales confidence, outreach rhythm and rejection tolerance are."
      : "The constraint is less about knowledge and more about protected time, stamina and follow through.",
    resourceAgentRecommendation:
      "Use resources only to support action. Read or watch enough to improve the next conversation, then act.",
    ceoFinalDecision: isBusinessGoal
      ? "Stop building in private. Speak to real buyers before you add another feature."
      : "Stop redesigning the system. Prove the habit with one visible action each day.",
    next24HourMove: isBusinessGoal
      ? "Send three direct outreach messages and book one buyer conversation."
      : "Choose one commitment, do it for 30 minutes, and record visible proof.",
    sevenDayPlan: isBusinessGoal
      ? [
          "Write a one-sentence offer for the buyer you most understand.",
          "Send three outreach messages using the template.",
          "Ask one buyer what breaks in their current workflow.",
          "Log the objections without defending the product.",
          "Adjust the offer from evidence, not taste.",
          "Send five more messages to the same buyer type.",
          "Decide whether the signal justifies building the next feature.",
        ]
      : [
          "Define the smallest proof of action.",
          "Do it once before consuming more advice.",
          "Remove one source of friction from the environment.",
          "Repeat the action at the same time.",
          "Ask one person to check the proof.",
          "Review where pressure broke the plan.",
          "Commit to the next seven days with a smaller promise if needed.",
        ],
    recommendedBook: isBusinessGoal ? "The Mom Test by Rob Fitzpatrick" : "Atomic Habits by James Clear",
    recommendedVideo: isBusinessGoal
      ? "A customer discovery interview walkthrough for early-stage founders"
      : "A practical consistency and habit design breakdown",
    recommendedEventType: isBusinessGoal
      ? `${input.localArea || "Local"} founder or small business networking event`
      : `${input.localArea || "Local"} accountability, training or peer execution group`,
    recommendedDeepDive: isBusinessGoal
      ? "Customer discovery interview scripts and cold outreach teardown examples"
      : "Behaviour design notes on triggers, friction and commitment proof",
    messageTemplate:
      "Hi [Name], I am testing a small AI workflow idea for [specific business type]. Could I ask you three questions about where work gets stuck? No pitch unless it is useful.",
    proofOfAction: isBusinessGoal
      ? "A screenshot or log showing three outreach messages sent and one buyer conversation requested."
      : "A timestamped note showing the action completed and what made it harder than expected.",
    stopDoing: isBusinessGoal
      ? "Building another feature before speaking to real buyers."
      : "Changing the plan before the current version has been tested.",
    memoryUpdateSuggestion: `Remember that this user is working on: ${goal}. Current bottleneck: ${primaryBottleneck}. Hidden obstacle: ${hiddenObstacle}.`,
    nextCheckInQuestion: "Did you complete the 24-hour move, and what proof do you have?",
    memoryMode: "demo",
    intelMode: "demo",
    aiMode: "demo",
  }
}

export function buildDemoAssistantReply(messages: Array<{ role?: string; parts?: unknown; content?: string }>): string {
  const userMessages = messages.filter((message) => message.role === "user").map(getTextFromMessage)
  const turn = userMessages.length
  const latest = userMessages[turn - 1] || ""

  if (turn <= 1) {
    return [
      "I hear the ambition. Before I give you a plan, I need to check whether the real bottleneck is product, sales, confidence, time or validation. Most early businesses fail at the uncomfortable bit, not the idea. Let us find yours.",
      "",
      "What skills or advantages do you already have that give you a real starting point?",
    ].join("\n")
  }

  if (turn === 2) {
    return [
      "That gives you a useful base. You understand enough to start testing, but I still need to check whether buyer exposure is happening.",
      "",
      "What skill, behaviour or resource is weakest right now?",
    ].join("\n")
  }

  if (turn === 3) {
    return [
      "That sounds like the constraint is not knowledge. It is pressure, repetition and the willingness to be seen before the offer feels perfect.",
      "",
      "How many focused hours can you commit each week without pretending?",
    ].join("\n")
  }

  if (turn === 4) {
    return [
      "That is enough capacity to create proof, if the hours are protected from tinkering.",
      "",
      "What action are you avoiding because it feels uncomfortable?",
    ].join("\n")
  }

  const result = buildDemoTriageResult({ messages })
  return [
    "Running triage agents...",
    "",
    "The pattern is clear enough now. The issue is not ambition. It is where execution meets rejection risk.",
    "",
    `<triage>${JSON.stringify(result)}</triage>`,
    "",
    `CEO decision: ${result.ceoFinalDecision}`,
  ].join("\n")
}
