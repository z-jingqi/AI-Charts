import { createCatalog } from '@json-render/core';
import { type ComponentRegistry } from '@json-render/react';
import { z } from 'zod';
import { MetricCard } from './components/metric-card';
import { TrendChart } from './components/trend-chart';
import { RecordForm } from './components/record-form';

export const catalog = createCatalog({
  components: {
    MetricCard: {
      description: 'Display a single metric with an optional trend icon.',
      props: z.object({
        label: z.string().describe('The name of the metric (e.g. "Total Revenue")'),
        value: z.union([z.string(), z.number()]).describe('The value to display'),
        unit: z.string().optional().describe('Optional unit (e.g. "USD", "kg")'),
        trend: z.enum(['up', 'down', 'neutral']).optional().describe('Trend direction'),
        description: z.string().optional().describe('Optional subtext'),
      }),
    },
    TrendChart: {
      description: 'Display a line or bar chart for trend analysis.',
      props: z.object({
        title: z.string().describe('Chart title'),
        type: z.enum(['line', 'bar']).describe('Type of chart'),
        color: z.string().optional().describe('Primary color for the chart'),
        data: z.array(z.object({
          name: z.string().describe('X-axis label'),
          value: z.number().describe('Y-axis value'),
        })).describe('Data points for the chart'),
      }),
    },
    RecordForm: {
      description: 'A form to review and edit extracted record data.',
      props: z.object({
        initialData: z.object({
          id: z.string(),
          title: z.string(),
          date: z.string(),
          metrics: z.array(z.object({
            key: z.string(),
            name: z.string(),
            value: z.union([z.string(), z.number()]),
            unit: z.string().optional(),
          })),
        }),
      }),
    },
  },
  actions: {
    save_record: {
      params: z.object({
        id: z.string(),
        data: z.any(),
      }),
    },
  },
});

export const registry: ComponentRegistry = {
  MetricCard: ({ element }) => MetricCard(element.props as any),
  TrendChart: ({ element }) => TrendChart(element.props as any),
  RecordForm: ({ element, onAction }) => (
    <RecordForm 
      initialData={element.props.initialData as any} 
      onSave={(data) => onAction?.({ name: 'save_record', params: { id: data.id, data } })}
    />
  ),
};
