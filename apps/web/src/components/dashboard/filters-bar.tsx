import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { RecordFilters } from '@/hooks/use-dashboard';

interface FiltersBarProps {
  filters: RecordFilters;
  onFiltersChange: (filters: RecordFilters) => void;
  categories: string[];
}

export function FiltersBar({ filters, onFiltersChange, categories }: FiltersBarProps) {
  const hasFilters = !!(filters.type || filters.category || filters.startDate || filters.endDate);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      {/* Type selector */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(val) =>
          onFiltersChange({
            ...filters,
            type: val === 'all' ? undefined : (val as 'health' | 'finance'),
            offset: 0,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="health">Health</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
        </SelectContent>
      </Select>

      {/* Category selector */}
      <Select
        value={filters.category || 'all'}
        onValueChange={(val) =>
          onFiltersChange({
            ...filters,
            category: val === 'all' ? undefined : val,
            offset: 0,
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          placeholder="Start"
          value={filters.startDate || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, startDate: e.target.value || undefined, offset: 0 })
          }
          className="w-full sm:w-[150px]"
        />
        <span className="text-muted-foreground text-sm hidden sm:inline">—</span>
        <Input
          type="date"
          placeholder="End"
          value={filters.endDate || ''}
          onChange={(e) =>
            onFiltersChange({ ...filters, endDate: e.target.value || undefined, offset: 0 })
          }
          className="w-full sm:w-[150px]"
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({ limit: filters.limit })}
          className="gap-1"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
