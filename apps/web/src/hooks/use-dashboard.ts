import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

// ========================================
// Types
// ========================================

export interface RecordListItem {
  id: string;
  type: 'health' | 'finance';
  title: string | null;
  category: string;
  date: string;
  summaryValue: number | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  metricsCount: number;
}

export interface RecordMetric {
  id: number;
  recordId: string;
  key: string;
  name: string;
  value: number;
  unit: string | null;
  status: string;
  reference: string | null;
  notes: string | null;
  displayOrder: number | null;
  categoryTag: string | null;
  parentKey: string | null;
}

export interface RecordDetail {
  id: string;
  userId: string;
  type: 'health' | 'finance';
  title: string | null;
  category: string;
  date: string;
  summaryValue: number | null;
  source: string | null;
  rawContent: string;
  createdAt: string;
  updatedAt: string;
  metrics: RecordMetric[];
}

export interface RecordFilters {
  type?: 'health' | 'finance';
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateRecordParams {
  id: string;
  title?: string;
  category?: string;
  date?: string;
  summary?: number;
  items?: Array<{
    key: string;
    name: string;
    value: number;
    unit?: string;
    status: string;
    reference?: string;
    notes?: string;
    displayOrder?: number;
    categoryTag?: string;
    parentKey?: string;
  }>;
}

export interface SaveRecordParams {
  data: {
    title: string;
    date: string;
    metrics: Array<{
      key: string;
      name: string;
      value: string | number;
      unit?: string;
    }>;
  };
}

// ========================================
// Hooks
// ========================================

/**
 * Fetch a paginated list of records with optional filters
 */
export function useRecords(filters: RecordFilters = {}) {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) {
        params.set('type', filters.type);
      }
      if (filters.category) {
        params.set('category', filters.category);
      }
      if (filters.startDate) {
        params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.set('endDate', filters.endDate);
      }
      if (filters.limit) {
        params.set('limit', String(filters.limit));
      }
      if (filters.offset) {
        params.set('offset', String(filters.offset));
      }

      const qs = params.toString();
      const res = await apiFetch(`/api/records${qs ? `?${qs}` : ''}`);
      if (!res.ok) {
        throw new Error('Failed to fetch records');
      }

      const json = (await res.json()) as {
        success: boolean;
        data: RecordListItem[];
        total: number;
        limit: number;
        offset: number;
      };
      return json;
    },
  });
}

/**
 * Fetch a single record with its metrics
 */
export function useRecord(id: string | null) {
  return useQuery({
    queryKey: ['record', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('No record ID');
      }
      const res = await apiFetch(`/api/records/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch record');
      }
      const json = (await res.json()) as { success: boolean; data: RecordDetail };
      return json.data;
    },
    enabled: !!id,
  });
}

/**
 * Update a record
 */
export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateRecordParams) => {
      const res = await apiFetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { message?: string }).message || 'Failed to update record');
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['record', variables.id] });
    },
  });
}

/**
 * Delete a record
 */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiFetch(`/api/records/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as { message?: string }).message || 'Failed to delete record');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}

/**
 * Save a new record (used by Canvas renderer)
 */
export function useSaveRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SaveRecordParams) => {
      const response = await apiFetch(`/api/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            type: 'health',
            category: params.data.title,
            date: params.data.date,
            summary: params.data.metrics.length,
            items: params.data.metrics.map((m) => ({
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
        throw new Error((err as { message?: string }).message || 'Failed to save record');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}
