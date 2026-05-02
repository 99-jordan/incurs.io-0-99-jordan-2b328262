import { TriageAnswers, Diagnosis, BottleneckScore, AgentAnalysis, TestCase } from './types'

const businessKeywords = ['company', 'business', 'startup', 'clients', 'sales', 'ai', 'product', 'agency', 'founder', 'revenue', 'customers', 'saas', 'app', 'platform']
const healthKeywords = ['health', 'fit', 'exercise', 'gym', 'weight', 'diet', 'sleep', 'energy', 'consistent', 'habit']
const socialKeywords = ['people', 'network', 'friends', 'community', 'environment', 'connections', 'relationships', 'meet']

function detectGoalType(goal: string): 'business' | 'health' | 'social' | 'general' {
  const lowerGoal = goal.toLowerCase()
  if (businessKeywords.some(kw => lowerGoal.includes(kw))) return 'business'
  if (healthKeywords.some(kw => lowerGoal.includes(kw))) return 'health'
  if (socialKeywords.some(kw => lowerGoal.includes(kw))) return 'social'
  return 'general'
}

function detectOverthinking(answers: TriageAnswers): boolean {
  const keywords = ['overthink', 'planning', 'research', 'analyse', 'perfect', 'ready', 'waiting', 'learn more', 'not sure']
  const combined = `${answers.goal} ${answers.weakness} ${answers.avoidance}`.toLowerCase()
  return keywords.some(kw => combined.includes(kw))
}

function detectSalesWeakness(answers: TriageAnswers): boolean {
  const keywords = ['sales', 'selling', 'outreach', 'cold', 'pitch', 'rejection', 'talking to', 'strangers', 'customers', 'clients']
  const combined = `${answers.weakness} ${answers.avoidance}`.toLowerCase()
  return keywords.some(kw => combined.includes(kw))
}

function detectValidationGap(answers: TriageAnswers): boolean {
  const keywords = ['haven\'t talked', 'no customers', 'not sure if', 'validate', 'research', 'market', 'idea', 'concept']
  const combined = `${answers.goal} ${answers.weakness} ${answers.avoidance}`.toLowerCase()
  return keywords.some(kw => combined.includes(kw))
}

function calculateBottleneckScores(answers: TriageAnswers, goalType: string): BottleneckScore[] {
  const hours = parseInt(answers.hours) || 10
  const isOverthinking = detectOverthinking(answers)
  const hasSalesWeakness = detectSalesWeakness(answers)
  const hasValidationGap = detectValidationGap(answers)
  
  const scores: BottleneckScore[] = [
    {
      name: 'Sales Readiness',
      score: hasSalesWeakness ? 3 : goalType === 'business' ? 5 : 7,
      description: hasSalesWeakness ? 'Critical gap in sales capability' : 'Moderate sales foundation'
    },
    {
      name: 'Skill Coverage',
      score: answers.skills.length > 50 ? 7 : 5,
      description: answers.skills.length > 50 ? 'Strong existing skill base' : 'Skills need development'
    },
    {
      name: 'Execution Capacity',
      score: hours >= 20 ? 8 : hours >= 10 ? 6 : 4,
      description: hours >= 20 ? 'High capacity for execution' : 'Limited execution bandwidth'
    },
    {
      name: 'Confidence Under Pressure',
      score: answers.avoidance.toLowerCase().includes('rejection') || answers.avoidance.toLowerCase().includes('fail') ? 4 : 6,
      description: 'Ability to perform when stakes are high'
    },
    {
      name: 'Market Validation',
      score: hasValidationGap ? 2 : goalType === 'business' ? 5 : 7,
      description: hasValidationGap ? 'No real-world validation yet' : 'Some market evidence exists'
    },
    {
      name: 'Support Network',
      score: answers.skills.toLowerCase().includes('network') || answers.skills.toLowerCase().includes('team') ? 7 : 4,
      description: 'Access to mentors, peers, and resources'
    },
    {
      name: 'Follow-Through Risk',
      score: isOverthinking ? 3 : 6,
      description: isOverthinking ? 'High risk of stalling' : 'Moderate completion likelihood'
    },
    {
      name: 'Action vs Planning',
      score: isOverthinking ? 2 : 7,
      description: isOverthinking ? 'Trapped in planning mode' : 'Balance of planning and action'
    }
  ]
  
  return scores
}

