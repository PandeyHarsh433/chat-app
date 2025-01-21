import {create} from 'zustand';
import api from '../utils/api-client';
import {useAuthStore} from './useAuthStore';
import {Chat, CreateChat, IMessage} from '../types';

interface ChatState {
    chats: Chat[];
    directChats: Chat[];
    groupChats: Chat[];
    messagesByChat: Record<string, IMessage[]>;
    activeChat: Chat | null;

    setChats: (chats: Chat[]) => void;
    setDirectChats: (chats: Chat[]) => void;
    setGroupChats: (chats: Chat[]) => void;
    setMessages: (chatId: string, messages: IMessage[]) => void;
    setActiveChat: (chat: Chat | null) => void;

    fetchAllChats: () => Promise<void>;
    fetchDirectChats: () => Promise<void>;
    fetchGroupChats: () => Promise<void>;
    createChat: (chat: CreateChat) => Promise<Chat | void>;
    fetchMessages: (chatId: string) => Promise<IMessage[] | void>;
    fetchMessage: (messageId: string) => Promise<IMessage | void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    directChats: [],
    groupChats: [],
    messagesByChat: {},
    activeChat: null,

    setChats: (chats) => set({chats}),
    setDirectChats: (chats) => set({directChats: chats}),
    setGroupChats: (chats) => set({groupChats: chats}),
    setMessages: (chatId, messages) => {
        const {messagesByChat} = get();
        set({messagesByChat: {...messagesByChat, [chatId]: messages}});
    },
    setActiveChat: (activeChat) => set({activeChat}),

    fetchAllChats: async () => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get('/chats', {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });
            set({chats: response.data.data});
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    },

    fetchDirectChats: async () => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get('/chats/DIRECT', {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });
            set({directChats: response.data.data});
        } catch (error) {
            console.error('Failed to fetch direct chats:', error);
        }
    },

    fetchGroupChats: async () => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get('/chats/GROUP', {
                headers: {Authorization: `Bearer ${access_token}`},
                withCredentials: true,
            });
            set({groupChats: response.data.data});
        } catch (error) {
            console.error('Failed to fetch group chats:', error);
        }
    },

    createChat: async (chat) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.post('/chats', chat, {
                headers: {Authorization: `Bearer ${access_token}`},
            });

            const newChat = response.data.data;
            set((state) => ({chats: [newChat, ...state.chats]}));

            const {fetchDirectChats, fetchGroupChats} = get();

            await Promise.all([fetchDirectChats(), fetchGroupChats()]);
            return newChat;
        } catch (error) {
            console.error('Failed to create chat:', error);
            throw error;
        }
    },

    fetchMessages: async (chatId) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get(`/chats/${chatId}/messages`, {
                headers: {Authorization: `Bearer ${access_token}`},
            });

            const messages = response.data.data as IMessage[];
            get().setMessages(chatId, messages);
            return messages;
        } catch (error) {
            console.error(`Failed to fetch messages for chatId ${chatId}:`, error);
            throw error;
        }
    },

    fetchMessage: async (messageId) => {
        const {access_token} = useAuthStore.getState();
        if (!access_token) return;

        try {
            const response = await api.get(`/chats/messages/${messageId}`, {
                headers: {Authorization: `Bearer ${access_token}`},
            });
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch message:', error);
        }
    },
}));
