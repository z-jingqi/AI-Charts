import { createFileRoute } from '@tanstack/react-router';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCanvas } from '@/context/canvas-context';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';

export const Route = createFileRoute('/chat/$chatId')({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { openCanvas } = useCanvas();
  
  // Use the new Vercel AI SDK Multi-modal Chat API (ai v4/v6)
  const { messages, sendMessage, status } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onFinish: ({ message }) => {
      // Check for render_ui tool call results in the message parts
      if (message.parts) {
        message.parts.forEach((part: any) => {
          if (part.type === 'tool-invocation') {
            const toolInvocation = part.toolInvocation;
            if (toolInvocation.state === 'result' && toolInvocation.toolName === 'render_ui') {
              const { component, props, contentType } = toolInvocation.result;
              openCanvas(contentType, [
                { component, props }
              ]);
            }
          }
        });
      }
    }
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSend = async (content: string) => {
    // sendMessage handles the UI state and API call
    sendMessage({ text: content });
  };

  const handleUpload = (files: FileList) => {
    console.log('Uploading files:', files);
    sendMessage({ 
      text: `Uploaded ${files.length} file(s) for analysis.`,
      files: files 
    });
  };

  return (
    <div className="h-full flex flex-col relative bg-background">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isStreaming={isLoading} />
      </div>
      
      <div className="w-full max-w-3xl mx-auto">
        <ChatInput 
          onSend={handleSend} 
          onUpload={handleUpload} 
          disabled={isLoading} 
        />
      </div>
    </div>
  );
}

