import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import type { UIMessage } from 'ai';
import { MessagePartRenderer } from './message-part-renderer';

interface MessageBubbleProps {
  message: UIMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex w-full gap-4 px-4 py-8 border-b last:border-0',
        isAssistant ? 'bg-muted/30' : 'bg-background',
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl gap-4">
        {/* Avatar Section */}
        <Avatar className="h-8 w-8 border shrink-0">
          {isAssistant ? (
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          ) : (
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>

        {/* Content Section */}
        <div className="flex-1 space-y-4 overflow-hidden">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isAssistant ? 'AI Analyst' : 'You'}
          </p>

          <div className="flex flex-col gap-4">
            {message.parts.map((part, index) => (
              <MessagePartRenderer
                key={`${message.id}-${index}`}
                part={part}
                isStreaming={isStreaming && index === message.parts.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
