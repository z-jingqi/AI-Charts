import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppShell } from '@/components/layout/app-shell';
import { CanvasProvider } from '@/context/canvas-context';

export const Route = createRootRoute({
  component: () => (
    <CanvasProvider>
      <AppShell />
      <TanStackRouterDevtools />
    </CanvasProvider>
  ),
});
