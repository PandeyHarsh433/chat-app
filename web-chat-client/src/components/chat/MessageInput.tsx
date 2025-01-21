import React, {useEffect, useRef, useState} from 'react';
import {Send} from 'lucide-react';
import {useSocketStore} from "../../store/useSocketStore.ts";

interface MessageInputProps {
    chatId: string;
    userId: string | null;
    emitTyping: (chatId: string, userId: string, isTyping: boolean) => void;
}

export function MessageInput({chatId, userId, emitTyping}: MessageInputProps) {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const sendMessage = useSocketStore((state) => state.sendMessage);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current && userId) {
                clearTimeout(typingTimeoutRef.current);
                if (isTypingRef.current) {
                    emitTyping(chatId, userId, false);
                }
            }
        };
    }, [chatId, userId, emitTyping]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);
        if (userId) {
            if (!isTypingRef.current && userId) {
                isTypingRef.current = true;
                emitTyping(chatId, userId, true);
            }

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                emitTyping(chatId, userId, false);
            }, 1000);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userId) {
            const trimmedMessage = message.trim();
            if (!trimmedMessage) return;

            sendMessage(chatId, trimmedMessage);
            setMessage('');

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            isTypingRef.current = false;
            emitTyping(chatId, userId, false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-800">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <Send size={20}/>
                </button>
            </div>
        </form>
    );
}