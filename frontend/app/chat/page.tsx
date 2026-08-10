'use client'

import { useState, useCallback, useEffect } from 'react'
import { ChatSidebar } from '@/components/chat-sidebar'
import { ChatArea } from '@/components/chat-area'
import { makeInitialMessages, type Message, type Chat } from '@/lib/mock-data'
import { apiClient } from '@/lib/api'

// Convert a raw DB chat document into our frontend Chat shape
function dbChatToFrontend(dbChat: any): Chat {
  const userMsg: Message = {
    id: `user-${dbChat._id}`,
    role: 'user',
    content: dbChat.message,
    timestamp: new Date(dbChat.created_at),
  }
  const aiMsg: Message = {
    id: `ai-${dbChat._id}`,
    role: 'assistant',
    content: 'Here is your calorie breakdown:',
    timestamp: new Date(dbChat.created_at),
    result: dbChat.result,
  }
  return {
    id: dbChat._id,
    title: dbChat.message.slice(0, 40) + (dbChat.message.length > 40 ? '…' : ''),
    lastMessage: `${dbChat.result?.total_min ?? '?'}–${dbChat.result?.total_max ?? '?'} kcal`,
    timestamp: new Date(dbChat.created_at),
    messages: [userMsg, aiMsg],
  }
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [currentMessages, setCurrentMessages] = useState<Message[]>(() => makeInitialMessages())
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)

  // ─── Fetch history on mount ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const loadHistory = async () => {
      try {
        const data = await apiClient('/chat/history')
        if (cancelled) return
        const fetchedChats: Chat[] = (data.data?.chats ?? []).map(dbChatToFrontend)
        setChats(fetchedChats)
      } catch (err) {
        console.error('[loadHistory Error]:', err)
        // silently fail — user still gets a fresh chat session
      } finally {
        if (!cancelled) setIsHistoryLoading(false)
      }
    }
    loadHistory()
    return () => { cancelled = true }
  }, [])

  // ─── Sidebar: select a past chat ─────────────────────────────────────────
  const handleSelectChat = useCallback((chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      setActiveChatId(chatId)
      setCurrentMessages(chat.messages)
    }
  }, [chats])

  // ─── Sidebar: start a new blank chat ─────────────────────────────────────
  const handleNewChat = useCallback(() => {
    setActiveChatId(null)
    setCurrentMessages(makeInitialMessages())
  }, [])

  // ─── Sidebar: delete a chat ───────────────────────────────────────────────
  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      await apiClient(`/chat/${chatId}`, { method: 'DELETE' })
      setChats((prev) => prev.filter((c) => c.id !== chatId))
      // If the deleted chat was active, reset to new chat
      setActiveChatId((prev) => {
        if (prev === chatId) {
          setCurrentMessages(makeInitialMessages())
          return null
        }
        return prev
      })
    } catch (err) {
      console.error('[deleteChat Error]:', err)
    }
  }, [])

  // ─── Send a message ───────────────────────────────────────────────────────
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
        body: JSON.stringify({ message: content }),
      })

      const dbChat = data.data?.chat
      const result = dbChat?.result

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: 'Here is your calorie breakdown:',
        timestamp: new Date(),
        result,
      }

      setCurrentMessages((prev) => [...prev, aiMessage])

      // Build the new sidebar entry from the real DB record
      const newChat: Chat = dbChat
        ? dbChatToFrontend(dbChat)
        : {
            id: `chat-${Date.now()}`,
            title: content.slice(0, 40) + (content.length > 40 ? '…' : ''),
            lastMessage: `${result?.total_min ?? '?'}–${result?.total_max ?? '?'} kcal`,
            timestamp: new Date(),
            messages: [userMessage, aiMessage],
          }

      if (activeChatId) {
        // Update existing sidebar entry messages in-place
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, messages: [...c.messages, userMessage, aiMessage] }
              : c
          )
        )
      } else {
        // New conversation — prepend to history
        setChats((prev) => [newChat, ...prev])
        setActiveChatId(newChat.id)
      }
    } catch (err: any) {
      console.error('[sendMessage Error]:', err)
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
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isHistoryLoading={isHistoryLoading}
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