function generateAgentAnalyses(answers: TriageAnswers, goalType: string): AgentAnalysis[] {
  const isOverthinking = detectOverthinking(answers)
  const hasSalesWeakness = detectSalesWeakness(answers)
  const hasValidationGap = detectValidationGap(answers)
  
  return [
    {
      agent: 'Goal Agent',
      icon: '🎯',
      status: 'complete',
      finding: `Target identified: ${answers.goal.slice(0, 80)}${answers.goal.length > 80 ? '...' : ''}. ${goalType === 'business' ? 'Business-building objective detected. Sales and validation metrics activated.' : goalType === 'health' ? 'Health transformation goal. Consistency and habit formation metrics activated.' : goalType === 'social' ? 'Network expansion goal. Exposure and confidence metrics activated.' : 'General ambition detected. Full diagnostic suite active.'}`,
      severity: 'low'
    },
    {
      agent: 'Reality Agent',
      icon: '🔍',
      status: 'complete',
      finding: hasValidationGap 
        ? 'Critical gap: No evidence of real-world validation. The goal exists only in theory. You have not tested whether the market, people, or reality agrees with your plan.'
        : isOverthinking 
          ? 'Planning is being used as a substitute for action. The avoidance pattern suggests fear of real feedback.'
          : 'Reality check passed. Some foundation exists, but execution is where most goals fail.',
      severity: hasValidationGap || isOverthinking ? 'high' : 'medium'
    },
    {
      agent: 'Skill Agent',
      icon: '⚡',
      status: 'complete',
      finding: hasSalesWeakness && goalType === 'business'
        ? 'Critical skill gap: Sales. Every business is a sales business. Technical skills without sales ability creates expensive hobbies, not companies.'
        : `Skills audit: ${answers.skills.slice(0, 60)}. ${answers.weakness ? `Identified weakness: ${answers.weakness.slice(0, 40)}.` : ''} Time allocation: ${answers.hours} hours/week.`,
      severity: hasSalesWeakness && goalType === 'business' ? 'critical' : 'medium'
    },
    {
      agent: 'Resource Agent',
      icon: '📚',
      status: 'complete',
      finding: goalType === 'business'
        ? 'Resource loadout optimised for business building. Focus: sales skills, market validation frameworks, outreach templates.'
        : goalType === 'health'
          ? 'Resource loadout optimised for behaviour change. Focus: habit science, accountability systems, environment design.'
          : 'Resource loadout optimised for network expansion. Focus: social confidence, event strategy, relationship building.',
      severity: 'low'
    },
    {
      agent: 'CEO Agent',
      icon: '👔',
      status: 'complete',
      finding: 'Final analysis complete. Primary bottleneck identified. One move selected. All other activity is noise until this is resolved.',
      severity: 'high'
    }
  ]
}

