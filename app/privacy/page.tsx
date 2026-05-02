import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy - incurs.io",
  description: "How we handle your data and protect your privacy",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to app
          </Button>
        </Link>

        <article className="prose prose-invert max-w-none">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground">
              incurs.io (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal data when you use our multi-agent triage system.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">2. Data We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-foreground">Conversation Data:</strong> Messages you send to our AI agents, including your goals, challenges, and responses to diagnostic questions.</p>
              <p><strong className="text-foreground">Armour Memory:</strong> Persistent insights extracted from your conversations, such as identified bottlenecks, advantages, and commitments.</p>
              <p><strong className="text-foreground">Preferences:</strong> Your consent choices and app settings.</p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">3. How We Use Your Data</h2>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>To provide personalised diagnosis and action plans</li>
              <li>To maintain continuity across your sessions (if memory storage is enabled)</li>
              <li>To improve our diagnostic algorithms (only if analytics consent is given)</li>
              <li>To enforce data retention policies (auto-delete after 90 days)</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">4. Data Storage and Security</h2>
            <div className="space-y-4 text-muted-foreground">
              <p><strong className="text-foreground">Local Storage:</strong> Your conversation history and preferences are stored locally on your device using browser localStorage.</p>
              <p><strong className="text-foreground">AI Processing:</strong> Messages are sent to AI providers (OpenAI) for processing. We do not store your messages on our servers beyond what is necessary for real-time processing.</p>
              <p><strong className="text-foreground">No Third-Party Sharing:</strong> We do not sell or share your personal data with third parties for marketing purposes.</p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">5. Your Rights (GDPR)</h2>
            <p className="mb-4 text-muted-foreground">Under GDPR, you have the following rights:</p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li><strong className="text-foreground">Right to Access:</strong> Export all your data at any time via Privacy Settings</li>
              <li><strong className="text-foreground">Right to Rectification:</strong> Edit or correct your information through the app</li>
              <li><strong className="text-foreground">Right to Erasure:</strong> Delete all your data permanently via Privacy Settings</li>
              <li><strong className="text-foreground">Right to Restrict Processing:</strong> Disable memory storage while still using the app</li>
              <li><strong className="text-foreground">Right to Data Portability:</strong> Export your data in JSON format</li>
              <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Change your preferences or delete your data at any time</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">6. Data Retention</h2>
            <p className="text-muted-foreground">
              Conversations are automatically deleted after 90 days. You can delete all your data at any time through Privacy Settings. When you delete your data, it is permanently removed from your device.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">7. AI Processing</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Your messages are processed by AI models (currently OpenAI GPT-4) to generate diagnoses and recommendations. This processing is essential to provide the core functionality of incurs.io.
              </p>
              <p>
                AI processing is covered by OpenAI&apos;s data processing agreement. Your conversations are not used to train AI models when processed through the Vercel AI Gateway.
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use browser localStorage for essential functionality. We do not use tracking cookies. If you enable analytics, we collect anonymous usage data to improve the app.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related enquiries or to exercise your rights, please contact us at privacy@incurs.io.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this policy from time to time. If we make significant changes, we will ask for your consent again.
            </p>
          </section>
        </article>
      </div>
    </div>
  )
}
