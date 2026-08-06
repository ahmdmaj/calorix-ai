'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanInput = input.trim()
    
    // Validation rules
    if (!cleanInput) {
      return
    }
    if (cleanInput.length < 3) {
      setError("Please describe the food in a bit more detail (e.g. 'an apple').")
      return
    }
    if (cleanInput.length > 200) {
      setError("That's a lot of food! Please try breaking it down into smaller messages.")
      return
    }

    if (!disabled) {
      setError(null)
      onSend(cleanInput)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (error) setError(null) // clear error on type
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what you ate..."
          disabled={disabled}
          rows={1}
          className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className="h-10 w-10 shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
          <div className="bg-destructive text-destructive-foreground text-xs px-3 py-1.5 rounded-lg shadow-md font-medium">
            {error}
          </div>
        </div>
      )}

      <p className="mt-2 text-center text-xs text-muted-foreground">
        CalorieAI provides estimates. Consult a professional for precise nutrition advice.
      </p>
    </form>
  )
}
