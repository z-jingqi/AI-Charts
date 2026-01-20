import type { UIMessage } from "ai"
import { TextPart } from "./parts/text-part"
import { ReasoningPart } from "./parts/reasoning-part"
import { ToolInvocationPart } from "./parts/tool-part"

type MessagePart = UIMessage["parts"][number]

interface MessagePartRendererProps {
  part: MessagePart
  isStreaming?: boolean
}

export function MessagePartRenderer({ part, isStreaming }: MessagePartRendererProps) {
  if (part.type === "text") {
    return <TextPart text={part.text} isStreaming={isStreaming} />
  }

  if (part.type === "reasoning") {
    return <ReasoningPart reasoning={part.text} />
  }

  if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
    const toolName = part.type === "dynamic-tool" ? part.toolName : part.type.slice(5)
    const toolCallId = (part as any).toolCallId
    return (
      <ToolInvocationPart 
        toolName={toolName} 
        toolCallId={toolCallId} 
      />
    )
  }

  return (
    <div className="text-xs text-muted-foreground italic border-l-2 pl-2 py-1">
      Supported content type: {part.type}
    </div>
  )
}
