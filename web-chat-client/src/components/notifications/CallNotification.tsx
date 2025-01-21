import {Phone, PhoneOff} from 'lucide-react';

interface CallNotificationProps {
    caller: {
        name: string;
        avatar?: string;
    };
    onAccept: () => void;
    onDecline: () => void;
}

export function CallNotification({caller, onAccept, onDecline}: CallNotificationProps) {
    return (
        <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80 animate-slide-in">
            <div className="flex items-center space-x-4">
                <img
                    src={caller.avatar || `https://source.unsplash.com/100x100/?portrait&${caller.name}`}
                    alt={caller.name}
                    className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                    <h3 className="font-medium">{caller.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Incoming video call...</p>
                </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <button
                    onClick={onDecline}
                    className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                >
                    <PhoneOff size={20}/>
                </button>
                <button
                    onClick={onAccept}
                    className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
                >
                    <Phone size={20}/>
                </button>
            </div>
        </div>
    );
}