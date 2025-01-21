import {create} from 'zustand';
import api from '../utils/api-client.tsx';
import {User} from "../types";

interface AuthStore {
    user: User | null;
    access_token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkSession: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('access_token');

    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        access_token: storedToken,
        isAuthenticated: !!storedToken,
        isLoading: false,
        error: null,

        login: async (email: string, password: string) => {
            try {
                set({isLoading: true, error: null});
                const response = await api.post('/auth/login', {email, password}, {withCredentials: true});
                const {user, accessToken} = response.data.data;

                localStorage.setItem('auth_user', JSON.stringify(user));
                localStorage.setItem('access_token', accessToken);

                set({
                    user,
                    access_token: accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                return true;
            } catch (error) {
                set({isLoading: false, error: 'Invalid credentials'});
                return false;
            }
        },

        register: async (name: string, email: string, password: string) => {
            try {
                set({isLoading: true, error: null});
                const response = await api.post('/auth/register', {name, email, password}, {withCredentials: true});
                const {user, accessToken} = response.data;

                localStorage.setItem('auth_user', JSON.stringify(user));
                localStorage.setItem('access_token', accessToken);

                set({
                    user,
                    access_token: accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
                return true;
            } catch (error) {
                set({isLoading: false, error: 'Registration failed'});
                return false;
            }
        },

        logout: () => {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('access_token');
            set({user: null, access_token: null, isAuthenticated: false, isLoading: false, error: null});
        },

        checkSession: () => {
            const accessToken = localStorage.getItem('access_token');
            if (!accessToken) {
                set({user: null, isAuthenticated: false});
                return;
            }

            try {
                const {exp} = JSON.parse(atob(accessToken.split('.')[1]));
                if (Date.now() >= exp * 1000) {
                    localStorage.removeItem('auth_user');
                    localStorage.removeItem('access_token');
                    set({user: null, access_token: null, isAuthenticated: false});
                } else {
                    set({isAuthenticated: true});
                }
            } catch (error) {
                console.error('Invalid access token format');
                localStorage.removeItem('auth_user');
                localStorage.removeItem('access_token');
                set({user: null, access_token: null, isAuthenticated: false});
            }
        },

        clearError: () => {
            set({error: null});
        }
    }
});
