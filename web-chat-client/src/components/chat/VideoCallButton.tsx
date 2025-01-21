import { Video } from 'lucide-react';
import { useVideoCall } from '../../hooks/useVideoCall';

interface VideoCallButtonProps {
    chatId: string;
    participants: string[];
}

export function VideoCallButton({ chatId, participants }: VideoCallButtonProps) {
    const { startCall } = useVideoCall(chatId);

    return (
        <button
            onClick={() => startCall(participants)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <Video size={30} className="text-gray-600 dark:text-gray-300" />
        </button>
    );
}