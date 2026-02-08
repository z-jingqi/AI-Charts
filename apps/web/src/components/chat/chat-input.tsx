import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Attachment {
  file: File;
  previewUrl: string;
}

interface ChatInputProps {
  onSend: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const canSend = (value.trim() || attachments.length > 0) && !disabled;

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    const files = attachments.length > 0 ? attachments.map((a) => a.file) : undefined;
    onSend(value.trim(), files);

    // Clean up
    setValue('');
    cleanupAttachments();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) {
      return;
    }

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // Only accept images for now
      if (file.type.startsWith('image/')) {
        newAttachments.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Reset file input so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const cleanupAttachments = () => {
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    setAttachments([]);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    };
  }, []);

  // Handle paste images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          newAttachments.push({
            file,
            previewUrl: URL.createObjectURL(file),
          });
        }
      }
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-4 bg-background border-t">
      <div className="relative flex-1 bg-muted/50 rounded-2xl border transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-3 pt-3 pb-1 overflow-x-auto">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="relative group shrink-0 rounded-lg overflow-hidden border bg-background"
              >
                <img
                  src={attachment.previewUrl}
                  alt={attachment.file.name}
                  className="h-16 w-16 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1 py-0.5">
                  <p className="text-[9px] text-white truncate">{attachment.file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />

        {/* Attach button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 bottom-1.5 h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text input */}
        <TextareaAutosize
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={
            attachments.length > 0
              ? 'Add instructions (optional), or press Enter to send...'
              : placeholder
          }
          rows={1}
          maxRows={6}
          className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 pl-12 pr-12 text-sm max-h-[200px] outline-none"
          disabled={disabled}
        />

        {/* Send button — visible when there's text OR attachments */}
        <Button
          variant="default"
          size="icon"
          className={cn(
            'absolute right-2 bottom-1.5 h-8 w-8 transition-all duration-200',
            canSend ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none',
          )}
          onClick={handleSend}
          disabled={!canSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
