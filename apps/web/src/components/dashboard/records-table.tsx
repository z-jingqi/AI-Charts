import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RecordListItem } from '@/hooks/use-dashboard';

interface RecordsTableProps {
  records: RecordListItem[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={type === 'health' ? 'default' : 'secondary'} className="capitalize text-[10px]">
      {type}
    </Badge>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  if (!source) {
    return null;
  }
  const colors: Record<string, string> = {
    chat: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    upload: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    manual: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${colors[source] || ''}`}
    >
      {source}
    </span>
  );
}

export function RecordsTable({ records, onView, onEdit, onDelete }: RecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No records found</p>
        <p className="text-xs mt-1">Try adjusting your filters or add data via chat</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title / Category</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-center">Metrics</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="w-[60px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow
            key={record.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => onView(record.id)}
          >
            <TableCell>
              <div className="min-w-0">
                <p className="font-medium truncate text-sm">
                  {record.title || record.category.replace(/_/g, ' ')}
                </p>
                {record.title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {record.category.replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <TypeBadge type={record.type} />
            </TableCell>
            <TableCell className="text-sm whitespace-nowrap">{formatDate(record.date)}</TableCell>
            <TableCell className="text-center text-sm tabular-nums">
              {record.metricsCount}
            </TableCell>
            <TableCell>
              <SourceBadge source={record.source} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(record.id)}>
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(record.id)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(record.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
