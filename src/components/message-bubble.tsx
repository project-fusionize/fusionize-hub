import { cn } from '@/lib/utils'
import React, { useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Single Message Bubble
export interface MessageBubbleProps {
  content: string
  avatar?: string
  author?: string
  time?: string
  isOwn?: boolean
  status?: 'sent' | 'delivered' | 'read'
  interactionType?: 'MESSAGE' | 'THOUGHT' | 'OBSERVATION'
}

export function MessageBubble({
  content = 'Hey! How are you doing?',
  avatar = 'J',
  author,
  isOwn = false,
  interactionType = 'MESSAGE'
}: MessageBubbleProps) {
  return (
    <div className={cn('flex gap-3 w-full', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-medium shrink-0 text-foreground shadow-sm mt-1">
          {avatar}
        </div>
      )}
      <div className={cn('flex flex-col', isOwn ? 'max-w-[75%] items-end' : 'max-w-[85%] items-start')}>
        {!isOwn && author && (
          <span className="text-[10px] text-muted-foreground ml-1 mb-1 opacity-70">{author}</span>
        )}
        <div
          className={cn(
            'w-full text-sm leading-relaxed break-words',
            isOwn
              ? 'bg-secondary text-secondary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm'
              : 'px-0 py-1 w-full'
          )}
        >
          {interactionType === 'THOUGHT' && (
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              Thinking Process
            </div>
          )}
          {interactionType === 'OBSERVATION' && (
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
              Observation
            </div>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <span className="font-semibold">{children}</span>,
              a: ({ children, href }) => <a href={href} className="text-primary underline underline-offset-2 hover:opacity-80" target="_blank" rel="noopener noreferrer">{children}</a>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary/50 pl-4 py-1 italic my-2 bg-muted/20 rounded-r">{children}</blockquote>,
              code: ({ className, children }) => {
                const match = /language-(\w+)/.exec(className || '')
                const isInline = !match && !children?.toString().includes('\n')
                if (isInline) {
                  return <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[0.9em]">{children}</code>
                }
                return (
                  <div className="my-2 rounded-md overflow-hidden bg-muted/50 border w-full">
                    <div className="px-3 py-1.5 bg-muted border-b text-[10px] text-muted-foreground font-mono flex justify-between items-center">
                      <span>{match?.[1] || 'text'}</span>
                    </div>
                    <pre className="p-3 overflow-x-auto text-xs font-mono">
                      <code className={className}>{children}</code>
                    </pre>
                  </div>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {!isOwn && (
          <div className="flex items-center gap-2 mt-1 px-1">
            {/* Actions like Copy, Regenerate could go here */}
          </div>
        )}
      </div>
    </div>
  )
}

// Image Message Bubble
export interface ImageMessageBubbleProps {
  image: string
  caption?: string
  avatar?: string
  author?: string
  time?: string
  isOwn?: boolean
  status?: 'sent' | 'delivered' | 'read'
}

export function ImageMessageBubble({
  image = 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=300&fit=crop',
  caption,
  avatar = 'J',
  isOwn = false,
}: ImageMessageBubbleProps) {
  return (
    <div className={cn('flex gap-3 w-full', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-medium shrink-0 text-foreground shadow-sm mt-1">
          {avatar}
        </div>
      )}
      <div className={cn('flex flex-col', isOwn ? 'max-w-[70%] items-end' : 'max-w-[85%] items-start')}>
        <div
          className={cn(
            'rounded-xl overflow-hidden border',
            isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'
          )}
        >
          <img
            src={image}
            alt="Shared image"
            className="w-full max-w-[320px] h-auto object-cover"
          />
          {caption && (
            <div
              className={cn(
                'px-3 py-2 text-sm',
                isOwn ? 'bg-secondary text-secondary-foreground' : 'bg-muted/30'
              )}
            >
              <p>{caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Message with reactions
export interface MessageWithReactionsProps {
  content: string
  avatar?: string
  author?: string
  time?: string
  isOwn?: boolean
  reactions?: { emoji: string; count: number }[]
  onReact?: (emoji: string) => void
}

export function MessageWithReactions({
  content = 'This is such great news! 🎉',
  avatar = 'A',
  isOwn = false,
  reactions = [
    { emoji: '❤️', count: 3 },
    { emoji: '👍', count: 2 }
  ],
}: MessageWithReactionsProps) {
  return (
    <div className={cn('flex gap-3 w-full', isOwn && 'flex-row-reverse')}>
      {!isOwn && (
        <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-medium shrink-0 text-foreground shadow-sm mt-1">
          {avatar}
        </div>
      )}
      <div className={cn('flex flex-col', isOwn ? 'max-w-[70%] items-end' : 'max-w-[85%] items-start')}>
        <div
          className={cn(
            'text-sm leading-relaxed',
            isOwn
              ? 'bg-secondary text-secondary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm'
              : 'px-0 py-1'
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        <div className={cn('flex items-center gap-1 mt-1.5', isOwn && 'justify-end')}>
          {reactions && reactions.length > 0 && (
            <>
              {reactions.map((reaction, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-0.5 bg-background border rounded-full px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {reaction.emoji}
                  <span>{reaction.count}</span>
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Voice Message Bubble
export interface VoiceMessageBubbleProps {
  duration?: string
  avatar?: string
  author?: string
  time?: string
  isOwn?: boolean
  status?: 'sent' | 'delivered' | 'read'
  audioSrc?: string
}

export function VoiceMessageBubble({
  duration = '0:42',
  avatar = 'M',
  isOwn = false,
  audioSrc = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
}: VoiceMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState('0:00')
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime
      const total = audioRef.current.duration || 1
      setProgress((current / total) * 100)
      const mins = Math.floor(current / 60)
      const secs = Math.floor(current % 60)
      setCurrentTime(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setProgress(0)
    setCurrentTime('0:00')
  }

  return (
    <div className={cn('flex gap-3 w-full', isOwn && 'flex-row-reverse')}>
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
      />
      {!isOwn && (
        <div className="h-6 w-6 rounded-full border bg-background flex items-center justify-center text-[10px] font-medium shrink-0 text-foreground shadow-sm mt-1">
          {avatar}
        </div>
      )}
      <div className={cn('flex flex-col', isOwn ? 'max-w-[70%] items-end' : 'max-w-[85%] items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 flex items-center gap-3 w-[260px]',
            isOwn
              ? 'bg-secondary text-secondary-foreground rounded-tr-sm'
              : 'bg-muted/50 rounded-tl-sm'
          )}
        >
          <button
            onClick={togglePlay}
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors',
              isOwn ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-background hover:bg-background/80 shadow-sm'
            )}
          >
            {isPlaying ? (
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="h-4 w-4 ml-0.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-1 bg-primary/20 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium opacity-70">{isPlaying ? currentTime : duration}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
