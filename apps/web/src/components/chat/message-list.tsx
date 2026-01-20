import * as React from "react"
import { MessageBubble } from "./message-bubble"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { UIMessage } from "ai"

interface MessageListProps {
  messages: UIMessage[]
  isStreaming?: boolean
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <ScrollArea ref={scrollRef} className="h-full w-full">
      <div className="flex flex-col min-h-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground">How can I help you today?</h2>
            <p className="max-w-xs mt-2 text-sm">
              Upload a health report or financial bill to get started with intelligent analysis.
            </p>
          </div>
        ) : (
          messages.map((m, index) => (
            <MessageBubble 
              key={m.id} 
              message={m} 
              isStreaming={isStreaming && index === messages.length - 1 && m.role === "assistant"}
            />
          ))
        )}
      </div>
    </ScrollArea>
  )
}
