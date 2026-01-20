import { FileText } from "lucide-react"

interface ToolInvocationPartProps {
  toolName: string
  toolCallId: string
}

export function ToolInvocationPart({ toolName }: ToolInvocationPartProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card shadow-sm animate-in zoom-in-95 duration-200">
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-medium truncate">Tool: {toolName}</p>
        <p className="text-[10px] text-muted-foreground">Click to view on Canvas</p>
      </div>
    </div>
  )
}
