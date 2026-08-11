'use client'

import { useRef, useEffect } from 'react'
import { Menu, Flame } from 'lucide-react'
import { ChatMessage } from '@/components/chat-message'
import { ChatInput } from '@/components/chat-input'
import { LoadingMessage } from '@/components/loading-message'
import type { Message } from '@/lib/mock-data'
import { motion, AnimatePresence } from 'framer-motion'

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
      <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-md px-4 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-[0_0_15px_rgba(var(--accent),0.4)]">
              <Flame className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-foreground">Calorix AI</h1>
              <p className="text-xs text-muted-foreground">Your nutrition assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-[0_0_30px_rgba(var(--accent),0.5)]">
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
                  ].map((suggestion, idx) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.02, backgroundColor: 'var(--secondary)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSendMessage(suggestion)}
                      className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-4 py-3 text-left text-sm text-card-foreground hover:border-primary/50 transition-colors shadow-sm hover:shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chat-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                    >
                      <ChatMessage message={message} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <LoadingMessage />
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input */}
      <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-6 pb-2">
        <div className="mx-auto max-w-3xl px-4 py-2">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}
