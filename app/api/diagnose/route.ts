import { generateObject, wrapLanguageModel } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export const maxDuration = 60

const diagnosisSchema = z.object({
  primaryBottleneck: z.string().describe("The main thing blocking progress"),
  secondaryBottleneck: z.string().describe("A secondary issue to address"),
  hiddenObstacle: z.string().describe("What they are not seeing or avoiding"),
  currentAdvantage: z.string().describe("Their strongest asset right now"),
  riskIfUnchanged: z.string().describe("What happens if they don't act"),
  bottleneckScores: z.object({
    salesReadiness: z.number().min(1).max(10),
    skillCoverage: z.number().min(1).max(10),
    executionCapacity: z.number().min(1).max(10),
    confidenceUnderPressure: z.number().min(1).max(10),
    marketValidation: z.number().min(1).max(10),
    supportNetwork: z.number().min(1).max(10),
    followThroughRisk: z.number().min(1).max(10),
  }),
  ceoDecision: z.string().describe("The CEO Agent's final verdict"),
  next24HourMove: z.string().describe("One specific action for the next 24 hours"),
  sevenDayPlan: z.array(z.string()).max(3).describe("2-3 actions for the next 7 days"),
  recommendedBook: z.string().describe("One book recommendation with author"),
  recommendedVideo: z.string().describe("One video or talk recommendation"),
  recommendedEventType: z.string().describe("Type of event or community to join"),
  messageTemplate: z.string().describe("A message template they can use for outreach"),
  proofOfAction: z.string().describe("How they will prove they took action"),
  stopDoing: z.string().describe("One thing they should stop doing immediately"),
  memoryUpdate: z.string().describe("What should be remembered from this conversation"),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { conversationContext, userId } = body

  const hasMubit = !!process.env.MUBIT_API_KEY
  
  let model = openai("gpt-4o")

  if (hasMubit) {
    try {
      const { mubitMemoryMiddleware } = await import("@mubit-ai/ai-sdk")
      const sessionId = userId ? `incurs:${userId}` : "incurs-demo-user"
      
      model = wrapLanguageModel({
        model: openai("gpt-4o"),
        middleware: mubitMemoryMiddleware({
          apiKey: process.env.MUBIT_API_KEY!,
          sessionId,
        }),
      }) as typeof model
    } catch {
      console.log("[v0] Mubit middleware not available")
    }
  }

  const result = await generateObject({
    model,
    schema: diagnosisSchema,
    prompt: `Based on this conversation, generate a structured diagnosis for the user.

Conversation:
${conversationContext}

Be honest, direct, and practical.
Do not motivate vaguely.
Do not create a huge plan.
Give one clear next move.
Focus on execution, not inspiration.`,
  })

  return Response.json(result.object)
}
