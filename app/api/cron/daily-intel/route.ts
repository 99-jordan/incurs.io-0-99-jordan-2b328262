import { generateText, wrapLanguageModel } from "ai"
import { createMistral } from "@ai-sdk/mistral"
import { mubitMemoryMiddleware } from "@mubit-ai/ai-sdk"
import { after } from "next/server"

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
})

function fallbackSummary() {
  return [
    "Daily Intel fallback summary:",
    "- Event: local founder or small business networking event.",
    "- Book: The Mom Test by Rob Fitzpatrick.",
    "- Video: customer discovery or cold outreach walkthrough.",
    "- Deep dive: customer discovery scripts and objection logging.",
    "- Opportunity: identify five local businesses with visible workflow friction and request one discovery call.",
  ].join("\n")
}

export async function GET(req: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { ok: false, message: "Daily Intel cron is disabled because CRON_SECRET is missing" },
      { status: 503 },
    )
  }

  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false, message: "Unauthorised" }, { status: 401 })
  }

  const mode = process.env.BRIGHTDATA_API_KEY ? "fallback" : "fallback"
  const summary = fallbackSummary()

  if (process.env.MISTRAL_API_KEY && process.env.MUBIT_API_KEY) {
    const model = wrapLanguageModel({
      model: mistral("mistral-large-latest"),
      middleware: mubitMemoryMiddleware({
        apiKey: process.env.MUBIT_API_KEY,
        sessionId: "incurs-demo-user",
        userId: "incurs-demo-user",
        agentId: "incurs-daily-intel",
        injectLessons: false,
        captureInteractions: true,
        scheduleIngest: (task) => after(task()),
        failOpen: true,
      }) as unknown as Parameters<typeof wrapLanguageModel>[0]["middleware"],
    })

    await generateText({
      model,
      prompt: [
        "Capture this public Daily Intel summary as useful opportunity context for incurs.io.",
        "Only store aggregate public opportunity signals. Do not store personal data about public people.",
        "",
        summary,
      ].join("\n"),
    })
  }

  return Response.json({
    ok: true,
    message: "Daily Intel refreshed",
    timestamp: new Date().toISOString(),
    mode,
  })
}
