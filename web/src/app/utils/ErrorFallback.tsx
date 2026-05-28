import { useRouter } from '@tanstack/react-router';
import { Button } from '@dev-hub/ui';

export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-500 mb-6">
            {error.message || 'An unexpected error occurred while rendering the page.'}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full justify-center py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors"
            >
              Try again
            </Button>
            <Button
              onClick={() => {
                reset();
                router.navigate({ to: '/' });
              }}
              className="w-full justify-center py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-xl transition-colors"
            >
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
