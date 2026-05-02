"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Shield, Download, Trash2, Brain, Database, BarChart3 } from "lucide-react"
import { downloadUserData, deleteAllUserData, saveConsent, type GDPRConsent } from "@/lib/gdpr"

interface PrivacySettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consent: GDPRConsent | null
  onConsentChange: (consent: GDPRConsent | null) => void
  onDataDeleted: () => void
}

export function PrivacySettings({
  open,
  onOpenChange,
  consent,
  onConsentChange,
  onDataDeleted,
}: PrivacySettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [memoryStorage, setMemoryStorage] = useState(consent?.memoryStorage ?? true)

  const handleSavePreferences = () => {
    if (!consent) return
    const updated: GDPRConsent = {
      ...consent,
      analytics,
      memoryStorage,
      timestamp: new Date(),
    }
    saveConsent(updated)
    onConsentChange(updated)
    onOpenChange(false)
  }

  const handleExportData = () => {
    downloadUserData()
  }

  const handleDeleteData = () => {
    deleteAllUserData()
    onConsentChange(null)
    onDataDeleted()
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              <DialogTitle>Privacy Settings</DialogTitle>
            </div>
            <DialogDescription>
              Manage your data and privacy preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Data Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Data Preferences</h3>

              <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
                {/* AI Processing - Always on */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Brain className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">AI Processing</p>
                      <p className="text-xs text-muted-foreground">Required for diagnosis</p>
                    </div>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Memory Storage */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Database className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Persistent Memory</p>
                      <p className="text-xs text-muted-foreground">Remember patterns across sessions</p>
                    </div>
                  </div>
                  <Switch checked={memoryStorage} onCheckedChange={setMemoryStorage} />
                </div>

                {/* Analytics */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Usage Analytics</p>
                      <p className="text-xs text-muted-foreground">Anonymous usage data</p>
                    </div>
                  </div>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} />
                </div>
              </div>
            </div>

            {/* Data Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Your Data</h3>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="justify-start"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Data
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Data is stored locally on your device. Conversations older than 90 days are automatically deleted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your conversations, memory, and preferences. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
