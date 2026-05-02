import { streamText, convertToModelMessages, wrapLanguageModel, type UIMessage } from "ai"
import { createMistral } from "@ai-sdk/mistral"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import { after } from "next/server"
import { buildDemoTriageResult } from "@/lib/triage-demo"

// Mistral: French company, EU-hosted, GDPR-compliant, no training on API data.
const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
})

const HAS_MISTRAL = Boolean(process.env.MISTRAL_API_KEY)
const HAS_MUBIT = Boolean(process.env.MUBIT_API_KEY)

// System prompt that defines the CEO Agent behaviour
const SYSTEM_PROMPT = `You are the CEO Agent of incurs.io — an adaptive armour system for ambitious people.

Your role is to have a natural conversation that diagnoses the real bottleneck behind someone's goal, then prescribe one practical next move.

LONG-TERM MEMORY:
You have access to long-term memory of this user across all previous sessions through the Armour Memory layer. Use what you remember about their previous goals, bottlenecks, commitments, and proof of action. Refer to past lessons by name. If they previously committed to something, ask how it went. If you see a repeated bottleneck, name it.

CONVERSATION STYLE:
- Be direct but warm. No fluff. No generic motivation.
- Ask one question at a time. Let the conversation breathe.
- Challenge gently when you sense avoidance or vagueness.
- Remember and reference what the user has told you across all sessions, not just this one.

TRIAGE AREAS:
Cover these naturally, one at a time:
1. Goal clarity
2. Existing skills and advantages
3. Weakest skill, behaviour or resource
4. Available focused hours
5. Uncomfortable action being avoided

Do not dump all questions at once. During triage, each incurs.io message should usually be one short reflection and one clear question.

DIAGNOSIS FRAMEWORK:
Score these bottleneck dimensions from 0 to 10:
- salesReadiness
- skillCoverage
- executionCapacity
- confidenceUnderPressure
- marketValidation
- supportNetwork
- followThroughRisk

Business goal logic:
- If the goal mentions company, business, startup, clients, sales, AI, product, agency, software, SaaS or building a company, prioritise sales readiness, market validation, outreach, confidence and execution capacity.
- If sales ability is weak, make sales readiness the primary bottleneck.
- If they have not spoken to real buyers, make market validation primary or secondary.
- If they are overthinking, researching, planning or waiting until ready, name avoidance through planning as the hidden obstacle.

SPECIALIST LENSES:
- Goal Agent: Is the goal specific, measurable, and genuinely theirs?
- Reality Agent: What's the actual current state? What have they tried?
- Skill Agent: What capabilities are missing? What's their learning edge?
- Resource Agent: Recommends one book, one video, one event type and one useful deep dive based on the bottleneck.
- CEO Agent: You. Make the final call on what matters most.

WHEN READY TO DIAGNOSE:
After gathering enough context (usually 4-8 exchanges), provide a structured diagnosis:

<triage>
{
  "primaryBottleneck": "The main thing stopping them",
  "secondaryBottleneck": "The second constraint",
  "hiddenObstacle": "What they're not seeing or admitting",
  "currentAdvantage": "Their strongest asset right now",
  "riskIfUnchanged": "What happens if they don't act",
  "bottleneckScores": {
    "salesReadiness": 3,
    "skillCoverage": 6,
    "executionCapacity": 7,
    "confidenceUnderPressure": 4,
    "marketValidation": 2,
    "supportNetwork": 5,
    "followThroughRisk": 6
  },
  "goalAgentDiagnosis": "Specialist input",
  "realityAgentDiagnosis": "Specialist input",
  "skillAgentDiagnosis": "Specialist input",
  "resourceAgentRecommendation": "Specialist input",
  "ceoFinalDecision": "The direct decision",
  "next24HourMove": "One specific action they can do tomorrow",
  "sevenDayPlan": ["Day 1 action", "Day 2 action", "Day 3 action", "Day 4 action", "Day 5 action", "Day 6 action", "Day 7 action"],
  "recommendedBook": "One book that addresses their specific bottleneck",
  "recommendedVideo": "One video or talk that would help",
  "recommendedEventType": "Type of event they should attend",
  "recommendedDeepDive": "One useful guide, essay or teardown",
  "messageTemplate": "Exact message they can send to someone to take action",
  "proofOfAction": "What evidence they should send you to prove they did it",
  "stopDoing": "One thing they should stop doing immediately",
  "memoryUpdateSuggestion": "What the user can approve for Armour Memory",
  "nextCheckInQuestion": "The next question to ask later",
  "memoryMode": "live",
  "intelMode": "demo",
  "aiMode": "live"
}
</triage>

Continue the conversation naturally after the diagnosis. Ask if they want to commit to the action.

Use British English. Be sharp. Be kind. Be useful.`

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      messages,
      userId,
      chatId,
      goal,
      answers,
      localArea,
    }: {
      messages?: UIMessage[]
      userId?: string
      chatId?: string
      goal?: string
      answers?: string[]
      localArea?: string
    } = body

    if (!HAS_MISTRAL) {
      return Response.json(
        buildDemoTriageResult({
          goal,
          answers,
          messages,
          localArea,
        }),
        {
          headers: {
            "x-incurs-ai": "demo",
            "x-incurs-memory": "session-only",
          },
        },
      )
    }

    if (!messages) {
      return Response.json(
        { error: "messages are required for live conversational triage" },
        { status: 400 },
      )
    }

    // Per-user memory scope. Same user across multiple chats shares one memory base.
    const sessionId = userId || "incurs-demo-user"

    // Base provider model
    const baseModel = mistral("mistral-large-latest")

    // Wrap with Mubit if the key is present; otherwise run plain.
    // `after()` ensures memory capture survives function suspension on Vercel.
    const model = HAS_MUBIT
      ? wrapLanguageModel({
          model: baseModel,
          middleware: mubitMemoryMiddleware({
            apiKey: process.env.MUBIT_API_KEY!,
            sessionId,
            userId: sessionId,
            agentId: "incurs-ceo",
            // Inject relevant lessons before each LLM call
            injectLessons: true,
            // Capture this turn into memory after the LLM call
            captureInteractions: true,
            // Hand off the ingest task to Next so it survives the response
            scheduleIngest: (task) => after(task()),
            // Don't crash the chat if Mubit is briefly unavailable
            failOpen: true,
          }) as unknown as Parameters<typeof wrapLanguageModel>[0]["middleware"],
        })
      : baseModel

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
      // Pass useful metadata that Mubit can attach to memory entries
      experimental_telemetry: {
        isEnabled: false,
      },
    })

    return result.toUIMessageStreamResponse({
      headers: {
        "x-incurs-ai": "live",
        "x-incurs-memory": HAS_MUBIT ? "mubit" : "session-only",
        "x-incurs-session": sessionId,
        ...(chatId ? { "x-incurs-chat": chatId } : {}),
      },
    })
  } catch (error) {
    console.error("[v0] Triage API error:", error)
    return new Response(
      JSON.stringify({ error: "Failed to process triage request", details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

// Public health check so the client can show a "Memory active" badge
export async function GET() {
  return Response.json({
    ai: HAS_MISTRAL ? "mistral" : "demo",
    memory: HAS_MUBIT ? "mubit" : "session-only",
    intel: process.env.BRIGHTDATA_API_KEY ? "live" : "demo",
    cron: process.env.CRON_SECRET ? "enabled" : "manual-only",
    model: "mistral-large-latest",
    region: "eu",
  })
}
