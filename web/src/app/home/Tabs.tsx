type TabsProps = {
    activeTab: 'active' | 'add';
    setActiveTab: (tab: 'active' | 'add') => void;
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
                className="h-full border-b-2 border-transparent text-gray-400 hover:text-gray-200 transition-colors flex items-center"
            >
                console
            </button>
        </div>
    )
}
