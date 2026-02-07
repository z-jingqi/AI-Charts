import { Renderer, flatToTree, ActionProvider } from '@json-render/react';
import type { UITree } from '@json-render/core';
import { useSaveRecord } from '@/hooks/use-records';
import { registry } from './catalog';
import { useCanvas } from '@/context/canvas-context';
import type { CanvasComponentData } from '@/context/canvas-context';

export function CanvasRenderer() {
  const { contentType, data } = useCanvas();

  // Use the encapsulated hook
  const saveRecordMutation = useSaveRecord();

  if (!contentType || !data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground italic p-8 text-center">
        Select an analysis result from the chat to view details here.
      </div>
    );
  }

  // Type guard to determine if data is a flat component array or already a UITree
  const tree: UITree = Array.isArray(data)
    ? flatToTree(
        (data as CanvasComponentData[]).map((item, index) => ({
          key: `item-${index}`,
          type: item.component,
          props: item.props,
        })),
      )
    : (data as UITree);

  const handleAction = async (name: string, params: any) => {
    console.log(`Canvas Action Triggered: ${name}`, params);

    if (name === 'save_record') {
      saveRecordMutation.mutate(params, {
        onSuccess: () => {
          alert('Record saved successfully!');
        },
        onError: (error) => {
          alert(`Error saving record: ${error.message}`);
        },
      });
    }
  };

  return (
    <ActionProvider
      handlers={{
        save_record: (params) => handleAction('save_record', params),
      }}
    >
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 p-6">
        {saveRecordMutation.isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <Renderer tree={tree} registry={registry} />
      </div>
    </ActionProvider>
  );
}
