import {useEffect} from 'react';
import {useAuthStore} from '../store/useAuthStore';
import {useNavigate} from 'react-router-dom';

export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        checkSession,
        clearError,
    } = useAuthStore();

    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    const handleLogin = async (email: string, password: string) => {
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    const handleRegister = async (name: string, email: string, password: string) => {
        const success = await register(name, email, password);
        if (success) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    const handleLogout = async () => {
        logout();
        navigate('/login');
    };

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        checkSession,
    };
};
