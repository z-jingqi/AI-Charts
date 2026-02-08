import { Activity, Calendar, FolderOpen, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { RecordListItem } from '@/hooks/use-dashboard';

interface StatsSummaryProps {
  records: RecordListItem[];
  total: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <Card className="py-4 gap-2 min-w-[160px] snap-start shrink-0 md:shrink md:min-w-0">
      <CardContent className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsSummary({ records, total }: StatsSummaryProps) {
  const categories = new Set(records.map((r) => r.category));

  const latestDate =
    records.length > 0
      ? new Date(Math.max(...records.map((r) => new Date(r.date).getTime())))
      : null;

  const healthCount = records.filter((r) => r.type === 'health').length;
  const financeCount = records.filter((r) => r.type === 'finance').length;

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
      <StatCard label="Total Records" value={total} icon={<Hash className="h-4 w-4" />} />
      <StatCard
        label="Latest Record"
        value={latestDate ? latestDate.toLocaleDateString() : '—'}
        icon={<Calendar className="h-4 w-4" />}
      />
      <StatCard
        label="Categories"
        value={categories.size}
        icon={<FolderOpen className="h-4 w-4" />}
        sub={[...categories].slice(0, 3).join(', ')}
      />
      <StatCard
        label="By Type"
        value={`${healthCount}H / ${financeCount}F`}
        icon={<Activity className="h-4 w-4" />}
        sub={`of ${total} total`}
      />
    </div>
  );
}
