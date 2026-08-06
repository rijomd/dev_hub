type TabsProps = {
    activeTab: 'active' | 'add' | 'console';
    setActiveTab: (tab: 'active' | 'add' | 'console') => void;
};

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
    return (
        <div className="flex gap-6 h-full text-sm font-medium">
            <button
                onClick={() => setActiveTab('active')}
                className={`h-full border-b-2 transition-colors flex items-center ${activeTab === 'active'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
            >
                projects
            </button>
            <button
                onClick={() => setActiveTab('add')}
                className={`h-full border-b-2 transition-colors flex items-center ${activeTab === 'add'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
            >
                + add project
            </button>
            <button
                onClick={() => setActiveTab('console')}
                className={`h-full border-b-2 transition-colors flex items-center ${activeTab === 'console'
                    ? 'border-emerald-500 text-emerald-500'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
            >
                console
            </button>
        </div>
    )
}
