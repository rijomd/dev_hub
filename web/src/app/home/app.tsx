import { useState } from 'react';
import { Header } from './Header';
import { CreateProject } from '../project/CreateProject';
import { ProjectList } from '../project/ProjectList';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-5xl mx-auto py-6 px-6">
        {activeTab === 'active' ? (<ProjectList />) : (
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
