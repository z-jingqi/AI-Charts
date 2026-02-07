import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw } from 'lucide-react';

// Dynamic schema based on the data type
const fieldSchema = z.object({
  key: z.string(),
  name: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string().optional(),
});

const recordSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  metrics: z.array(fieldSchema),
});

type RecordFormData = z.infer<typeof recordSchema>;

export interface RecordFormProps {
  initialData: RecordFormData;
  onSave?: (data: RecordFormData) => void;
  onCancel?: () => void;
}

export function RecordForm({ initialData, onSave, onCancel }: RecordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: RecordFormData) => {
    console.log('Saving record data:', data);
    onSave?.(data);
  };

  return (
    <Card className="w-full shadow-md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>{initialData.title}</CardTitle>
          <CardDescription>
            AI has extracted the following metrics. Please review and adjust if necessary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Record Date</Label>
              <Input id="date" {...register('date')} />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base">Metrics</Label>
            <div className="grid gap-4">
              {initialData.metrics.map((metric, index) => (
                <div
                  key={metric.key}
                  className="flex items-end gap-3 p-3 border rounded-lg bg-muted/20"
                >
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{metric.name}</Label>
                    <div className="flex gap-2 items-center">
                      <Input className="h-9" {...register(`metrics.${index}.value` as const)} />
                      {metric.unit && (
                        <span className="text-sm text-muted-foreground min-w-[40px]">
                          {metric.unit}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 mt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => reset()}
            disabled={!isDirty || isSubmitting}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={!isDirty || isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
