import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRecords, type RecordFilters } from '@/hooks/use-dashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { StatsSummary } from '@/components/dashboard/stats-summary';
import { FiltersBar } from '@/components/dashboard/filters-bar';
import { RecordsTable } from '@/components/dashboard/records-table';
import { RecordsList } from '@/components/dashboard/records-list';
import { RecordDetail } from '@/components/dashboard/record-detail';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

const PAGE_SIZE = 20;

function DashboardPage() {
  const isMobile = useIsMobile();

  // Filters state
  const [filters, setFilters] = useState<RecordFilters>({ limit: PAGE_SIZE, offset: 0 });

  // Detail panel state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setDetailMode] = useState<'view' | 'edit'>('view');

  // Fetch records
  const { data, isLoading, error } = useRecords(filters);

  const records = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = Math.floor((filters.offset ?? 0) / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Derive unique categories from the loaded records for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(records.map((r) => r.category));
    return [...cats].sort();
  }, [records]);

  // Handlers
  const handleView = (id: string) => {
    setDetailMode('view');
    setSelectedId(id);
  };

  const handleEdit = (id: string) => {
    setDetailMode('edit');
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    // Open detail in view mode, user can delete from there
    setDetailMode('view');
    setSelectedId(id);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setFilters((prev) => ({
      ...prev,
      offset:
        direction === 'next'
          ? (prev.offset ?? 0) + PAGE_SIZE
          : Math.max(0, (prev.offset ?? 0) - PAGE_SIZE),
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all your health & finance records
        </p>
      </div>

      {/* Stats */}
      {!isLoading && records.length > 0 && <StatsSummary records={records} total={total} />}

      {/* Filters + Table */}
      <Card className="gap-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FiltersBar filters={filters} onFiltersChange={setFilters} categories={categories} />

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <p className="text-sm">Failed to load records</p>
              <p className="text-xs mt-1">{error.message}</p>
            </div>
          )}

          {/* Records: table on desktop, cards on mobile */}
          {!isLoading && !error && (
            <>
              {isMobile ? (
                <RecordsList
                  records={records}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <RecordsTable
                  records={records}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {total} record{total !== 1 ? 's' : ''} · Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail panel */}
      <RecordDetail
        recordId={selectedId}
        onClose={() => setSelectedId(null)}
        onDeleted={() => setSelectedId(null)}
      />
    </div>
  );
}
