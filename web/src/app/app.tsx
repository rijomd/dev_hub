import { useNavigate } from '@tanstack/react-router';

export function Dashboard() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('user_name') || 'Developer';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    navigate({ to: '/login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Dev Hub</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hi, <span className="font-semibold text-gray-900">{userName}</span></span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Welcome Home</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            You have successfully authenticated via GraphQL and TanStack Query.
            This dashboard will soon show your local and remote developer projects.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Active Projects', 'Health Check', 'Recent Logs'].map((card) => (
              <div key={card} className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-blue-900 mb-2">{card}</h3>
                <p className="text-sm text-blue-700 opacity-80">Coming soon to your developer dashboard.</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
