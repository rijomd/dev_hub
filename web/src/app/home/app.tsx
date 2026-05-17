import { useState } from 'react';
import { Header } from './Header';
import { CreateProject } from '../project/CreateProject';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Welcome Home</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            This dashboard will soon show your local and remote developer projects.
          </p>

          <div className="flex space-x-6 border-b border-gray-200 mb-8">
            <button
              className={`pb-4 px-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('active')}
            >
              Active Projects
            </button>
            <button
              className={`pb-4 px-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('add')}
            >
              Add Project
            </button>
          </div>

          {activeTab === 'active' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-blue-900 mb-2">Active Projects</h3>
                <p className="text-sm text-blue-700 opacity-80">Coming soon to your developer dashboard.</p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-blue-900 mb-2">Recent Logs</h3>
                <p className="text-sm text-blue-700 opacity-80">Coming soon to your developer dashboard.</p>
              </div>
            </div>
          ) : (
            <CreateProject onProjectCreated={() => setActiveTab('active')} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
