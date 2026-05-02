import { generateText, wrapLanguageModel } from "ai"
import { createMistral } from "@ai-sdk/mistral"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import { after } from "next/server"

const HAS_MISTRAL = Boolean(process.env.MISTRAL_API_KEY)
const HAS_MUBIT = Boolean(process.env.MUBIT_API_KEY)

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const {
    memoryType,
    memoryText,
    goal,
    primaryBottleneck,
    proofOfAction,
    nextCheckInQuestion,
    userId,
  }: {
    memoryType?: string
    memoryText?: string
    goal?: string
    primaryBottleneck?: string
    proofOfAction?: string
    nextCheckInQuestion?: string
    userId?: string
  } = body

  if (!memoryText?.trim()) {
    return Response.json({ success: false, error: "memoryText is required", mode: "demo" }, { status: 400 })
  }

  if (!HAS_MISTRAL || !HAS_MUBIT) {
    return Response.json({
      success: false,
      mode: "demo",
      message: "Demo memory updated locally. Add MISTRAL_API_KEY and MUBIT_API_KEY to save durable memory.",
    })
  }

  const sessionId = userId || "incurs-demo-user"
  const model = wrapLanguageModel({
    model: mistral("mistral-large-latest"),
    middleware: mubitMemoryMiddleware({
      apiKey: process.env.MUBIT_API_KEY!,
      sessionId,
      userId: sessionId,
      agentId: "incurs-memory",
      injectLessons: false,
      captureInteractions: true,
      scheduleIngest: (task) => after(task()),
      failOpen: true,
    }) as unknown as Parameters<typeof wrapLanguageModel>[0]["middleware"],
  })

  await generateText({
    model,
    prompt: [
      "Capture the following as durable execution memory for this user.",
      "Prioritise useful patterns, commitments, bottlenecks and proof of action.",
      "Do not store sensitive personal details unless the user explicitly approved them.",
      "",
      `Memory type: ${memoryType || "execution-pattern"}`,
      `Memory text: ${memoryText}`,
      `Goal: ${goal || "unknown"}`,
      `Primary bottleneck: ${primaryBottleneck || "unknown"}`,
      `Proof of action: ${proofOfAction || "not provided"}`,
      `Next check-in question: ${nextCheckInQuestion || "not provided"}`,
    ].join("\n"),
  })

  return Response.json({
    success: true,
    mode: "live",
    message: "Memory saved",
  })
}
