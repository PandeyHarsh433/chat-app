import { create } from 'zustand';
import { generateId } from '../lib/utils';

interface VideoCall {
    id: string;
    chatId: string;
    participants: string[];
    stream: MediaStream;
    startTime: Date;
    endTime?: Date;
}

interface VideoCallState {
    activeCall: VideoCall | null;
    callHistory: VideoCall[];
    startCall: (params: {
        chatId: string;
        participants: string[];
        stream: MediaStream;
    }) => Promise<void>;
    endCall: (chatId: string) => void;
    updateStream: (chatId: string, stream: MediaStream) => void;
}

export const useVideoCallStore = create<VideoCallState>((set, get) => ({
    activeCall: null,
    callHistory: [],

    startCall: async ({ chatId, participants, stream }) => {
        const newCall: VideoCall = {
            id: generateId(),
            chatId,
            participants,
            stream,
            startTime: new Date(),
        };

        set({ activeCall: newCall });
    },

    endCall: (chatId) => {
        const { activeCall, callHistory } = get();
        if (activeCall && activeCall.chatId === chatId) {
            const endedCall = {
                ...activeCall,
                endTime: new Date(),
            };

            set({
                activeCall: null,
                callHistory: [...callHistory, endedCall],
            });
        }
    },

    updateStream: (chatId, stream) => {
        const { activeCall } = get();
        if (activeCall && activeCall.chatId === chatId) {
            set({
                activeCall: {
                    ...activeCall,
                    stream,
                },
            });
        }
    },
}));