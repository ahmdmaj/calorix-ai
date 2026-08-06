'use client'

import { Bot } from 'lucide-react'

export function LoadingMessage() {
  return (
    <div className="flex gap-4 justify-start animate-in fade-in duration-300">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Bot className="h-4 w-4 text-accent-foreground" />
      </div>
      <div className="rounded-2xl bg-card border border-border px-4 py-3 shadow-sm w-full max-w-[250px]">
        <div className="space-y-3">
          <div className="h-4 bg-secondary rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-secondary rounded w-1/2 animate-pulse"></div>
          <div className="h-3 bg-secondary rounded w-5/6 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
