import {useCallback, useMemo} from 'react';
import {useChatParticipantsStore} from '../store/useChatParticipantsStore';
import {Chat} from '../types';
import {useAuth} from './useAuth.ts';

export const useChatParticipants = (chat?: Chat) => {
    const {user} = useAuth();
    const {
        participants,
        loading,
        error,
        fetchParticipants,
        addParticipants,
        removeParticipant,
    } = useChatParticipantsStore();

    const isAdmin = useCallback(
        (userId: string) => chat?.type === 'GROUP' && chat?.creatorId === userId,
        [chat]
    );

    const canManageParticipants = useMemo(
        () => chat?.type === 'GROUP' && chat.creatorId === user?._id,
        [chat, user?._id]
    );

    const getParticipants = async (chatId: string) => {
        if (participants[chatId]) {
            return participants[chatId];
        }
        return await fetchParticipants(chatId);
    }

    return {
        participants,
        loading,
        error,
        addParticipants,
        removeParticipant,
        fetchParticipants: getParticipants,
        utils: {
            isAdmin,
            canManageParticipants,
        },
    };
};
