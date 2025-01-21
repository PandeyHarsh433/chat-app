import {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {ChatHeader} from './ChatHeader';
import {Message} from './Message';
import {MessageInput} from './MessageInput';
import {useAuth} from "../../hooks/useAuth.ts";
import {useChat} from "../../hooks/useChat.ts";
import {VideoCallWindow} from '../video/VideoCallWindow';
import {useChatParticipants} from "../../hooks/useChatParticipant.ts";
import {useVideoCallStore} from "../../store/useVideoCallStore.tsx";
import {useSocketStore} from "../../store/useSocketStore.ts";

export function ChatWindow() {
    const {chatId} = useParams();
    const {activeCall} = useVideoCallStore();
    const [isCallMinimized, setIsCallMinimized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {user} = useAuth();
    const {
        chats,
        activeChat,
        sendMessage,
        messagesByChat,
        fetchMessages,
    } = useChat();

    const {fetchParticipants, participants, loading} = useChatParticipants();

    const typingUsers = useSocketStore((state) => state.typingUsers);
    const userStatus = useSocketStore((state) => state.onlineUsers);
    const joinChat = useSocketStore((state) => state.joinChat);
    const leaveChat = useSocketStore((state) => state.leaveChat);
    const emitTyping = useSocketStore((state) => state.emitTyping);

    useEffect(() => {
        if (chatId) {
            joinChat(chatId);
            return () => {
                leaveChat(chatId);
            };
        }
    }, [chatId]);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (chatId) {
                await Promise.all([fetchMessages(chatId), fetchParticipants(chatId)]);
            }
        };
        fetchAndSetData();
    }, [chatId, activeChat, sendMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messagesByChat, chatId]);

    if (!chatId || !activeChat || loading) return null;

    return (
        <div className="flex flex-col">
            <ChatHeader
                chat={{
                    ...activeChat,
                    name: chats.find((chat) => chat._id === chatId)?.name || 'Chat',
                    participants: participants[chatId]
                        ? participants[chatId]
                            .map((item) => item.userId)
                        : [],
                }}
                typingUsers={typingUsers}
                userStatus={userStatus}
            />
            <div className="flex-1 p-4 space-y-4 min-h-[73vh] max-h-[70vh] overflow-y-auto">
                {messagesByChat && messagesByChat[chatId] && messagesByChat[chatId].map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isOwn={message.sender.id === user?._id}
                    />
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <MessageInput
                chatId={chatId}
                userId={user && user?._id}
                emitTyping={emitTyping}
            />

            {activeCall && activeCall.chatId === chatId && (
                <VideoCallWindow
                    chatId={chatId}
                    participants={activeCall.participants.map(id => ({
                        id,
                        name: 'User',
                        stream: id === user?._id ? activeCall.stream : undefined
                    }))}
                    onClose={() => {
                    }}
                    isMinimized={isCallMinimized}
                    onToggleMinimize={() => setIsCallMinimized(!isCallMinimized)}
                />
            )}
        </div>
    );
}
