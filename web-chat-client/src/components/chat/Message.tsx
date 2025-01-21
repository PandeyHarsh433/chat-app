import {format} from 'date-fns';
import {cn} from '../../lib/utils';
import type {IMessage as MessageType} from '../../types';
import {User, Video} from "lucide-react";

interface MessageProps {
    message: MessageType;
    isOwn: boolean;
}

export function Message({message, isOwn}: MessageProps) {
    const isVideoCall = message.type === 'VIDEO';

    return (
        <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
            <div className="flex items-end space-x-2">
                {!isOwn && (
                    <User className="text-blue-600 dark:text-blue-400" size={20}/>
                )}
                <div
                    className={cn(
                        'max-w-[100%] rounded-lg px-4 py-2',
                        isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100',
                        isVideoCall && 'flex items-center space-x-2'
                    )}
                >
                    {!isOwn && (
                        <p className="text-xs font-medium mb-1">{message.sender && message.sender.name}</p>
                    )}
                    {isVideoCall && <Video size={16}/>}
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </p>
                </div>
            </div>
        </div>
    );
}