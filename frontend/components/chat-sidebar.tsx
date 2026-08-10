'use client'

import { Plus, MessageSquare, Settings, LogOut, X, Activity, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import type { Chat } from '@/lib/mock-data'

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  isOpen: boolean
  onClose: () => void
  isHistoryLoading?: boolean
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
  isHistoryLoading = false,
}: ChatSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const groupChatsByDate = (chats: Chat[]) => {
    const groups: { [key: string]: Chat[] } = {}
    
    chats.forEach((chat) => {
      const dateLabel = formatDate(chat.timestamp)
      if (!groups[dateLabel]) {
        groups[dateLabel] = []
      }
      groups[dateLabel].push(chat)
    })
    
    return groups
  }

  const groupedChats = groupChatsByDate(chats)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button & Dashboard Link */}
        <div className="p-4">
          <Button
            onClick={() => {
              onNewChat()
              onClose()
            }}
            className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Link href="/dashboard" className="block mt-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Activity className="h-4 w-4" />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2">
          {isHistoryLoading ? (
            // Skeleton loading state
            <div className="space-y-2 px-2 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg p-3 bg-sidebar-accent/30">
                  <div className="h-3 w-3/4 rounded bg-sidebar-border mb-2" />
                  <div className="h-2 w-1/2 rounded bg-sidebar-border/60" />
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-sidebar-foreground/40 text-sm gap-2">
              <MessageSquare className="h-8 w-8 opacity-40" />
              <p>No chat history yet</p>
              <p className="text-xs text-center px-4">Start a new conversation to track your calories</p>
            </div>
          ) : (
            Object.entries(groupedChats).map(([dateLabel, dateChats]) => (
              <div key={dateLabel} className="mb-4">
                <p className="mb-2 px-2 text-xs font-medium text-sidebar-foreground/60">
                  {dateLabel}
                </p>
                <div className="space-y-1">
                  {dateChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group flex w-full items-start gap-2 rounded-lg transition-colors ${
                        activeChatId === chat.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectChat(chat.id)
                          onClose()
                        }}
                        className="flex flex-1 items-start gap-3 p-3 text-left min-w-0"
                      >
                        <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{chat.title}</p>
                          <p className="truncate text-xs text-sidebar-foreground/60">
                            {chat.lastMessage}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteChat(chat.id)
                        }}
                        className="p-3 opacity-0 group-hover:opacity-100 text-sidebar-foreground/40 hover:text-red-400 transition-all shrink-0"
                        title="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Daily Progress */}
        <div className="px-4 py-4 border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-sidebar-foreground">Daily Goal</span>
            <span className="text-xs text-sidebar-foreground/70">1,200 / 2,000 kcal</span>
          </div>
          <div className="h-2.5 w-full bg-sidebar-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '60%' }} />
          </div>
          <p className="text-[10px] text-sidebar-foreground/50 mt-2 text-center">Resetting in 8 hrs</p>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
                U
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  User
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">
                  user@example.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
                <Settings className="h-4 w-4" />
              </button>
              <Link
                href="/login"
                className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
