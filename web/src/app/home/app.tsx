import { useState, lazy, Suspense } from 'react';
import { Header } from './Header';
import { LoadingFallback } from '../utils/LoadingFallback';
import { TabKey } from './Tabs';

const ProjectList = lazy(() =>
  import('../project/ProjectList').then(m => ({ default: m.ProjectList }))
);
const CreateProject = lazy(() =>
  import('../project/CreateProject').then(m => ({ default: m.CreateProject }))
);
const ConsoleTab = lazy(() =>
  import('./ConsoleTab').then(m => ({ default: m.ConsoleTab }))
);
const MembersTab = lazy(() =>
  import('../devs/MembersTab').then(m => ({ default: m.MembersTab }))
);
const OrganizationsTab = lazy(() =>
  import('../devs/OrganizationsTab').then(m => ({ default: m.OrganizationsTab }))
);

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('active');

  return (
    <div className="min-h-screen bg-[#141414] text-gray-200 font-sans">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-5xl mx-auto py-6 px-6">
        {activeTab === 'active' ? (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectList />
          </Suspense>
        ) : activeTab === 'add' ? (
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
        ) : activeTab === 'console' ? (
          <ConsoleTab />
        ) : activeTab === 'members' ? (
          <Suspense fallback={<LoadingFallback />}>
            <MembersTab />
          </Suspense>
        ) : activeTab === 'organizations' ? (
          <Suspense fallback={<LoadingFallback />}>
            <OrganizationsTab />
          </Suspense>
        ) : null}
      </main>
    </div>
  );
}

export default Dashboard;
