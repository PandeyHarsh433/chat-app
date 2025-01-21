import {create} from 'zustand';
import api from '../utils/api-client.tsx';
import {User} from '../types';
import {useAuthStore} from "./useAuthStore.ts";

interface UserStoreState {
    isLoading: boolean;
    error: string | null;
    query: string | null;
    users: User[];
    searchUsers: (query: string) => Promise<User[] | void>;
    updateProfile: (updateData: Partial<User>) => Promise<User | void>;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setQuery: (query: string | null) => void;
    setUsers: (users: User[]) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
    isLoading: false,
    error: null,
    query: null,
    users: [],

    setLoading: (isLoading: boolean) => set({isLoading}),
    setError: (error: string | null) => set({error}),
    setQuery: (query: string | null) => set({query}),
    setUsers: (users: User[]) => set({users}),

    searchUsers: async (query: string) => {
        set({isLoading: true, error: null});

        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get(`/users/search`, {
                params: {query: query.length > 0 ? query : ''},
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });

            const users = response.data.data as User[];
            set({users, query});
            return users;
        } catch (error) {
            set({error: 'Failed to search users'});
            throw error;
        } finally {
            set({isLoading: false});
        }
    },

    updateProfile: async (updateData: Partial<User>) => {
        set({isLoading: true, error: null});

        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.patch('/api/users/profile', updateData, {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });

            return response.data;
        } catch (error) {
            set({error: 'Failed to update profile'});
            throw error;
        } finally {
            set({isLoading: false});
        }
    },
}));
