"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Brain, Database, BarChart3 } from "lucide-react"
import type { GDPRConsent } from "@/lib/gdpr"

interface ConsentBannerProps {
  onAccept: (consent: GDPRConsent) => void
  onDecline: () => void
}

export function ConsentBanner({ onAccept, onDecline }: ConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [memoryStorage, setMemoryStorage] = useState(true)

  const handleAcceptAll = () => {
    onAccept({
      version: "1.0",
      essential: true,
      analytics: true,
      aiProcessing: true,
      memoryStorage: true,
      timestamp: new Date(),
    })
  }

  const handleAcceptSelected = () => {
    onAccept({
      version: "1.0",
      essential: true,
      analytics,
      aiProcessing: true,
      memoryStorage,
      timestamp: new Date(),
    })
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2">
      <Card className="border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <CardTitle className="text-base">Data Protection</CardTitle>
          </div>
          <CardDescription className="text-xs">
            incurs.io processes your data to provide personalised diagnosis and actionable insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          <p className="text-xs text-muted-foreground">
            We use AI to analyse your goals. Your data is stored locally on your device.
          </p>

          {showDetails ? (
            <div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
              {/* Essential - Always on */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Essential</p>
                    <p className="text-xs text-muted-foreground">Required for the app to function</p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>

              {/* AI Processing - Required */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Brain className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">AI Processing</p>
                    <p className="text-xs text-muted-foreground">Your messages are processed by AI to generate diagnoses</p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>

              {/* Memory Storage - Optional */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Persistent Memory</p>
                    <p className="text-xs text-muted-foreground">Remember your patterns across sessions</p>
                  </div>
                </div>
                <Switch checked={memoryStorage} onCheckedChange={setMemoryStorage} />
              </div>

              {/* Analytics - Optional */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Usage Analytics</p>
                    <p className="text-xs text-muted-foreground">Help improve the app with anonymous usage data</p>
                  </div>
                </div>
                <Switch checked={analytics} onCheckedChange={setAnalytics} />
              </div>
            </div>
          ) : null}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            {showDetails ? "Hide details" : "Customise settings"}
          </button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Decline
          </Button>
          {showDetails ? (
            <Button onClick={handleAcceptSelected} className="w-full sm:w-auto">
              Accept Selected
            </Button>
          ) : (
            <Button onClick={handleAcceptAll} className="w-full sm:w-auto">
              Accept All
            </Button>
          )}
        </CardFooter>

        <div className="border-t border-border px-6 py-3">
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/privacy" className="text-accent underline-offset-4 hover:underline">
              Privacy Policy
            </a>
            . You can change your preferences or delete your data at any time.
          </p>
        </div>
      </Card>
    </div>
  )
}
