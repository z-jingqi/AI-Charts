import { MoreVertical, Pencil, Trash2, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RecordListItem } from '@/hooks/use-dashboard';

interface RecordsListProps {
  records: RecordListItem[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecordsList({ records, onView, onEdit, onDelete }: RecordsListProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No records found</p>
        <p className="text-xs mt-1">Try adjusting your filters or add data via chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => (
        <Card
          key={record.id}
          className="py-3 gap-0 cursor-pointer active:scale-[0.99] transition-transform"
          onClick={() => onView(record.id)}
        >
          <CardContent className="flex items-center gap-3">
            {/* Color indicator */}
            <div
              className={`w-1 h-10 rounded-full shrink-0 ${
                record.type === 'health' ? 'bg-primary' : 'bg-secondary'
              }`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {record.title || record.category.replace(/_/g, ' ')}
                </p>
                <Badge
                  variant={record.type === 'health' ? 'default' : 'secondary'}
                  className="text-[10px] shrink-0"
                >
                  {record.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{record.metricsCount} metrics</span>
                {record.source && (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {record.source}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-sm" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
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

            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
