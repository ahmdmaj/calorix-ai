'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
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
    
    if (!cleanInput) return

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
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
      {/* Background Glow Effect */}
      <motion.div
        animate={{
          opacity: isFocused ? 0.15 : 0,
          scale: isFocused ? 1.02 : 0.98,
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl"
      />
      
      <div 
        className={`relative flex items-end gap-2 rounded-3xl border bg-card/60 backdrop-blur-xl p-2 transition-all duration-300 ${
          isFocused ? 'border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.1)]' : 'border-border/50 shadow-sm'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (error) setError(null)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Tell me what you ate..."
          disabled={disabled}
          rows={1}
          className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="shrink-0 mb-1 mr-1"
        >
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || disabled}
            className={`h-10 w-10 rounded-2xl transition-all duration-300 ${
              input.trim() && !disabled 
                ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_0_15px_rgba(var(--accent),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent),0.5)] border-none' 
                : 'bg-muted text-muted-foreground opacity-50'
            }`}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -48, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 0.95 }}
            className="absolute top-0 left-0 right-0 flex justify-center z-10 pointer-events-none"
          >
            <div className="bg-destructive/90 backdrop-blur-md border border-destructive/20 text-destructive-foreground text-xs px-4 py-2 rounded-xl shadow-lg font-medium">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-4 text-center text-[11px] font-medium text-muted-foreground/60 tracking-wide uppercase">
        Calorix AI provides estimates. Consult a professional for precise advice.
      </p>
    </form>
  )
}
