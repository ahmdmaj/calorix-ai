'use client'

import { Bot, User, Activity, Lightbulb } from 'lucide-react'
import type { Message } from '@/lib/mock-data'
import { NutritionCard } from '@/components/nutrition-card'
import { FoodItemCard } from '@/components/food-item-card'

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Bot className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md ${
          isAssistant
            ? 'bg-card/70 border border-border/50 text-card-foreground shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]'
            : 'bg-primary/90 border border-primary/20 text-primary-foreground shadow-[0_4px_20px_-4px_rgba(var(--primary),0.3)]'
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
          <div className="mt-4 pt-2">
            
            {message.result.status === 'needs_clarification' && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Clarification Needed</p>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                  I couldn't accurately identify all the items or their quantities. Please provide more details.
                </p>
              </div>
            )}

            {message.result.food_items && message.result.food_items.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {message.result.food_items.map((item: any, idx: number) => (
                  <FoodItemCard key={idx} item={item} />
                ))}
              </div>
            )}

            {message.result.status === 'success' && (
              <NutritionCard 
                totalMin={message.result.total_min} 
                totalMax={message.result.total_max}
                proteinG={message.result.total_protein_g || 0}
                fatG={message.result.total_fat_g || 0}
                carbsG={message.result.total_carbs_g || 0}
              />
            )}

            {/* ── Health Tips ── */}
            {message.result.health_tips && message.result.health_tips.length > 0 && (
              <div className="mt-4 animate-in fade-in duration-700 delay-200">
                <div className="flex items-center gap-1.5 mb-2 text-sm font-medium text-foreground">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  Health Tips
                </div>
                <div className="space-y-2">
                  {message.result.health_tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 animate-in slide-in-from-left-2 fade-in duration-500"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] font-bold text-emerald-400">
                        {idx + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-foreground/80">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            
            {message.result.activities && message.result.activities.length > 0 && (
              <div className="mt-4 bg-secondary/40 rounded-lg p-3 text-sm animate-in fade-in duration-700 delay-300">
                <div className="font-medium flex items-center gap-1 mb-2 text-foreground">
                  <Activity className="w-4 h-4 text-primary" /> 
                  Activity Recommendations
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.result.activities.map((activity, idx) => (
                    <span key={idx} className="inline-flex items-center rounded-full bg-background border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors hover:bg-secondary">
                      {activity.type}: {activity.duration_minutes}m
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {message.result.health_note && (
              <div className="mt-3 text-[11px] text-muted-foreground/80 italic leading-tight">
                💡 {message.result.health_note}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground" suppressHydrationWarning>
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
