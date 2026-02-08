import {
  FileText,
  Database,
  TrendingUp,
  Save,
  Pencil,
  Trash2,
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  Layout,
  PackagePlus,
} from 'lucide-react';

const TOOL_CONFIG: Record<string, { label: string; activeLabel: string; icon: typeof FileText }> = {
  query_records: { label: 'Queried records', activeLabel: 'Querying records...', icon: Database },
  get_metric_trend: {
    label: 'Fetched trend data',
    activeLabel: 'Fetching trend data...',
    icon: TrendingUp,
  },
  get_latest_records: {
    label: 'Fetched latest records',
    activeLabel: 'Fetching latest records...',
    icon: BarChart3,
  },
  render_ui: { label: 'Rendered on Canvas', activeLabel: 'Rendering on Canvas...', icon: Layout },
  save_record: { label: 'Record saved', activeLabel: 'Saving record...', icon: Save },
  save_records: { label: 'Records saved (batch)', activeLabel: 'Saving multiple records...', icon: PackagePlus },
  update_record: { label: 'Record updated', activeLabel: 'Updating record...', icon: Pencil },
  delete_record: { label: 'Record deleted', activeLabel: 'Deleting record...', icon: Trash2 },
};

export interface ToolInvocationPartProps {
  toolName: string;
  toolCallId: string;
  state?: 'input-streaming' | 'input-available' | 'output-available' | 'error';
  errorText?: string;
}

export function ToolInvocationPart({ toolName, state, errorText }: ToolInvocationPartProps) {
  const config = TOOL_CONFIG[toolName] || {
    label: toolName,
    activeLabel: `Running ${toolName}...`,
    icon: FileText,
  };
  const Icon = config.icon;

  const isActive = state === 'input-streaming' || state === 'input-available';
  const isError = state === 'error';
  const isDone = state === 'output-available';

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border shadow-sm animate-in zoom-in-95 duration-200 ${
        isError ? 'border-destructive/50 bg-destructive/5' : 'bg-card'
      }`}
    >
      <div
        className={`p-2 rounded-md ${
          isError
            ? 'bg-destructive/10 text-destructive'
            : isDone
              ? 'bg-green-500/10 text-green-600 dark:text-green-400'
              : 'bg-primary/10 text-primary'
        }`}
      >
        {isActive ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isError ? (
          <XCircle className="h-4 w-4" />
        ) : isDone ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-medium truncate">
          {isActive ? config.activeLabel : isError ? `Failed: ${toolName}` : config.label}
        </p>
        {isError && errorText && (
          <p className="text-[10px] text-destructive truncate">{errorText}</p>
        )}
        {isDone && toolName === 'render_ui' && (
          <p className="text-[10px] text-muted-foreground">View on Canvas →</p>
        )}
      </div>
    </div>
  );
}
