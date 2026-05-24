type TabsProps = {
    activeTab: 'active' | 'add';
    setActiveTab: (tab: 'active' | 'add') => void;
};

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
    return (
        <div  >
            <div className="bg-[#222222] max-w-5xl mx-auto px-6 my-6 flex gap-6 text-sm font-medium pt-3">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'active'
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    projects
                </button>
                <button
                    onClick={() => setActiveTab('add')}
                    className={`pb-3 border-b-2 transition-colors ${activeTab === 'add'
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                >
                    + add project
                </button>
                <button
                    className="pb-3 border-b-2 border-transparent text-gray-400 hover:text-gray-200 transition-colors"
                >
                    console
                </button>
            </div>
        </div>
    )
}
