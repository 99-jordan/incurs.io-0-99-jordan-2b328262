function seededDailyIntel(input: {
  goal?: string
  primaryBottleneck?: string
  localArea?: string
}) {
  const localArea = input.localArea || "London"
  const bottleneck = input.primaryBottleneck || "sales readiness"
  const now = new Date()
  const displayDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London",
  }).format(now)
  const searchIntents = [
    `${localArea} founder events this week`,
    `${localArea} small business networking ${displayDate}`,
    `${localArea} customer discovery startup meetup`,
    `${localArea} local business owners networking`,
  ]

  return {
    recommendedEvent: `${localArea} founder, startup, or small business networking event this week`,
    recommendedBook: "The Mom Test by Rob Fitzpatrick",
    recommendedVideo: "A practical customer discovery interview walkthrough for startup founders",
    recommendedDeepDive: "Customer discovery scripts, objection logs and cold outreach teardown examples",
    recommendedOpportunity: `Search today for "${searchIntents[0]}" and shortlist three rooms where buyers or operators actually attend.`,
    whyTheseMatch: `These resources point at ${bottleneck}: more buyer exposure, less private planning, and faster proof from the market.`,
    searchIntents,
    localTimeContext: displayDate,
    sources: searchIntents.map((query) => ({ title: query, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` })),
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
