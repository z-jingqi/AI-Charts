import * as React from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  onUpload?: (files: FileList) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ 
  onSend, 
  onUpload, 
  disabled, 
  placeholder = "Type a message..." 
}: ChatInputProps) {
  const [value, setValue] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value)
      setValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative flex items-end gap-2 p-4 bg-background border-t">
      <div className="relative flex-1 bg-muted/50 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => e.target.files && onUpload?.(e.target.files)}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 bottom-1.5 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        
        <TextareaAutosize
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          maxRows={6}
          className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-12 pr-12 text-sm max-h-[200px]"
          disabled={disabled}
        />

        <Button
          variant="default"
          size="icon"
          className={cn(
            "absolute right-2 bottom-1.5 h-8 w-8 transition-all duration-200",
            value.trim() ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          )}
          onClick={handleSend}
          disabled={disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
