import { Terminal, ChevronDown } from "lucide-react"

interface ReasoningPartProps {
  reasoning: string
}

export function ReasoningPart({ reasoning }: ReasoningPartProps) {
  return (
    <details className="group border rounded-lg bg-muted/50 overflow-hidden">
      <summary className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover:bg-muted transition-colors">
        <Terminal className="h-3 w-3" />
        <span>AI Reasoning Process</span>
        <ChevronDown className="h-3 w-3 ml-auto transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 text-xs text-muted-foreground/80 leading-relaxed font-mono whitespace-pre-wrap border-t pt-2">
        {reasoning}
      </div>
    </details>
  )
}
