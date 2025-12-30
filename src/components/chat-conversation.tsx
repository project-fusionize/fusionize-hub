'use client'

import {
  MessageBubble,
  ImageMessageBubble,
} from './message-bubble'

// Chat Conversation (multiple messages)
export interface ChatMessage {
  id: string
  type: 'text' | 'image'
  content: string
  image?: string
  caption?: string
  author: string
  avatar: string
  time: string
  isOwn: boolean
  status?: 'sent' | 'delivered' | 'read'
  interactionType?: 'MESSAGE' | 'THOUGHT' | 'OBSERVATION'
}

export interface ChatConversationProps {
  messages?: ChatMessage[]
  isThinking?: boolean
}

const defaultMessages: ChatMessage[] = [
  // {
  //   id: '1',
  //   type: 'text',
  //   content: 'Can you explain how the new React compiler works?',
  //   author: 'You',
  //   avatar: 'U',
  //   time: '10:30 AM',
  //   isOwn: true,
  //   status: 'read'
  // },
  // {
  //   id: '2',
  //   type: 'text',
  //   content: 'Certainly! The React Compiler (often referred to as React Forget) is an automatic memoization tool aimed at optimizing your React applications.\n\nInstead of you manually applying `useMemo` and `useCallback` to prevent unnecessary re-renders, the compiler automatically analyzes your component and caches values and components at a fine-grained level.\n\n**Key Benefits:**\n• **Automatic Optimization:** No need to manage dependency arrays manually.\n• **Cleaner Code:** You can write idiomatic JavaScript without memoization boilerplate.\n• **Fine-Grained Updates:** The UI only updates the specific parts that changed.',
  //   author: 'Assistant',
  //   avatar: 'AI',
  //   time: '10:30 AM',
  //   isOwn: false
  // },
  // {
  //   id: '3',
  //   type: 'text',
  //   content: 'That sounds great. Do I need to rewrite my existing code to use it?',
  //   author: 'You',
  //   avatar: 'U',
  //   time: '10:31 AM',
  //   isOwn: true,
  //   status: 'read'
  // },
  // {
  //   id: '4',
  //   type: 'text',
  //   content: 'No, you generally don\'t need to rewrite existing code! The compiler is resigned to be backwards compatible.\n\nIt works by understanding standard React rules. However, once you adopt it, you can simplify your codebase by removing the now-redundant `useMemo` and `useCallback` hooks, making your components easier to read and maintain.',
  //   author: 'Assistant',
  //   avatar: 'AI',
  //   time: '10:31 AM',
  //   isOwn: false
  // }
]

export function ChatConversation({
  messages = defaultMessages,
  isThinking = false
}: ChatConversationProps) {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {messages.map((message) =>
        message.type === 'image' ? (
          <ImageMessageBubble
            key={message.id}
            image={message.image!}
            caption={message.caption}
            avatar={message.avatar}
            author={message.author}
            time={message.time}
            isOwn={message.isOwn}
            status={message.status}
          />
        ) : (
          <MessageBubble
            key={message.id}
            content={message.content}
            avatar={message.avatar}
            author={message.author}
            time={message.time}
            isOwn={message.isOwn}
            status={message.status}
            interactionType={message.interactionType}
          />
        )
      )}
      {isThinking && (
        <div className="flex gap-3 w-full max-w-[85%] items-start">
          <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-medium shrink-0 text-foreground shadow-sm mt-1">
            AI
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground ml-1 mb-1 opacity-70">Assistant</span>
            <div className="px-4 py-2 bg-muted/20 rounded-2xl rounded-tl-sm">
              <div className="flex space-x-1 h-3 items-center">
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
