import {useNavigate} from 'react-router-dom';
import {LogOut, Moon, Sun} from 'lucide-react';
import {useThemeStore} from '../../store/useThemeStore';
import {useAuthStore} from "../../store/useAuthStore.ts";

export function Header() {
    const navigate = useNavigate();
    const {user, logout} = useAuthStore();
    const {theme, toggleTheme} = useThemeStore();

    const handleLogout = async () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4">
            <div className="h-full flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="font-medium">{`Hello, ${user?.name.toLocaleUpperCase()}`}</span>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <LogOut size={20}/>
                    </button>
                </div>
            </div>
        </header>
    );
}