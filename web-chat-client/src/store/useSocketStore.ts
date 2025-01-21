import {create} from 'zustand';
import {io, Socket} from 'socket.io-client';
import {useAuthStore} from './useAuthStore';
import {IMessage} from '../types';
import {useChatStore} from "./useChatStore.ts";

interface SocketState {
    socket: Socket | null;
    isConnected: boolean;
    connectSocket: () => void;
    disconnectSocket: () => void;
    onlineUsers: Record<string, boolean>;
    sendMessage: (chatId: string, message: string) => void;
    typingUsers: Record<string, Record<string, boolean>>;
    emitTyping: (chatId: string, userid: string, isTyping: boolean) => void;
    onTyping: (callback: (chatId: string, userId: string, isTyping: boolean) => void) => void;
    onMessageReceived: (callback: (message: IMessage) => void) => void;
    markMessagesAsRead: (chatId: string, messageIds: string[]) => void;
    messageErrorCallback: (error: string) => void;
    joinChat: (chatId: string) => void;
    leaveChat: (chatId: string) => void;
    onUserJoined: (callback: (userId: string, chatId: string) => void) => void;
    onUserLeft: (callback: (userId: string, chatId: string) => void) => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
    let typingCallback: (chatId: string, userId: string, isTyping: boolean) => void = () => {
    };
    let messageCallback: (message: IMessage) => void = () => {
    };
    let userJoinedCallback: (userId: string, chatId: string) => void = () => {
    };
    let userLeftCallback: (userId: string, chatId: string) => void = () => {
    };

    return {
        socket: null,
        isConnected: false,
        onlineUsers: {},
        typingUsers: {},

        connectSocket: () => {
            const {access_token} = useAuthStore.getState();
            if (!access_token) return;

            const socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000', {
                transports: ['websocket'],
                auth: {
                    token: `Bearer ${access_token}`,
                },
                withCredentials: true,
            });

            socket.on('connect', () => set({isConnected: true}));
            socket.on('disconnect', () => set({isConnected: false}));

            socket.on('chatStateSync', ({chatState}) => {
                set((state) => ({
                    onlineUsers: chatState.onlineUsers.reduce((acc: {
                        [x: string]: boolean;
                    }, userId: string | number) => {
                        acc[userId] = true;
                        return acc;
                    }, {...state.onlineUsers}),

                    typingUsers: chatState.typingUsers.reduce((acc: {
                        [x: string]: { [x: string]: { isTyping: boolean; timestamp: any; }; };
                    }, typingStatus: { userId: any; chatId: any; timestamp: any; }) => {
                        const {userId, chatId: typingChatId, timestamp} = typingStatus;
                        acc[typingChatId] = acc[typingChatId] || {};
                        acc[typingChatId][userId] = {isTyping: true, timestamp};
                        return acc;
                    }, {...state.typingUsers}),
                }));
            });

            socket.on(
                'userTyping',
                ({chatId, userId, isTyping}: { chatId: string; userId: string; isTyping: boolean }) => {
                    const {typingUsers} = get();

                    const updatedChatUsers = {
                        ...typingUsers[chatId],
                        [userId]: isTyping,
                    };

                    if (!isTyping) {
                        delete updatedChatUsers[userId];
                    }

                    set({
                        typingUsers: {
                            ...typingUsers,
                            [chatId]: updatedChatUsers,
                        },
                    });

                    if (typingCallback) typingCallback(chatId, userId, isTyping);
                },
            );

            socket.on('message', (message: IMessage) => {
                if (messageCallback) messageCallback(message);
            });

            socket.on('userStatus', ({userId, isOnline}: { userId: string; isOnline: boolean }) => {
                const {onlineUsers} = get();
                set({onlineUsers: {...onlineUsers, [userId]: isOnline}});
            });

            socket.on('userJoinedChat', ({userId, chatId}) => {
                if (userJoinedCallback) userJoinedCallback(userId, chatId);
            });

            socket.on('chatHistory', async ({chatId, messages}) => {
                if (chatId && messages) {
                    const {fetchMessages} = useChatStore.getState();
                    await fetchMessages(chatId);
                }
            });

            socket.on('userLeftChat', ({userId, chatId}) => {
                if (userLeftCallback) userLeftCallback(userId, chatId);
            });

            socket.on('newMessage', async ({success, message, error}) => {
                const {messageErrorCallback} = get();
                if (!success && error && messageErrorCallback) {
                    messageErrorCallback(error);
                }

                if (success) {
                    console.log('Message sent:', message);

                    const {fetchMessages} = useChatStore.getState();
                    await fetchMessages(message.chatId);
                }
            });

            set({socket});
        },

        disconnectSocket: () => {
            const {socket} = get();
            socket?.disconnect();
            set({socket: null, isConnected: false});
        },

        emitTyping: (chatId, isTyping) => {
            const {socket} = get();
            const {user} = useAuthStore.getState();
            if (!socket) return;

            socket.emit('typing', {chatId, userId: user?._id, isTyping});
        },

        onTyping: (callback) => {
            typingCallback = callback;
        },

        onMessageReceived: (callback) => {
            messageCallback = callback;
        },

        sendMessage: (chatId: string, message: string) => {
            const socket = useSocketStore.getState().socket;
            if (socket) {
                socket.emit('sendMessage', {chatId, content: message});
            }
        },

        joinChat: (chatId: string) => {
            const {socket} = get();
            if (!socket) return;
            socket.emit('joinChat', chatId);
        },

        leaveChat: (chatId: string) => {
            const {socket} = get();
            if (!socket) return;
            socket.emit('leaveChat', chatId);
        },

        onUserJoined: (callback) => {
            userJoinedCallback = callback;
        },

        onUserLeft: (callback) => {
            userLeftCallback = callback;
        },

        markMessagesAsRead: (chatId, messageIds) => {
            const {socket} = get();
            const {access_token} = useAuthStore.getState();
            if (!socket || !access_token) return;

            socket.emit('markMessagesRead', {chatId, messageIds, token: access_token});
        },

        messageErrorCallback: (error: any) => {
            console.error('Message error:', error);
        },
    };
});
