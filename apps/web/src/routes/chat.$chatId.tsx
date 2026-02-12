import { createFileRoute } from '@tanstack/react-router';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCanvas } from '@/context/canvas-context';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { API_BASE } from '@/lib/api';

/** Shape of the render_ui tool output (defined in server/ai/tools.ts) */
interface RenderUIOutput {
  render: boolean;
  component: string;
  props: Record<string, unknown>;
  contentType: 'chart' | 'form' | 'pdf';
}

export const Route = createFileRoute('/chat/$chatId')({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { openCanvas } = useCanvas();

  const { messages, sendMessage, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({ api: `${API_BASE}/api/chat` }),
    onFinish: ({ message }) => {
      // Check for render_ui tool call results in the message parts
      for (const part of message.parts) {
        if (
          part.type === 'dynamic-tool' &&
          part.toolName === 'render_ui' &&
          part.state === 'output-available'
        ) {
          const { component, props, contentType } = part.output as RenderUIOutput;
          openCanvas(contentType, [{ component, props }]);
        }
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = async (content: string, files?: File[]) => {
    if (files && files.length > 0) {
      // Convert File[] to FileList-like structure for the SDK
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));

      // If user didn't type anything, send a minimal prompt.
      // The AI will see the image and use the system prompt to infer intent.
      sendMessage({
        text: content || '[User attached image(s) without text — analyze the content and take appropriate action]',
        files: dt.files,
      });
    } else {
      sendMessage({ text: content });
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-background">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isStreaming={isLoading} />
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
