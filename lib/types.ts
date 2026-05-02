export interface TriageAnswers {
  goal: string
  skills: string
  weakness: string
  hours: string
  avoidance: string
}

export interface BottleneckScore {
  name: string
  score: number
  description: string
}

export interface AgentAnalysis {
  agent: string
  icon: string
  status: 'analysing' | 'complete'
  finding: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface Diagnosis {
  primaryBottleneck: string
  secondaryBottleneck: string
  hiddenObstacle: string
  currentAdvantage: string
  riskIfUnchanged: string
  bottleneckMap: BottleneckScore[]
  ceoDecision: string
  next24HourMove: string
  sevenDayPlan: string[]
  recommendedBook: {
    title: string
    author: string
    reason: string
  }
  recommendedVideo: {
    title: string
    channel: string
    reason: string
  }
  recommendedEventType: string
  messageTemplate: string
  proofOfAction: string
  thingToStop: string
  overallScore: number
}

export interface TestCase {
  id: string
  goal: string
  primaryBottleneck: string
  ceoNextMove: string
  resourceRecommendation: string
  score: number
  pass: boolean
  diagnosisNotes: string
}

export type TriageStep = 0 | 1 | 2 | 3 | 4 | 5
