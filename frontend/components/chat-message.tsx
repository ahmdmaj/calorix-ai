'use client'

import { Bot, User } from 'lucide-react'
import type { Message } from '@/lib/mock-data'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAssistant
            ? 'bg-card text-card-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content.split('\n').map((line, index) => {
            // Handle bold text
            const parts = line.split(/(\*\*[^*]+\*\*)/)
            return (
              <p key={index} className={index > 0 ? 'mt-2' : ''}>
                {parts.map((part, partIndex) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <strong key={partIndex} className="font-semibold">
                        {part.slice(2, -2)}
                      </strong>
                    )
                  }
                  return <span key={partIndex}>{part}</span>
                })}
              </p>
            )
          })}
        </div>
        
        {isAssistant && message.result && (
          <div className="mt-4 space-y-3 pt-2">
            <div className="font-bold text-sm">
              Calories: {message.result.total_min} - {message.result.total_max} kcal
            </div>
            
            {message.result.activities && message.result.activities.length > 0 && (
              <div className="text-sm">
                <div className="font-medium mb-1">Activities:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {message.result.activities.map((activity, idx) => (
                    <li key={idx} className="text-foreground/90">
                      {activity.type}: {activity.duration_minutes} mins
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {message.result.disclaimer && (
              <div className="mt-4 text-[10px] text-muted-foreground/70 italic leading-tight">
                {message.result.disclaimer}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {formatTime(message.timestamp)}
        </p>
      </div>
      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
