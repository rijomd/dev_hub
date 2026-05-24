import { useState } from 'react';
import { Header } from './Header';
import { CreateProject } from '../project/CreateProject';
import { ProjectList } from '../project/ProjectList';

const mockProjects = [
  {
    name: 'auth-service',
    type: 'Node.js',
    framework: 'Express',
    port: 3001,
    status: 'running',
    version: 'v18.17',
    path: '/home/arjun/projects/auth-service',
    borderColor: 'border-l-emerald-400',
    tagClass: 'bg-emerald-50 text-emerald-700'
  },
  {
    name: 'dashboard-ui',
    type: 'React',
    framework: 'Vite',
    port: 5173,
    status: 'stopped',
    version: 'v18.17',
    path: '/home/arjun/projects/dashboard-ui',
    borderColor: 'border-l-gray-500',
    tagClass: 'bg-indigo-50 text-indigo-700'
  },
  {
    name: 'data-processor',
    type: 'Python',
    framework: 'FastAPI',
    port: 8000,
    status: 'building',
    version: '3.11',
    path: '/home/arjun/projects/data-processor',
    borderColor: 'border-l-amber-400',
    tagClass: 'bg-blue-50 text-blue-700'
  },
  {
    name: 'billing-api',
    type: 'Java',
    framework: 'Spring Boot',
    port: 8080,
    status: 'stopped',
    version: 'JDK 21',
    path: '/home/arjun/projects/billing-api',
    borderColor: 'border-l-gray-500',
    tagClass: 'bg-orange-50 text-orange-700'
  }
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-5xl mx-auto py-6 px-6">
        {activeTab === 'active' ? (<ProjectList mockProjects={mockProjects} />) : (
          <div className="bg-[#222222] p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-100">Add Project</h2>
              <button onClick={() => setActiveTab('active')} className="text-gray-400 hover:text-gray-200">
                Cancel
              </button>
            </div>
            <CreateProject onProjectCreated={() => setActiveTab('active')} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
