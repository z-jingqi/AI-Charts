import { useState } from 'react';
import { Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  useRecord,
  useUpdateRecord,
  useDeleteRecord,
  type RecordMetric,
} from '@/hooks/use-dashboard';
import { useIsMobile } from '@/hooks/use-mobile';

// ========================================
// Detail Content (shared between dialog/sheet)
// ========================================

interface RecordDetailContentProps {
  recordId: string;
  onClose: () => void;
  onDeleted?: () => void;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function MetricRow({
  metric,
  isEditing,
  onChange,
}: {
  metric: RecordMetric;
  isEditing: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{metric.name}</p>
        {metric.reference && (
          <p className="text-[10px] text-muted-foreground">Ref: {metric.reference}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isEditing ? (
          <Input
            type="number"
            value={metric.value}
            onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
            className="w-20 h-7 text-sm text-right"
          />
        ) : (
          <span className="text-sm font-mono tabular-nums">{metric.value}</span>
        )}
        {metric.unit && (
          <span className="text-xs text-muted-foreground w-12 text-left">{metric.unit}</span>
        )}
        <StatusBadge status={metric.status} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    low: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    positive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    negative: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium w-14 justify-center ${styles[status] || 'bg-muted text-muted-foreground'}`}
    >
      {status}
    </span>
  );
}

function RecordDetailContent({ recordId, onClose, onDeleted }: RecordDetailContentProps) {
  const { data: record, isLoading, error } = useRecord(recordId);
  const updateMutation = useUpdateRecord();
  const deleteMutation = useDeleteRecord();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editMetrics, setEditMetrics] = useState<RecordMetric[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const startEditing = () => {
    if (!record) {
      return;
    }
    setIsEditing(true);
    setEditTitle(record.title || record.category.replace(/_/g, ' '));
    setEditDate(new Date(record.date).toISOString().split('T')[0]);
    setEditMetrics([...record.metrics]);
  };

  const handleSave = async () => {
    if (!record) {
      return;
    }
    await updateMutation.mutateAsync({
      id: record.id,
      title: editTitle,
      date: editDate,
      items: editMetrics.map((m) => ({
        key: m.key,
        name: m.name,
        value: m.value,
        unit: m.unit || undefined,
        status: m.status,
        reference: m.reference || undefined,
        notes: m.notes || undefined,
        displayOrder: m.displayOrder || undefined,
        categoryTag: m.categoryTag || undefined,
        parentKey: m.parentKey || undefined,
      })),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(recordId);
    setShowDeleteConfirm(false);
    onDeleted?.();
    onClose();
  };

  const handleMetricChange = (index: number, value: number) => {
    setEditMetrics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], value };
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">Failed to load record</p>
        <Button variant="ghost" size="sm" onClick={onClose} className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  const displayMetrics = isEditing ? editMetrics : record.metrics;

  return (
    <div className="flex flex-col h-full">
      {/* Header info */}
      <div className="space-y-3 px-1">
        {isEditing ? (
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <Label>Date</Label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={record.type === 'health' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {record.type}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {record.category.replace(/_/g, ' ')}
              </Badge>
              {record.source && (
                <Badge variant="outline" className="text-[10px]">
                  {record.source}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(record.date)}</p>
          </>
        )}
      </div>

      <Separator className="my-4" />

      {/* Metrics */}
      <div className="px-1 mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Metrics ({displayMetrics.length})
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-1">
        <div className="space-y-0.5 px-1">
          {displayMetrics.map((metric, index) => (
            <MetricRow
              key={metric.id || index}
              metric={metric}
              isEditing={isEditing}
              onChange={(val) => handleMetricChange(index, val)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={startEditing} className="gap-1">
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{record.title || record.category.replace(/_/g, ' ')}
              "? This action cannot be undone and will remove all associated metrics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================================
// Wrapper: Desktop = Sheet side panel, Mobile = full Sheet
// ========================================

interface RecordDetailProps {
  recordId: string | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function RecordDetail({ recordId, onClose, onDeleted }: RecordDetailProps) {
  const isMobile = useIsMobile();

  if (!recordId) {
    return null;
  }

  // Both desktop and mobile use Sheet, but different sides/sizes
  return (
    <Sheet open={!!recordId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={isMobile ? 'h-[85vh] rounded-t-xl' : 'w-[440px] sm:w-[480px]'}
      >
        <SheetHeader>
          <SheetTitle className="text-left">Record Details</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden pt-4">
          <RecordDetailContent recordId={recordId} onClose={onClose} onDeleted={onDeleted} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
