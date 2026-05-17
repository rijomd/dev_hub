import { Header } from './Header';

export function Dashboard() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
