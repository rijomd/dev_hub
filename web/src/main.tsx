import { StrictMode, lazy, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';

import './styles.css';
import { isAuthenticated, requireAuth } from './app/utils/hooks';
import { LoadingFallback } from './app/utils/LoadingFallback';
import { ErrorFallback } from './app/utils/ErrorFallback';
import { ToastContainer } from './app/utils/ToastContainer';
import { toast } from './app/utils/toast';
import { ACCESS_TOKEN, USER_NAME } from './app/utils/authConstants';

const Dashboard = lazy(() => import('./app/home/app'));
const LoginPage = lazy(() =>
  import('./app/auth/LoginPage').then(m => ({ default: m.LoginPage }))
);

const handleApiError = (error: Error | any) => {
  const isUnauthorized = 
    error?.response?.status === 401 || 
    error?.response?.errors?.some((e: any) => e.message?.toLowerCase().includes('unauthorized'));
    
  if (isUnauthorized) {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_NAME);
    router?.navigate({ to: '/login' });
    toast.error('Session expired. Please log in again.');
  } else {
    toast.error(error?.response?.errors?.[0]?.message || error.message || 'An error occurred');
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleApiError }),
  mutationCache: new MutationCache({ onError: handleApiError }),
});

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ToastContainer />
    </QueryClientProvider>
  ),
  errorComponent: ({ error, reset }) => <ErrorFallback error={error} reset={reset} />,
});


const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <Dashboard />
    </Suspense>
  ),
  beforeLoad: () => {
    requireAuth();
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <LoginPage />
    </Suspense>
  ),
  beforeLoad: () => {
    isAuthenticated();
  },
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);