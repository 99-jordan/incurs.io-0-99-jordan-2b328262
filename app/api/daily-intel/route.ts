function seededDailyIntel(input: {
  goal?: string
  primaryBottleneck?: string
  localArea?: string
}) {
  const localArea = input.localArea || "London"
  const bottleneck = input.primaryBottleneck || "sales readiness"

  return {
    recommendedEvent: `${localArea} founder or small business networking event`,
    recommendedBook: "The Mom Test by Rob Fitzpatrick",
    recommendedVideo: "A practical customer discovery interview walkthrough for startup founders",
    recommendedDeepDive: "Customer discovery scripts, objection logs and cold outreach teardown examples",
    recommendedOpportunity: "Research five local service businesses with visible workflow bottlenecks and ask for one short discovery call.",
    whyTheseMatch: `These resources point at ${bottleneck}: more buyer exposure, less private planning, and faster proof from the market.`,
    sources: [],
    lastRefreshed: new Date().toISOString(),
    sourceMode: "fallback" as const,
    refreshMethod: "manual" as const,
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  if (!process.env.BRIGHTDATA_API_KEY) {
    return Response.json({
      ...seededDailyIntel(body),
      intelMode: "demo",
    })
  }

  // Bright Data SDK interfaces vary by account product. Keep provider calls
  // server-side and fail closed into seeded public-signal guidance.
  try {
    return Response.json({
      ...seededDailyIntel(body),
      sourceMode: "fallback",
      intelMode: "demo",
      note: "BRIGHTDATA_API_KEY is present, but live search wiring needs the account-specific SDK endpoint.",
    })
  } catch {
    return Response.json({
      ...seededDailyIntel(body),
      intelMode: "demo",
    })
  }
}
