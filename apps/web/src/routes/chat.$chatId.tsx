import { createFileRoute } from '@tanstack/react-router';
import { useCanvas } from '@/context/canvas-context';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/chat/$chatId')({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = Route.useParams();
  const { openCanvas } = useCanvas();

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex-1 overflow-auto">
        <h1 className="text-3xl font-bold">Chat Session</h1>
        <p className="mt-2 text-muted-foreground">Chat ID: {chatId}</p>
        
        <div className="mt-8 space-y-4">
          <div className="bg-muted p-4 rounded-lg max-w-[80%]">
            Hello! I can help you analyze your data. Please upload a file or ask a question.
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openCanvas('form', { recordId: chatId })}>
            Review Extracted Data
          </Button>
          <Button variant="outline" onClick={() => openCanvas('chart', { recordId: chatId })}>
            View Trends
          </Button>
        </div>
      </div>
    </div>
  );
}
