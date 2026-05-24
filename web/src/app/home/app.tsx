import { useState, lazy, Suspense } from 'react';
import { Header } from './Header';
import { LoadingFallback } from '../utils/LoadingFallback';

const ProjectList = lazy(() =>
  import('../project/ProjectList').then(m => ({ default: m.ProjectList }))
);
const CreateProject = lazy(() =>
  import('../project/CreateProject').then(m => ({ default: m.CreateProject }))
);

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'add'>('active');

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-5xl mx-auto py-6 px-6">
          {activeTab === 'active' ? (
            <Suspense fallback={<LoadingFallback />}>
              <ProjectList />
            </Suspense>
          ) : (
            <div className="bg-[#222222] p-8 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-100">Add Project</h2>
                <button onClick={() => setActiveTab('active')} className="text-gray-400 hover:text-gray-200">
                  Cancel
                </button>
              </div>
              <Suspense fallback={<LoadingFallback />}>
                <CreateProject onProjectCreated={() => setActiveTab('active')} />
              </Suspense>
            </div>
          )}
        </main>
    </div>
  );
}

export default Dashboard;
