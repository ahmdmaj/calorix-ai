'use client'

import { useState, useCallback } from 'react'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatArea } from '@/components/chat-area'
import { mockChats, makeInitialMessages, type Message, type Chat } from '@/lib/mock-data'
import { apiClient } from '@/lib/api'

// Sample AI responses for different types of queries
const aiResponses: { [key: string]: string } = {
  default:
    "I've logged that for you! Based on what you described, here's an estimate:\n\n• Estimated calories: ~350-450 cal\n\nWould you like me to provide a more detailed breakdown or adjust the portion size?",
  breakfast:
    "Great breakfast choice! Here's the breakdown:\n\n• Estimated total: ~400-500 calories\n• Protein: ~15-20g\n• Carbs: ~45-55g\n• Fat: ~18-22g\n\nThis is a solid way to start your day with balanced macros!",
  lunch:
    "I've logged your lunch! Here's the nutritional estimate:\n\n• Estimated total: ~550-700 calories\n• Protein: ~25-35g\n• Carbs: ~50-65g\n• Fat: ~20-30g\n\nYou're on track for a balanced day!",
  summary:
    "Here's your summary so far today:\n\n**Meals logged:** 3\n**Total calories:** ~1,450 cal\n**Remaining:** ~550 cal\n\n**Macros:**\n• Protein: 75g (30%)\n• Carbs: 160g (44%)\n• Fat: 42g (26%)\n\nYou're doing great! Stay hydrated.",
  avocado:
    "Great question! Here's the nutritional info for avocado:\n\n**1 medium avocado (~150g):**\n• Calories: ~240 cal\n• Fat: 22g (healthy fats!)\n• Fiber: 10g\n• Carbs: 13g\n• Protein: 3g\n\nAvocados are packed with healthy monounsaturated fats and fiber!",
}

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('summary') || lowerMessage.includes('daily')) {
    return aiResponses.summary
  }
  if (lowerMessage.includes('avocado')) {
    return aiResponses.avocado
  }
  if (lowerMessage.includes('breakfast') || lowerMessage.includes('eggs') || lowerMessage.includes('toast')) {
    return aiResponses.breakfast
  }
  if (lowerMessage.includes('lunch') || lowerMessage.includes('sandwich')) {
    return aiResponses.lunch
  }
  return aiResponses.default
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>(() => makeInitialMessages())
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSelectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setActiveChatId(chatId)
      setCurrentMessages(chat.messages)
    }
  }, [chats])

  const handleNewChat = useCallback(() => {
    setActiveChatId(null)
    setCurrentMessages(makeInitialMessages())
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setCurrentMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const data = await apiClient('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: content })
      })

      const result = data.data?.chat?.result

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: "Here is your calorie breakdown:",
        timestamp: new Date(),
        result: result,
      }

      setCurrentMessages((prev) => [...prev, aiMessage])

      // Update chat list if it's a new chat
      if (!activeChatId) {
        const newChat: Chat = {
          id: `chat-${Date.now()}`,
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          lastMessage: aiMessage.content.slice(0, 50),
          timestamp: new Date(),
          messages: [userMessage, aiMessage],
        }
        setChats((prev) => [newChat, ...prev])
        setActiveChatId(newChat.id)
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Something went wrong.'}`,
        timestamp: new Date(),
      }
      setCurrentMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [activeChatId])

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <ChatArea
        messages={currentMessages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  )
}