export function generateDiagnosis(answers: TriageAnswers): Diagnosis {
  const goalType = detectGoalType(answers.goal)
  const isOverthinking = detectOverthinking(answers)
  const hasSalesWeakness = detectSalesWeakness(answers)
  const hasValidationGap = detectValidationGap(answers)
  const hours = parseInt(answers.hours) || 10
  
  const bottleneckMap = calculateBottleneckScores(answers, goalType)
  const lowestScore = bottleneckMap.reduce((min, b) => b.score < min.score ? b : min, bottleneckMap[0])
  const secondLowest = bottleneckMap.filter(b => b !== lowestScore).reduce((min, b) => b.score < min.score ? b : min, bottleneckMap[1])
  
  let primaryBottleneck = lowestScore.name
  let secondaryBottleneck = secondLowest.name
  let hiddenObstacle = 'Comfort zone addiction'
  let ceoDecision = ''
  let next24HourMove = ''
  let sevenDayPlan: string[] = []
  let messageTemplate = ''
  let recommendedBook = { title: '', author: '', reason: '' }
  let recommendedVideo = { title: '', channel: '', reason: '' }
  let recommendedEventType = ''
  let proofOfAction = ''
  let thingToStop = ''
  
  // Business-specific logic
  if (goalType === 'business') {
    if (hasSalesWeakness) {
      primaryBottleneck = 'Sales Readiness'
      ceoDecision = 'You cannot build a company if you cannot sell. Every founder is a salesperson first. Your technical skills are worthless until someone pays for them.'
      next24HourMove = 'Write 5 cold outreach messages to potential customers. Send them. Do not edit for perfection.'
      sevenDayPlan = [
        'Day 1: Send 5 outreach messages to potential customers',
        'Day 2: Follow up on any responses. Send 5 more messages',
        'Day 3: Book at least 1 call with a potential customer',
        'Day 4: Conduct customer discovery call. Ask what they struggle with',
        'Day 5: Refine pitch based on feedback. Send 10 more messages',
        'Day 6: Follow up on all conversations. Push for commitment',
        'Day 7: Review rejection reasons. Iterate messaging'
      ]
      messageTemplate = `Hi [Name],\n\nI noticed [specific observation about their business/situation].\n\nI'm building [brief description] that helps [specific outcome].\n\nWould you be open to a 15-minute call this week to see if this could help you?\n\nBest,\n[Your name]`
      recommendedBook = { title: '$100M Offers', author: 'Alex Hormozi', reason: 'Learn to create offers so good people feel stupid saying no' }
      recommendedVideo = { title: 'How to Sell', channel: 'Alex Hormozi', reason: 'Tactical sales framework for founders' }
      recommendedEventType = 'Industry networking event or founder meetup where potential customers gather'
      proofOfAction = 'Screenshot of 5 sent outreach messages with timestamps'
      thingToStop = 'Building features before you have paying customers'
    } else if (hasValidationGap) {
      primaryBottleneck = 'Market Validation'
      secondaryBottleneck = 'Sales Readiness'
      ceoDecision = 'You are building in a vacuum. Real companies solve real problems for real people who will pay real money. You have not proven any of this yet.'
      next24HourMove = 'Message 10 people in your target market and ask them about their biggest problem in this area.'
      sevenDayPlan = [
        'Day 1: Identify 20 people in your target market on LinkedIn/Twitter',
        'Day 2: Message 10 of them asking about their struggles',
        'Day 3: Message the other 10. Follow up on Day 2 responses',
        'Day 4: Conduct 2-3 problem discovery calls',
        'Day 5: Document patterns in problems and willingness to pay',
        'Day 6: Create rough solution concept based on real feedback',
        'Day 7: Present solution to 3 people. Ask if they would pay'
      ]
      messageTemplate = `Hi [Name],\n\nI'm researching [problem area] and noticed you work in [their field].\n\nI'd love to hear: what's your biggest frustration with [specific topic]?\n\nJust trying to understand the problem better before building anything.\n\nThanks,\n[Your name]`
      recommendedBook = { title: 'The Mom Test', author: 'Rob Fitzpatrick', reason: 'Learn to ask questions that reveal truth, not validation' }
      recommendedVideo = { title: 'Customer Discovery Masterclass', channel: 'Y Combinator', reason: 'How to validate before building' }
      recommendedEventType = 'Industry conference or professional meetup where your target customers spend time'
      proofOfAction = 'Document with 10 customer conversations summarised'
      thingToStop = 'Building product before talking to customers'
    } else if (isOverthinking) {
      primaryBottleneck = 'Action vs Planning'
      hiddenObstacle = 'Avoidance through planning'
      ceoDecision = 'Planning feels productive but produces nothing. You are using research as armour against rejection. The market does not care about your plans.'
      next24HourMove = 'Take the smallest possible action towards revenue. Email one person who might pay.'
      sevenDayPlan = [
        'Day 1: Stop all planning. Send 1 email to potential customer',
        'Day 2: Send 3 more outreach messages. No more research',
        'Day 3: Follow up on any responses. Send 5 more messages',
        'Day 4: Book a call with anyone who responds',
        'Day 5: Conduct call. Ask about their problems and budget',
        'Day 6: Send 10 more messages. Follow up on all conversations',
        'Day 7: Count responses. This is your real market feedback'
      ]
      messageTemplate = `Hi [Name],\n\nI help [target audience] with [specific problem].\n\nWould a quick chat be useful to see if I can help?\n\n[Your name]`
      recommendedBook = { title: 'The War of Art', author: 'Steven Pressfield', reason: 'Understanding resistance and how to defeat it' }
      recommendedVideo = { title: 'Bias Towards Action', channel: 'Naval Ravikant', reason: 'Why execution beats planning every time' }
      recommendedEventType = 'Accountability mastermind or founder co-working session'
      proofOfAction = 'List of actions taken today with timestamps'
      thingToStop = 'Reading about how to start. Start.'
    } else {
      ceoDecision = `Primary bottleneck: ${primaryBottleneck}. Address this before everything else. All other progress is an illusion until this is fixed.`
      next24HourMove = 'Take one action that directly addresses your primary bottleneck.'
      sevenDayPlan = [
        'Day 1: Define exactly what fixing the bottleneck looks like',
        'Day 2: Take first concrete action towards resolution',
        'Day 3: Measure progress. Adjust approach if needed',
        'Day 4: Continue daily action. Document learnings',
        'Day 5: Review progress. Double down on what works',
        'Day 6: Seek feedback from someone ahead of you',
        'Day 7: Plan next week based on results, not theory'
      ]
      recommendedBook = { title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz', reason: 'Real talk about building companies' }
      recommendedVideo = { title: 'How to Start a Startup', channel: 'Y Combinator', reason: 'Foundation principles from the best' }
      recommendedEventType = 'Founder peer group or industry-specific conference'
      proofOfAction = 'Evidence that you took action on your bottleneck today'
      thingToStop = 'Avoiding the hardest task on your list'
    }
  }
  // Health-specific logic
  else if (goalType === 'health') {
    primaryBottleneck = 'Follow-Through Risk'
    secondaryBottleneck = 'Execution Capacity'
    hiddenObstacle = 'Environment working against you'
    ceoDecision = 'Health goals fail because of systems, not willpower. Your environment is designed for your old behaviour. Redesign the environment first.'
    next24HourMove = 'Remove one friction point from your desired behaviour. Add one friction point to your undesired behaviour.'
    sevenDayPlan = [
      'Day 1: Audit your environment. What makes healthy choices hard?',
      'Day 2: Remove or hide 3 things that trigger bad habits',
      'Day 3: Add visual cues for your desired behaviour',
      'Day 4: Complete your target activity at 50% intensity',
      'Day 5: Increase to 75% intensity. Track completion',
      'Day 6: Full intensity. Celebrate with non-food reward',
      'Day 7: Review what worked. Lock in the new routine'
    ]
    recommendedBook = { title: 'Atomic Habits', author: 'James Clear', reason: 'The science of habit formation and environment design' }
    recommendedVideo = { title: 'The Science of Making & Breaking Habits', channel: 'Andrew Huberman', reason: 'Neuroscience-backed habit protocols' }
    recommendedEventType = 'Group fitness class or accountability partner workout'
    proofOfAction = 'Photo of environment change you made today'
    thingToStop = 'Relying on motivation instead of systems'
  }
  // Social-specific logic
  else if (goalType === 'social') {
    primaryBottleneck = 'Confidence Under Pressure'
    secondaryBottleneck = 'Support Network'
    hiddenObstacle = 'Comfort with current social circle'
    ceoDecision = 'You will not meet better people by accident. Exposure is a skill. The discomfort you feel is the cost of growth. Pay it or stay where you are.'
    next24HourMove = 'Find one event happening this week with people you want to meet. Register for it.'
    sevenDayPlan = [
      'Day 1: Find 3 events in your area with your target people',
      'Day 2: Register for at least 1. Put it in your calendar',
      'Day 3: Research 3 people who might attend. Prepare questions',
      'Day 4: Attend the event. Talk to minimum 5 new people',
      'Day 5: Follow up with everyone you met via LinkedIn/email',
      'Day 6: Suggest a 1-1 coffee with the most interesting person',
      'Day 7: Review what worked. Book next week\'s event'
    ]
    messageTemplate = `Hi [Name],\n\nGreat meeting you at [event]. I really enjoyed our conversation about [topic].\n\nWould you be up for a coffee sometime? I'd love to hear more about [their work/interest].\n\nBest,\n[Your name]`
    recommendedBook = { title: 'Never Eat Alone', author: 'Keith Ferrazzi', reason: 'Strategic networking without feeling transactional' }
    recommendedVideo = { title: 'How to Network', channel: 'Naval Ravikant', reason: 'Building genuine relationships that compound' }
    recommendedEventType = 'Industry conference, professional meetup, or interest-based community event'
    proofOfAction = 'Screenshot of event registration confirmation'
    thingToStop = 'Waiting for better people to find you'
  }
  // General goal logic
  else {
    ceoDecision = `Your primary bottleneck is ${primaryBottleneck}. Everything else is a distraction until this is fixed.`
    next24HourMove = 'Take one concrete action that directly addresses your primary bottleneck. Not planning. Action.'
    sevenDayPlan = [
      'Day 1: Define what success looks like for this week',
      'Day 2: Take your first action. Any action beats planning',
      'Day 3: Measure what happened. Adjust if needed',
      'Day 4: Increase intensity. Push past comfort',
      'Day 5: Seek feedback from someone who has done this',
      'Day 6: Double down on what worked. Drop what didn\'t',
      'Day 7: Review results. Set next week\'s target based on evidence'
    ]
    recommendedBook = { title: 'The Obstacle Is the Way', author: 'Ryan Holiday', reason: 'Turn your blockers into advantages' }
    recommendedVideo = { title: 'How to Get What You Want', channel: 'Naval Ravikant', reason: 'First principles thinking about goals' }
    recommendedEventType = 'Accountability group or mastermind with people chasing similar goals'
    proofOfAction = 'Photo or screenshot proving you took action today'
    thingToStop = 'Consuming content about your goal instead of doing it'
  }
  
  // Calculate overall score
  const avgBottleneckScore = bottleneckMap.reduce((sum, b) => sum + b.score, 0) / bottleneckMap.length
  const overallScore = Math.round(avgBottleneckScore * 10)
  
  // Risk if unchanged
  const riskIfUnchanged = overallScore < 40 
    ? 'High probability of abandonment within 30 days. The goal will join the graveyard of good intentions.'
    : overallScore < 60
      ? 'Progress will stall within 60 days. You will find reasons to pivot or pause.'
      : 'Moderate execution risk. Without addressing bottlenecks, progress will slow after initial momentum.'
  
  // Current advantage
  const highestScore = bottleneckMap.reduce((max, b) => b.score > max.score ? b : max, bottleneckMap[0])
  const currentAdvantage = `${highestScore.name} (${highestScore.score}/10): ${highestScore.description}. Build on this strength.`
  
  return {
    primaryBottleneck,
    secondaryBottleneck,
    hiddenObstacle,
    currentAdvantage,
    riskIfUnchanged,
    bottleneckMap,
    ceoDecision,
    next24HourMove,
    sevenDayPlan,
    recommendedBook,
    recommendedVideo,
    recommendedEventType,
    messageTemplate,
    proofOfAction,
    thingToStop,
    overallScore
  }
}

export function getAgentAnalyses(answers: TriageAnswers): AgentAnalysis[] {
  const goalType = detectGoalType(answers.goal)
  return generateAgentAnalyses(answers, goalType)
}

export const testCases: TestCase[] = [
  {
    id: '1',
    goal: 'I want to build an AI company but keep overthinking.',
    primaryBottleneck: 'Sales Readiness',
    ceoNextMove: 'Send 5 cold outreach messages to potential customers today. Stop building. Start selling.',
    resourceRecommendation: '$100M Offers by Alex Hormozi — Learn to create offers people cannot refuse.',
    score: 82,
    pass: true,
    diagnosisNotes: 'Detected business goal with overthinking pattern. Prioritised sales readiness and market validation. Hidden obstacle: avoidance through planning.'
  },
  {
    id: '2',
    goal: 'I want to get healthier but never stay consistent.',
    primaryBottleneck: 'Follow-Through Risk',
    ceoNextMove: 'Remove one friction point from healthy behaviour. Add one friction point to unhealthy behaviour.',
    resourceRecommendation: 'Atomic Habits by James Clear — The science of habit formation and environment design.',
    score: 75,
    pass: true,
    diagnosisNotes: 'Detected health goal with consistency pattern. Prioritised execution capacity and follow-through risk. Hidden obstacle: environment working against goals.'
  },
  {
    id: '3',
    goal: 'I want to meet better people and change my environment.',
    primaryBottleneck: 'Confidence Under Pressure',
    ceoNextMove: 'Find one event this week with people you want to meet. Register for it today.',
    resourceRecommendation: 'Never Eat Alone by Keith Ferrazzi — Strategic networking without feeling transactional.',
    score: 78,
    pass: true,
    diagnosisNotes: 'Detected social/network goal. Prioritised exposure, confidence, and support network. Hidden obstacle: comfort with current circle.'
  }
]
