import {User, Users} from 'lucide-react';
import {Chat} from "../../types";
import {VideoCallButton} from "./VideoCallButton.tsx";
import {useAuth} from "../../hooks/useAuth.ts";

interface ChatHeaderProps {
    chat: Chat;
    userStatus: Record<string, boolean>;
    typingUsers: Record<string, Record<string, boolean>>;
}

export function ChatHeader({chat, userStatus, typingUsers}: ChatHeaderProps) {
    const {user} = useAuth();

    const chatTypingUsers = typingUsers[chat._id] || {};
    const otherParticipants = chat.participants.filter(p => p !== user?._id);
    const onlineUsersCount = otherParticipants.filter(p => userStatus[p]).length;
    const typingUsersList = Object.keys(chatTypingUsers).filter(id => id !== user?._id);

    const getStatusText = () => {
        if (chat.type === "GROUP") {
            const typingText = typingUsersList.length > 0
                ? `${typingUsersList.length} typing...`
                : '';
            const onlineText = `${onlineUsersCount}/${chat.participants.length} online`;
            return typingText ? `${onlineText} • ${typingText}` : onlineText;
        } else {
            const otherUserId = otherParticipants[0];
            const isOnline = userStatus[otherUserId];
            const isTyping = chatTypingUsers[otherUserId];

            if (isTyping) return "Typing...";
            return isOnline ? "Online" : "Offline";
        }
    };

    return (
        <div
            className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                {chat.type === 'GROUP' ? (
                    <div
                        className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Users className="text-blue-600 dark:text-blue-400" size={20}/>
                    </div>
                ) : (
                    <User className="text-blue-600 dark:text-blue-400" size={25}/>
                )}
                <div>
                    <h2 className="font-medium">{chat.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getStatusText()}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <VideoCallButton
                    chatId={chat._id}
                    participants={chat.participants.map(p => p)}
                />
            </div>
        </div>
    );
}