import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useCanvas } from '@/context/canvas-context';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';

export const Route = createFileRoute('/chat/$chatId')({
  component: ChatPage,
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function ChatPage() {
  const { chatId } = Route.useParams();
  const { openCanvas } = useCanvas();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);

  const handleSend = async (content: string) => {
    // Add user message
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    
    // Simulate AI response
    setIsStreaming(true);
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = { id: assistantId, role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMessage]);

    // Simple mock streaming
    const fullResponse = "I've analyzed your request. I can see you're interested in the latest trends. I'm opening a chart for you to see the details better.";
    const chunks = fullResponse.split(' ');
    let currentContent = '';

    for (let i = 0; i < chunks.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      currentContent += (i === 0 ? '' : ' ') + chunks[i];
      setMessages((prev) => 
        prev.map((m) => m.id === assistantId ? { ...m, content: currentContent } : m)
      );
    }

    setIsStreaming(false);

    // Auto open canvas for demo if keywords present
    if (content.toLowerCase().includes('chart') || content.toLowerCase().includes('trend')) {
      openCanvas('chart', { title: 'Dynamic Insight' });
    }
  };

  const handleUpload = (files: FileList) => {
    console.log('Uploading files:', files);
    handleSend(`Uploaded ${files.length} file(s) for analysis.`);
  };

  return (
    <div className="h-full flex flex-col relative bg-background">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isStreaming={isStreaming} />
      </div>
      
      <div className="w-full max-w-3xl mx-auto">
        <ChatInput onSend={handleSend} onUpload={handleUpload} disabled={isStreaming} />
      </div>
    </div>
  );
}

