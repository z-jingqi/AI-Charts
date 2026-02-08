import type { UIMessage } from 'ai';
import { TextPart } from './parts/text-part';
import { ReasoningPart } from './parts/reasoning-part';
import { ToolInvocationPart, type ToolInvocationPartProps } from './parts/tool-part';
import { FilePart } from '@/components/chat/parts/file-part';

type MessagePart = UIMessage['parts'][number];

interface MessagePartRendererProps {
  part: MessagePart;
  isStreaming?: boolean;
}

export function MessagePartRenderer({ part, isStreaming }: MessagePartRendererProps) {
  if (part.type === 'text') {
    return <TextPart text={part.text} isStreaming={isStreaming} />;
  }

  if (part.type === 'reasoning') {
    return <ReasoningPart reasoning={part.text} />;
  }

  if (part.type === 'file') {
    return <FilePart part={part} />;
  }

  if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
    const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.slice(5);
    const toolCallId = (part as Record<string, unknown>).toolCallId as string;
    const state = (part as Record<string, unknown>).state as string | undefined;
    const errorText = (part as Record<string, unknown>).errorText as string | undefined;
    return (
      <ToolInvocationPart
        toolName={toolName}
        toolCallId={toolCallId}
        state={state as ToolInvocationPartProps['state']}
        errorText={errorText}
      />
    );
  }

  return (
    <div className="text-xs text-muted-foreground italic border-l-2 pl-2 py-1">
      Supported content type: {part.type}
    </div>
  );
}
