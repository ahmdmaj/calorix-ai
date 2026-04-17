'use client'

import { Bot } from 'lucide-react'

export function LoadingMessage() {
  return (
    <div className="flex gap-4 justify-start">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Bot className="h-4 w-4 text-accent-foreground" />
      </div>
      <div className="rounded-2xl bg-card px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
