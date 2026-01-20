import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SaveRecordParams {
  data: {
    title: string;
    date: string;
    metrics: any[];
  };
}

export function useSaveRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveRecordParams) => {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            type: 'health', // AI should ideally provide this or it should be passed in params
            category: params.data.title,
            date: params.data.date,
            summary: params.data.metrics.length,
            items: params.data.metrics.map((m: any) => ({
              key: m.key,
              name: m.name,
              value: typeof m.value === 'string' ? parseFloat(m.value) : m.value,
              unit: m.unit,
              status: 'normal',
            })),
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to save record');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });
}
