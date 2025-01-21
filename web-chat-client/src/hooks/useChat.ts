import {useEffect} from 'react';
import {useChatStore} from '../store/useChatStore';

export const useChat = () => {
    const {
        chats,
        directChats,
        groupChats,
        messagesByChat,
        activeChat,
        fetchAllChats,
        fetchDirectChats,
        fetchGroupChats,
        fetchMessages,
        fetchMessage,
        setActiveChat,
        createChat,
        sendMessage,
    } = useChatStore();

    useEffect(() => {
        if (chats.length === 0) {
            fetchAllChats().catch((err) =>
                console.error('Failed to fetch chats:', err)
            );
        }
    }, [chats, fetchAllChats]);

    const getChats = async () => {
        if (chats.length === 0) {
            await fetchAllChats();
        }
        return chats;
    };

    const getDirectChats = async () => {
        if (directChats.length === 0) {
            await fetchDirectChats();
        }
        return directChats;
    };

    const getGroupChats = async () => {
        if (groupChats.length === 0) {
            await fetchGroupChats();
        }
        return groupChats;
    };

    const getMessages = async (chatId: string) => {
        if (!messagesByChat[chatId]) {
            await fetchMessages(chatId);
        }
        return messagesByChat[chatId] || [];
    };

    const getMessage = async (messageId: string) => {
        if (messageId) {
            return await fetchMessage(messageId);
        }
    };

    return {
        chats,
        directChats,
        groupChats,
        messagesByChat,
        activeChat,
        fetchAllChats: getChats,
        fetchDirectChats: getDirectChats,
        fetchGroupChats: getGroupChats,
        fetchMessages: getMessages,
        fetchMessage: getMessage,
        setActiveChat,
        createChat,
        sendMessage,
    };
};
