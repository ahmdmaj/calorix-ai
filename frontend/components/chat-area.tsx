'use client'

import { useRef, useEffect } from 'react'
import { Menu, Flame } from 'lucide-react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { LoadingMessage } from '@/components/loading-message'
import type { Message } from '@/lib/mock-data'

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => void
  onOpenSidebar: () => void
}

export function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onOpenSidebar,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Flame className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground">CalorieAI</h1>
              <p className="text-xs text-muted-foreground">Your nutrition assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                <Flame className="h-8 w-8 text-accent-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">
                Start tracking your calories
              </h2>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Tell me what you&apos;ve eaten and I&apos;ll help you track calories, macros, and
                reach your health goals.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'I had a chicken sandwich for lunch',
                  'What calories are in an avocado?',
                  'Log my breakfast: eggs and toast',
                  'Show my daily summary',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSendMessage(suggestion)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-card-foreground hover:bg-secondary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && <LoadingMessage />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}
