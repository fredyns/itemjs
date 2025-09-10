import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRoute({
  context: (): RouterContext => undefined!,
  component: () => <Outlet />,
})
