import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppShell } from '@/components/layout/app-shell';
import { CanvasProvider } from '@/context/canvas-context';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <CanvasProvider>
        <AppShell />
        <TanStackRouterDevtools />
        <ReactQueryDevtools initialIsOpen={false} />
      </CanvasProvider>
    </QueryClientProvider>
  ),
});
