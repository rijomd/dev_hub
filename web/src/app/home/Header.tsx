import { USER_NAME } from '../utils/authConstants';
import { useLogout } from '../utils/hooks'

export const Header = () => {
    const logout = useLogout();
    const userName = localStorage.getItem(USER_NAME);

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Dev Hub</h1>
            <div className="flex items-center gap-4">
                <span className="text-gray-600"><span className="font-semibold text-gray-900">{userName}</span></span>
                <button
                    onClick={logout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}