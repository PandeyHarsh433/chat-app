import {useState, useEffect, useRef} from 'react';
import {Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2} from 'lucide-react';
import {cn} from '../../lib/utils';
import {useVideoCall} from '../../hooks/useVideoCall';

interface VideoCallWindowProps {
    chatId: string;
    participants: Array<{
        id: string;
        name: string;
        stream?: MediaStream;
    }>;
    // onClose: () => void;
    isMinimized?: boolean;
    onToggleMinimize: () => void;
}

export function VideoCallWindow({
                                    chatId,
                                    participants,
                                    // onClose,
                                    isMinimized,
                                    onToggleMinimize,
                                }: VideoCallWindowProps) {
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<number>();
    const {toggleAudio, toggleVideo, endCall, isMuted, isVideoEnabled} = useVideoCall(chatId);

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = window.setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                window.clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, []);

    const gridTemplateAreas = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-2 grid-rows-2',
        4: 'grid-cols-2 grid-rows-2',
        default: 'grid-cols-3 grid-rows-2',
    };

    const gridClass = gridTemplateAreas[
        Math.min(participants.length, 6) as keyof typeof gridTemplateAreas
        ] || gridTemplateAreas.default;

    return (
        <div
            className={cn(
                'fixed bg-gray-900 text-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300',
                isMinimized
                    ? 'bottom-4 right-4 w-72 h-48'
                    : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[80vh]'
            )}
            onMouseMove={handleMouseMove}
        >
            <div className={cn('grid gap-2 p-2 w-full h-full', gridClass)}>
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className="relative bg-gray-800 rounded-lg overflow-hidden"
                    >
                        {participant.stream ? (
                            <video
                                autoPlay
                                playsInline
                                muted={participant.id === 'self'}
                                ref={(el) => {
                                    if (el && participant.stream) {
                                        el.srcObject = participant.stream;
                                    }
                                }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl font-semibold">
                    {participant.name[0].toUpperCase()}
                  </span>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded">
                            {participant.name}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div
                className={cn(
                    'absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black to-transparent transition-opacity duration-300',
                    !showControls && 'opacity-0 pointer-events-none'
                )}
            >
                <button
                    onClick={toggleAudio}
                    className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    {isMuted ? <MicOff size={20}/> : <Mic size={20}/>}
                </button>
                <button
                    onClick={toggleVideo}
                    className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    {isVideoEnabled ? <Video size={20}/> : <VideoOff size={20}/>}
                </button>
                <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                >
                    <PhoneOff size={20}/>
                </button>
                <button
                    onClick={onToggleMinimize}
                    className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                    {isMinimized ? <Maximize2 size={20}/> : <Minimize2 size={20}/>}
                </button>
            </div>
        </div>
    );
}