import {format} from 'date-fns';
import {User, Users} from 'lucide-react';
import {cn} from '../../lib/utils';
import {Chat} from "../../types";
import {useChat} from "../../hooks/useChat.ts";
import {useEffect, useState} from "react";

interface ChatListItemProps {
    chat: Chat;
    isActive?: boolean;
    onClick: () => void;
}

export function ChatListItem({chat, isActive, onClick}: ChatListItemProps) {
    const [lastMessage, setLastMessage] = useState<string>();
    const {fetchMessage} = useChat();

    useEffect(() => {
        const fetchLastMessage = async () => {
            if (chat.lastMessage) {
                const data = await fetchMessage(chat.lastMessage?.messageId)
                if (data) setLastMessage(data.content);
            }
        }

        fetchLastMessage();
    }, []);

    return (
        <div
            onClick={onClick}
            className={cn(
                'p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                isActive && 'bg-gray-100 dark:bg-gray-800'
            )}
        >
            <div className="flex items-center space-x-4">
                {chat.type === 'GROUP' ? (
                    <div
                        className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Users className="text-blue-600 dark:text-blue-400" size={24}/>
                    </div>
                ) : (
                    <User className="text-blue-600 dark:text-blue-400" size={50}/>
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {chat.name}
                        </p>
                        {chat.lastMessage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(chat.lastMessage.timestamp), 'HH:mm')}
              </span>
                        )}
                    </div>
                    {chat.lastMessage && (
                        <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                                {lastMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}