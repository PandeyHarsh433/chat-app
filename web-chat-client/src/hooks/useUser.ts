import {useEffect} from 'react';
import {useUserStore} from '../store/useUserStore';

export const useUser = () => {
    const {
        isLoading,
        error,
        users,
        query,
        searchUsers,
        updateProfile,
        setQuery,
    } = useUserStore();

    useEffect(() => {
        if (!query) {
            searchUsers('').catch((err) =>
                console.error('Failed to fetch users:', err)
            );
        }
    }, [query, searchUsers]);

    const getUsers = async (queryParam: string) => {
        if (query !== queryParam || users.length === 0) {
            await searchUsers(queryParam);
        }
        return users;
    };

    return {
        isLoading,
        error,
        users,
        query,
        searchUsers: getUsers,
        updateProfile,
        setQuery,
    };
};
