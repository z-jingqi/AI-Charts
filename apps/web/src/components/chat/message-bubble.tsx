import * as React from "react"
import { Streamdown } from "streamdown"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"

interface MessageBubbleProps {
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isAssistant = role === "assistant"

  return (
    <div className={cn(
      "flex w-full gap-4 px-4 py-8",
      isAssistant ? "bg-muted/30" : "bg-background"
    )}>
      <div className="mx-auto flex w-full max-w-3xl gap-4">
        <Avatar className="h-8 w-8 border">
          {isAssistant ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-secondary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 space-y-2 overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isAssistant ? "AI Analyst" : "You"}
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
            {isAssistant ? (
              <Streamdown>{content}</Streamdown>
            ) : (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
          </div>
          {isStreaming && isAssistant && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-primary/50 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  )
}
