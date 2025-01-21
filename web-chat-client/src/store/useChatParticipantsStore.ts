import {create} from 'zustand';
import {api} from '../utils/api-client';
import {ChatParticipant} from '../types';
import {useAuthStore} from "./useAuthStore.ts";

interface ChatParticipantsStore {
    participants: Record<string, ChatParticipant[]>;
    loading: boolean;
    error: string | null;
    fetchParticipants: (chatId: string) => Promise<void>;
    addParticipants: (chatId: string, userIds: string[]) => Promise<void>;
    removeParticipant: (chatId: string, userId: string) => Promise<void>;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useChatParticipantsStore = create<ChatParticipantsStore>((set) => ({
    participants: {},
    loading: false,
    error: null,
    setLoading: (loading) => set({loading}),
    setError: (error) => set({error}),

    fetchParticipants: async (chatId: string) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            set({loading: true, error: null});
            const response = await api.get(`/chats/${chatId}/participants`, {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });

            set((state) => {
                const updatedParticipants = {
                    ...state.participants,
                    [chatId]: response.data.data,
                };
                console.log("Updated Participants:", updatedParticipants); // Debugging
                return {participants: updatedParticipants};
            });
        } catch (error) {
            set({error: error instanceof Error ? error.message : 'Failed to fetch participants'});
        } finally {
            set({loading: false});
        }
    },

    addParticipants: async (chatId: string, userIds: string[]) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            set({loading: true, error: null});
            const response = await api.post(`/chats/${chatId}/participants`, {userIds}, {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });
            set((state) => ({
                participants: {
                    ...state.participants,
                    [chatId]: [...(state.participants[chatId] || []), ...response.data.data],
                },
            }));
        } catch (error) {
            set({error: error instanceof Error ? error.message : 'Failed to add participants'});
        } finally {
            set({loading: false});
        }
    },

    removeParticipant: async (chatId: string, userId: string) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            set({loading: true, error: null});
            await api.delete(`/chats/${chatId}/participants/${userId}`, {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });
            set((state) => ({
                participants: {
                    ...state.participants,
                    [chatId]: state.participants[chatId]?.filter(p => p.userId !== userId) || [],
                },
            }));
        } catch (error) {
            set({error: error instanceof Error ? error.message : 'Failed to remove participant'});
        } finally {
            set({loading: false});
        }
    },
}));