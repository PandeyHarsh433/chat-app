import {useState, useCallback, useEffect} from 'react';
import {useVideoCallStore} from '../store/useVideoCallStore';
// import {useAuth} from "./useAuth.ts";

export function useVideoCall(chatId: string) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    // const {user} = useAuth();
    const {
        startCall: startCallStore,
        endCall: endCallStore,
        // updateStream,
        activeCall,
    } = useVideoCallStore();

    const startCall = useCallback(
        async (participants: string[]) => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });
                await startCallStore({
                    chatId,
                    participants,
                    stream,
                });
            } catch (error) {
                console.error('Failed to start video call:', error);
            }
        },
        [chatId, startCallStore]
    );

    const toggleAudio = useCallback(() => {
        if (activeCall?.stream) {
            const audioTracks = activeCall.stream.getAudioTracks();
            audioTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    }, [activeCall, isMuted]);

    const toggleVideo = useCallback(() => {
        if (activeCall?.stream) {
            const videoTracks = activeCall.stream.getVideoTracks();
            videoTracks.forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    }, [activeCall, isVideoEnabled]);

    const endCall = useCallback(() => {
        if (activeCall) {
            activeCall.stream.getTracks().forEach((track) => track.stop());
            endCallStore(chatId);
        }
    }, [activeCall, chatId, endCallStore]);

    useEffect(() => {
        return () => {
            if (activeCall) {
                endCall();
            }
        };
    }, [activeCall, endCall]);

    return {
        startCall,
        endCall,
        toggleAudio,
        toggleVideo,
        isMuted,
        isVideoEnabled,
        activeCall,
    };
}