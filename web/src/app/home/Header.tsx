import { USER_NAME } from '../utils/authConstants';
import { useLogout } from '../utils/hooks';

type HeaderProps = {
    activeTab: 'active' | 'add';
    setActiveTab: (tab: 'active' | 'add') => void;
};

export const Header = ({ activeTab, setActiveTab }: HeaderProps) => {
    const logout = useLogout();
    // Default to 'Arjun Raj' if not found, to match screenshot
    const userName = localStorage.getItem(USER_NAME) || 'Arjun Raj';

    // Get initials
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <header className="bg-[#222222] border-b border-gray-700/30 sticky top-0 z-50">
            {/* Top Bar */}
            <div className="max-w-5xl mx-auto px-6 flex justify-between items-center h-16">
                <div className="text-xl font-bold tracking-tight">
                    <span className="text-white">dev</span>
                    <span className="text-emerald-500">hub</span>
                </div>

                {/* Tabs in Center */}
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

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                        {initials}
                    </div>
                    <span className="text-sm text-gray-300 font-medium">{userName}</span>
                    <button
                        onClick={logout}
                        className="ml-4 text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}