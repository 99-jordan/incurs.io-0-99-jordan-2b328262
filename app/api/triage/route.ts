import { streamText, convertToModelMessages, wrapLanguageModel, type UIMessage } from "ai"
import { createMistral } from "@ai-sdk/mistral"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import { after } from "next/server"

// Mistral: French company, EU-hosted, GDPR-compliant, no training on API data.
const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
})

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

DIAGNOSIS FRAMEWORK:
You are analysing 8 bottleneck dimensions:
1. Clarity — Do they know exactly what success looks like?
2. Validation — Have they tested their assumptions with reality?
3. Capability — Do they have the skills required?
4. Capacity — Do they have the time, energy, and resources?
5. Confidence — Do they believe they can do this?
6. Support — Do they have the right people around them?
7. Follow-through — Have they historically finished what they started?
8. Avoidance — Are they avoiding the hardest action?

SPECIALIST LENSES:
- Goal Agent: Is the goal specific, measurable, and genuinely theirs?
- Reality Agent: What's the actual current state? What have they tried?
- Skill Agent: What capabilities are missing? What's their learning edge?
- Resource Agent: Time, money, energy, connections — what's the true constraint?
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
  "bottleneckScores": [
    {"category": "clarity", "score": 7, "label": "Clarity", "description": "Assessment"},
    {"category": "validation", "score": 4, "label": "Validation", "description": "Assessment"},
    {"category": "capability", "score": 6, "label": "Capability", "description": "Assessment"},
    {"category": "capacity", "score": 5, "label": "Capacity", "description": "Assessment"},
    {"category": "confidence", "score": 8, "label": "Confidence", "description": "Assessment"},
    {"category": "support", "score": 6, "label": "Support", "description": "Assessment"},
    {"category": "follow_through", "score": 5, "label": "Follow-through", "description": "Assessment"},
    {"category": "avoidance", "score": 3, "label": "Avoidance", "description": "Assessment"}
  ],
  "next24HourMove": "One specific action they can do tomorrow",
  "sevenDayPlan": ["Day 1-2 action", "Day 3-4 action", "Day 5-7 action"],
  "recommendedBook": "One book that addresses their specific bottleneck",
  "recommendedVideo": "One video or talk that would help",
  "recommendedEventType": "Type of event they should attend",
  "messageTemplate": "Exact message they can send to someone to take action",
  "proofOfAction": "What evidence they should send you to prove they did it",
  "stopDoing": "One thing they should stop doing immediately",
  "memoryUpdate": "What should be remembered about this user for future sessions — write as a clear lesson, e.g. 'User repeatedly stalls when sales calls are required; their advantage is technical depth.'"
}
</triage>

Continue the conversation naturally after the diagnosis. Ask if they want to commit to the action.

Use British English. Be sharp. Be kind. Be useful.`

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, userId, chatId }: { messages: UIMessage[]; userId?: string; chatId?: string } = body

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
          }),
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
    memory: HAS_MUBIT ? "mubit" : "session-only",
    model: "mistral-large-latest",
    region: "eu",
  })
}
