import { createFileRoute } from '@tanstack/react-router';
import { useCanvas } from '@/context/canvas-context';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { openCanvas, isOpen } = useCanvas();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Welcome to AI-Chart</h1>
      <p className="mt-2 text-muted-foreground">
        Your personal data intelligence dashboard. Start by uploading a medical report or a financial bill.
      </p>

      <div className="mt-8 p-6 border rounded-xl bg-card">
        <h3 className="font-semibold mb-2">Getting Started</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to simulate AI generating an insight.
        </p>
        <Button 
          onClick={() => openCanvas('chart', [
            {
              component: 'MetricCard',
              props: {
                label: 'Health Score',
                value: '92',
                unit: '/100',
                trend: 'up'
              }
            },
            {
              component: 'TrendChart',
              props: {
                title: 'Weight Trend',
                type: 'line',
                data: [
                  { name: 'Oct', value: 75 },
                  { name: 'Nov', value: 73 },
                  { name: 'Dec', value: 72 },
                  { name: 'Jan', value: 71 },
                ]
              }
            }
          ])}
          disabled={isOpen}
        >
          {isOpen ? 'Canvas is Open' : 'Simulate Insight'}
        </Button>
      </div>
    </div>
  );
}
