import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatCallDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function getCallMessage(duration: number) {
    return `Video call ended • ${formatCallDuration(duration)}`;
}