'use client'

import { Diagnosis } from '@/lib/types'
import { BookOpen, Play, Calendar } from 'lucide-react'

interface ResourceLoadoutProps {
  diagnosis: Diagnosis | null
  isActive?: boolean
}

export function ResourceLoadout({ diagnosis, isActive = false }: ResourceLoadoutProps) {
  if (!isActive || !diagnosis) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold text-sm mb-2">Resource Loadout</h3>
        <p className="text-sm text-muted-foreground">
          Resources will be curated based on your diagnosis.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <h3 className="font-semibold mb-4">Resource Loadout</h3>
      
      <div className="space-y-4">
        {/* Book */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
            <BookOpen className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Book</p>
            <p className="font-medium text-sm">{diagnosis.recommendedBook.title}</p>
            <p className="text-xs text-muted-foreground">by {diagnosis.recommendedBook.author}</p>
            <p className="text-xs text-foreground/70 mt-1">{diagnosis.recommendedBook.reason}</p>
          </div>
        </div>

        {/* Video */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
            <Play className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Video</p>
            <p className="font-medium text-sm">{diagnosis.recommendedVideo.title}</p>
            <p className="text-xs text-muted-foreground">{diagnosis.recommendedVideo.channel}</p>
            <p className="text-xs text-foreground/70 mt-1">{diagnosis.recommendedVideo.reason}</p>
          </div>
        </div>

        {/* Event */}
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center shrink-0">
            <Calendar className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Event Type</p>
            <p className="text-sm text-foreground/90">{diagnosis.recommendedEventType}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
