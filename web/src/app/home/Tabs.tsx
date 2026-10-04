import { USER_TYPE } from '../utils/authConstants';

export type TabKey = 'active' | 'add' | 'console' | 'members' | 'organizations';

type TabsProps = {
    activeTab: TabKey;
    setActiveTab: (tab: TabKey) => void;
};

const TAB_STYLE_ACTIVE = 'border-emerald-500 text-emerald-500';
const TAB_STYLE_INACTIVE = 'border-transparent text-gray-400 hover:text-gray-200';

export const Tabs = ({ activeTab, setActiveTab }: TabsProps) => {
    const userType = localStorage.getItem(USER_TYPE);
    const isOrg = userType === 'organization';
    const isDev = userType === 'dev';

    const tabs: { key: TabKey; label: string }[] = [
        { key: 'active', label: 'projects' },
        { key: 'add', label: '+ add project' },
        { key: 'console', label: 'console' },
        ...(isOrg ? [{ key: 'members' as TabKey, label: 'members' }] : []),
        ...(isDev ? [{ key: 'organizations' as TabKey, label: 'organizations' }] : []),
    ];

    return (
        <div className="flex gap-6 h-full text-sm font-medium">
            {tabs.map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`h-full border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeTab === key ? TAB_STYLE_ACTIVE : TAB_STYLE_INACTIVE
                    }`}
                >
                    {key === 'members' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                        </svg>
                    )}
                    {key === 'organizations' && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )}
                    {label}
                </button>
            ))}
        </div>
    );
};
